import React from 'react';
import { RenderChildren } from './utils';

export const Card = ({ children, title, variant = 'DEFAULT', onAction }: any) => {
  const styles: Record<string, string> = {
    DEFAULT: 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700',
    GLASS: 'bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-xl',
    NEON: 'bg-zinc-950 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]',
    OUTLINED: 'bg-transparent border-2 border-dashed border-zinc-800 hover:border-zinc-700',
    ELEVATED: 'bg-zinc-800 shadow-2xl shadow-black/50 border-t border-white/5',
    FROSTED: 'bg-white/5 backdrop-blur-xl border border-white/5'
  };

  return (
    <div className={`rounded-2xl overflow-hidden ${styles[variant] || styles.DEFAULT} flex flex-col h-full transition-all duration-300 group`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <RenderChildren children={children} onAction={onAction} />
      </div>
    </div>
  );
};
