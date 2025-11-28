
import React from 'react';
import { RenderChildren } from './utils';
import { THEME } from './theme';

export const Container = ({ children, layout = 'COL', gap = 'GAP_MD', padding = false, background = 'DEFAULT', bgImage, className = '', onAction, path }: any) => {
  const layoutClass = THEME.container.layouts[layout as keyof typeof THEME.container.layouts] || THEME.container.layouts.COL;
  const gapClass = THEME.container.gaps[gap as keyof typeof THEME.container.gaps] || THEME.container.gaps.GAP_MD;
  const bgClass = bgImage ? '' : (THEME.container.backgrounds[background as keyof typeof THEME.container.backgrounds] || THEME.container.backgrounds.DEFAULT);
  const padClass = padding ? 'p-6 md:p-8' : '';

  const style = bgImage ? {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return (
    <div 
      className={`flex w-full ${layoutClass} ${gapClass} ${padClass} ${bgClass} ${className} transition-all relative overflow-hidden`}
      style={style}
    >
      {bgImage && <div className="absolute inset-0 bg-black/40 pointer-events-none" />}
      
      <div className="relative z-10 w-full flex flex-col h-full">
        <RenderChildren children={children} onAction={onAction} parentPath={path} />
      </div>
    </div>
  );
};
