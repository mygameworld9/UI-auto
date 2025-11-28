
import React, { useState } from 'react';
import DynamicRenderer from './components/DynamicRenderer';
import { 
  User, Sparkles, Smartphone, Monitor, Shield, Zap, Settings, Terminal, ArrowUp, Activity, Gauge, Code2, PenTool, MousePointer2, Palette
} from 'lucide-react';
import { CodeViewer } from './components/CodeViewer';
import { SettingsDialog } from './components/SettingsDialog';
import { useGenUI } from './hooks/useGenUI';
import { EditorProvider } from './components/EditorContext';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { generateTheme } from './services/themeAgent';

const App = () => {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
};

const MainApp = () => {
  const { state, actions, refs } = useGenUI();
  const { context, input, loading, streamingNode, messages, metrics, editMode, selectedPath, config } = state;
  const { setTheme, isGenerating, setIsGenerating } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  // Intercept theme commands
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
          // Add system message
          actions.handleAction({ type: 'SYSTEM', payload: `Theme updated: ${themePrompt}` }); // Dummy action to log
       } catch (err) {
          console.error(err);
       } finally {
          setIsGenerating(false);
       }
       return;
    }
    actions.handleSubmit(e);
  };

  return (
    <EditorProvider value={{ isEditing: editMode, selectedPath, onSelect: actions.setSelectedPath }}>
      <div className="flex flex-col h-screen overflow-hidden text-slate-200 font-sans selection:bg-indigo-500/30">
        
        {/* 1. Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 z-50 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ${isGenerating ? 'animate-spin' : ''}`}>
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight">GenUI <span className="text-slate-500 font-light">Architect</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-xs font-medium text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'} `}></span>
                  {config.model}
              </div>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-zinc-800 rounded-lg"
                title="API Settings"
              >
                  <Settings className="w-5 h-5" />
              </button>
          </div>
        </header>

        {/* 2. Main Content */}
        <main className="flex-1 overflow-y-auto relative pt-20 pb-32">
          <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-12">
              
              {/* Context Controls */}
              <div className="sticky top-4 z-40 flex justify-center mb-8">
                  <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center gap-1">
                      <button 
                          onClick={() => actions.setContext(p => ({ ...p, role: 'user' }))}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${context.role === 'user' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                          <User className="w-3.5 h-3.5" /> User View
                      </button>
                      <button 
                          onClick={() => actions.setContext(p => ({ ...p, role: 'admin' }))}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${context.role === 'admin' ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                          <Shield className="w-3.5 h-3.5" /> Admin View
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-2" />
                      <button 
                          onClick={() => actions.setEditMode(!editMode)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${editMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                          {editMode ? <MousePointer2 className="w-3.5 h-3.5" /> : <PenTool className="w-3.5 h-3.5" />}
                          {editMode ? 'Editing' : 'Edit Mode'}
                      </button>
                  </div>
              </div>

              {/* Messages Feed */}
              {messages.map((msg, idx) => (
                <div key={idx} className={`group ${msg.role === 'user' ? 'flex justify-end' : 'flex flex-col items-center w-full'}`}>
                  
                  {msg.role === 'user' && (
                     <div className="max-w-xl">
                        <div className="bg-zinc-800 text-slate-100 px-6 py-4 rounded-2xl rounded-tr-none border border-zinc-700 shadow-md">
                          <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                        </div>
                     </div>
                  )}

                  {msg.role === 'system' && (
                      <div className="w-full max-w-2xl flex items-center gap-3 py-2 px-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-xs font-mono text-indigo-400/80">
                          <Terminal className="w-3 h-3" />
                          <span>{msg.text}</span>
                      </div>
                  )}

                  {msg.role === 'assistant' && (
                    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {msg.text && (
                          <div className="flex gap-4 max-w-2xl mx-auto">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-white" />
                              </div>
                              <div className="pt-1">
                                  <p className="text-sm text-slate-300 leading-relaxed">{msg.text}</p>
                              </div>
                          </div>
                      )}

                      {msg.ui && (
                          <div className="w-full flex justify-center py-6">
                               <DeviceWrapper 
                                  context={context} 
                                  node={msg.ui} 
                                  onAction={actions.handleAction} 
                                  onError={actions.fixNode} // Pass the auto-healer
                               />
                          </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && streamingNode && (
                  <div className="w-full flex justify-center py-6 animate-in fade-in duration-300">
                      <DeviceWrapper context={context} node={streamingNode} onAction={actions.handleAction} isStreaming={true} />
                  </div>
              )}
              
              <div ref={refs.messagesEndRef} className="h-32" /> 
          </div>
        </main>

        {/* 3. Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto relative">
              
              {/* Telemetry Status Bar */}
              <div className="absolute -top-10 right-0 flex items-center gap-4 text-[10px] font-mono text-zinc-500 bg-zinc-950/90 border border-zinc-800 rounded px-3 py-1 backdrop-blur opacity-80">
                 <div className="flex items-center gap-1.5">
                    <Activity className={`w-3 h-3 ${metrics.active ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'}`} />
                    <span className={metrics.active ? 'text-emerald-400' : ''}>{metrics.active ? 'STREAMING' : 'IDLE'}</span>
                 </div>
                 <div className="w-px h-3 bg-zinc-800" />
                 <div className="flex items-center gap-1.5">
                    <Gauge className="w-3 h-3" />
                    <span>TTFT: {metrics.ttft > 0 ? `${metrics.ttft.toFixed(0)}ms` : '--'}</span>
                 </div>
              </div>

              <form onSubmit={handleCustomSubmit} className="relative group transform transition-all hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-r ${editMode ? 'from-indigo-600 via-purple-600 to-pink-600' : (isGenerating ? 'from-emerald-500 via-teal-500 to-cyan-500' : 'from-indigo-500 via-purple-500 to-pink-500')} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                  
                  <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                      <div className="pl-4 pr-3 text-slate-500">
                          {editMode ? <PenTool className="w-5 h-5 text-indigo-400" /> : (isGenerating ? <Palette className="w-5 h-5 text-emerald-400 animate-pulse" /> : <Terminal className="w-5 h-5" />)}
                      </div>
                      <input
                          type="text"
                          value={input}
                          onChange={(e) => actions.setInput(e.target.value)}
                          placeholder={editMode && selectedPath ? "Refine selected element..." : "Describe component (or /theme name)..."}
                          className="w-full bg-transparent text-slate-100 placeholder-slate-500 py-4 px-2 focus:outline-none font-medium"
                          disabled={loading || isGenerating}
                      />
                      <div className="pr-2">
                          <button
                              type="submit"
                              disabled={!input.trim() || loading || isGenerating}
                              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:bg-zinc-700 transition-all shadow-lg shadow-indigo-500/20"
                          >
                              <ArrowUp className="w-5 h-5" />
                          </button>
                      </div>
                  </div>
              </form>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <SettingsDialog 
            config={config} 
            onSave={actions.setConfig} 
            onClose={() => setShowSettings(false)} 
          />
        )}

      </div>
    </EditorProvider>
  );
};

const DeviceWrapper = ({ context, node, onAction, isStreaming, onError }: any) => {
    const [showCode, setShowCode] = useState(false);

    return (
        <div 
            className={`transition-all duration-700 ease-in-out relative
                ${context.device === 'mobile' ? 'w-[375px]' : 'w-full'}
                ${isStreaming ? 'opacity-80' : 'opacity-100'}
            `}
        >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-500 tracking-widest uppercase bg-zinc-950 px-2 flex items-center gap-2">
                {context.device === 'mobile' ? 'iPhone 15 Viewport' : 'Desktop Viewport'}
            </div>

            <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group-ui">
                <div className="h-9 bg-zinc-950/50 border-b border-white/5 flex items-center px-4 gap-2 justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    </div>
                    <button 
                        onClick={() => setShowCode(true)}
                        className="text-zinc-600 hover:text-indigo-400 transition-colors p-1"
                        title="View Source Code"
                    >
                        <Code2 className="w-4 h-4" />
                    </button>
                </div>
                
                <div className={`
                    bg-slate-950
                    ${context.device === 'mobile' ? 'min-h-[667px]' : 'min-h-[500px]'}
                    overflow-hidden
                `}>
                    <DynamicRenderer node={node} onAction={onAction} onError={onError} path="root" />
                </div>

                {showCode && (
                    <CodeViewer node={node} onClose={() => setShowCode(false)} />
                )}
            </div>
        </div>
    );
};

export default App;
