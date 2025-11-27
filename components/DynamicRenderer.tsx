import React from 'react';
import { UINode, UIAction } from '../types';
import { ComponentRegistry } from './ui/Registry';

interface RendererProps {
  node: UINode;
  onAction: (action: UIAction) => void;
  index?: number;
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

/**
 * THE RECURSIVE RENDERER
 * Core Logic:
 * 1. Receives a "Loose" JSON Node (e.g., { button: { label: "Submit" } })
 * 2. Finds the key that matches a component in our Registry ("button")
 * 3. Extracts props from that key
 * 4. Renders the component and recursively renders its `children`
 */
const DynamicRenderer: React.FC<RendererProps> = ({ node, onAction, index = 0 }) => {
  // Safety check
  if (!node || typeof node !== 'object') return null;

  // 1. Identify Component Type
  // We look for the first key in the node object that exists in our ComponentRegistry.
  // This adheres to the "OneOf" Protobuf-style schema where a node has exactly one active field.
  const componentType = Object.keys(node).find(key => ComponentRegistry[key]);

  // 2. Fallback for Unknown Types
  if (!componentType) {
    const unknownKey = Object.keys(node)[0] || 'unknown';
    // Only warn in dev console, UI shows a discreet placeholder
    console.warn(`[GenUI] Unknown component type: ${unknownKey}`, node);
    return (
      <div className="p-2 border border-dashed border-slate-700 rounded bg-slate-900/50 text-slate-500 text-[10px] font-mono">
        UNKNOWN: {unknownKey}
      </div>
    );
  }

  // 3. Resolve Component & Props
  const Component = ComponentRegistry[componentType];
  const props = node[componentType] || {}; // Extract the "Value" of the OneOf
  const { children, ...restProps } = props;

  // 4. Recursion
  const renderedChildren = Array.isArray(children) 
    ? children.map((child: UINode, i: number) => (
        <DynamicRenderer key={i} index={i} node={child} onAction={onAction} />
      ))
    : null;

  // 5. Render with Error Boundary
  return (
    <ErrorBoundary 
      fallback={
        <div className="text-xs text-red-400 p-2 border border-red-900/50 bg-red-900/10 rounded">
          Failed: {componentType}
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