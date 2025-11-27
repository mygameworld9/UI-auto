import React from 'react';
import { UINode, UIAction } from '../types';
import { ComponentRegistry } from './ui/Registry';
import { validateNode } from '../services/schemas';

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
 * 
 * Update: Now includes Zod Schema Validation to prevent rendering 
 * malformed nodes during streaming.
 */
const DynamicRenderer: React.FC<RendererProps> = ({ node, onAction, index = 0 }) => {
  // 1. Validation Layer
  // During streaming, a node might be half-formed (e.g. { "cont": ... }).
  // The parser fixes braces, but structure might still be partial.
  // We use Zod to ensure it meets minimum viability.
  if (!node || typeof node !== 'object') return null;

  // React Element Safety Check
  if ('$$typeof' in node) {
    return null;
  }

  const validNode = validateNode(node);
  if (!validNode) {
    // If validation fails, we return null. 
    // In a stream, this usually means the chunk hasn't completed this node's definition yet.
    return null; 
  }

  // 2. Identify Component Type
  const componentType = Object.keys(validNode).find(key => ComponentRegistry[key]);

  // 3. Fallback for Unknown Types
  if (!componentType) {
    // If we have a key but it's not in registry, wait for stream to finish or show placeholder
    // During streaming, we might see partial keys like "contai", which won't match.
    // We just return null to avoid UI flickering.
    return null;
  }

  // 4. Resolve Component & Props
  const Component = ComponentRegistry[componentType];
  const props = validNode[componentType] || {};
  const { children, ...restProps } = props;

  // 5. Render
  // Added Suspense wrapper for lazy loaded components
  return (
    <ErrorBoundary 
      fallback={
        <div className="text-xs text-red-400 p-2 border border-red-900/50 bg-red-900/10 rounded">
          Error: {componentType}
        </div>
      }
    >
      <React.Suspense fallback={
        <div className="w-full h-24 bg-zinc-900/50 border border-white/5 rounded-xl animate-pulse flex items-center justify-center">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Loading {componentType}</span>
            </div>
        </div>
      }>
        <Component {...restProps} children={children} onAction={onAction} />
      </React.Suspense>
    </ErrorBoundary>
  );
};

export default React.memo(DynamicRenderer);