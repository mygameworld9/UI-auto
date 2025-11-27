import React from 'react';
import { THEME } from './theme';

export const Typography = ({ content, variant = 'BODY', color = 'DEFAULT', font = 'SANS' }: any) => {
  const styleClass = THEME.typography.variants[variant as keyof typeof THEME.typography.variants] || THEME.typography.variants.BODY;
  const colorClass = THEME.typography.colors[color as keyof typeof THEME.typography.colors] || THEME.typography.colors.DEFAULT;
  const fontClass = THEME.typography.fonts[font as keyof typeof THEME.typography.fonts] || THEME.typography.fonts.SANS;

  return (
    <div className={`${styleClass} ${colorClass} ${fontClass}`}>
      {content}
    </div>
  );
};