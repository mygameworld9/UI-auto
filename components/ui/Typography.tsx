import React from 'react';

export const Typography = ({ content, variant = 'BODY', color = 'DEFAULT' }: any) => {
  const styles: Record<string, string> = {
    H1: 'text-4xl md:text-5xl font-extrabold tracking-tight',
    H2: 'text-3xl font-bold tracking-tight',
    H3: 'text-xl font-semibold tracking-tight',
    BODY: 'text-sm md:text-base leading-7 text-slate-300',
    CAPTION: 'text-xs uppercase tracking-widest font-bold text-slate-500',
    CODE: 'font-mono text-xs bg-zinc-900 border border-white/10 px-2 py-1 rounded text-pink-400'
  };
  const colors: Record<string, string> = {
    DEFAULT: 'text-slate-100',
    MUTED: 'text-slate-500',
    PRIMARY: 'text-indigo-400',
    ACCENT: 'text-violet-400',
    DANGER: 'text-red-400',
    SUCCESS: 'text-emerald-400'
  };

  return (
    <div className={`${styles[variant] || styles.BODY} ${colors[color] || colors.DEFAULT}`}>
      {content}
    </div>
  );
};
