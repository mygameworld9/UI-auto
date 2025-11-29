
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

// Helper to crawl tree and collect input values
function collectFormData(node: any): Record<string, any> {
  let data: Record<string, any> = {};
  
  if (!node || typeof node !== 'object') return data;

  // Check if current node is an input with a label
  if (node.input && node.input.label) {
     const key = node.input.label;
     const value = node.input.value || "";
     data[key] = value;
  }

  // Recursive traversal
  Object.values(node).forEach(childValue => {
     if (Array.isArray(childValue)) {
         childValue.forEach(child => {
             data = { ...data, ...collectFormData(child) };
         })
     } else if (typeof childValue === 'object' && childValue !== null) {
         data = { ...data, ...collectFormData(childValue) };
     }
  });
  
  return data;
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
        // If path was just 'root', replace the whole UI
        if (!relativePath) {
           next[actualIndex] = { ...next[actualIndex], ui: fixedNode };
        } else {
           next[actualIndex] = { ...next[actualIndex], ui: setByPath(oldUi, relativePath, fixedNode) };
        }
        return next;
      });
      
      setMessages(prev => [...prev, { role: 'system', text: `🔧 Auto-Healed component at ${path}` }]);

    } catch (err) {
      console.error("Failed to heal:", err);
      setMessages(prev => [...prev, { role: 'system', text: `❌ Auto-Healing failed: ${err}` }]);
    }
  }, [messages, config]);

  const handleAction = useCallback(async (action: UIAction) => {
    console.log("Handling Action:", action);

    // 1. VISUAL EFFECTS
    if (action.type === 'TRIGGER_EFFECT') {
        const effect = action.payload?.effect;
        if (effect === 'CONFETTI') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        if (effect === 'SNOW') confetti({ particleCount: 100, spread: 360, ticks: 200, gravity: 0.4, decay: 0.94, startVelocity: 30, origin: { y: 0 }, colors: ['#ffffff', '#e0f2fe'] });
        return;
    }

    // 2. STATE PATCHING (Local Updates)
    if (action.type === 'PATCH_STATE' && action.path) {
        const lastUiMsgIndex = [...messages].reverse().findIndex(m => m.ui);
        const actualIndex = lastUiMsgIndex >= 0 ? messages.length - 1 - lastUiMsgIndex : -1;

        if (actualIndex === -1) return;

        // Strip "root." prefix to get relative path within the UI object
        const relativePath = action.path.startsWith('root.') ? action.path.substring(5) : action.path;
        
        setMessages(prev => {
            const next = [...prev];
            const oldUi = next[actualIndex].ui;
            // Merge existing props with payload
            // e.g. Input has { label: '...' }, payload is { value: '...' }. 
            // setByPath replaces the object at path. We need to merge if targeting a component props object.
            
            // However, setByPath implementation (utils.ts) replaces the value at the key.
            // If path ends in 'input', payload should be the full input props OR we update specific prop like 'input.value'.
            // In Input.tsx, we sent payload: { value: ... } and path: ...input
            // This would replace input props with just { value }. That's bad.
            // Let's assume the component sends the sub-path or we handle merging here.
            
            // FIX: If the payload is partial, we should probably retrieve current, merge, and set.
            // But getting deep value is expensive to clone.
            // Simplified: The components calling PATCH_STATE should target the exact leaf property OR send the full object.
            // Input.tsx sends `value: debouncedValue` but the path passed to Input is `...input`. 
            // So we should append `.value` to the path if we want to update just the value.
            // OR we change Input.tsx to dispatch path + '.value'.
            
            // Let's check Input.tsx change:
            // It sends payload: { value: debouncedValue }. 
            // It receives path to the input component (e.g. root.children.0.input).
            // If we use setByPath(ui, 'children.0.input', { value: ... }), we lose other props.
            
            // Optimization: Let's do a merge here for objects.
            const targetProp = getByPath(oldUi, relativePath);
            let newValue = action.payload;
            
            if (typeof targetProp === 'object' && targetProp !== null && typeof action.payload === 'object') {
                 newValue = { ...targetProp, ...action.payload };
            }

            next[actualIndex] = { ...next[actualIndex], ui: setByPath(oldUi, relativePath, newValue) };
            return next;
        });
        return;
    }

    // 3. FORM SUBMISSION
    if (action.type === 'SUBMIT_FORM') {
        setLoading(true);
        // Find the active UI
        const lastUiMsg = [...messages].reverse().find(m => m.ui);
        if (!lastUiMsg || !lastUiMsg.ui) {
            setLoading(false);
            return;
        }

        const formData = collectFormData(lastUiMsg.ui);
        const submissionText = `User Submitted Form Data: ${JSON.stringify(formData, null, 2)}`;
        
        setMessages(prev => [...prev, { role: 'system', text: 'Submitting form data...' }]);
        
        // Feed this back to the LLM to decide what to do next
        await handleGeneration(submissionText, "Form Submission");
        setLoading(false);
        return;
    }

  }, [messages, handleGeneration]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    
    // REFINEMENT LOGIC
    if (editMode && selectedPath) {
        setLoading(true);
        const lastUiMsgIndex = [...messages].reverse().findIndex(m => m.ui);
        const actualIndex = lastUiMsgIndex >= 0 ? messages.length - 1 - lastUiMsgIndex : -1;
        
        if (actualIndex === -1) {
             setLoading(false);
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
            } catch (err) {
                setMessages(prev => [...prev, { role: 'system', text: 'Failed to refine component.' }]);
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

  return {
    state: { context, input, loading, streamingNode, messages, metrics, editMode, selectedPath, config },
    refs: { messagesEndRef },
    actions: { setContext, setInput, handleSubmit, handleAction, setEditMode, setSelectedPath, setConfig, fixNode }
  };
};
