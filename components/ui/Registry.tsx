import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import * as Lucide from 'lucide-react';

// --- Atomic Components ---

const Container = ({ children, layout = 'COL', gap = 'GAP_MD', padding = false, className = '' }: any) => {
  const baseClass = "flex w-full";
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
  const p = padding ? 'p-6' : '';
  
  // Lowercase fallback for safety
  const layoutClass = layouts[layout] || layouts[layout.toUpperCase()] || layouts.COL;
  const gapClass = gaps[gap] || gaps[gap.toUpperCase()] || gaps.GAP_MD;

  return (
    <div className={`${baseClass} ${layoutClass} ${gapClass} ${p} ${className}`}>
      {children}
    </div>
  );
};

const Typography = ({ content, variant = 'BODY', color = 'DEFAULT' }: any) => {
  const styles: Record<string, string> = {
    H1: 'text-3xl font-bold tracking-tight',
    H2: 'text-2xl font-semibold tracking-tight',
    H3: 'text-xl font-medium',
    BODY: 'text-base',
    CAPTION: 'text-sm text-slate-400 uppercase tracking-wider font-bold',
  };
  const colors: Record<string, string> = {
    DEFAULT: 'text-slate-100',
    MUTED: 'text-slate-400',
    PRIMARY: 'text-blue-400',
    DANGER: 'text-red-400'
  };

  const v = variant.toUpperCase();
  const c = color.toUpperCase();

  return <div className={`${styles[v] || styles.BODY} ${colors[c] || colors.DEFAULT}`}>{content}</div>;
};

const Button = ({ label, variant = 'PRIMARY', icon, action, onAction }: any) => {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  const variants: Record<string, string> = {
    PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    SECONDARY: 'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500',
    GHOST: 'bg-transparent hover:bg-slate-800 text-slate-300',
    DANGER: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };

  const v = variant.toUpperCase();
  const IconCmp = icon && (Lucide as any)[icon] ? (Lucide as any)[icon] : null;

  return (
    <button 
      onClick={() => onAction && action ? onAction(action) : null}
      className={`${base} ${variants[v] || variants.PRIMARY}`}
    >
      {IconCmp && <IconCmp className="w-4 h-4 mr-2" />}
      {label}
    </button>
  );
};

const Card = ({ children, title, variant = 'DEFAULT' }: any) => {
  const styles: Record<string, string> = {
    DEFAULT: 'bg-slate-800 border border-slate-700 shadow-sm',
    GLASS: 'bg-slate-800/50 backdrop-blur-md border border-slate-700/50'
  };

  const v = variant.toUpperCase();

  return (
    <div className={`rounded-xl overflow-hidden ${styles[v] || styles.DEFAULT} flex flex-col h-full`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="font-semibold text-slate-200">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, trendDirection }: any) => {
  const isUp = trendDirection === 'UP';
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

const ChartComponent = ({ type = 'BAR', data, title, color = "#3b82f6" }: any) => {
  const t = type.toUpperCase();
  const ChartImpl = t === 'LINE' ? LineChart : t === 'AREA' ? AreaChart : BarChart;

  return (
    <div className="w-full h-64">
      {title && <h4 className="text-sm font-medium text-slate-400 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <ChartImpl data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any) => `${value}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          {t === 'LINE' ? (
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} />
          ) : t === 'AREA' ? (
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
          ) : (
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0] as [number, number, number, number]} />
          )}
        </ChartImpl>
      </ResponsiveContainer>
    </div>
  );
};

const Badge = ({ label, color = 'BLUE' }: any) => {
  const colors: Record<string, string> = {
    BLUE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    GREEN: 'bg-green-500/10 text-green-400 border-green-500/20',
    RED: 'bg-red-500/10 text-red-400 border-red-500/20',
    GRAY: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color.toUpperCase()] || colors.BLUE}`}>
      {label}
    </span>
  );
};

const Input = ({ label, placeholder, inputType = 'text' }: any) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <input 
        type={inputType}
        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        placeholder={placeholder}
      />
    </div>
  );
};

const Separator = () => <div className="h-px bg-slate-700 my-4 w-full" />;

// 4.1 Component Registry Map
export const ComponentRegistry: Record<string, React.FC<any>> = {
  container: Container,
  text: Typography,
  button: Button,
  card: Card,
  stat: StatCard,
  chart: ChartComponent,
  badge: Badge,
  input: Input,
  separator: Separator
};