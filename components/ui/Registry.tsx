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
    GAP_SM: 'gap-3', 
    GAP_MD: 'gap-6', 
    GAP_LG: 'gap-8',
    GAP_XL: 'gap-12'
  };
  // Updated Backgrounds for Obsidian Theme
  const backgrounds: Record<string, string> = {
    DEFAULT: '',
    SURFACE: 'bg-zinc-900 border border-white/5 rounded-2xl',
    GLASS: 'bg-zinc-900/60 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl'
  };

  const layoutClass = layouts[layout] || layouts.COL;
  const gapClass = gaps[gap] || gaps.GAP_MD;
  const padClass = padding ? 'p-6 md:p-8' : '';
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
    H3: 'text-xl font-semibold tracking-tight',
    BODY: 'text-sm md:text-base leading-7 text-slate-300',
    CAPTION: 'text-xs uppercase tracking-widest font-bold text-slate-500',
    CODE: 'font-mono text-xs bg-zinc-900 border border-white/10 px-2 py-1 rounded text-pink-400'
  };
  const colors: Record<string, string> = {
    DEFAULT: 'text-slate-100',
    MUTED: 'text-slate-500',
    PRIMARY: 'text-indigo-400',
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
  const base = "inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants: Record<string, string> = {
    PRIMARY: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10',
    SECONDARY: 'bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700',
    GHOST: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
    DANGER: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    GLOW: 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_25px_rgba(124,58,237,0.4)] border border-violet-400/50',
    OUTLINE: 'bg-transparent border border-zinc-600 text-zinc-400 hover:border-zinc-400 hover:text-white',
    SOFT: 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/10',
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

// 4. Hero Section
const Hero = ({ title, subtitle, gradient = 'BLUE_PURPLE', align = 'CENTER', children, onAction }: any) => {
  const gradients: Record<string, string> = {
    BLUE_PURPLE: 'from-blue-600/30 via-indigo-500/30 to-purple-600/30',
    ORANGE_RED: 'from-orange-500/30 via-red-500/30 to-pink-500/30',
    GREEN_TEAL: 'from-emerald-500/30 via-teal-500/30 to-cyan-500/30',
  };

  const alignClass = align === 'LEFT' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/5 p-12 md:p-24 flex flex-col ${alignClass} gap-8`}>
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[gradient] || gradients.BLUE_PURPLE} opacity-40 blur-3xl`} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      
      <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-sm">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 mt-6 flex gap-4">
        <RenderChildren children={children} onAction={onAction} />
      </div>
    </div>
  );
};

// 5. Card
const Card = ({ children, title, variant = 'DEFAULT', onAction }: any) => {
  const styles: Record<string, string> = {
    DEFAULT: 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700',
    GLASS: 'bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-xl',
    NEON: 'bg-zinc-950 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]',
    OUTLINED: 'bg-transparent border-2 border-dashed border-zinc-800 hover:border-zinc-700',
    ELEVATED: 'bg-zinc-800 shadow-2xl shadow-black/50 border-t border-white/5',
    FROSTED: 'bg-white/5 backdrop-blur-xl border border-white/5'
  };

  return (
    <div className={`rounded-2xl overflow-hidden ${styles[variant] || styles.DEFAULT} flex flex-col h-full transition-all duration-300 group`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <RenderChildren children={children} onAction={onAction} />
      </div>
    </div>
  );
};

// 6. Table
const Table = ({ headers, rows, onAction }: any) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-zinc-950/50 text-slate-400 border-b border-zinc-800">
            <tr>
              {headers?.map((h: string, i: number) => (
                <th key={i} className="px-6 py-4 font-semibold tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows?.map((row: any[], i: number) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group">
                {row.map((cell: any, j: number) => (
                   <td key={j} className="px-6 py-4 whitespace-nowrap text-slate-300">
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
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition-colors group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
         {/* Abstract Shape */}
         <div className="w-16 h-16 bg-gradient-to-br from-white to-transparent rounded-full blur-xl" />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-3 relative z-10">
          <div className="text-3xl font-bold text-white tracking-tight">
            {value}
          </div>
          {trend && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center ${
                isUp ? 'text-emerald-400 bg-emerald-500/10' : 
                isDown ? 'text-red-400 bg-red-500/10' : 'text-slate-400 bg-slate-500/10'
            }`}>
                {isUp ? <Lucide.TrendingUp className="w-3 h-3 mr-1" /> : isDown ? <Lucide.TrendingDown className="w-3 h-3 mr-1" /> : <Lucide.Minus className="w-3 h-3 mr-1" />}
                {trend}
            </span>
            )}
      </div>
    </div>
  );
};

// 8. Progress
const Progress = ({ label, value, color = 'BLUE' }: any) => {
  const colors: Record<string, string> = {
    BLUE: 'bg-indigo-500',
    GREEN: 'bg-emerald-500',
    ORANGE: 'bg-orange-500',
    RED: 'bg-rose-500'
  };
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color] || colors.BLUE} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
};

// 9. Alert
const Alert = ({ title, description, variant = 'INFO' }: any) => {
  const variants: Record<string, any> = {
    INFO: { style: 'bg-blue-900/10 border-blue-500/20 text-blue-300', icon: Lucide.Info },
    SUCCESS: { style: 'bg-emerald-900/10 border-emerald-500/20 text-emerald-300', icon: Lucide.CheckCircle2 },
    WARNING: { style: 'bg-orange-900/10 border-orange-500/20 text-orange-300', icon: Lucide.AlertTriangle },
    ERROR: { style: 'bg-red-900/10 border-red-500/20 text-red-300', icon: Lucide.XCircle },
  };
  const config = variants[variant] || variants.INFO;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border flex gap-4 items-start ${config.style}`}>
      <div className="mt-0.5 p-1 bg-white/5 rounded-full">
         <Icon className="w-4 h-4 flex-shrink-0" />
      </div>
      <div>
        <h5 className="font-semibold text-sm mb-1">{title}</h5>
        <p className="text-xs opacity-80 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

// 10. Avatar
const Avatar = ({ initials, src, status }: any) => {
  const statusColors: Record<string, string> = {
    ONLINE: 'bg-emerald-500',
    OFFLINE: 'bg-slate-500',
    BUSY: 'bg-red-500'
  };
  return (
    <div className="relative inline-block group">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700 ring-2 ring-transparent group-hover:ring-white/10 transition-all">
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-xs text-slate-400 group-hover:text-white">{initials}</span>
        )}
      </div>
      {status && (
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${statusColors[status] || 'bg-slate-500'}`} />
      )}
    </div>
  );
};

// 11. Chart
const ChartComponent = ({ type = 'BAR', data, title, color = "#6366f1" }: any) => {
  return (
    <div className="w-full h-72 flex flex-col bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl">
      {title && <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">{title}</h4>}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'LINE' ? (
            <LineChart data={data}>
              <defs>
                <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor={color} stopOpacity={0.5}/>
                  <stop offset="95%" stopColor={color} stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
                cursor={{ stroke: '#27272a', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="value" stroke="url(#lineColor)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color, stroke: '#09090b', strokeWidth: 2 }} />
            </LineChart>
          ) : type === 'AREA' ? (
             <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                 cursor={{ fill: '#27272a', opacity: 0.4, radius: 4 }}
                 contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f8fafc' }}
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
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors group-focus-within:text-indigo-400">{label}</label>
      <input 
        type={inputType}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-zinc-600"
        placeholder={placeholder}
      />
    </div>
  );
};

// 13. Separator
const Separator = () => <div className="h-px bg-zinc-800 my-8 w-full" />;

// 14. Badge
const Badge = ({ label, color = 'BLUE' }: any) => {
  const colors: Record<string, string> = {
    BLUE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    GREEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    RED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    GRAY: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${colors[color] || colors.BLUE}`}>
      {label}
    </span>
  );
};

// 15. Accordion
const Accordion = ({ items, variant = 'DEFAULT', onAction }: any) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!items || !Array.isArray(items)) return null;

  const containerStyles: Record<string, string> = {
    DEFAULT: 'divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900',
    SEPARATED: 'space-y-4'
  };

  const itemStyles: Record<string, string> = {
    DEFAULT: 'bg-transparent',
    SEPARATED: 'border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden'
  };

  return (
    <div className={`w-full ${containerStyles[variant] || containerStyles.DEFAULT}`}>
      {items.map((item: any, i: number) => {
        const isOpen = openIndex === i;
        const content = Array.isArray(item.content) ? item.content : [];
        
        return (
          <div key={i} className={itemStyles[variant] || itemStyles.DEFAULT}>
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors focus:outline-none"
            >
              <span className={`font-medium text-sm ${isOpen ? 'text-indigo-400' : 'text-slate-200'}`}>
                {item.title}
              </span>
              <Lucide.ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 border-t border-zinc-800/50 text-slate-400">
                        <RenderChildren children={content} onAction={onAction} />
                    </div>
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 16. Image
const ImageComponent = ({ src, alt, caption, aspectRatio = 'VIDEO' }: any) => {
  const ratios: Record<string, string> = {
    VIDEO: 'aspect-video',
    SQUARE: 'aspect-square',
    WIDE: 'aspect-[21/9]',
    PORTRAIT: 'aspect-[3/4]'
  };

  return (
    <figure className="w-full flex flex-col gap-3 group">
      <div className={`w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 ${ratios[aspectRatio] || ratios.VIDEO} relative`}>
        <img 
          src={src || 'https://via.placeholder.com/800x400/18181b/52525b?text=Image'} 
          alt={alt || 'Generated Content'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
      </div>
      {caption && (
        <figcaption className="text-xs text-center text-slate-500 font-medium tracking-wide">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// 17. Map Widget (Visual Representation)
const MapWidget = ({ label, style = 'DARK', markers = [] }: any) => {
  const bgStyles: Record<string, any> = {
    DARK: { bg: '#18181b', grid: '#27272a' },
    LIGHT: { bg: '#cbd5e1', grid: '#94a3b8' },
    SATELLITE: { bg: '#020617', grid: '#1e293b' }
  };
  
  const theme = bgStyles[style] || bgStyles.DARK;

  return (
    <div className="w-full h-72 rounded-xl overflow-hidden relative border border-zinc-700 group shadow-2xl">
      {/* Mock Map Background */}
      <div 
        className="absolute inset-0 w-full h-full transition-colors duration-500"
        style={{ backgroundColor: theme.bg }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-700 shadow-xl flex items-center gap-2">
        <Lucide.Map className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold text-slate-200">{label || 'Geographic View'}</span>
      </div>

      {/* Markers */}
      {markers && markers.map((m: any, i: number) => {
        const top = 20 + ((i * 37) % 60) + '%';
        const left = 20 + ((i * 53) % 60) + '%';
        
        return (
          <div 
            key={i} 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker cursor-pointer"
            style={{ top, left }}
          >
            <div className="relative flex flex-col items-center">
               <div className="w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-500/30 animate-pulse" />
               <div className="absolute -top-8 opacity-0 group-hover/marker:opacity-100 transition-all transform translate-y-2 group-hover/marker:translate-y-0 bg-zinc-900 text-[10px] px-2 py-1 rounded border border-zinc-700 whitespace-nowrap z-20 shadow-xl font-bold">
                  {m.title}
               </div>
            </div>
          </div>
        );
      })}
    </div>
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
  accordion: Accordion,
  
  text: Typography,
  button: Button,
  input: Input,
  badge: Badge,
  avatar: Avatar,
  alert: Alert,
  
  stat: StatCard,
  chart: ChartComponent,
  table: Table,
  progress: Progress,
  
  image: ImageComponent,
  map: MapWidget
};