import React, { useState, useRef, useEffect } from 'react';
import { generateUIStream } from './services/geminiService';
import { parsePartialJson } from './services/streamParser';
import DynamicRenderer from './components/DynamicRenderer';
import { UINode, UserContext, UIAction } from './types';
import { INITIAL_CONTEXT } from './constants';
import { 
  User, Sparkles, Smartphone, Monitor, Shield, Zap, Box, Terminal, ArrowUp, Activity, Gauge, Code2
} from 'lucide-react';
import { telemetry } from './services/telemetry';
import confetti from 'canvas-confetti';
import { CodeViewer } from './components/CodeViewer';
import { executeTool } from './services/toolService';

/**
 * Immutable Deep Set Utility (Recursive & Type-Safe)
 * Safely updates a nested value within an object tree using dot-notation path,
 * ensuring structural sharing/immutability for React state updates.
 */
function setByPath<T>(obj: T, path: string, value: any): T {
  // If path is empty, we can't patch "inside", so we return value as the new root
  if (!path) return value as unknown as T;

  const segments = path.split('.');

  const update = (current: any, depth: number): any => {
    // 1. Base Case: Reached the target key
    if (depth === segments.length) {
      return value;
    }

    const key = segments[depth];
    
    // 2. Clone the current level
    // We determine if 'current' is an array or object to clone it correctly.
    // If 'current' is null/undefined (auto-vivification), we check the key to guess type.
    let clone: any;
    
    if (Array.isArray(current)) {
      clone = [...current];
    } else if (current && typeof current === 'object') {
      clone = { ...current };
    } else {
      // Auto-vivification: 
      // If the key is numeric, assume we are building an array.
      // Otherwise, assume an object.
      const isIndex = !isNaN(Number(key));
      clone = isIndex ? [] : {};
    }

    // 3. Recursive Step: Assign the result of the update to the clone's key
    clone[key] = update(current ? current[key] : undefined, depth + 1);

    return clone;
  };

  return update(obj, 0) as T;
}

const App = () => {
  // State
  const [context, setContext] = useState<UserContext>(INITIAL_CONTEXT);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingNode, setStreamingNode] = useState<UINode | null>(null);
  
  const [messages, setMessages] = useState<Array<{role: string, text: string, ui?: UINode}>>([
    { role: 'system', text: 'GenUI Studio is ready. Describe a UI component, dashboard, or layout to generate it instantly.' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Telemetry State
  const [metrics, setMetrics] = useState({
    ttft: 0,
    latency: 0,
    active: false,
    hallucinations: 0
  });

  // Subscribe to telemetry
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

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingNode]);

  // 3.2 Action Protocol & Local State Patch
  const handleAction = (action: UIAction) => {
    // 1. Handle Visual Effects
    if (action.type === 'TRIGGER_EFFECT') {
        const effect = action.payload?.effect;
        if (effect === 'CONFETTI') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else if (effect === 'SNOW') {
            const duration = 5000;
            const animationEnd = Date.now() + duration;
            let skew = 1;

            (function frame() {
                const timeLeft = animationEnd - Date.now();
                const ticks = Math.max(200, 500 * (timeLeft / duration));
                skew = Math.max(0.8, skew - 0.001);

                confetti({
                    particleCount: 1,
                    startVelocity: 0,
                    ticks: ticks,
                    origin: {
                        x: Math.random(),
                        // since particles fall down, skew is better than nothing
                        y: (Math.random() * skew) - 0.2
                    },
                    colors: ['#ffffff'],
                    shapes: ['circle'],
                    gravity: 0.6,
                    scalar: 0.6,
                    drift: 0,
                });

                if (timeLeft > 0) {
                    requestAnimationFrame(frame);
                }
            }());
        }
        return;
    }

    // 2. Handle State Patching
    if (action.type === 'PATCH_STATE' && action.path) {
        // CASE A: User is interacting with a node that is currently streaming/generating
        if (streamingNode) {
            setStreamingNode((prev) => setByPath(prev, action.path!, action.payload));
            return;
        }

        // CASE B: User is interacting with a finalized node in the history
        setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            // Search backwards for the last message with a UI payload
            let targetIndex = -1;
            for (let i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i].ui) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex !== -1) {
                const targetMsg = { ...newMessages[targetIndex] };
                // Immutable update of the UI tree within the message
                targetMsg.ui = setByPath(targetMsg.ui, action.path!, action.payload);
                newMessages[targetIndex] = targetMsg;
            }

            return newMessages;
        });
        return;
    }

    // 3. Handle System Actions (Logging / Navigation fallbacks)
    const responseText = `Action Executed: ${action.type} (Payload: ${JSON.stringify(action.payload)})`;
    setMessages(prev => [...prev, { role: 'system', text: responseText }]);
  };

  const handleKeySelection = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
    }
  };

  /**
   * RECURSIVE GENERATION LOOP (Supports Function Calling)
   * 
   * This function handles the conversation flow:
   * 1. Calls Gemini with current prompt
   * 2. Streams response
   * 3. Checks for "tool_call"
   * 4. If tool_call: Executes tool -> Updates prompt -> Recurses
   * 5. If UI: Updates streaming buffer -> Finalizes
   */
  const handleGeneration = async (prompt: string, originalUserMsg: string) => {
    let rawAccumulated = "";
    let isToolCallDetected = false;
    
    try {
        const stream = generateUIStream(prompt, context);
        
        for await (const chunk of stream) {
            rawAccumulated += chunk;
            
            // 1. Partial Parse: Attempt to fix and parse the incomplete JSON
            const partialUI = parsePartialJson(rawAccumulated);
            
            // 2. Tool Detection
            // If the model starts outputting a tool call, we suppress UI rendering
            if (partialUI?.tool_call) {
                isToolCallDetected = true;
                continue;
            }

            // 3. Update UI Buffer
            if (partialUI && typeof partialUI === 'object' && !isToolCallDetected) {
                setStreamingNode(partialUI);
            }
        }

        // Final Parse
        const finalResponse = parsePartialJson(rawAccumulated);

        // CASE A: Handle Tool Call
        if (finalResponse?.tool_call) {
             const { name, arguments: args } = finalResponse.tool_call;
             
             // Feedback to User
             setMessages(prev => [...prev, { 
                 role: 'system', 
                 text: `⚡ Orchestrating: ${name} with args ${JSON.stringify(args)}` 
             }]);

             // Execute Tool
             const toolResult = await executeTool(name, args);

             // Construct Next Prompt (Chain of Thought)
             const nextPrompt = `
ORIGINAL USER REQUEST: ${originalUserMsg}

SYSTEM UPDATE - TOOL EXECUTION RESULT:
Function '${name}' returned:
${JSON.stringify(toolResult)}

INSTRUCTIONS:
Based on the tool result above, generate the appropriate UI component now.
             `;
             
             // Recursive Call
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);
    setStreamingNode(null); // Reset streaming buffer

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Trigger the recursive generation loop
    await handleGeneration(userMsg, userMsg);

    setLoading(false);
    setStreamingNode(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* 1. Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">GenUI <span className="text-slate-500 font-light">Architect</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-xs font-medium text-slate-400">
                <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'} `}></span>
                Gemini 3.0 Pro {loading ? 'Thinking...' : 'Ready'}
            </div>
            <button 
              onClick={handleKeySelection}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="API Key Settings"
            >
                <Box className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pt-20 pb-32">
        <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-12">
            
            {/* Context Controls (Floating Toolbar) */}
            <div className="sticky top-4 z-40 flex justify-center mb-8">
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center gap-1">
                    <button 
                        onClick={() => setContext(p => ({ ...p, role: 'user' }))}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${context.role === 'user' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <User className="w-3.5 h-3.5" /> User View
                    </button>
                    <button 
                        onClick={() => setContext(p => ({ ...p, role: 'admin' }))}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${context.role === 'admin' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Shield className="w-3.5 h-3.5" /> Admin View
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <button 
                        onClick={() => setContext(p => ({ ...p, device: 'desktop' }))}
                        className={`p-2 rounded-full transition-all ${context.device === 'desktop' ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Desktop View"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setContext(p => ({ ...p, device: 'mobile' }))}
                        className={`p-2 rounded-full transition-all ${context.device === 'mobile' ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Mobile View"
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages Feed */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`group ${msg.role === 'user' ? 'flex justify-end' : 'flex flex-col items-center w-full'}`}>
                
                {/* User Message */}
                {msg.role === 'user' && (
                   <div className="max-w-xl">
                      <div className="bg-zinc-800 text-slate-100 px-6 py-4 rounded-2xl rounded-tr-none border border-zinc-700 shadow-md">
                        <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2 text-right pr-2 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                         You
                      </div>
                   </div>
                )}

                {/* System Message (Tool Execution Logs) */}
                {msg.role === 'system' && (
                    <div className="w-full max-w-2xl flex items-center gap-3 py-2 px-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-xs font-mono text-indigo-400/80 animate-in fade-in slide-in-from-bottom-2">
                        <Terminal className="w-3 h-3" />
                        <span>{msg.text}</span>
                    </div>
                )}

                {/* Assistant Message */}
                {msg.role === 'assistant' && (
                  <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Text Response (if any) */}
                    {msg.text && (
                        <div className="flex gap-4 max-w-2xl mx-auto">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="pt-1">
                                <p className="text-sm text-slate-300 leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    )}

                    {/* UI Render Area (The "Canvas") */}
                    {msg.ui && (
                        <div className="w-full flex justify-center py-6">
                             {/* Re-use the device wrapper logic */}
                             <DeviceWrapper context={context} node={msg.ui} onAction={handleAction} />
                        </div>
                    )}
                  </div>
                )}

              </div>
            ))}

            {/* LIVE STREAMING RENDER AREA */}
            {loading && streamingNode && (
                <div className="w-full flex justify-center py-6 animate-in fade-in duration-300">
                    <DeviceWrapper context={context} node={streamingNode} onAction={handleAction} isStreaming={true} />
                </div>
            )}

            {/* Loading Indicator (only if we haven't started streaming yet) */}
            {loading && !streamingNode && (
                <div className="flex justify-center py-12">
                   <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700 relative z-10">
                                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                            </div>
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse" />
                        </div>
                        <span className="text-xs font-mono text-slate-500 animate-pulse">
                            Processing...
                        </span>
                   </div>
                </div>
            )}
            
            <div ref={messagesEndRef} className="h-32" /> 
        </div>
      </main>

      {/* 3. Floating Command Bar (Input) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto relative">
            
            {/* Telemetry Status Bar - Tech Style */}
            <div className="absolute -top-10 right-0 flex items-center gap-4 text-[10px] font-mono text-zinc-500 bg-zinc-950/90 border border-zinc-800 rounded px-3 py-1 backdrop-blur opacity-80 hover:opacity-100 transition-opacity">
               <div className="flex items-center gap-1.5">
                  <Activity className={`w-3 h-3 ${metrics.active ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'}`} />
                  <span className={metrics.active ? 'text-emerald-400' : ''}>{metrics.active ? 'STREAMING' : 'IDLE'}</span>
               </div>
               <div className="w-px h-3 bg-zinc-800" />
               <div className="flex items-center gap-1.5">
                  <Gauge className="w-3 h-3" />
                  <span>TTFT: {metrics.ttft > 0 ? `${metrics.ttft.toFixed(0)}ms` : '--'}</span>
               </div>
               <div className="w-px h-3 bg-zinc-800" />
               <div className="flex items-center gap-1.5">
                  <span>LATENCY: {metrics.latency > 0 ? `${metrics.latency.toFixed(0)}ms` : '--'}</span>
               </div>
               {metrics.hallucinations > 0 && (
                   <>
                       <div className="w-px h-3 bg-zinc-800" />
                       <div className="flex items-center gap-1.5 text-pink-500 font-bold">
                          <span>ERR: {metrics.hallucinations}</span>
                       </div>
                   </>
               )}
            </div>

            <form onSubmit={handleSubmit} className="relative group transform transition-all hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                
                <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="pl-4 pr-3 text-slate-500">
                        <Terminal className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe your UI component..."
                        className="w-full bg-transparent text-slate-100 placeholder-slate-500 py-4 px-2 focus:outline-none font-medium"
                        disabled={loading}
                    />
                    <div className="pr-2">
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:bg-zinc-700 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="mt-3 text-center flex justify-center gap-6">
                     <span className="text-[10px] text-slate-600 font-medium">Stream Mode: Enabled</span>
                     <span className="text-[10px] text-slate-600 font-medium">Model: Gemini 3.0 Pro</span>
                </div>
            </form>
        </div>
      </div>

    </div>
  );
};

// Helper Component for the Device Frame
const DeviceWrapper = ({ context, node, onAction, isStreaming }: any) => {
    const [showCode, setShowCode] = useState(false);

    return (
        <div 
            className={`transition-all duration-700 ease-in-out relative
                ${context.device === 'mobile' ? 'w-[375px]' : 'w-full'}
                ${isStreaming ? 'opacity-80' : 'opacity-100'}
            `}
        >
            {/* Device Label */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-500 tracking-widest uppercase bg-zinc-950 px-2 flex items-center gap-2">
                {context.device === 'mobile' ? 'iPhone 15 Viewport' : 'Desktop Viewport'}
                {isStreaming && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}
            </div>

            <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group-ui">
                {/* Mock Browser Header with Code Toggle */}
                <div className="h-9 bg-zinc-950/50 border-b border-white/5 flex items-center px-4 gap-2 justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 group-ui-hover:bg-red-500/50 transition-colors" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 group-ui-hover:bg-yellow-500/50 transition-colors" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 group-ui-hover:bg-green-500/50 transition-colors" />
                    </div>
                    <div className="w-1/2 h-5 bg-zinc-800/50 rounded flex items-center justify-center">
                        <span className="text-[9px] text-zinc-600 font-mono">localhost:3000</span>
                    </div>
                    <button 
                        onClick={() => setShowCode(true)}
                        className="text-zinc-600 hover:text-indigo-400 transition-colors p-1"
                        title="View Source Code"
                    >
                        <Code2 className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Component Renderer */}
                <div className={`
                    bg-slate-950
                    ${context.device === 'mobile' ? 'min-h-[667px]' : 'min-h-[500px]'}
                    overflow-hidden
                `}>
                    <DynamicRenderer node={node} onAction={onAction} />
                </div>

                {/* Code Overlay */}
                {showCode && (
                    <CodeViewer node={node} onClose={() => setShowCode(false)} />
                )}
            </div>
            
            {/* Decor effects */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-2xl -z-10 opacity-50" />
        </div>
    );
};

export default App;