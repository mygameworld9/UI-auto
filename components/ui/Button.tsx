import React from 'react';
import * as Lucide from 'lucide-react';
import { useTheme } from '../ThemeContext';

export const Button = ({ label, variant = 'PRIMARY', icon, action, onAction }: any) => {
  const { theme } = useTheme();
  const IconCmp = icon && (Lucide as any)[icon] ? (Lucide as any)[icon] : null;

  const variantClass = theme.button.variants[variant as keyof typeof theme.button.variants] || theme.button.variants.PRIMARY;

  return (
    <button 
      onClick={() => onAction && action ? onAction(action) : null}
      className={`${theme.button.base} ${variantClass}`}
    >
      {IconCmp && <IconCmp className="w-4 h-4 mr-2" />}
      {label}
    </button>
  );
};