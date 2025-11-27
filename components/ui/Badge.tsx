import React from 'react';
import { THEME } from './theme';

export const Badge = ({ label, color = 'BLUE' }: any) => {
  const colorClass = THEME.badge.colors[color as keyof typeof THEME.badge.colors] || THEME.badge.colors.BLUE;
  
  return (
    <span className={`${THEME.badge.base} ${colorClass}`}>
      {label}
    </span>
  );
};