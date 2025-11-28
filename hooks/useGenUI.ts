import { useState, useRef, useEffect, useCallback } from 'react';
import { UINode, UserContext, UIAction } from '../types';
import { INITIAL_CONTEXT } from '../constants';
import { generateUIStream } from '../services/geminiService';
import { parsePartialJson } from '../services/streamParser';
import { executeTool } from '../services/toolService';
import { telemetry } from '../services/telemetry';
import confetti from 'canvas-confetti';

/**
 * Immutable Deep Set Utility (Recursive & Type-Safe)
 * Safely updates a nested value within an object tree using dot-notation path.
 */
function setByPath<T>(obj: T, path: string, value: any): T {
  if (!path) return value as unknown as T;
  const segments = path.split('.');

  const update = (current: any, depth: number): any => {
    if (depth === segments.length) return value;
    const key = segments[depth];
    
    let clone: any;
    if (Array.isArray(current)) {
      clone = [...current];
    } else if (current && typeof current === 'object') {
      clone = { ...current };
    } else {
      const isIndex = !isNaN(Number(key));
      clone = isIndex ? [] : {};
    }

    clone[key] = update(current ? current[key] : undefined, depth + 1);
    return clone;
  };

  return update(obj, 0) as T;
}

export const useGenUI = () => {
  // --- State ---
  const [context, setContext] = useState<UserContext>(INITIAL_CONTEXT);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingNode, setStreamingNode] = useState<UINode | null>(null);
  
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

  // Telemetry Subscription
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingNode]);

  // --- Actions ---

  const handleKeySelection = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
    }
  };

  /**
   * RECURSIVE GENERATION LOOP (Supports Function Calling)
   */
  const handleGeneration = useCallback(async (prompt: string, originalUserMsg: string) => {
    let rawAccumulated = "";
    let isToolCallDetected = false;
    
    try {
        const stream = generateUIStream(prompt, context);
        
        for await (const chunk of stream) {
            rawAccumulated += chunk;
            
            const partialUI = parsePartialJson(rawAccumulated);
            
            // Tool Detection: Suppress UI rendering if detected
            if (partialUI?.tool_call) {
                isToolCallDetected = true;
                continue;
            }

            // Update UI Buffer
            if (partialUI && typeof partialUI === 'object' && !isToolCallDetected) {
                setStreamingNode(partialUI);
            }
        }

        const finalResponse = parsePartialJson(rawAccumulated);

        // CASE A: Handle Tool Call
        if (finalResponse?.tool_call) {
             const { name, arguments: args } = finalResponse.tool_call;
             
             setMessages(prev => [...prev, { 
                 role: 'system', 
                 text: `⚡ Orchestrating: ${name} with args ${JSON.stringify(args)}` 
             }]);

             const toolResult = await executeTool(name, args);

             const nextPrompt = `
ORIGINAL USER REQUEST: ${originalUserMsg}

SYSTEM UPDATE - TOOL EXECUTION RESULT:
Function '${name}' returned:
${JSON.stringify(toolResult)}

INSTRUCTIONS:
Based on the tool result above, generate the appropriate UI component now.
             `;
             
             // Recursion
             await handleGeneration(nextPrompt, originalUserMsg);
             return;
        }

        // CASE B: Handle UI Response (Finalize)
        if (!isToolCallDetected && (finalResponse || rawAccumulated.trim())) {
             setMessages(prev => [...prev, { 
                 role: 'assistant', 
                 text: '', 
                 ui: finalResponse || streamingNode
             }]);
        }

    } catch (e) {
        console.error("Streaming failed", e);
        setMessages(prev => [...prev, { 
            role: 'system', 
            text: 'Error rendering stream. See console.' 
        }]);
    }
  }, [context, streamingNode]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);
    setStreamingNode(null);

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    await handleGeneration(userMsg, userMsg);

    setLoading(false);
    setStreamingNode(null);
  }, [input, loading, handleGeneration]);

  const handleAction = useCallback((action: UIAction) => {
    // 1. Visual Effects
    if (action.type === 'TRIGGER_EFFECT') {
        const effect = action.payload?.effect;
        if (effect === 'CONFETTI') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else if (effect === 'SNOW') {
            const duration = 5000;
            const animationEnd = Date.now() + duration;
            let skew = 1;
            (function frame() {
                const timeLeft = animationEnd - Date.now();
                const ticks = Math.max(200, 500 * (timeLeft / duration));
                skew = Math.max(0.8, skew - 0.001);
                confetti({
                    particleCount: 1, startVelocity: 0, ticks: ticks,
                    origin: { x: Math.random(), y: (Math.random() * skew) - 0.2 },
                    colors: ['#ffffff'], shapes: ['circle'], gravity: 0.6, scalar: 0.6, drift: 0,
                });
                if (timeLeft > 0) requestAnimationFrame(frame);
            }());
        }
        return;
    }

    // 2. State Patching
    if (action.type === 'PATCH_STATE' && action.path) {
        if (streamingNode) {
            setStreamingNode((prev) => setByPath(prev, action.path!, action.payload));
            return;
        }

        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            let targetIndex = -1;
            for (let i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i].ui) {
                    targetIndex = i;
                    break;
                }
            }
            if (targetIndex !== -1) {
                const targetMsg = { ...newMessages[targetIndex] };
                targetMsg.ui = setByPath(targetMsg.ui, action.path!, action.payload);
                newMessages[targetIndex] = targetMsg;
            }
            return newMessages;
        });
        return;
    }

    // 3. System Log Fallback
    const responseText = `Action Executed: ${action.type} (Payload: ${JSON.stringify(action.payload)})`;
    setMessages(prev => [...prev, { role: 'system', text: responseText }]);
  }, [streamingNode]);

  return {
    state: {
      context,
      input,
      loading,
      streamingNode,
      messages,
      metrics
    },
    refs: {
      messagesEndRef
    },
    actions: {
      setContext,
      setInput,
      handleSubmit,
      handleAction,
      handleKeySelection
    }
  };
};
