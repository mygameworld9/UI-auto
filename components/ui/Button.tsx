import React from 'react';
import * as Lucide from 'lucide-react';

export const Button = ({ label, variant = 'PRIMARY', icon, action, onAction }: any) => {
  const base = "inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants: Record<string, string> = {
    PRIMARY: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10',
    SECONDARY: 'bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700',
    GHOST: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
    DANGER: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    GLOW: 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_25px_rgba(124,58,237,0.4)] border border-violet-400/50',
    OUTLINE: 'bg-transparent border border-zinc-600 text-zinc-400 hover:border-zinc-400 hover:text-white',
    SOFT: 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/10',
    GRADIENT: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-white/10'
  };

  const IconCmp = icon && (Lucide as any)[icon] ? (Lucide as any)[icon] : null;

  return (
    <button 
      onClick={() => onAction && action ? onAction(action) : null}
      className={`${base} ${variants[variant] || variants.PRIMARY}`}
    >
      {IconCmp && <IconCmp className="w-4 h-4 mr-2" />}
      {label}
    </button>
  );
};
