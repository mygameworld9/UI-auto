import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import * as Lucide from 'lucide-react';
import { UINode } from '../../types';
import DynamicRenderer from '../DynamicRenderer';

/* -------------------------------------------------------------------------- */
/*                                UTILITIES                                   */
/* -------------------------------------------------------------------------- */

// Helper to render nested children via the DynamicRenderer (circular dependency handled via prop)
const RenderChildren = ({ children, onAction }: any) => {
  if (!children || !Array.isArray(children)) return null;
  return children.map((child: UINode, i: number) => (
    <DynamicRenderer key={i} index={i} node={child} onAction={onAction} />
  ));
};

/* -------------------------------------------------------------------------- */
/*                                ATOMIC COMPONENTS                           */
/* -------------------------------------------------------------------------- */

// 1. Container
const Container = ({ children, layout = 'COL', gap = 'GAP_MD', padding = false, background = 'DEFAULT', className = '', onAction }: any) => {
  const baseClass = "flex w-full";
  
  const layouts: Record<string, string> = {
    COL: 'flex-col',
    ROW: 'flex-row flex-wrap items-center',
    GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };
  const gaps: Record<string, string> = { 
    GAP_SM: 'gap-2', 
    GAP_MD: 'gap-4', 
    GAP_LG: 'gap-6',
    GAP_XL: 'gap-8'
  };
  const backgrounds: Record<string, string> = {
    DEFAULT: '',
    SURFACE: 'bg-slate-900',
    GLASS: 'bg-slate-900/40 backdrop-blur-md border border-white/5 shadow-xl' // Glassmorphism
  };

  const layoutClass = layouts[layout] || layouts.COL;
  const gapClass = gaps[gap] || gaps.GAP_MD;
  const padClass = padding ? 'p-6' : '';
  const bgClass = backgrounds[background] || backgrounds.DEFAULT;

  return (
    <div className={`${baseClass} ${layoutClass} ${gapClass} ${padClass} ${bgClass} ${className} transition-all`}>
      <RenderChildren children={children} onAction={onAction} />
    </div>
  );
};

// 2. Typography
const Typography = ({ content, variant = 'BODY', color = 'DEFAULT' }: any) => {
  const styles: Record<string, string> = {
    H1: 'text-4xl md:text-5xl font-extrabold tracking-tight',
    H2: 'text-3xl font-bold tracking-tight',
    H3: 'text-xl font-semibold',
    BODY: 'text-base leading-relaxed',
    CAPTION: 'text-xs uppercase tracking-widest font-bold',
    CODE: 'font-mono text-sm bg-black/30 px-2 py-1 rounded'
  };
  const colors: Record<string, string> = {
    DEFAULT: 'text-slate-100',
    MUTED: 'text-slate-400',
    PRIMARY: 'text-blue-400',
    ACCENT: 'text-violet-400',
    DANGER: 'text-red-400',
    SUCCESS: 'text-emerald-400'
  };

  return (
    <div className={`${styles[variant] || styles.BODY} ${colors[color] || colors.DEFAULT}`}>
      {content}
    </div>
  );
};

// 3. Button
const Button = ({ label, variant = 'PRIMARY', icon, action, onAction }: any) => {
  const base = "inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium transition-all focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants: Record<string, string> = {
    PRIMARY: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
    SECONDARY: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    GHOST: 'bg-transparent hover:bg-white/5 text-slate-300',
    DANGER: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    GLOW: 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400/50',
    // New Variants
    OUTLINE: 'bg-transparent border-2 border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white',
    SOFT: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
    GRADIENT: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-white/10'
  };

  const IconCmp = icon && (Lucide as any)[icon] ? (Lucide as any)[icon] : null;

  return (
    <button 
      onClick={() => onAction && action ? onAction(action) : null}
      className={`${base} ${variants[variant] || variants.PRIMARY}`}
    >
      {IconCmp && <IconCmp className="w-4 h-4 mr-2" />}
      {label}
    </button>
  );
};

// 4. Hero Section (NEW)
const Hero = ({ title, subtitle, gradient = 'BLUE_PURPLE', align = 'CENTER', children, onAction }: any) => {
  const gradients: Record<string, string> = {
    BLUE_PURPLE: 'from-blue-600 via-indigo-500 to-purple-600',
    ORANGE_RED: 'from-orange-500 via-red-500 to-pink-500',
    GREEN_TEAL: 'from-emerald-500 via-teal-500 to-cyan-500',
  };

  const alignClass = align === 'LEFT' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-900 border border-white/10 p-12 md:p-20 flex flex-col ${alignClass} gap-6`}>
      {/* Ambient Background Glow */}
      <div className={`absolute top-0 left-0 w-full h-full opacity-20 bg-gradient-to-br ${gradients[gradient] || gradients.BLUE_PURPLE} blur-3xl pointer-events-none`} />
      
      <div className="relative z-10 flex flex-col gap-4 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          {title}
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 mt-4">
        <RenderChildren children={children} onAction={onAction} />
      </div>
    </div>
  );
};

// 5. Card
const Card = ({ children, title, variant = 'DEFAULT', onAction }: any) => {
  const styles: Record<string, string> = {
    DEFAULT: 'bg-slate-800 border border-slate-700',
    GLASS: 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl',
    NEON: 'bg-slate-900 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]',
    // New Variants
    OUTLINED: 'bg-transparent border-2 border-slate-800 hover:border-slate-700 transition-colors',
    ELEVATED: 'bg-slate-800 shadow-2xl shadow-black/50 border-t border-white/5 transform hover:-translate-y-1 transition-transform',
    FROSTED: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg'
  };

  return (
    <div className={`rounded-xl overflow-hidden ${styles[variant] || styles.DEFAULT} flex flex-col h-full`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <RenderChildren children={children} onAction={onAction} />
      </div>
    </div>
  );
};

// 6. Table (NEW)
const Table = ({ headers, rows, onAction }: any) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-800 text-slate-400">
            <tr>
              {headers?.map((h: string, i: number) => (
                <th key={i} className="px-6 py-3 font-bold tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {rows?.map((row: any[], i: number) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                {row.map((cell: any, j: number) => (
                   <td key={j} className="px-6 py-4 whitespace-nowrap text-slate-300">
                     {/* If cell is a string render it, else if it's an object try to render as node */}
                     {typeof cell === 'string' || typeof cell === 'number' ? cell : (
                        <div className="scale-90 origin-left">
                          <DynamicRenderer node={cell} onAction={onAction} />
                        </div>
                     )}
                   </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 7. StatCard
const StatCard = ({ label, value, trend, trendDirection }: any) => {
  const isUp = trendDirection === 'UP';
  const isDown = trendDirection === 'DOWN';
  
  return (
    <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${
            isUp ? 'bg-emerald-500/10 text-emerald-400' : 
            isDown ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
          }`}>
             {isUp ? <Lucide.TrendingUp className="w-3 h-3 mr-1" /> : isDown ? <Lucide.TrendingDown className="w-3 h-3 mr-1" /> : <Lucide.Minus className="w-3 h-3 mr-1" />}
             {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left">
        {value}
      </div>
    </div>
  );
};

// 8. Progress (NEW)
const Progress = ({ label, value, color = 'BLUE' }: any) => {
  const colors: Record<string, string> = {
    BLUE: 'bg-blue-500',
    GREEN: 'bg-emerald-500',
    ORANGE: 'bg-orange-500',
    RED: 'bg-red-500'
  };
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color] || colors.BLUE} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
};

// 9. Alert (NEW)
const Alert = ({ title, description, variant = 'INFO' }: any) => {
  const variants: Record<string, any> = {
    INFO: { style: 'bg-blue-900/20 border-blue-500/30 text-blue-200', icon: Lucide.Info },
    SUCCESS: { style: 'bg-emerald-900/20 border-emerald-500/30 text-emerald-200', icon: Lucide.CheckCircle2 },
    WARNING: { style: 'bg-orange-900/20 border-orange-500/30 text-orange-200', icon: Lucide.AlertTriangle },
    ERROR: { style: 'bg-red-900/20 border-red-500/30 text-red-200', icon: Lucide.XCircle },
  };
  const config = variants[variant] || variants.INFO;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border flex gap-3 items-start ${config.style}`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>
        <h5 className="font-semibold text-sm mb-1">{title}</h5>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </div>
  );
};

// 10. Avatar (NEW)
const Avatar = ({ initials, src, status }: any) => {
  const statusColors: Record<string, string> = {
    ONLINE: 'bg-emerald-500',
    OFFLINE: 'bg-slate-500',
    BUSY: 'bg-red-500'
  };
  return (
    <div className="relative inline-block">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center border-2 border-slate-800 ring-2 ring-white/10">
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-sm text-slate-300">{initials}</span>
        )}
      </div>
      {status && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${statusColors[status] || 'bg-slate-500'}`} />
      )}
    </div>
  );
};

// 11. Chart
const ChartComponent = ({ type = 'BAR', data, title, color = "#3b82f6" }: any) => {
  return (
    <div className="w-full h-64 flex flex-col">
      {title && <h4 className="text-sm font-medium text-slate-400 mb-4">{title}</h4>}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'LINE' ? (
            <LineChart data={data}>
              <defs>
                <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#f8fafc' }}
                cursor={{ stroke: '#334155', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="value" stroke="url(#lineColor)" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: color, stroke: '#0f172a', strokeWidth: 2 }} />
            </LineChart>
          ) : type === 'AREA' ? (
             <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                 cursor={{ fill: '#334155', opacity: 0.1, radius: 4 }}
                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                 itemStyle={{ color: '#f8fafc' }}
              />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 12. Input (Enhanced)
const Input = ({ label, placeholder, inputType = 'text' }: any) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors group-focus-within:text-blue-400">{label}</label>
      <input 
        type={inputType}
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all hover:border-slate-600"
        placeholder={placeholder}
      />
    </div>
  );
};

// 13. Separator
const Separator = () => <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-6 w-full" />;

// 14. Badge
const Badge = ({ label, color = 'BLUE' }: any) => {
  const colors: Record<string, string> = {
    BLUE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    GREEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    RED: 'bg-red-500/10 text-red-400 border-red-500/20',
    GRAY: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[color] || colors.BLUE}`}>
      {label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                            COMPONENT REGISTRY MAP                          */
/* -------------------------------------------------------------------------- */
export const ComponentRegistry: Record<string, React.FC<any>> = {
  container: Container,
  card: Card,
  separator: Separator,
  hero: Hero,
  
  text: Typography,
  button: Button,
  input: Input,
  badge: Badge,
  avatar: Avatar,
  alert: Alert,
  
  stat: StatCard,
  chart: ChartComponent,
  table: Table,
  progress: Progress
};