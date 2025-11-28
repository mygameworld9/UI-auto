
import React from 'react';
import { useTheme } from '../ThemeContext';

export const Badge = ({ label, color = 'BLUE' }: any) => {
  const { theme } = useTheme();
  const colorClass = theme.badge.colors[color as keyof typeof theme.badge.colors] || theme.badge.colors.BLUE;
  
  return (
    <span className={`${theme.badge.base} ${colorClass}`}>
      {label}
    </span>
  );
};
