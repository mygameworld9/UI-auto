import React, { useState, useRef, useEffect } from 'react';
import { generateUI } from './services/geminiService';
import DynamicRenderer from './components/DynamicRenderer';
import { UINode, UserContext, UIAction } from './types';
import { INITIAL_CONTEXT } from './constants';
import { 
  Bot, Send, User, Settings, LayoutTemplate, ShieldAlert, Smartphone, Monitor, Moon, Sun, Loader2 
} from 'lucide-react';

const App = () => {
  // State
  const [context, setContext] = useState<UserContext>(INITIAL_CONTEXT);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{role: string, text: string, ui?: UINode}>>([
    { role: 'system', text: 'Welcome to GenUI. I can generate dynamic interfaces based on your needs. Try "Create a dashboard for user analytics" or "Show me a profile settings form".' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5.1 Event Delegation / Action Handler
  const handleAction = (action: UIAction) => {
    console.log("Action Triggered:", action);
    // In a real app, this would dispatch to a store or API
    const responseText = `Action Executed: ${action.type} (Payload: ${action.payload || 'None'})`;
    
    setMessages(prev => [...prev, { 
      role: 'system', 
      text: responseText 
    }]);

    // Simulating a state update cycle or multi-turn UI update
    if (action.type === 'NAVIGATE') {
        // Logic to ask LLM for new page...
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);

    // 1.1 Explicit Input
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // 2. LLM Processing
    const uiTree = await generateUI(userMsg, context);

    setLoading(false);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      text: 'Here is the generated interface:',
      ui: uiTree
    }]);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar / Context Controls */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-10">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <LayoutTemplate className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg text-white">GenUI Architect</h1>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-8">
          {/* Context Control: Role */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Context</h3>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                {context.role === 'admin' ? <ShieldAlert className="w-5 h-5 text-red-400"/> : <User className="w-5 h-5 text-blue-400"/>}
                <span className="text-sm font-medium">{context.role === 'admin' ? 'Admin' : 'Standard User'}</span>
              </div>
              <button 
                onClick={() => setContext(p => ({ ...p, role: p.role === 'admin' ? 'user' : 'admin' }))}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Switch
              </button>
            </div>
          </div>

          {/* Context Control: Device */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Environment</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setContext(p => ({ ...p, device: 'desktop' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${context.device === 'desktop' ? 'bg-blue-600/10 border-blue-600 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <Monitor className="w-5 h-5 mb-1" />
                <span className="text-xs">Desktop</span>
              </button>
              <button 
                onClick={() => setContext(p => ({ ...p, device: 'mobile' }))}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${context.device === 'mobile' ? 'bg-blue-600/10 border-blue-600 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <Smartphone className="w-5 h-5 mb-1" />
                <span className="text-xs">Mobile</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          Powered by Gemini 2.5 Flash
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Chat / Interaction History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-8 pb-24">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center mt-1">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                )}

                <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Text Bubble */}
                  {msg.text && (
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                  )}

                  {/* Generated UI Canvas */}
                  {msg.ui && (
                    <div className={`mt-2 w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}>
                      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                        {/* Canvas Header */}
                        <div className="h-8 bg-slate-800/50 border-b border-slate-700 flex items-center px-3 gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                          <div className="ml-auto text-[10px] font-mono text-slate-500">DYNAMIC RENDERER</div>
                        </div>
                        {/* Canvas Body - 4.2 Recursive Renderer Entry */}
                        <div className={`p-6 md:p-8 ${context.device === 'mobile' ? 'max-w-sm mx-auto border-x border-slate-800 min-h-[500px]' : 'w-full'}`}>
                          <DynamicRenderer node={msg.ui} onAction={handleAction} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                   <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center mt-1">
                     <User className="w-5 h-5 text-white" />
                   </div>
                )}
              </div>
            ))}
            
            {loading && (
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-700 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-sm text-slate-400">Generating Interface Architecture...</span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 absolute bottom-0 left-0 right-0">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the UI you need (e.g., 'A sales dashboard for an admin', 'Login page for mobile')..."
                className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-2 text-center">
              <p className="text-[10px] text-slate-500">
                The AI acts as a backend, returning raw JSON which the frontend dynamically maps to components.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
