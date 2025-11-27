import React from 'react';
import { RenderChildren } from './utils';
import { THEME } from './theme';

export const Container = ({ children, layout = 'COL', gap = 'GAP_MD', padding = false, background = 'DEFAULT', className = '', onAction }: any) => {
  const layoutClass = THEME.container.layouts[layout as keyof typeof THEME.container.layouts] || THEME.container.layouts.COL;
  const gapClass = THEME.container.gaps[gap as keyof typeof THEME.container.gaps] || THEME.container.gaps.GAP_MD;
  const bgClass = THEME.container.backgrounds[background as keyof typeof THEME.container.backgrounds] || THEME.container.backgrounds.DEFAULT;
  const padClass = padding ? 'p-6 md:p-8' : '';

  return (
    <div className={`${THEME.container.base} ${layoutClass} ${gapClass} ${padClass} ${bgClass} ${className}`}>
      <RenderChildren children={children} onAction={onAction} />
    </div>
  );
};