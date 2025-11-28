import { UINode } from "../types";

const toPascalCase = (str: string): string => {
  return str
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, (c) => c.toUpperCase());
};

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
    if (value.type && value.payload) { // Action handling
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

const generateJSX = (node: UINode, depth: number = 0): string => {
  if (!node || typeof node !== "object") return "";
  const key = Object.keys(node)[0];
  if (!key) return "";

  const ComponentName = toPascalCase(key);
  const props = node[key] || {};
  const { children, ...restProps } = props;
  const indentStr = "  ".repeat(depth);
  
  const propLines = Object.entries(restProps).map(([k, v]) => {
    if (v === undefined || v === null) return "";
    if (v === true) return k;
    if (typeof v === "string") return `${k}="${v}"`;
    return `${k}={${serializeProp(v, depth + 1)}}`;
  }).filter(Boolean);

  const propsString = propLines.length > 0 ? " " + propLines.join(" ") : "";
  const hasChildren = Array.isArray(children) && children.length > 0;

  if (!hasChildren) return `${indentStr}<${ComponentName}${propsString} />`;

  const childrenJSX = children
    .map((child: UINode) => generateJSX(child, depth + 1))
    .join("\n");

  return `${indentStr}<${ComponentName}${propsString}>\n${childrenJSX}\n${indentStr}</${ComponentName}>`;
};

export const generateReactCode = (rootNode: UINode): string => {
  if (!rootNode) return "// No UI to generate.";
  
  // 简单粗暴的 import 生成
  const imports = `import React from 'react';\nimport { \n  Container, Typography, Button, Card, \n  StatCard, ChartComponent, MapWidget, \n  Input, ImageComponent, Hero, \n  Alert, Badge, Progress, Separator, Accordion \n} from './components/ui';\n\n`;

  const jsxBody = generateJSX(rootNode, 2);

  return `${imports}export default function GeneratedPage() {
  return (
${jsxBody}
  );
}`;
};