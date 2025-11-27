// 3.1 Recursive Data Structure & 3.2 Action Protocol
export interface UIAction {
  type: string;
  payload?: any;
}

// The Node is a loose object where the KEY is the component type
// e.g. { "container": { ...props } }
export type UINode = {
  [key: string]: any;
};

// Allowed component types in our Registry
export type ComponentType = 
  | 'container'
  | 'text'
  | 'button'
  | 'card'
  | 'input'
  | 'stat'
  | 'chart'
  | 'separator'
  | 'badge'
  | 'hero'     
  | 'table'    
  | 'progress' 
  | 'alert'    
  | 'avatar'   
  | 'image'
  | 'accordion';

// User Context for 1.1 Implicit Input
export interface UserContext {
  role: 'admin' | 'user';
  device: 'desktop' | 'mobile';
  theme: 'dark' | 'light';
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  uiNode?: UINode; // The structured UI payload
}