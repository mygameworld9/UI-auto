import React from 'react';
import { UINode, UIAction } from '../types';
import { ComponentRegistry } from './ui/Registry';

interface RendererProps {
  node: UINode;
  onAction: (action: UIAction) => void;
  index?: number; // Used for key generation if IDs are missing
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 4.2 Recursive Renderer Logic
const DynamicRenderer: React.FC<RendererProps> = ({ node, onAction, index = 0 }) => {
  if (!node || typeof node !== 'object') return null;

  // Find the key that matches a registered component
  const componentType = Object.keys(node).find(key => ComponentRegistry[key]);

  if (!componentType) {
    const unknownKey = Object.keys(node)[0] || 'unknown';
    console.warn(`Unknown component type: ${unknownKey}`);
    return (
      <div className="p-4 border border-dashed border-red-500 text-red-500 rounded bg-red-500/10 text-xs font-mono">
        Unknown Node: {JSON.stringify(node).slice(0, 50)}...
      </div>
    );
  }

  const Component = ComponentRegistry[componentType];
  const props = node[componentType] || {};
  const { children, ...restProps } = props;

  // Render children recursively if they exist
  // We use the index as a fallback key since generated JSON might not have IDs
  const renderedChildren = Array.isArray(children) 
    ? children.map((child: UINode, i: number) => (
        <DynamicRenderer key={i} index={i} node={child} onAction={onAction} />
      ))
    : null;

  return (
    <ErrorBoundary 
      fallback={
        <div className="text-xs text-red-400 p-2 bg-red-900/20 rounded">
          Error in {componentType}
        </div>
      }
    >
      <Component {...restProps} onAction={onAction}>
        {renderedChildren}
      </Component>
    </ErrorBoundary>
  );
};

export default React.memo(DynamicRenderer);