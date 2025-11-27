import React from 'react';
import { UINode, UIAction } from '../../types';
import DynamicRenderer from '../DynamicRenderer';

export const RenderChildren = ({ children, onAction }: { children: UINode[], onAction: (action: UIAction) => void }) => {
  if (!children || !Array.isArray(children)) return null;
  return children.map((child: UINode, i: number) => (
    <DynamicRenderer key={i} index={i} node={child} onAction={onAction} />
  ));
};
