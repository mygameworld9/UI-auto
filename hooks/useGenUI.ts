import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UINode, UserContext, UIAction } from '../types';
import { INITIAL_CONTEXT } from '../constants';
import { generateUIStream, refineComponent, fixComponent } from '../services/geminiService';
import { generateTheme } from '../services/themeAgent';
import { parsePartialJson } from '../services/streamParser';
import { executeTool } from '../services/toolService';
import { telemetry } from '../services/telemetry';
import { ModelConfig, DEFAULT_CONFIG } from '../types/settings';
import { setByPath } from '../components/ui/utils';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const STORAGE_KEY = 'genui_model_config';

// Helper for deep retrieval
function getByPath(obj: any, path: string): any {
  if (!path || !obj) return undefined;
  const segments = path.split('.');
  let current = obj;
  for (const key of segments) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return current;
}

export const useGenUI = () => {
  // --- State ---
  const [context, setContext] = useState<UserContext>(INITIAL_CONTEXT);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingNode, setStreamingNode] = useState<UINode | null>(null);
  
  // Settings State
  const [config, setConfigState] = useState<ModelConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const setConfig = (newConfig: ModelConfig) => {
    setConfigState(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  // Editor State
  const [editMode, setEditMode] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Array<{role: string, text: string, ui?: UINode}>>([
    { role: 'system', text: 'GenUI Studio is ready. Describe a UI component, dashboard, or layout to generate it instantly.' }
  ]);
  
  const [metrics, setMetrics] = useState({
    ttft: 0,
    latency: 0,
    active: false,
    hallucinations: 0
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  useEffect(() => {
    const unsubscribe = telemetry.subscribe((event) => {
      setMetrics(prev => {
        if (event.name === 'STREAM_START') return { ...prev, active: true, latency: 0, ttft: 0 };
        if (event.name === 'STREAM_COMPLETE') return { ...prev, active: false, latency: event.value };
        if (event.name === 'TTFT') return { ...prev, ttft: event.value };
        if (event.name === 'HALLUCINATION') return { ...prev, hallucinations: prev.hallucinations + 1 };
        return prev;
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!editMode) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, streamingNode, editMode]);

  // --- Actions ---

  const handleGeneration = useCallback(async (prompt: string, originalUserMsg: string) => {
    let rawAccumulated = "";
    let isToolCallDetected = false;
    
    try {
        const stream = generateUIStream(prompt, context, config);
        
        for await (const chunk of stream) {
            rawAccumulated += chunk;
            const partialUI = parsePartialJson(rawAccumulated);
            if (partialUI?.tool_call) {
                isToolCallDetected = true;
                continue;
            }
            if (partialUI && typeof partialUI === 'object' && !isToolCallDetected) {
                setStreamingNode(partialUI);
            }
        }

        const finalResponse = parsePartialJson(rawAccumulated);

        if (finalResponse?.tool_call) {
             const { name, arguments: args } = finalResponse.tool_call;
             setMessages(prev => [...prev, { role: 'system', text: `⚡ Orchestrating: ${name} with args ${JSON.stringify(args)}` }]);
             const toolResult = await executeTool(name, args);
             const nextPrompt = `ORIGINAL REQUEST: ${originalUserMsg}\nTOOL RESULT (${name}): ${JSON.stringify(toolResult)}\nINSTRUCTIONS: Generate UI.`;
             await handleGeneration(nextPrompt, originalUserMsg);
             return;
        }

        if (!isToolCallDetected && (finalResponse || rawAccumulated.trim())) {
             setMessages(prev => [...prev, { role: 'assistant', text: '', ui: finalResponse || streamingNode }]);
        }

    } catch (e) {
        console.error("Streaming failed", e);
        setMessages(prev => [...prev, { role: 'system', text: 'Error rendering stream. Check settings.' }]);
    }
  }, [context, streamingNode, config]);

  const fixNode = useCallback(async (error: Error, node: UINode, path: string) => {
    console.log("Attempting to fix node at path:", path);
    
    const lastUiMsgIndex = [...messages].reverse().findIndex(m => m.ui);
    const actualIndex = lastUiMsgIndex >= 0 ? messages.length - 1 - lastUiMsgIndex : -1;

    if (actualIndex === -1) return;

    try {
      const fixedNode = await fixComponent(error.message, node, config);
      const relativePath = path.startsWith('root.') ? path.substring(5) : (path === 'root' ? '' : path);

      setMessages(prev => {
        const next = [...prev];
        const oldUi = next[actualIndex].ui;
        if (!relativePath) {
           next[actualIndex] = { ...next[actualIndex], ui: fixedNode };
        } else {
           next[actualIndex] = { ...next[actualIndex], ui: setByPath(oldUi, relativePath, fixedNode) };
        }
        return next;
      });
      
      toast.success("Component auto-healed!");
      setMessages(prev => [...prev, { role: 'system', text: `🔧 Auto-Healed component at ${path}` }]);

    } catch (err) {
      console.error("Failed to heal:", err);
      toast.error("Auto-healing failed");
      setMessages(prev => [...prev, { role: 'system', text: `❌ Auto-Healing failed: ${err}` }]);
    }
  }, [messages, config]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    
    // REFINEMENT LOGIC
    if (editMode && selectedPath) {
        setLoading(true);
        const toastId = toast.loading("Refining component...");
        
        const lastUiMsgIndex = [...messages].reverse().findIndex(m => m.ui);
        const actualIndex = lastUiMsgIndex >= 0 ? messages.length - 1 - lastUiMsgIndex : -1;
        
        if (actualIndex === -1) {
             setLoading(false);
             toast.dismiss(toastId);
             return;
        }

        const rootNode = messages[actualIndex].ui;
        const pathParts = selectedPath.split('.');
        const relativePath = pathParts.slice(1).join('.');
        
        const subComponent = relativePath ? getByPath(rootNode, relativePath) : rootNode;
        
        if (subComponent) {
            setMessages(prev => [...prev, { role: 'user', text: `Refine selected component: ${userMsg}` }]);
            
            try {
                const refinedJson = await refineComponent(userMsg, subComponent, config);
                
                if (!relativePath) {
                     setMessages(prev => {
                        const next = [...prev];
                        next[actualIndex] = { ...next[actualIndex], ui: refinedJson };
                        return next;
                     });
                } else {
                     setMessages(prev => {
                        const next = [...prev];
                        const oldUi = next[actualIndex].ui;
                        next[actualIndex] = { ...next[actualIndex], ui: setByPath(oldUi, relativePath, refinedJson) };
                        return next;
                     });
                }
                setMessages(prev => [...prev, { role: 'system', text: 'Component updated successfully.' }]);
                toast.success("Component refined!", { id: toastId });
            } catch (err) {
                setMessages(prev => [...prev, { role: 'system', text: 'Failed to refine component.' }]);
                toast.error("Refinement failed", { id: toastId });
            }
        }
        setLoading(false);
        return;
    }

    setLoading(true);
    setStreamingNode(null);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    await handleGeneration(userMsg, userMsg);
    setLoading(false);
    setStreamingNode(null);
  }, [input, loading, handleGeneration, editMode, selectedPath, messages, config]);

  const handleAction = useCallback(async (action: UIAction) => {
    // 1. Effects
    if (action.type === 'TRIGGER_EFFECT') {
        const effect = action.payload?.effect;
        if (effect === 'CONFETTI') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        if (effect === 'SNOW') confetti({ particleCount: 50, spread: 100, origin: { y: 0 }, drift: 0.5, gravity: 0.5, colors: ['#ffffff', '#e2e8f0'] });
        return;
    }

    // 2. State Patching (Fix for broken inputs)
    if (action.type === 'PATCH_STATE') {
        try {
            const targetPath = action.path; 
            const newValue = action.payload;

            if (!targetPath) {
                console.warn("PATCH_STATE action missing path");
                return;
            }

            setMessages(prev => {
                const next = [...prev];
                const lastUiMsgIndex = [...next].reverse().findIndex(m => m.ui);
                const actualIndex = lastUiMsgIndex >= 0 ? next.length - 1 - lastUiMsgIndex : -1;

                if (actualIndex !== -1) {
                    const oldUi = next[actualIndex].ui;
                    // Strip "root." prefix if present to match object structure
                    const cleanPath = targetPath.startsWith('root.') ? targetPath.substring(5) : targetPath;
                    
                    // The path typically points to the component itself (e.g., ...input). 
                    // We need to update the specific property, usually "value".
                    // Assuming the payload IS the value, or object with value? 
                    // Convention: payload is the new value for the component. 
                    // We need to set ...input.value = newValue.
                    
                    const newUi = setByPath(oldUi, `${cleanPath}.value`, newValue);
                    next[actualIndex] = { ...next[actualIndex], ui: newUi };
                }
                return next;
            });
        } catch (e) {
            console.error("State patch failed", e);
            toast.error("Failed to update input state");
        }
        return;
    }

    // 3. Generic Feedback
    toast.success(`Action Triggered: ${action.type}`, {
        description: typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload),
        duration: 3000,
        icon: '⚡'
    });

  }, []);

  return {
    state: { context, input, loading, streamingNode, messages, metrics, editMode, selectedPath, config },
    refs: { messagesEndRef },
    actions: { setContext, setInput, handleSubmit, handleAction, setEditMode, setSelectedPath, setConfig, fixNode }
  };
};