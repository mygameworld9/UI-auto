import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import * as Lucide from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                ATOMIC COMPONENTS                           */
/* -------------------------------------------------------------------------- */

// 1. Container - The layout workhorse
const Container = ({ children, layout = 'COL', gap = 'GAP_MD', padding = false, className = '' }: any) => {
  const baseClass = "flex w-full";
  
  // Enum Mappers
  const layouts: Record<string, string> = {
    COL: 'flex-col',
    ROW: 'flex-row flex-wrap items-center',
    GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };
  const gaps: Record<string, string> = { 
    GAP_SM: 'gap-2', 
    GAP_MD: 'gap-4', 
    GAP_LG: 'gap-6' 
  };
  
  const layoutClass = layouts[layout] || layouts.COL;
  const gapClass = gaps[gap] || gaps.GAP_MD;
  const paddingClass = padding ? 'p-6' : '';

  return (
    <div className={`${baseClass} ${layoutClass} ${gapClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
};

// 2. Typography - Handles headings and body text
const Typography = ({ content, variant = 'BODY', color = 'DEFAULT' }: any) => {
  const styles: Record<string, string> = {
    H1: 'text-3xl font-bold tracking-tight',
    H2: 'text-2xl font-semibold tracking-tight',
    H3: 'text-xl font-medium',
    BODY: 'text-base',
    CAPTION: 'text-xs text-slate-500 uppercase tracking-wider font-bold',
  };
  const colors: Record<string, string> = {
    DEFAULT: 'text-slate-100',
    MUTED: 'text-slate-400',
    PRIMARY: 'text-blue-400',
    DANGER: 'text-red-400'
  };

  return (
    <div className={`${styles[variant] || styles.BODY} ${colors[color] || colors.DEFAULT}`}>
      {content}
    </div>
  );
};

// 3. Button - Interactive element with Action protocol support
const Button = ({ label, variant = 'PRIMARY', icon, action, onAction }: any) => {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-95";
  
  const variants: Record<string, string> = {
    PRIMARY: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 focus:ring-blue-500',
    SECONDARY: 'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500',
    GHOST: 'bg-transparent hover:bg-slate-800 text-slate-300',
    DANGER: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 focus:ring-red-500'
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

// 4. Card - Content wrapper
const Card = ({ children, title, variant = 'DEFAULT' }: any) => {
  const styles: Record<string, string> = {
    DEFAULT: 'bg-slate-800 border border-slate-700 shadow-xl',
    GLASS: 'bg-slate-800/40 backdrop-blur-xl border border-white/5 shadow-2xl'
  };

  return (
    <div className={`rounded-xl overflow-hidden ${styles[variant] || styles.DEFAULT} flex flex-col h-full transition-all hover:border-slate-600`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
          <h3 className="font-semibold text-slate-200">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
};

// 5. StatCard - Data display
const StatCard = ({ label, value, trend, trendDirection }: any) => {
  const isUp = trendDirection === 'UP';
  const isNeutral = !trendDirection;
  
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {trend && (
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
            isUp ? 'bg-green-500/10 text-green-400' : 
            isNeutral ? 'bg-slate-500/10 text-slate-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {isUp ? <Lucide.ArrowUpRight className="w-3 h-3 mr-1" /> : <Lucide.ArrowDownRight className="w-3 h-3 mr-1" />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

// 6. Chart - Visualization wrapper
const ChartComponent = ({ type = 'BAR', data, title, color = "#3b82f6" }: any) => {
  return (
    <div className="w-full h-64 flex flex-col">
      {title && <h4 className="text-sm font-medium text-slate-400 mb-4">{title}</h4>}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'LINE' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
                cursor={{ stroke: '#334155', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          ) : type === 'AREA' ? (
             <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                 cursor={{ fill: '#334155', opacity: 0.2 }}
                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                 itemStyle={{ color: '#f8fafc' }}
              />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 7. Input
const Input = ({ label, placeholder, inputType = 'text' }: any) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <input 
        type={inputType}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        placeholder={placeholder}
      />
    </div>
  );
};

// 8. Separator
const Separator = () => <div className="h-px bg-slate-800 my-6 w-full" />;

// 9. Badge (Utility)
const Badge = ({ label, color = 'BLUE' }: any) => {
  const colors: Record<string, string> = {
    BLUE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    GREEN: 'bg-green-500/10 text-green-400 border-green-500/20',
    RED: 'bg-red-500/10 text-red-400 border-red-500/20',
    GRAY: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[color] || colors.BLUE}`}>
      {label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                            COMPONENT REGISTRY MAP                          */
/* -------------------------------------------------------------------------- */
/**
 * This Map connects the JSON "OneOf" keys to React Components.
 * The Renderer uses this to look up the correct component implementation.
 */
export const ComponentRegistry: Record<string, React.FC<any>> = {
  // Structure
  container: Container,
  card: Card,
  separator: Separator,
  
  // Content
  text: Typography,
  button: Button,
  input: Input,
  badge: Badge,
  
  // Visualization
  stat: StatCard,
  chart: ChartComponent
};