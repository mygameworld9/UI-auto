import React from 'react';
import { RenderChildren } from './utils';

export const Hero = ({ title, subtitle, gradient = 'BLUE_PURPLE', align = 'CENTER', children, onAction }: any) => {
  const gradients: Record<string, string> = {
    BLUE_PURPLE: 'from-blue-600/30 via-indigo-500/30 to-purple-600/30',
    ORANGE_RED: 'from-orange-500/30 via-red-500/30 to-pink-500/30',
    GREEN_TEAL: 'from-emerald-500/30 via-teal-500/30 to-cyan-500/30',
  };

  const alignClass = align === 'LEFT' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/5 p-12 md:p-24 flex flex-col ${alignClass} gap-8`}>
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[gradient] || gradients.BLUE_PURPLE} opacity-40 blur-3xl`} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      
      <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-sm">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 mt-6 flex gap-4">
        <RenderChildren children={children} onAction={onAction} />
      </div>
    </div>
  );
};
