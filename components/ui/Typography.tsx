import React from 'react';
import { THEME } from './theme';

export const Typography = ({ content, variant = 'BODY', color = 'DEFAULT' }: any) => {
  const styleClass = THEME.typography.variants[variant as keyof typeof THEME.typography.variants] || THEME.typography.variants.BODY;
  const colorClass = THEME.typography.colors[color as keyof typeof THEME.typography.colors] || THEME.typography.colors.DEFAULT;

  return (
    <div className={`${styleClass} ${colorClass}`}>
      {content}
    </div>
  );
};