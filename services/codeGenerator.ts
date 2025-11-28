// services/codeGenerator.ts

import { UINode } from "../types";

/**
 * UTILITY: Converts string to PascalCase (e.g., "stat_card" -> "StatCard")
 * Handles snake_case, kebab-case, and camelCase.
 */
const toPascalCase = (str: string): string => {
  // Special overrides for known irregularities if needed, otherwise algorithmic
  const overrides: Record<string, string> = {
    // Add specific overrides here if algorithm fails, e.g. "ui_kit" -> "UIKit"
  };
  if (overrides[str]) return overrides[str];

  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase()) // snake/kebab to camel
    .replace(/^\w/, (c) => c.toUpperCase());         // first char to upper
};

/**
 * UTILITY: Serializes a value into a readable JSX/JS string.
 * Replaces simple JSON.stringify to provide multi-line formatting for objects.
 */
const serializeProp = (value: any, depth: number = 0): string => {
  const indent = "  ".repeat(depth);

  if (value === null || value === undefined) return "null";

  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map(v => serializeProp(v, depth + 1)).join(",\n" + indent + "  ");
    return `[\n${indent}  ${items}\n${indent}]`;
  }

  if (typeof value === "object") {
    // Handle semantic Action objects specifically to make them readable
    if (value.type && value.payload) {
      return `{ type: "${value.type}", payload: ${serializeProp(value.payload, depth)} }`;
    }

    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";

    const props = entries
      .map(([k, v]) => `${k}: ${serializeProp(v, depth + 1)}`)
      .join(",\n" + indent + "  ");

    return `{\n${indent}  ${props}\n${indent}}`;
  }

  return JSON.stringify(value);
};

/**
 * CORE: Recursively generates JSX string for a component node.
 */
const generateJSX = (node: UINode, depth: number = 0): string => {
  if (!node || typeof node !== "object") return "";

  // The key (e.g., "button") determines the component
  const key = Object.keys(node)[0];
  if (!key) return "";

  const ComponentName = toPascalCase(key);
  const props = node[key] || {};
  const { children, ...restProps } = props;

  const indentStr = "  ".repeat(depth);

  // Generate Props String
  const propLines = Object.entries(restProps).map(([k, v]) => {
    if (v === undefined || v === null) return "";

    // Boolean shorthand: <Button disabled /> instead of disabled={true}
    if (v === true) return k;

    // Complex objects/arrays need {} wrapper
    // Strings need "" wrapper (already handled by serializeProp logic for clean output)
    if (typeof v === "string") return `${k}="${v}"`;

    return `${k}={${serializeProp(v, depth + 1)}}`;
  }).filter(Boolean);

  const propsString = propLines.length > 0 ? " " + propLines.join(" ") : "";

  // Handling Children
  const hasChildren = Array.isArray(children) && children.length > 0;

  if (!hasChildren) {
    return `${indentStr}<${ComponentName}${propsString} />`;
  }

  const childrenJSX = children
    .map((child: UINode) => generateJSX(child, depth + 1))
    .join("\n");

  return `${indentStr}<${ComponentName}${propsString}>\n${childrenJSX}\n${indentStr}</${ComponentName}>`;
};

/**
 * MAIN: Generates the full React component file content.
 */
export const generateReactCode = (rootNode: UINode): string => {
  if (!rootNode) return "// No UI to generate.";

  // 1. Scan tree to collect imports
  const importsSet = new Set<string>();
  // 增强：处理不合法的组件名，防止生成无效代码
  const scanImports = (node: UINode) => {
    const key = Object.keys(node)[0];
    if (key) {
      const componentName = toPascalCase(key);
      // 过滤掉原生 HTML 标签或无效字符
      if (/^[A-Z]/.test(componentName) && !['Div', 'Span'].includes(componentName)) {
        importsSet.add(componentName);
      }
      // ...
    }
  };
  scanImports(rootNode);

  // 2. Build Import Statement
  // We assume all these components are exported from your UI library
  const importStatement = `import React from 'react';
import { 
  ${Array.from(importsSet).sort().join(",\n  ")} 
} from './components/ui';`;

  // 3. Build Component Body
  const jsxBody = generateJSX(rootNode, 2);

  return `${importStatement}

export default function GeneratedPage() {
  return (
${jsxBody}
  );
}`;
};