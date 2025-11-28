import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { ModelConfig, DEFAULT_CONFIG } from '../types/settings';

interface SettingsDialogProps {
  config: ModelConfig;
  onSave: (config: ModelConfig) => void;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState<ModelConfig>(config);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    if (!localConfig.apiKey) {
      setError("API Key is required");
      return;
    }
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-lg font-bold text-white tracking-tight">Model Configuration</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Base URL</label>
              <input
                type="text"
                value={localConfig.baseUrl}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="https://generativelanguage.googleapis.com/v1beta/openai/"
              />
              <p className="text-[10px] text-zinc-600">Default: Google Gemini OpenAI-compatible endpoint</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">API Key</label>
              <input
                type="password"
                value={localConfig.apiKey}
                onChange={(e) => {
                    setLocalConfig({ ...localConfig, apiKey: e.target.value });
                    if (error) setError(null);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="sk-..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Model</label>
              <input
                type="text"
                value={localConfig.model}
                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="gemini-2.0-flash"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-end gap-3">
          <button 
            onClick={() => setLocalConfig(DEFAULT_CONFIG)}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Reset Default
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
