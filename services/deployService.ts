import sdk from '@stackblitz/sdk';
import { generateReactCode } from './codeGenerator';
import { UINode } from '../types';
import { FILES } from './componentTemplates';

export async function openInStackBlitz(rootNode: UINode) {
  if (!rootNode) {
    alert("No UI to export!");
    return;
  }

  // 1. Generate the main App file
  const appCode = generateReactCode(rootNode);

  // 2. Construct the file system
  const projectFiles: Record<string, string> = {
    ...FILES, // Include all component library files
    'src/App.tsx': appCode,
    'src/main.tsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './components/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
    `,
    'index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GenUI Export</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  </head>
  <body class="bg-black text-white">
    <div id="root"></div>
  </body>
</html>
    `,
    'src/index.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #000;
  color: #fff;
  font-family: 'Inter', sans-serif;
}
    `,
    'vite.config.ts': `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
    `,
    'tailwind.config.js': `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
    `,
    'postcss.config.js': `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
    `,
    'package.json': JSON.stringify({
      name: "genui-export",
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
      },
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "lucide-react": "^0.344.0",
        "framer-motion": "^11.0.8",
        "recharts": "^2.12.2",
        "clsx": "^2.1.0",
        "tailwind-merge": "^2.2.1",
        "canvas-confetti": "^1.9.2"
      },
      devDependencies: {
        "@types/react": "^18.2.64",
        "@types/react-dom": "^18.2.21",
        "@vitejs/plugin-react": "^4.2.1",
        "autoprefixer": "^10.4.18",
        "postcss": "^8.4.35",
        "tailwindcss": "^3.4.1",
        "typescript": "^5.2.2",
        "vite": "^5.1.6"
      }
    }, null, 2)
  };

  // 3. Open StackBlitz
  sdk.openProject({
    title: 'GenUI Export',
    description: 'Exported from GenUI Architect',
    template: 'node',
    files: projectFiles
  }, {
    newWindow: true,
    openFile: 'src/App.tsx'
  });
}
