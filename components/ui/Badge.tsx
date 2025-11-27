import React from 'react';

export const Badge = ({ label, color = 'BLUE' }: any) => {
  const colors: Record<string, string> = {
    BLUE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    GREEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    RED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    GRAY: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${colors[color] || colors.BLUE}`}>
      {label}
    </span>
  );
};
