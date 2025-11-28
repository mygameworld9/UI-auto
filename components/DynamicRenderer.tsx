
import React from 'react';
import { UINode, UIAction } from '../types';
import { ComponentRegistry } from './ui/Registry';
import { validateNode } from '../services/schemas';
import { telemetry } from '../services/telemetry';
import { useEditor } from './EditorContext';

interface RendererProps {
  node: UINode;
  onAction: (action: UIAction) => void;
  index?: number;
  path?: string; // New: Current path in the JSON tree
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
 * Handles Schema Validation, Rendering, and now Editor Interaction
 */
const DynamicRenderer: React.FC<RendererProps> = ({ node, onAction, index = 0, path = 'root' }) => {
  const { isEditing, selectedPath, onSelect } = useEditor();

  // 1. Validation Layer
  if (!node || typeof node !== 'object') return null;
  if ('$$typeof' in node) return null;

  const validNode = validateNode(node);
  if (!validNode) {
    if (Object.keys(node).length > 0) {
       telemetry.logEvent('render_validation', 'HALLUCINATION', { 
         nodeKeys: Object.keys(node),
         raw: JSON.stringify(node).substring(0, 50) + '...'
       });
    }
    return null; 
  }

  // 2. Identify Component Type
  const componentType = Object.keys(validNode).find(key => ComponentRegistry[key]);

  // 3. Fallback
  if (!componentType) {
    return null;
  }

  // 4. Resolve Component & Props
  const Component = ComponentRegistry[componentType];
  const props = validNode[componentType] || {};
  const { children, ...restProps } = props;
  
  // Calculate path to the props of this specific component
  // If we are at 'root', and component is 'container', props are at 'root.container'
  const currentPath = `${path}.${componentType}`;
  
  const isSelected = isEditing && selectedPath === currentPath;

  const handleSelect = (e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
      e.preventDefault();
      onSelect(currentPath);
    }
  };

  // 5. Render
  const content = (
    <React.Suspense fallback={
        <div className="w-full h-24 bg-zinc-900/50 border border-white/5 rounded-xl animate-pulse flex items-center justify-center">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            </div>
        </div>
      }>
        <Component 
          {...restProps} 
          children={children} 
          onAction={onAction} 
          path={currentPath} // Pass path for children path generation
        />
    </React.Suspense>
  );

  return (
    <ErrorBoundary 
      fallback={
        <div className="text-xs text-red-400 p-2 border border-red-900/50 bg-red-900/10 rounded">
          Error: {componentType}
        </div>
      }
    >
      {isEditing ? (
        <div 
          onClickCapture={handleSelect}
          className={`relative transition-all duration-200 ${isSelected ? 'ring-2 ring-indigo-500 rounded cursor-default z-50' : 'hover:ring-1 hover:ring-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer rounded'}`}
          style={{ display: 'contents' }}
        >
          {content}
        </div>
      ) : (
        content
      )}
    </ErrorBoundary>
  );
};

export default React.memo(DynamicRenderer);
