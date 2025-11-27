import React from 'react';
import { RenderChildren } from './utils';

export const Container = ({ children, layout = 'COL', gap = 'GAP_MD', padding = false, background = 'DEFAULT', className = '', onAction }: any) => {
  const baseClass = "flex w-full";
  
  const layouts: Record<string, string> = {
    COL: 'flex-col',
    ROW: 'flex-row flex-wrap items-center',
    GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };
  const gaps: Record<string, string> = { 
    GAP_SM: 'gap-3', 
    GAP_MD: 'gap-6', 
    GAP_LG: 'gap-8',
    GAP_XL: 'gap-12'
  };
  const backgrounds: Record<string, string> = {
    DEFAULT: '',
    SURFACE: 'bg-zinc-900 border border-white/5 rounded-2xl',
    GLASS: 'bg-zinc-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl'
  };

  const layoutClass = layouts[layout] || layouts.COL;
  const gapClass = gaps[gap] || gaps.GAP_MD;
  const padClass = padding ? 'p-6 md:p-8' : '';
  const bgClass = backgrounds[background] || backgrounds.DEFAULT;

  return (
    <div className={`${baseClass} ${layoutClass} ${gapClass} ${padClass} ${bgClass} ${className} transition-all`}>
      <RenderChildren children={children} onAction={onAction} />
    </div>
  );
};
