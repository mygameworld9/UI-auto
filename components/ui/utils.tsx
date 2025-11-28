
import React from 'react';
import { UINode, UIAction } from '../../types';
import DynamicRenderer from '../DynamicRenderer';

export const RenderChildren = ({ children, onAction, parentPath }: { children: UINode[], onAction: (action: UIAction) => void, parentPath?: string }) => {
  if (!children || !Array.isArray(children)) return null;
  
  return children.map((child: UINode, i: number) => {
    // Construct child path based on parent props path
    // If parent is `root.container`, then children array is `root.container.children`
    // Child index `i` is `root.container.children.i`
    // This path points to the UINode object of the child
    const childPath = parentPath ? `${parentPath}.children.${i}` : undefined;
    
    return <DynamicRenderer key={i} index={i} node={child} onAction={onAction} path={childPath} />;
  });
};
