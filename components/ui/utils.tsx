
import React from 'react';
import { UINode, UIAction } from '../../types';
import DynamicRenderer from '../DynamicRenderer';

export const RenderChildren = ({ children, onAction, parentPath }: { children: UINode[], onAction: (action: UIAction) => void, parentPath?: string }) => {
  if (!children || !Array.isArray(children)) return null;
  
  return children.map((child: UINode, i: number) => {
    const childPath = parentPath ? `${parentPath}.children.${i}` : undefined;
    return <DynamicRenderer key={i} index={i} node={child} onAction={onAction} path={childPath} />;
  });
};

/**
 * Immutable Deep Set Utility (Recursive & Type-Safe)
 */
export function setByPath<T>(obj: T, path: string, value: any): T {
  if (!path) return value as unknown as T;
  const segments = path.split('.');

  const update = (current: any, depth: number): any => {
    if (depth === segments.length) return value;
    const key = segments[depth];
    
    let clone: any;
    if (Array.isArray(current)) {
      clone = [...current];
    } else if (current && typeof current === 'object') {
      clone = { ...current };
    } else {
      const isIndex = !isNaN(Number(key));
      clone = isIndex ? [] : {};
    }

    clone[key] = update(current ? current[key] : undefined, depth + 1);
    return clone;
  };

  return update(obj, 0) as T;
}
