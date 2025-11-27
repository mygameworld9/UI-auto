import React from 'react';

export const Progress = ({ label, value, color = 'BLUE' }: any) => {
  const colors: Record<string, string> = {
    BLUE: 'bg-indigo-500',
    GREEN: 'bg-emerald-500',
    ORANGE: 'bg-orange-500',
    RED: 'bg-rose-500'
  };
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color] || colors.BLUE} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
};
