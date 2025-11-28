
import React, { useState, useEffect, useRef } from 'react';
import DynamicRenderer from './components/DynamicRenderer';
import { 
  User, Sparkles, Smartphone, Monitor, Shield, Zap, Settings, Terminal, 
  ArrowUp, Activity, Gauge, Code2, PenTool, MousePointer2, Palette,
  PanelLeftClose, PanelLeft, Share2, ZoomIn, ZoomOut, RotateCcw, Rocket
} from 'lucide-react';
import { CodeViewer } from './components/CodeViewer';
import { SettingsDialog } from './components/SettingsDialog';
import { useGenUI } from './hooks/useGenUI';
import { EditorProvider } from './components/EditorContext';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { generateTheme } from './services/themeAgent';
import { UINode } from './types';
import { openInStackBlitz } from './services/deployService';

const App = () => {
  return (
    <ThemeProvider>
      <Workspace />
    </ThemeProvider>
  );
};

const Workspace = () => {
  const { state, actions, refs } = useGenUI();
  const { context, input, loading, streamingNode, messages, metrics, editMode, selectedPath, config } = state;
  const { setTheme, isGenerating, setIsGenerating } = useTheme();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Calculate the active node to display on the stage
  const activeNode = streamingNode || messages.slice().reverse().find(m => m.ui)?.ui || null;

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.startsWith('/theme')) {
       const themePrompt = input.replace('/theme', '').trim();
       if (!themePrompt) return;
       
       setIsGenerating(true);
       actions.setInput('');
       try {
          const newTheme = await generateTheme(themePrompt, config);
          setTheme(newTheme);
          actions.handleAction({ type: 'SYSTEM', payload: `Theme updated: ${themePrompt}` });
       } catch (err) {
          console.error(err);
       } finally {
          setIsGenerating(false);
       }
       return;
    }
    actions.handleSubmit(e);
  };

  const handleDeploy = async () => {
    if (!activeNode) return;
    setIsDeploying(true);
    try {
      await openInStackBlitz(activeNode);
    } catch (e) {
      console.error(e);
      alert("Failed to open StackBlitz");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <EditorProvider value={{ isEditing: editMode, selectedPath, onSelect: actions.setSelectedPath }}>
      <div className="flex h-screen w-full bg-[#09090b] text-slate-200 font-sans overflow-hidden">
        
        {/* --- LEFT SIDEBAR (CHAT & INPUT) --- */}
        <div className={`${showSidebar ? 'w-[400px] border-r' : 'w-0'} flex flex-col border-white/5 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 ease-in-out relative z-20 overflow-hidden`}>
          <div className="flex-1 flex flex-col min-h-0 w-[400px]"> {/* Fixed width inner to prevent squishing during transition */}
            
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ${isGenerating ? 'animate-spin' : ''}`}>
                  <Zap className="w-4 h-4 text-white fill-current" />
                </div>
                <h1 className="font-bold text-sm text-white tracking-tight">GenUI <span className="text-slate-500 font-light">Architect</span></h1>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900 border border-white/5 text-[10px] font-medium text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'} `}></span>
                    {config.model.replace('gemini-', '')}
                </div>
                <button onClick={() => setShowSettings(true)} className="p-1.5 text-slate-500 hover:text-white transition-colors hover:bg-zinc-800 rounded-md">
                    <Settings className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
               {messages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-8">
                    <Sparkles className="w-12 h-12 mb-4 text-indigo-500" />
                    <p className="text-sm font-medium">Start building by describing your UI.</p>
                 </div>
               )}
               
               {messages.map((msg, idx) => (
                  <div key={idx} className={`group flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 px-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {msg.role === 'user' ? 'You' : 'Architect'}
                          </span>
                      </div>
                      
                      {msg.role === 'system' ? (
                          <div className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-[11px] font-mono text-indigo-400/80">
                            <Terminal className="w-3 h-3" />
                            <span>{msg.text}</span>
                          </div>
                      ) : (
                        <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-zinc-800 text-slate-100 rounded-tr-sm' 
                              : 'bg-zinc-900/40 text-slate-300 border border-white/5 rounded-tl-sm'
                        }`}>
                            {msg.text || (msg.ui ? <span className="italic text-slate-500 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Generated UI Component</span> : null)}
                        </div>
                      )}
                      
                      {msg.ui && (
                        <div className="mt-1 px-1">
                           <button 
                              onClick={() => {
                                alert("History restoration would happen here.");
                              }}
                              className="text-[10px] flex items-center gap-1 text-slate-600 hover:text-indigo-400 transition-colors"
                           >
                              <RotateCcw className="w-3 h-3" /> Restore this version
                           </button>
                        </div>
                      )}
                  </div>
               ))}
               <div ref={refs.messagesEndRef} className="h-4" />
            </div>

            {/* Input Area (Fixed Bottom) */}
            <div className="p-4 bg-zinc-950 border-t border-white/5 relative z-10">
               <form onSubmit={handleCustomSubmit} className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${editMode ? 'from-indigo-600 via-purple-600 to-pink-600' : 'from-indigo-500/50 via-purple-500/50 to-pink-500/50'} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                  <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-lg">
                      <div className="pl-3 text-slate-500">
                          {editMode ? <PenTool className="w-4 h-4 text-indigo-400" /> : <Terminal className="w-4 h-4" />}
                      </div>
                      <input
                          type="text"
                          value={input}
                          onChange={(e) => actions.setInput(e.target.value)}
                          placeholder={editMode && selectedPath ? "Refine selection..." : "Describe UI..."}
                          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 py-3.5 px-3 focus:outline-none"
                          disabled={loading || isGenerating}
                      />
                      <button
                          type="submit"
                          disabled={!input.trim() || loading || isGenerating}
                          className="mr-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:bg-zinc-800 transition-all"
                      >
                          <ArrowUp className="w-4 h-4" />
                      </button>
                  </div>
               </form>

               {/* Metrics Mini-Bar */}
               <div className="flex items-center justify-between mt-3 px-1">
                   <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                      <div className="flex items-center gap-1.5">
                          <Activity className={`w-3 h-3 ${metrics.active ? 'text-emerald-500 animate-pulse' : ''}`} />
                          <span className={metrics.active ? 'text-emerald-500' : ''}>{metrics.active ? 'GENERATING' : 'IDLE'}</span>
                      </div>
                      <span>TTFT: {metrics.ttft > 0 ? `${metrics.ttft.toFixed(0)}ms` : '--'}</span>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => actions.setEditMode(!editMode)}
                        className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${editMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                      >
                         {editMode ? <MousePointer2 className="w-3 h-3" /> : <PenTool className="w-3 h-3" />}
                         {editMode ? 'Edit Mode On' : 'Edit Mode'}
                      </button>
                   </div>
               </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT STAGE (MAIN CANVAS) --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0e] relative">
           
           {/* Sidebar Toggle (Floating on left edge) */}
           <button 
             onClick={() => setShowSidebar(!showSidebar)}
             className="absolute left-4 top-4 z-30 p-2 bg-zinc-900/80 backdrop-blur border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all hover:bg-zinc-800"
           >
             {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
           </button>

           {/* Toolbar */}
           <div className="h-14 border-b border-white/5 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center relative z-20 px-4">
              <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-white/5">
                  <button 
                    onClick={() => actions.setContext(p => ({ ...p, device: 'desktop' }))}
                    className={`p-2 rounded-md transition-all ${context.device === 'desktop' ? 'bg-zinc-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Desktop View"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => actions.setContext(p => ({ ...p, device: 'mobile' }))}
                    className={`p-2 rounded-md transition-all ${context.device === 'mobile' ? 'bg-zinc-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button 
                    onClick={() => actions.setContext(p => ({ ...p, role: context.role === 'admin' ? 'user' : 'admin' }))}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-zinc-800 transition-all"
                  >
                     {context.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-indigo-400" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
                     {context.role === 'admin' ? 'Admin' : 'User'}
                  </button>
              </div>

              <div className="absolute right-4 flex items-center gap-2">
                 <button 
                    onClick={handleDeploy}
                    disabled={isDeploying || !activeNode}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${isDeploying ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-zinc-900 border-white/5 text-slate-400 hover:text-white hover:border-emerald-500/30 hover:bg-emerald-500/10'}`}
                 >
                    {isDeploying ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Rocket className="w-4 h-4" />}
                    <span className="hidden sm:inline">Launch</span>
                 </button>
                 <button 
                    onClick={() => setShowCode(!showCode)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${showCode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-zinc-900 border-white/5 text-slate-400 hover:text-white'}`}
                 >
                    <Code2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Code</span>
                 </button>
              </div>
           </div>

           {/* Canvas Area */}
           <div className="flex-1 overflow-hidden relative flex items-center justify-center">
              {/* Dot Pattern Background */}
              <div className="absolute inset-0 z-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
              
              <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar flex items-start justify-center pt-12 pb-24">
                  {activeNode ? (
                    <DeviceWrapper 
                        context={context} 
                        node={activeNode} 
                        onAction={actions.handleAction} 
                        onError={actions.fixNode} 
                        isStreaming={loading}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-700 mt-32 animate-in fade-in duration-700">
                        <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl rotate-3">
                           <Palette className="w-10 h-10 opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-600">Ready to Design</h3>
                        <p className="text-sm text-zinc-600 mt-2 max-w-md text-center">Use the chat on the left to describe your interface.</p>
                    </div>
                  )}
              </div>
           </div>
        </div>

        {/* Modals */}
        {showSettings && <SettingsDialog config={config} onSave={actions.setConfig} onClose={() => setShowSettings(false)} />}
        {showCode && activeNode && <CodeViewer node={activeNode} onClose={() => setShowCode(false)} />}
        
      </div>
    </EditorProvider>
  );
};

// --- Sub-components ---

const DeviceWrapper = ({ context, node, onAction, isStreaming, onError }: any) => {
    return (
        <div 
            className={`transition-all duration-500 ease-in-out relative flex-shrink-0
                ${context.device === 'mobile' ? 'w-[390px]' : 'w-[1024px]'}
                ${isStreaming ? 'opacity-90 grayscale-[0.2]' : 'opacity-100'}
            `}
        >
            <div className={`
                bg-zinc-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative 
                ${context.device === 'mobile' ? 'min-h-[844px] border-[8px] border-zinc-900 rounded-[3rem]' : 'min-h-[600px] border border-zinc-800'}
            `}>
                {/* Desktop Browser Bar */}
                {context.device !== 'mobile' && (
                    <div className="h-10 bg-zinc-950 border-b border-white/5 flex items-center px-4 gap-4">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                        </div>
                        <div className="flex-1 max-w-xl mx-auto h-6 bg-zinc-900 rounded-md border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-600 font-mono">
                            localhost:3000/preview
                        </div>
                    </div>
                )}
                
                {/* Mobile Dynamic Island Notch Placeholder */}
                {context.device === 'mobile' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-4 bg-zinc-900/20 rounded-full" />
                    </div>
                )}

                <div className={`
                    bg-[#020617] h-full
                    ${context.device === 'mobile' ? 'pt-8 pb-4 px-1 min-h-[800px]' : 'min-h-[600px]'}
                `}>
                    <DynamicRenderer node={node} onAction={onAction} onError={onError} path="root" />
                </div>
                
                {/* Loading Overlay */}
                {isStreaming && (
                    <div className="absolute top-4 right-4 z-50">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-500/50" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
