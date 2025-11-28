
import React from 'react';
import { UINode, UIAction } from '../types';
import { ComponentRegistry } from './ui/Registry';
import { validateNode } from '../services/schemas';
import { telemetry } from '../services/telemetry';
import { useEditor } from './EditorContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface RendererProps {
  node: UINode;
  onAction: (action: UIAction) => void;
  index?: number;
  path?: string; // New: Current path in the JSON tree
  onError?: (error: Error, node: UINode, path: string) => void; // New: Healing Callback
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  node: UINode;
  path: string;
  onError?: (error: Error, node: UINode, path: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[DynamicRenderer] Caught Error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, this.props.node, this.props.path);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg border border-red-500/30 bg-red-900/10 flex items-center gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1">
                <h4 className="text-sm font-bold text-red-400">Rendering Failed</h4>
                <p className="text-xs text-red-300/70">Attempting auto-repair...</p>
            </div>
            <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * THE RECURSIVE RENDERER
 * Handles Schema Validation, Rendering, Editor Interaction, and Self-Healing
 */
const DynamicRenderer: React.FC<RendererProps> = ({ node, onAction, index = 0, path = 'root', onError }) => {
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
       
       return (
        <div className="p-4 my-2 border border-dashed border-yellow-500/50 bg-yellow-500/10 text-yellow-500 text-xs font-mono rounded overflow-hidden">
          <div className="font-bold mb-1">⚠️ Unknown Component: {Object.keys(node)[0]}</div>
          <pre className="text-[10px] opacity-70">{JSON.stringify(node, null, 2)}</pre>
        </div>
       );
    }
    return null; 
  }

  // 2. Identify Component Type
  const componentType = Object.keys(validNode).find(key => ComponentRegistry[key]);

  // 3. Fallback
  if (!componentType) {
    return (
      <div className="p-4 border border-dashed border-yellow-500/50 bg-yellow-500/10 text-yellow-500 text-xs font-mono rounded">
        ⚠️ Unknown Component: {Object.keys(node)[0]}
      </div>
    );
  }

  // 4. Resolve Component & Props
  const Component = ComponentRegistry[componentType];
  const props = validNode[componentType] || {};
  const { children, ...restProps } = props;
  
  // Calculate path to the props of this specific component
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
          onError={onError} // Propagate error handler
        />
    </React.Suspense>
  );

  return (
    <ErrorBoundary node={node} path={path} onError={onError}>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          ease: "easeOut",
          delay: index * 0.05 // Stagger based on index
        }}
        onClickCapture={isEditing ? handleSelect : undefined}
        className={`relative transition-all duration-200 w-full ${isSelected ? 'ring-2 ring-indigo-500 rounded cursor-default z-50' : isEditing ? 'hover:ring-1 hover:ring-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer rounded' : ''}`}
        style={isEditing ? { display: 'contents' } : undefined}
      >
        {content}
      </motion.div>
    </ErrorBoundary>
  );
};

export default React.memo(DynamicRenderer);