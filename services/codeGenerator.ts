import { UINode } from "../types";

// Helper to capitalize component names (e.g., 'container' -> 'Container')
const toComponentName = (key: string): string => {
  const map: Record<string, string> = {
    container: 'Container',
    text: 'Typography',
    button: 'Button',
    card: 'Card',
    input: 'Input',
    stat: 'Stat',
    chart: 'Chart',
    separator: 'Separator',
    badge: 'Badge',
    hero: 'Hero',
    table: 'Table',
    progress: 'Progress',
    alert: 'Alert',
    avatar: 'Avatar',
    image: 'Image',
    map: 'Map',
    accordion: 'Accordion'
  };
  return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

// Helper to format values for JSX props
const formatValue = (value: any): string => {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `{${value}}`;
  }
  if (Array.isArray(value) || typeof value === 'object') {
    return `{${JSON.stringify(value)}}`;
  }
  return `"${value}"`;
};

// Recursive function to generate JSX string
const generateJSX = (node: UINode, depth: number = 0): string => {
  if (!node || typeof node !== 'object') return '';

  const key = Object.keys(node)[0];
  if (!key) return '';

  const componentName = toComponentName(key);
  const props = node[key];
  const indent = '  '.repeat(depth);
  
  // Extract children and other props
  const { children, ...restProps } = props || {};

  // Build Prop String
  const propStrings = Object.entries(restProps).map(([propKey, propValue]) => {
    // Skip empty values if needed, but for now we render everything provided
    if (propValue === undefined || propValue === null) return '';
    // Special handling for boolean true shorthand e.g. <Container padding>
    if (propValue === true) return `${propKey}`;
    return `${propKey}=${formatValue(propValue)}`;
  }).filter(Boolean).join(' ');

  const hasChildren = children && Array.isArray(children) && children.length > 0;
  const openTag = `${indent}<${componentName}${propStrings ? ' ' + propStrings : ''}`;

  if (!hasChildren) {
    return `${openTag} />`;
  }

  const childrenJSX = children
    .map((child: UINode) => generateJSX(child, depth + 1))
    .join('\n');

  return `${openTag}>\n${childrenJSX}\n${indent}</${componentName}>`;
};

// Main Export function including imports
export const generateReactCode = (rootNode: UINode): string => {
  if (!rootNode) return '';

  // 1. Traverse to find used components for imports
  const usedComponents = new Set<string>();
  const traverse = (node: UINode) => {
    if (!node) return;
    const key = Object.keys(node)[0];
    if (key) {
      usedComponents.add(toComponentName(key));
      const children = node[key]?.children;
      if (Array.isArray(children)) {
        children.forEach(traverse);
      }
    }
  };
  traverse(rootNode);

  const imports = `import React from 'react';\nimport { ${Array.from(usedComponents).join(', ')} } from './components/ui';\n\n`;

  // 2. Generate Component Body
  const jsx = generateJSX(rootNode, 2);

  return `${imports}export default function GeneratedComponent() {\n  return (\n${jsx}\n  );\n}`;
};