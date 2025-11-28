
import React from 'react';
import { RenderChildren } from './utils';
import { useTheme } from '../ThemeContext';

export const Container = ({ children, layout = 'COL', gap = 'GAP_MD', padding = false, background = 'DEFAULT', bgImage, className = '', onAction, path }: any) => {
  const { theme } = useTheme();
  const layoutClass = theme.container.layouts[layout as keyof typeof theme.container.layouts] || theme.container.layouts.COL;
  const gapClass = theme.container.gaps[gap as keyof typeof theme.container.gaps] || theme.container.gaps.GAP_MD;
  const bgClass = bgImage ? '' : (theme.container.backgrounds[background as keyof typeof theme.container.backgrounds] || theme.container.backgrounds.DEFAULT);
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
