// This file contains the source code of the UI library as strings.
// This is required because we cannot read the file system in the browser to bundle the app for StackBlitz.

// Helper to wrap code in a standard React file template if needed, 
// but mostly we will dump the raw content we already wrote.

export const FILES: Record<string, string> = {
  // -------------------------
  // CORE CONFIG & TYPES
  // -------------------------
  "src/types.ts": `
export interface UIAction {
  type: string;
  payload?: any;
  path?: string;
}
export type UINode = { [key: string]: any };
export type ComponentType = 'container' | 'text' | 'button' | 'card' | 'input' | 'stat' | 'chart' | 'separator' | 'badge' | 'hero' | 'table' | 'progress' | 'alert' | 'avatar' | 'image' | 'map' | 'accordion' | 'bento_container' | 'bento_card' | 'kanban';
`,

  "src/components/ui/theme.ts": `
export const DEFAULT_THEME = {
  typography: {
    variants: {
      H1: 'text-4xl md:text-5xl font-extrabold tracking-tight',
      H2: 'text-3xl font-bold tracking-tight',
      H3: 'text-xl font-semibold tracking-tight',
      BODY: 'text-sm md:text-base leading-7 text-slate-300',
      CAPTION: 'text-xs uppercase tracking-widest font-bold text-slate-500',
      CODE: 'font-mono text-xs bg-zinc-900 border border-white/10 px-2 py-1 rounded text-pink-400'
    },
    colors: {
      DEFAULT: 'text-slate-100',
      MUTED: 'text-slate-500',
      PRIMARY: 'text-indigo-400',
      ACCENT: 'text-violet-400',
      DANGER: 'text-red-400',
      SUCCESS: 'text-emerald-400'
    },
    fonts: {
      SANS: 'font-sans',
      SERIF: 'font-["Playfair_Display",serif]',
      CURSIVE: 'font-["Great_Vibes",cursive]'
    }
  },
  button: {
    base: "inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
    variants: {
      PRIMARY: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10',
      SECONDARY: 'bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700',
      GHOST: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
      DANGER: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
      GLOW: 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_25px_rgba(124,58,237,0.4)] border border-violet-400/50',
      OUTLINE: 'bg-transparent border border-zinc-600 text-zinc-400 hover:border-zinc-400 hover:text-white',
      SOFT: 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/10',
      GRADIENT: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-white/10'
    }
  },
  badge: {
    base: "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border",
    colors: {
      BLUE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      GREEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      RED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      GRAY: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    }
  },
  container: {
    base: "flex w-full transition-all relative z-0",
    layouts: {
      COL: 'flex-col',
      ROW: 'flex-row flex-wrap items-center',
      GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    },
    gaps: { 
      GAP_SM: 'gap-3', 
      GAP_MD: 'gap-6', 
      GAP_LG: 'gap-8', 
      GAP_XL: 'gap-12'
    },
    backgrounds: {
      DEFAULT: '',
      SURFACE: 'bg-zinc-900 border border-white/5 rounded-2xl',
      GLASS: 'bg-zinc-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl'
    }
  },
  card: {
    base: "rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 group",
    variants: {
      DEFAULT: 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700',
      GLASS: 'bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-xl',
      NEON: 'bg-zinc-950 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]',
      OUTLINED: 'bg-transparent border-2 border-dashed border-zinc-800 hover:border-zinc-700',
      ELEVATED: 'bg-zinc-800 shadow-2xl shadow-black/50 border-t border-white/5',
      FROSTED: 'bg-white/5 backdrop-blur-xl border border-white/5'
    }
  },
  stat: {
    base: "bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition-colors group relative overflow-hidden",
    label: "text-sm font-medium text-slate-400 uppercase tracking-wide",
    value: "text-3xl font-bold text-white tracking-tight",
    trend: {
        base: "text-xs font-bold px-2 py-0.5 rounded-full flex items-center",
        UP: "text-emerald-400 bg-emerald-500/10",
        DOWN: "text-red-400 bg-red-500/10",
        NEUTRAL: "text-slate-400 bg-slate-500/10"
    },
    decorator: "absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity",
    decoratorBlur: "w-16 h-16 bg-gradient-to-br from-white to-transparent rounded-full blur-xl"
  },
  input: {
     base: "flex flex-col gap-2 w-full group",
     label: "text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors group-focus-within:text-indigo-400",
     field: "w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-zinc-600"
  },
  table: {
    base: "w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50",
    header: "text-xs uppercase bg-zinc-950/50 text-slate-400 border-b border-zinc-800",
    row: "hover:bg-white/5 transition-colors border-b border-zinc-800/50 last:border-0",
    cell: "px-6 py-4 whitespace-nowrap text-slate-300"
  },
  separator: {
    base: "h-px bg-zinc-800 my-8 w-full"
  },
  hero: {
    base: "relative w-full overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/5 p-12 md:p-24 flex flex-col",
    gradients: {
      BLUE_PURPLE: 'from-blue-600/30 via-indigo-500/30 to-purple-600/30',
      ORANGE_RED: 'from-orange-500/30 via-red-500/30 to-pink-500/30',
      GREEN_TEAL: 'from-emerald-500/30 via-teal-500/30 to-cyan-500/30',
    }
  },
  progress: {
    colors: {
      BLUE: 'bg-indigo-500',
      GREEN: 'bg-emerald-500',
      ORANGE: 'bg-orange-500',
      RED: 'bg-rose-500'
    }
  },
  alert: {
    base: "p-4 rounded-xl border flex gap-4 items-start",
    variants: {
      INFO: 'bg-blue-900/10 border-blue-500/20 text-blue-300',
      SUCCESS: 'bg-emerald-900/10 border-emerald-500/20 text-emerald-300',
      WARNING: 'bg-orange-900/10 border-orange-500/20 text-orange-300',
      ERROR: 'bg-red-900/10 border-red-500/20 text-red-300',
    }
  },
  avatar: {
    status: {
      ONLINE: 'bg-emerald-500',
      OFFLINE: 'bg-slate-500',
      BUSY: 'bg-red-500'
    }
  },
  image: {
    ratios: {
      VIDEO: 'aspect-video',
      SQUARE: 'aspect-square',
      WIDE: 'aspect-[21/9]',
      PORTRAIT: 'aspect-[3/4]'
    }
  },
  map: {
    styles: {
      DARK: { bg: '#18181b', grid: '#27272a' },
      LIGHT: { bg: '#cbd5e1', grid: '#94a3b8' },
      SATELLITE: { bg: '#020617', grid: '#1e293b' }
    }
  },
  accordion: {
    container: {
      DEFAULT: 'divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900',
      SEPARATED: 'space-y-4'
    },
    item: {
      DEFAULT: 'bg-transparent',
      SEPARATED: 'border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden'
    }
  }
};
export type ThemeType = typeof DEFAULT_THEME;
`,

  "src/components/ThemeContext.tsx": `
import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_THEME, ThemeType } from './ui/theme';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: Partial<ThemeType>) => void;
  resetTheme: () => void;
  isGenerating: boolean;
  setIsGenerating: (is: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  resetTheme: () => {},
  isGenerating: false,
  setIsGenerating: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setInternalTheme] = useState<ThemeType>(DEFAULT_THEME);
  const [isGenerating, setIsGenerating] = useState(false);

  const setTheme = (newTheme: Partial<ThemeType>) => {
    setInternalTheme(prev => ({ ...prev, ...newTheme }));
  };

  const resetTheme = () => {
    setInternalTheme(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme, isGenerating, setIsGenerating }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
`,

  "src/components/EditorContext.tsx": `
import React, { createContext, useContext } from 'react';
const EditorContext = createContext({ isEditing: false, selectedPath: null, onSelect: () => {} });
export const useEditor = () => useContext(EditorContext);
`,

  "src/services/telemetry.ts": `
export const telemetry = {
  logEvent: () => {},
  logMetric: () => {},
  startTrace: () => '',
  endTrace: () => {}
};
`,
  "src/services/schemas.ts": `
export const validateNode = (node: any) => node;
`,

  // -------------------------
  // CORE RENDERER & UTILS
  // -------------------------

  "src/components/ui/utils.tsx": `
import React from 'react';
import DynamicRenderer from '../DynamicRenderer';

// Hybrid RenderChildren: Handles both React Nodes (from App.tsx) and JSON UINodes (from nested structures like Table)
export const RenderChildren = ({ children, onAction, parentPath }: any) => {
  if (!children) return null;

  // Case 1: React Nodes (Generated JSX)
  if (React.isValidElement(children) || (Array.isArray(children) && children.some(React.isValidElement))) {
    return <>{children}</>;
  }

  // Case 2: JSON UINodes (Internal SDUI components like Table/Bento)
  if (Array.isArray(children)) {
    return children.map((child: any, i: number) => {
       const childPath = parentPath ? \`\${parentPath}.children.\${i}\` : undefined;
       return <DynamicRenderer key={i} index={i} node={child} onAction={onAction} path={childPath} />;
    });
  }

  return null;
};

export function setByPath<T>(obj: T, path: string, value: any): T {
  return obj; // Stub for export
}
`,

  "src/components/DynamicRenderer.tsx": `
import React from 'react';
import { ComponentRegistry } from './ui/Registry';
import { motion } from 'framer-motion';

const DynamicRenderer = ({ node, onAction, index = 0, path = 'root' }: any) => {
  if (!node || typeof node !== 'object') return null;
  const componentType = Object.keys(node).find(key => ComponentRegistry[key]);
  if (!componentType) return null;

  const Component = ComponentRegistry[componentType];
  const props = node[componentType] || {};
  const { children, ...restProps } = props;
  const currentPath = \`\${path}.\${componentType}\`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
    >
      <Component {...restProps} children={children} onAction={onAction} path={currentPath} />
    </motion.div>
  );
};
export default React.memo(DynamicRenderer);
`,

  "src/components/ui/Registry.tsx": `
import React from 'react';
import { Container } from './Container';
import { Typography } from './Typography';
import { Button } from './Button';
import { Hero } from './Hero';
import { Card } from './Card';
import { StatCard } from './StatCard';
import { Progress } from './Progress';
import { Alert } from './Alert';
import { Avatar } from './Avatar';
import { Input } from './Input';
import { Separator } from './Separator';
import { Badge } from './Badge';
import { Accordion } from './Accordion';
import { ImageComponent } from './Image';
import { BentoContainer, BentoCard } from './BentoGrid';
import { Kanban } from './Kanban';
import { ChartComponent } from './Chart';
import { MapWidget } from './Map';
import { Table } from './Table';

export const ComponentRegistry: Record<string, React.FC<any>> = {
  container: Container,
  card: Card,
  separator: Separator,
  hero: Hero,
  accordion: Accordion,
  text: Typography,
  button: Button,
  input: Input,
  badge: Badge,
  avatar: Avatar,
  alert: Alert,
  stat: StatCard,
  progress: Progress,
  image: ImageComponent,
  bento_container: BentoContainer,
  bento_card: BentoCard,
  kanban: Kanban,
  chart: ChartComponent,
  table: Table,
  map: MapWidget
};
`,

  "src/components/ui/index.ts": `
export * from './Accordion';
export * from './Alert';
export * from './Avatar';
export * from './Badge';
export * from './Button';
export * from './Card';
export * from './Chart';
export * from './Container';
export * from './Hero';
export * from './Image';
export * from './Input';
export * from './Map';
export * from './Progress';
export * from './Separator';
export * from './StatCard';
export * from './Table';
export * from './Typography';
export * from './BentoGrid';
export * from './Kanban';
`,

  // -------------------------
  // COMPONENTS
  // -------------------------
  
  "src/components/ui/Container.tsx": `
import React from 'react';
import { RenderChildren } from './utils';
import { useTheme } from '../ThemeContext';

export const Container = ({ children, layout = 'COL', gap = 'GAP_MD', padding = false, background = 'DEFAULT', bgImage, className = '', onAction, path }: any) => {
  const { theme } = useTheme();
  const layoutClass = theme.container.layouts[layout] || theme.container.layouts.COL;
  const gapClass = theme.container.gaps[gap] || theme.container.gaps.GAP_MD;
  const bgClass = bgImage ? '' : (theme.container.backgrounds[background] || theme.container.backgrounds.DEFAULT);
  const padClass = padding ? 'p-6 md:p-8' : '';
  const style = bgImage ? { backgroundImage: \`url(\${bgImage})\`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

  return (
    <div className={\`flex w-full \${layoutClass} \${gapClass} \${padClass} \${bgClass} \${className} transition-all relative overflow-hidden\`} style={style}>
      {bgImage && <div className="absolute inset-0 bg-black/40 pointer-events-none" />}
      <div className="relative z-10 w-full flex flex-col h-full">
        <RenderChildren children={children} onAction={onAction} parentPath={path} />
      </div>
    </div>
  );
};
`,

  "src/components/ui/Typography.tsx": `
import React from 'react';
import { useTheme } from '../ThemeContext';
export const Typography = ({ content, variant = 'BODY', color = 'DEFAULT', font = 'SANS' }: any) => {
  const { theme } = useTheme();
  const styles = theme.typography.variants;
  const colors = theme.typography.colors;
  const fonts = theme.typography.fonts;
  const fontClass = fonts[font] || fonts.SANS;
  const isClass = !fontClass.includes('"');
  return (
    <div className={\`\${styles[variant] || styles.BODY} \${colors[color] || colors.DEFAULT} \${isClass ? fontClass : ''}\`} style={!isClass ? { fontFamily: fontClass.replace('font-', '') } : {}}>
      {content}
    </div>
  );
};
`,

  "src/components/ui/Button.tsx": `
import React from 'react';
import * as Lucide from 'lucide-react';
import { useTheme } from '../ThemeContext';
export const Button = ({ label, variant = 'PRIMARY', icon, action, onAction }: any) => {
  const { theme } = useTheme();
  const IconCmp = icon && (Lucide as any)[icon] ? (Lucide as any)[icon] : null;
  const variantClass = theme.button.variants[variant] || theme.button.variants.PRIMARY;
  return (
    <button onClick={() => onAction && action ? onAction(action) : null} className={\`\${theme.button.base} \${variantClass}\`}>
      {IconCmp && <IconCmp className="w-4 h-4 mr-2" />}
      {label}
    </button>
  );
};
`,

  "src/components/ui/Hero.tsx": `
import React from 'react';
import { RenderChildren } from './utils';
import { useTheme } from '../ThemeContext';
export const Hero = ({ title, subtitle, gradient = 'BLUE_PURPLE', align = 'CENTER', children, onAction, path }: any) => {
  const { theme } = useTheme();
  const gradientClass = theme.hero.gradients[gradient] || theme.hero.gradients.BLUE_PURPLE;
  const alignClass = align === 'LEFT' ? 'text-left items-start' : 'text-center items-center';
  return (
    <div className={\`\${theme.hero.base} \${alignClass} gap-8\`}>
      <div className={\`absolute inset-0 bg-gradient-to-br \${gradientClass} opacity-40 blur-3xl\`} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-sm">{title}</h1>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl font-light">{subtitle}</p>
      </div>
      <div className="relative z-10 mt-6 flex gap-4">
        <RenderChildren children={children} onAction={onAction} parentPath={path} />
      </div>
    </div>
  );
};
`,

  "src/components/ui/Card.tsx": `
import React from 'react';
import { RenderChildren } from './utils';
import { useTheme } from '../ThemeContext';
export const Card = ({ children, title, variant = 'DEFAULT', onAction, path }: any) => {
  const { theme } = useTheme();
  const variantClass = theme.card.variants[variant] || theme.card.variants.DEFAULT;
  return (
    <div className={\`\${theme.card.base} \${variantClass}\`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <RenderChildren children={children} onAction={onAction} parentPath={path} />
      </div>
    </div>
  );
};
`,

  "src/components/ui/Table.tsx": `
import React from 'react';
import DynamicRenderer from '../DynamicRenderer';
import { useTheme } from '../ThemeContext';
export const Table = ({ headers, rows, onAction, path }: any) => {
  const { theme } = useTheme();
  return (
    <div className={theme.table.base}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className={theme.table.header}>
            <tr>
              {headers?.map((h: string, i: number) => <th key={i} className="px-6 py-4 font-semibold tracking-wider">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows?.map((row: any[], i: number) => (
              <tr key={i} className={theme.table.row}>
                {row.map((cell: any, j: number) => {
                   const cellPath = path ? \`\${path}.rows.\${i}.\${j}\` : undefined;
                   return (
                    <td key={j} className={theme.table.cell}>
                      {typeof cell === 'string' || typeof cell === 'number' ? cell : (
                          <div className="scale-90 origin-left">
                            <DynamicRenderer node={cell} onAction={onAction} path={cellPath} />
                          </div>
                      )}
                    </td>
                   );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
`,

  "src/components/ui/StatCard.tsx": `
import React from 'react';
import * as Lucide from 'lucide-react';
import { useTheme } from '../ThemeContext';
export const StatCard = ({ label, value, trend, trendDirection }: any) => {
  const { theme } = useTheme();
  const isUp = trendDirection === 'UP';
  const isDown = trendDirection === 'DOWN';
  const trendClass = isUp ? theme.stat.trend.UP : isDown ? theme.stat.trend.DOWN : theme.stat.trend.NEUTRAL;
  return (
    <div className={theme.stat.base}>
      <div className={theme.stat.decorator}><div className={theme.stat.decoratorBlur} /></div>
      <div className="flex justify-between items-start mb-4 relative z-10"><span className={theme.stat.label}>{label}</span></div>
      <div className="flex items-baseline gap-3 relative z-10">
          <div className={theme.stat.value}>{value}</div>
          {trend && <span className={\`\${theme.stat.trend.base} \${trendClass}\`}>{isUp ? <Lucide.TrendingUp className="w-3 h-3 mr-1" /> : isDown ? <Lucide.TrendingDown className="w-3 h-3 mr-1" /> : <Lucide.Minus className="w-3 h-3 mr-1" />}{trend}</span>}
      </div>
    </div>
  );
};
`,

  "src/components/ui/Progress.tsx": `
import React from 'react';
import { useTheme } from '../ThemeContext';
export const Progress = ({ label, value, color = 'BLUE' }: any) => {
  const { theme } = useTheme();
  const colorClass = theme.progress.colors[color] || theme.progress.colors.BLUE;
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500"><span>{label}</span><span>{value}%</span></div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={\`h-full \${colorClass} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]\`} style={{ width: \`\${value}%\` }} />
      </div>
    </div>
  );
};
`,

  "src/components/ui/Alert.tsx": `
import React from 'react';
import * as Lucide from 'lucide-react';
import { useTheme } from '../ThemeContext';
export const Alert = ({ title, description, variant = 'INFO' }: any) => {
  const { theme } = useTheme();
  const styles = theme.alert.variants[variant] || theme.alert.variants.INFO;
  const icons = { INFO: Lucide.Info, SUCCESS: Lucide.CheckCircle2, WARNING: Lucide.AlertTriangle, ERROR: Lucide.XCircle };
  const Icon = icons[variant] || icons.INFO;
  return (
    <div className={\`\${theme.alert.base} \${styles}\`}>
      <div className="mt-0.5 p-1 bg-white/5 rounded-full"><Icon className="w-4 h-4 flex-shrink-0" /></div>
      <div><h5 className="font-semibold text-sm mb-1">{title}</h5><p className="text-xs opacity-80 leading-relaxed">{description}</p></div>
    </div>
  );
};
`,

  "src/components/ui/Avatar.tsx": `
import React from 'react';
import { useTheme } from '../ThemeContext';
export const Avatar = ({ initials, src, status }: any) => {
  const { theme } = useTheme();
  const statusColor = status ? (theme.avatar.status[status] || theme.avatar.status.OFFLINE) : '';
  return (
    <div className="relative inline-block group">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700 ring-2 ring-transparent group-hover:ring-white/10 transition-all">
        {src ? <img src={src} alt="Avatar" className="w-full h-full object-cover" /> : <span className="font-bold text-xs text-slate-400 group-hover:text-white">{initials}</span>}
      </div>
      {status && <div className={\`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 \${statusColor}\`} />}
    </div>
  );
};
`,

  "src/components/ui/Chart.tsx": `
import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
export const ChartComponent = ({ type = 'BAR', data, title, color = "#6366f1" }: any) => {
  return (
    <div className="w-full h-72 flex flex-col bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl">
      {title && <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">{title}</h4>}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'LINE' ? (
            <LineChart data={data}>
              <defs><linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0"><stop offset="5%" stopColor={color} stopOpacity={0.5}/><stop offset="95%" stopColor={color} stopOpacity={1}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} itemStyle={{ color: '#f8fafc' }} cursor={{ stroke: '#27272a', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="value" stroke="url(#lineColor)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color, stroke: '#09090b', strokeWidth: 2 }} />
            </LineChart>
          ) : type === 'AREA' ? (
             <AreaChart data={data}>
              <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.2}/><stop offset="95%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#27272a', opacity: 0.4, radius: 4 }} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
`,

  "src/components/ui/Input.tsx": `
import React from 'react';
import { useTheme } from '../ThemeContext';
export const Input = ({ label, placeholder, inputType = 'text' }: any) => {
  const { theme } = useTheme();
  return (
    <div className={theme.input.base}>
      <label className={theme.input.label}>{label}</label>
      <input type={inputType} className={theme.input.field} placeholder={placeholder} />
    </div>
  );
};
`,

  "src/components/ui/Separator.tsx": `
import React from 'react';
import { useTheme } from '../ThemeContext';
export const Separator = () => {
    const { theme } = useTheme();
    return <div className={theme.separator.base} />;
};
`,

  "src/components/ui/Badge.tsx": `
import React from 'react';
import { useTheme } from '../ThemeContext';
export const Badge = ({ label, color = 'BLUE' }: any) => {
  const { theme } = useTheme();
  const colorClass = theme.badge.colors[color] || theme.badge.colors.BLUE;
  return <span className={\`\${theme.badge.base} \${colorClass}\`}>{label}</span>;
};
`,

  "src/components/ui/Accordion.tsx": `
import React from 'react';
import * as Lucide from 'lucide-react';
import { RenderChildren } from './utils';
import { useTheme } from '../ThemeContext';
export const Accordion = ({ items, variant = 'DEFAULT', onAction, path }: any) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const { theme } = useTheme();
  const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index);
  if (!items || !Array.isArray(items)) return null;
  const containerClass = theme.accordion.container[variant] || theme.accordion.container.DEFAULT;
  const itemClass = theme.accordion.item[variant] || theme.accordion.item.DEFAULT;
  return (
    <div className={\`w-full \${containerClass}\`}>
      {items.map((item: any, i: number) => {
        const isOpen = openIndex === i;
        const content = Array.isArray(item.content) ? item.content : [];
        const contentPath = path ? \`\${path}.items.\${i}.content\` : undefined;
        return (
          <div key={i} className={itemClass}>
            <button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors focus:outline-none">
              <span className={\`font-medium text-sm \${isOpen ? 'text-indigo-400' : 'text-slate-200'}\`}>{item.title}</span>
              <Lucide.ChevronDown className={\`w-4 h-4 text-slate-500 transition-transform duration-300 \${isOpen ? 'rotate-180' : ''}\`} />
            </button>
            <div className={\`grid transition-all duration-300 ease-in-out \${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}\`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 border-t border-zinc-800/50 text-slate-400">
                        <RenderChildren children={content} onAction={onAction} parentPath={contentPath} />
                    </div>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
`,

  "src/components/ui/Image.tsx": `
import React from 'react';
import { useTheme } from '../ThemeContext';
export const ImageComponent = ({ src, alt, caption, aspectRatio = 'VIDEO' }: any) => {
  const { theme } = useTheme();
  const ratioClass = theme.image.ratios[aspectRatio] || theme.image.ratios.VIDEO;
  return (
    <figure className="w-full flex flex-col gap-3 group">
      <div className={\`w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 \${ratioClass} relative\`}>
        <img src={src || 'https://via.placeholder.com/800x400/18181b/52525b?text=Image'} alt={alt || 'Generated Content'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
      </div>
      {caption && <figcaption className="text-xs text-center text-slate-500 font-medium tracking-wide">{caption}</figcaption>}
    </figure>
  );
};
`,

  "src/components/ui/Map.tsx": `
import React from 'react';
import * as Lucide from 'lucide-react';
import { useTheme } from '../ThemeContext';
export const MapWidget = ({ label, style = 'DARK', markers = [] }: any) => {
  const { theme } = useTheme();
  const mapTheme = theme.map.styles[style] || theme.map.styles.DARK;
  return (
    <div className="w-full h-72 rounded-xl overflow-hidden relative border border-zinc-700 group shadow-2xl">
      <div className="absolute inset-0 w-full h-full transition-colors duration-500" style={{ backgroundColor: mapTheme.bg }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: \`linear-gradient(\${mapTheme.grid} 1px, transparent 1px), linear-gradient(90deg, \${mapTheme.grid} 1px, transparent 1px)\`, backgroundSize: '40px 40px' }} />
      </div>
      <div className="absolute top-4 left-4 bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-700 shadow-xl flex items-center gap-2">
        <Lucide.Map className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold text-slate-200">{label || 'Geographic View'}</span>
      </div>
      {markers && markers.map((m: any, i: number) => {
        const top = 20 + ((i * 37) % 60) + '%';
        const left = 20 + ((i * 53) % 60) + '%';
        return (
          <div key={i} className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker cursor-pointer" style={{ top, left }}>
            <div className="relative flex flex-col items-center">
               <div className="w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-500/30 animate-pulse" />
               <div className="absolute -top-8 opacity-0 group-hover/marker:opacity-100 transition-all transform translate-y-2 group-hover/marker:translate-y-0 bg-zinc-900 text-[10px] px-2 py-1 rounded border border-zinc-700 whitespace-nowrap z-20 shadow-xl font-bold">{m.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
`,

  "src/components/ui/BentoGrid.tsx": `
import React from 'react';
import { RenderChildren } from './utils';
export const BentoContainer = ({ children, onAction, path }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full auto-rows-[minmax(180px,auto)]">
      <RenderChildren children={children} onAction={onAction} parentPath={path} />
    </div>
  );
};
export const BentoCard = ({ children, title, colSpan = 1, rowSpan = 1, variant = 'DEFAULT', bgImage, onAction, path }: any) => {
  const colSpanClass = { 1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4' }[colSpan] || 'md:col-span-1';
  const rowSpanClass = { 1: 'md:row-span-1', 2: 'md:row-span-2', 3: 'md:row-span-3' }[rowSpan] || 'md:row-span-1';
  const style = bgImage ? { backgroundImage: \`url(\${bgImage})\`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
  return (
    <div className={\`\${colSpanClass} \${rowSpanClass} group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl transition-all hover:border-white/20 hover:shadow-2xl flex flex-col\`} style={style}>
      {bgImage && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0" />}
      <div className="relative z-10 flex-1 flex flex-col h-full">
        {title && <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-200">{title}</h3>}
        <div className="flex-1 min-h-0 w-full"><RenderChildren children={children} onAction={onAction} parentPath={path} /></div>
      </div>
    </div>
  );
};
`,

  "src/components/ui/Kanban.tsx": `
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal } from 'lucide-react';
export const Kanban = ({ columns = [] }: any) => {
  return (
    <div className="flex w-full overflow-x-auto gap-6 pb-4 snap-x">
      {columns.map((col: any, colIdx: number) => {
        const items = col.items || [];
        return (
          <div key={colIdx} className="flex-none w-80 flex flex-col gap-4 snap-start">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className={\`w-3 h-3 rounded-full ring-2 ring-white/10 \${col.color === 'BLUE' ? 'bg-indigo-500' : col.color === 'GREEN' ? 'bg-emerald-500' : col.color === 'ORANGE' ? 'bg-orange-500' : 'bg-zinc-500'}\`} />
                  <span className="font-semibold text-sm text-slate-200">{col.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-500 font-mono">{items.length}</span>
               </div>
               <button className="text-zinc-600 hover:text-zinc-400"><Plus className="w-4 h-4" /></button>
            </div>
            <div className={\`flex-1 min-h-[400px] rounded-2xl bg-zinc-900/40 border border-white/5 p-3 flex flex-col gap-3 backdrop-blur-sm\`}>
               {items.map((item: any, itemIdx: number) => {
                 const content = typeof item === 'string' ? item : item.content;
                 const tag = typeof item === 'object' ? item.tag : null;
                 return (
                    <motion.div key={itemIdx} layoutId={\`card-\${colIdx}-\${itemIdx}\`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: itemIdx * 0.1 }} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-600 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                        <div className="flex justify-between items-start mb-2">
                           {tag ? <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-800 text-zinc-400\`}>{tag}</span> : <div />}
                           <button className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-400 transition-opacity"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{content}</p>
                    </motion.div>
                 );
               })}
               <button className="w-full py-2 rounded-lg border border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 hover:border-zinc-700 transition-all text-xs font-medium flex items-center justify-center gap-2 mt-2"><Plus className="w-3 h-3" /> Add Task</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
`
};
