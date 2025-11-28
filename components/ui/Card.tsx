
import React from 'react';
import { RenderChildren } from './utils';
import { THEME } from './theme';

export const Card = ({ children, title, variant = 'DEFAULT', onAction, path }: any) => {
  const variantClass = THEME.card.variants[variant as keyof typeof THEME.card.variants] || THEME.card.variants.DEFAULT;

  return (
    <div className={`${THEME.card.base} ${variantClass}`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <RenderChildren children={children} onAction={onAction} parentPath={path} />
      </div>
    </div>
  );
};
