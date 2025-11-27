import React from 'react';
import * as Lucide from 'lucide-react';
import { THEME } from './theme';

export const Button = ({ label, variant = 'PRIMARY', icon, action, onAction }: any) => {
  const IconCmp = icon && (Lucide as any)[icon] ? (Lucide as any)[icon] : null;

  // Use optional chaining/fallback to prevent crashes if a new variant is introduced in prompt but not theme
  const variantClass = THEME.button.variants[variant as keyof typeof THEME.button.variants] || THEME.button.variants.PRIMARY;

  return (
    <button 
      onClick={() => onAction && action ? onAction(action) : null}
      className={`${THEME.button.base} ${variantClass}`}
    >
      {IconCmp && <IconCmp className="w-4 h-4 mr-2" />}
      {label}
    </button>
  );
};