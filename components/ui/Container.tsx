import React from 'react';
import { RenderChildren } from './utils';
import { THEME } from './theme';

export const Container = ({ children, layout = 'COL', gap = 'GAP_MD', padding = false, background = 'DEFAULT', bgImage, className = '', onAction }: any) => {
  const layoutClass = THEME.container.layouts[layout as keyof typeof THEME.container.layouts] || THEME.container.layouts.COL;
  const gapClass = THEME.container.gaps[gap as keyof typeof THEME.container.gaps] || THEME.container.gaps.GAP_MD;
  const bgClass = THEME.container.backgrounds[background as keyof typeof THEME.container.backgrounds] || THEME.container.backgrounds.DEFAULT;
  const padClass = padding ? 'p-6 md:p-8' : '';

  return (
    <div className={`${THEME.container.base} ${layoutClass} ${gapClass} ${padClass} ${bgClass} ${className}`}>
      {bgImage && (
        <div 
          className="absolute inset-0 -z-10 bg-cover bg-center rounded-inherit opacity-90"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      {/* Optional dark overlay if image is present to ensure text readability */}
      {bgImage && <div className="absolute inset-0 -z-10 bg-black/40 rounded-inherit" />}
      
      <RenderChildren children={children} onAction={onAction} />
    </div>
  );
};