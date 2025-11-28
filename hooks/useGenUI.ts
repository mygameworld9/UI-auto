
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
    // Find the message that contains this node
    // This is tricky because path='root' implies root of one message's UI. 
    // We assume the error happened in the LATEST message that has UI.
    
    const lastUiMsgIndex = [...messages].reverse().findIndex(m => m.ui);
    const actualIndex = lastUiMsgIndex >= 0 ? messages.length - 1 - lastUiMsgIndex : -1;

    if (actualIndex === -1) return;

    try {
      const fixedNode = await fixComponent(error.message, node, config);
      
      // We need to splice this fixed node back into the tree.
      // The path passed from DynamicRenderer is like "root.container.children.0.card"
      // We need to strip "root." to match the object structure relative to `ui` root.
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
      
      // Notify user
      setMessages(prev => [...prev, { role: 'system', text: `🔧 Auto-Healed component at ${path}` }]);

    } catch (err) {
      console.error("Failed to heal:", err);
      setMessages(prev => [...prev, { role: 'system', text: `❌ Auto-Healing failed: ${err}` }]);
    }
  }, [messages, config]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // NOTE: API Key is now handled via process.env.API_KEY in the service layer.
    // We do not check it here in client state.

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

  const handleAction = useCallback(async (action: UIAction) => {
    if (action.type === 'TRIGGER_EFFECT') {
        const effect = action.payload?.effect;
        if (effect === 'CONFETTI') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        return;
    }
  }, []);

  return {
    state: { context, input, loading, streamingNode, messages, metrics, editMode, selectedPath, config },
    refs: { messagesEndRef },
    actions: { setContext, setInput, handleSubmit, handleAction, setEditMode, setSelectedPath, setConfig, fixNode }
  };
};
