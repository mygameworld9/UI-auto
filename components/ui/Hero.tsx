
import React from 'react';
import { RenderChildren } from './utils';
import { useTheme } from '../ThemeContext';

export const Hero = ({ title, subtitle, gradient = 'BLUE_PURPLE', align = 'CENTER', children, onAction, path }: any) => {
  const { theme } = useTheme();
  const gradientClass = theme.hero.gradients[gradient as keyof typeof theme.hero.gradients] || theme.hero.gradients.BLUE_PURPLE;
  const alignClass = align === 'LEFT' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`${theme.hero.base} ${alignClass} gap-8`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-40 blur-3xl`} />
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
        <RenderChildren children={children} onAction={onAction} parentPath={path} />
      </div>
    </div>
  );
};
