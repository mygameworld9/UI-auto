
import { UINode } from "../types";
import { THEME } from "../components/ui/theme";

// Context to track imports and depth during generation
interface GenContext {
  imports: Set<string>;
  depth: number;
}

// Helper to indent code
const indent = (depth: number) => '  '.repeat(depth);

// Safe property access utility for Theme
const getThemeProp = (obj: any, key: string, fallback: any) => {
  return (obj && obj[key]) ? obj[key] : fallback;
};

/* -------------------------------------------------------------------------- */
/*                               IMPORT MANAGER                               */
/* -------------------------------------------------------------------------- */

const addImport = (ctx: GenContext, lib: string, item: string) => {
  ctx.imports.add(`${lib}:${item}`);
};

/* -------------------------------------------------------------------------- */
/*                            COMPONENT GENERATORS                            */
/* -------------------------------------------------------------------------- */

const generateChildren = (children: UINode[] | undefined, ctx: GenContext): string => {
  if (!children || !Array.isArray(children) || children.length === 0) return '';
  return children
    .map(child => generateNode(child, { ...ctx, depth: ctx.depth + 1 }))
    .filter(str => str.length > 0) // Clean up empty strings from skipped nodes
    .join('\n');
};

const generateContainer = (props: any, ctx: GenContext): string => {
  const { layout = 'COL', gap = 'GAP_MD', padding, background = 'DEFAULT', bgImage, className = '', children } = props;

  const layoutClass = getThemeProp(THEME.container.layouts, layout, THEME.container.layouts.COL);
  const gapClass = getThemeProp(THEME.container.gaps, gap, THEME.container.gaps.GAP_MD);
  
  // Resolve tokens immediately
  const bgClass = bgImage ? '' : getThemeProp(THEME.container.backgrounds, background, THEME.container.backgrounds.DEFAULT);
  const padClass = padding ? 'p-6 md:p-8' : '';
  
  // Combine classes, removing extra spaces
  const classes = `flex w-full ${layoutClass} ${gapClass} ${padClass} ${bgClass} ${className} relative overflow-hidden`.replace(/\s+/g, ' ').trim();
  
  const styleProp = bgImage ? ` style={{ backgroundImage: 'url(${bgImage})', backgroundSize: 'cover', backgroundPosition: 'center' }}` : '';
  const childrenJSX = generateChildren(children, ctx);

  if (bgImage) {
    return `${indent(ctx.depth)}<div className="${classes}"${styleProp}>
${indent(ctx.depth + 1)}<div className="absolute inset-0 bg-black/40 pointer-events-none" />
${indent(ctx.depth + 1)}<div className="relative z-10 w-full flex flex-col h-full">
${childrenJSX}
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth)}</div>`;
  }

  return `${indent(ctx.depth)}<div className="${classes}"${styleProp}>
${childrenJSX}
${indent(ctx.depth)}</div>`;
};

const generateText = (props: any, ctx: GenContext): string => {
  const { content, variant = 'BODY', color = 'DEFAULT', font = 'SANS' } = props;
  
  const styleClass = getThemeProp(THEME.typography.variants, variant, THEME.typography.variants.BODY);
  const colorClass = getThemeProp(THEME.typography.colors, color, THEME.typography.colors.DEFAULT);
  const fontClass = getThemeProp(THEME.typography.fonts, font, THEME.typography.fonts.SANS);

  let Tag = 'div';
  if (['H1', 'H2', 'H3'].includes(variant)) Tag = variant.toLowerCase();
  if (variant === 'CODE') Tag = 'code';

  return `${indent(ctx.depth)}<${Tag} className="${styleClass} ${colorClass} ${fontClass}">
${indent(ctx.depth + 1)}${content}
${indent(ctx.depth)}</${Tag}>`;
};

const generateButton = (props: any, ctx: GenContext): string => {
  const { label, variant = 'PRIMARY', icon } = props;
  const variantClass = getThemeProp(THEME.button.variants, variant, THEME.button.variants.PRIMARY);
  const baseClass = THEME.button.base;

  if (icon) {
    addImport(ctx, 'lucide-react', icon);
  }

  return `${indent(ctx.depth)}<button className="${baseClass} ${variantClass}">
${icon ? `${indent(ctx.depth + 1)}<${icon} className="w-4 h-4 mr-2" />\n` : ''}${indent(ctx.depth + 1)}${label}
${indent(ctx.depth)}</button>`;
};

const generateCard = (props: any, ctx: GenContext): string => {
  const { title, variant = 'DEFAULT', children } = props;
  const variantClass = getThemeProp(THEME.card.variants, variant, THEME.card.variants.DEFAULT);
  const baseClass = THEME.card.base;

  return `${indent(ctx.depth)}<div className="${baseClass} ${variantClass}">
${title ? `${indent(ctx.depth + 1)}<div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
${indent(ctx.depth + 2)}<h3 className="font-semibold text-slate-200 tracking-tight">${title}</h3>
${indent(ctx.depth + 1)}</div>` : ''}
${indent(ctx.depth + 1)}<div className="p-6 flex-1 flex flex-col gap-4">
${generateChildren(children, ctx)}
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth)}</div>`;
};

const generateBadge = (props: any, ctx: GenContext): string => {
  const { label, color = 'BLUE' } = props;
  const colorClass = getThemeProp(THEME.badge.colors, color, THEME.badge.colors.BLUE);
  const baseClass = THEME.badge.base;

  return `${indent(ctx.depth)}<span className="${baseClass} ${colorClass}">
${indent(ctx.depth + 1)}${label}
${indent(ctx.depth)}</span>`;
};

const generateAlert = (props: any, ctx: GenContext): string => {
  const { title, description, variant = 'INFO' } = props;
  const variantClass = getThemeProp(THEME.alert.variants, variant, THEME.alert.variants.INFO);
  const baseClass = THEME.alert.base;

  const iconMap: Record<string, string> = {
    INFO: 'Info',
    SUCCESS: 'CheckCircle2',
    WARNING: 'AlertTriangle',
    ERROR: 'XCircle',
  };
  const iconName = iconMap[variant] || 'Info';
  addImport(ctx, 'lucide-react', iconName);

  return `${indent(ctx.depth)}<div className="${baseClass} ${variantClass}">
${indent(ctx.depth + 1)}<div className="mt-0.5 p-1 bg-white/5 rounded-full">
${indent(ctx.depth + 2)}<${iconName} className="w-4 h-4 flex-shrink-0" />
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth + 1)}<div>
${indent(ctx.depth + 2)}<h5 className="font-semibold text-sm mb-1">${title}</h5>
${indent(ctx.depth + 2)}<p className="text-xs opacity-80 leading-relaxed">${description}</p>
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth)}</div>`;
};

const generateProgress = (props: any, ctx: GenContext): string => {
  const { label, value = 0, color = 'BLUE' } = props;
  const colorClass = getThemeProp(THEME.progress.colors, color, THEME.progress.colors.BLUE);

  return `${indent(ctx.depth)}<div className="w-full space-y-3">
${indent(ctx.depth + 1)}<div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
${indent(ctx.depth + 2)}<span>${label}</span>
${indent(ctx.depth + 2)}<span>${value}%</span>
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth + 1)}<div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
${indent(ctx.depth + 2)}<div 
${indent(ctx.depth + 3)}className="h-full ${colorClass} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]" 
${indent(ctx.depth + 3)}style={{ width: '${value}%' }} 
${indent(ctx.depth + 2)}/>
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth)}</div>`;
};

const generateStat = (props: any, ctx: GenContext): string => {
  const { label, value, trend, trendDirection } = props;
  
  const isUp = trendDirection === 'UP';
  const isDown = trendDirection === 'DOWN';
  let Icon = 'Minus';
  if (isUp) Icon = 'TrendingUp';
  if (isDown) Icon = 'TrendingDown';
  addImport(ctx, 'lucide-react', Icon);

  const trendColor = isUp ? THEME.stat.trend.UP : isDown ? THEME.stat.trend.DOWN : THEME.stat.trend.NEUTRAL;

  return `${indent(ctx.depth)}<div className="${THEME.stat.base}">
${indent(ctx.depth + 1)}<div className="${THEME.stat.decorator}">
${indent(ctx.depth + 2)}<div className="${THEME.stat.decoratorBlur}" />
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth + 1)}<div className="flex justify-between items-start mb-4 relative z-10">
${indent(ctx.depth + 2)}<span className="${THEME.stat.label}">${label}</span>
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth + 1)}<div className="flex items-baseline gap-3 relative z-10">
${indent(ctx.depth + 2)}<div className="${THEME.stat.value}">${value}</div>
${trend ? `${indent(ctx.depth + 2)}<span className="${THEME.stat.trend.base} ${trendColor}">
${indent(ctx.depth + 3)}<${Icon} className="w-3 h-3 mr-1" />
${indent(ctx.depth + 3)}${trend}
${indent(ctx.depth + 2)}</span>` : ''}
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth)}</div>`;
};

const generateAvatar = (props: any, ctx: GenContext): string => {
  const { initials, src, status } = props;
  const statusColor = status ? getThemeProp(THEME.avatar.status, status, THEME.avatar.status.OFFLINE) : '';

  return `${indent(ctx.depth)}<div className="relative inline-block group">
${indent(ctx.depth + 1)}<div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border border-zinc-700 ring-2 ring-transparent group-hover:ring-white/10 transition-all">
${src 
  ? `${indent(ctx.depth + 2)}<img src="${src}" alt="Avatar" className="w-full h-full object-cover" />` 
  : `${indent(ctx.depth + 2)}<span className="font-bold text-xs text-slate-400 group-hover:text-white">${initials}</span>`
}
${indent(ctx.depth + 1)}</div>
${status ? `${indent(ctx.depth + 1)}<div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${statusColor}" />` : ''}
${indent(ctx.depth)}</div>`;
};

const generateHero = (props: any, ctx: GenContext): string => {
  const { title, subtitle, gradient = 'BLUE_PURPLE', align = 'CENTER', children } = props;
  const gradientClass = getThemeProp(THEME.hero.gradients, gradient, THEME.hero.gradients.BLUE_PURPLE);
  const alignClass = align === 'LEFT' ? 'text-left items-start' : 'text-center items-center';
  const baseClass = THEME.hero.base;

  return `${indent(ctx.depth)}<div className="${baseClass} ${alignClass} gap-8">
${indent(ctx.depth + 1)}<div className="absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-40 blur-3xl" />
${indent(ctx.depth + 1)}<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
${indent(ctx.depth + 1)}<div className="relative z-10 flex flex-col gap-6 max-w-4xl">
${indent(ctx.depth + 2)}<h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-sm">${title}</h1>
${indent(ctx.depth + 2)}<p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl font-light">${subtitle}</p>
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth + 1)}<div className="relative z-10 mt-6 flex gap-4">
${generateChildren(children, ctx)}
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth)}</div>`;
};

const generateImage = (props: any, ctx: GenContext): string => {
  const { src, alt, caption, aspectRatio = 'VIDEO' } = props;
  const ratioClass = getThemeProp(THEME.image.ratios, aspectRatio, THEME.image.ratios.VIDEO);

  return `${indent(ctx.depth)}<figure className="w-full flex flex-col gap-3 group">
${indent(ctx.depth + 1)}<div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 ${ratioClass} relative">
${indent(ctx.depth + 2)}<img 
${indent(ctx.depth + 3)}src="${src || 'https://via.placeholder.com/800x400'}" 
${indent(ctx.depth + 3)}alt="${alt || 'Generated'}" 
${indent(ctx.depth + 3)}className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
${indent(ctx.depth + 2)}/>
${indent(ctx.depth + 2)}<div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
${indent(ctx.depth + 1)}</div>
${caption ? `${indent(ctx.depth + 1)}<figcaption className="text-xs text-center text-slate-500 font-medium tracking-wide">${caption}</figcaption>` : ''}
${indent(ctx.depth)}</figure>`;
};

const generateInput = (props: any, ctx: GenContext): string => {
  const { label, placeholder, inputType = 'text' } = props;
  return `${indent(ctx.depth)}<div className="${THEME.input.base}">
${indent(ctx.depth + 1)}<label className="${THEME.input.label}">${label}</label>
${indent(ctx.depth + 1)}<input 
${indent(ctx.depth + 2)}type="${inputType}"
${indent(ctx.depth + 2)}className="${THEME.input.field}"
${indent(ctx.depth + 2)}placeholder="${placeholder}"
${indent(ctx.depth + 1)}/>
${indent(ctx.depth)}</div>`;
};

const generateSeparator = (props: any, ctx: GenContext): string => {
  return `${indent(ctx.depth)}<div className="${THEME.separator.base}" />`;
};

// Complex: Recharts
const generateChart = (props: any, ctx: GenContext): string => {
  const { type = 'BAR', data, title, color = "#6366f1" } = props;
  
  addImport(ctx, 'recharts', 'ResponsiveContainer');
  addImport(ctx, 'recharts', 'CartesianGrid');
  addImport(ctx, 'recharts', 'XAxis');
  addImport(ctx, 'recharts', 'YAxis');
  addImport(ctx, 'recharts', 'Tooltip');

  let ChartComponent = 'BarChart';
  let DataComponent = 'Bar';
  
  if (type === 'LINE') {
    ChartComponent = 'LineChart';
    DataComponent = 'Line';
  } else if (type === 'AREA') {
    ChartComponent = 'AreaChart';
    DataComponent = 'Area';
  }

  addImport(ctx, 'recharts', ChartComponent);
  addImport(ctx, 'recharts', DataComponent);

  const dataStr = JSON.stringify(data);

  return `${indent(ctx.depth)}<div className="w-full h-72 flex flex-col bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl">
${title ? `${indent(ctx.depth + 1)}<h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">${title}</h4>` : ''}
${indent(ctx.depth + 1)}<div className="flex-1 w-full min-h-0">
${indent(ctx.depth + 2)}<ResponsiveContainer width="100%" height="100%">
${indent(ctx.depth + 3)}<${ChartComponent} data={${dataStr}}>
${indent(ctx.depth + 4)}<CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
${indent(ctx.depth + 4)}<XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
${indent(ctx.depth + 4)}<YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
${indent(ctx.depth + 4)}<Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} itemStyle={{ color: '#f8fafc' }} />
${indent(ctx.depth + 4)}<${DataComponent} type="monotone" dataKey="value" stroke="${color}" fill="${color}" strokeWidth={2} />
${indent(ctx.depth + 3)}</${ChartComponent}>
${indent(ctx.depth + 2)}</ResponsiveContainer>
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth)}</div>`;
};

const generateMap = (props: any, ctx: GenContext): string => {
  const { label, style = 'DARK', markers = [] } = props;
  const theme = getThemeProp(THEME.map.styles, style, THEME.map.styles.DARK);
  addImport(ctx, 'lucide-react', 'Map');

  return `${indent(ctx.depth)}<div className="w-full h-72 rounded-xl overflow-hidden relative border border-zinc-700 group shadow-2xl">
${indent(ctx.depth + 1)}<div className="absolute inset-0 w-full h-full" style={{ backgroundColor: '${theme.bg}' }}>
${indent(ctx.depth + 2)}<div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth + 1)}<div className="absolute top-4 left-4 bg-zinc-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-700 shadow-xl flex items-center gap-2">
${indent(ctx.depth + 2)}<Map className="w-4 h-4 text-indigo-400" />
${indent(ctx.depth + 2)}<span className="text-xs font-bold text-slate-200">${label || 'View'}</span>
${indent(ctx.depth + 1)}</div>
${markers.map((m: any, i: number) => {
    const top = 20 + ((i * 37) % 60);
    const left = 20 + ((i * 53) % 60);
    return `${indent(ctx.depth + 1)}<div className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker cursor-pointer" style={{ top: '${top}%', left: '${left}%' }}>
${indent(ctx.depth + 2)}<div className="relative flex flex-col items-center">
${indent(ctx.depth + 3)}<div className="w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-500/30 animate-pulse" />
${indent(ctx.depth + 3)}<div className="absolute -top-8 opacity-0 group-hover/marker:opacity-100 transition-all bg-zinc-900 text-[10px] px-2 py-1 rounded border border-zinc-700 whitespace-nowrap z-20 shadow-xl font-bold">
${indent(ctx.depth + 4)}${m.title}
${indent(ctx.depth + 3)}</div>
${indent(ctx.depth + 2)}</div>
${indent(ctx.depth + 1)}</div>`;
  }).join('\n')}
${indent(ctx.depth)}</div>`;
};

const generateTable = (props: any, ctx: GenContext): string => {
  const { headers, rows } = props;
  
  const headerJSX = headers?.map((h: string) => 
    `${indent(ctx.depth + 4)}<th className="${THEME.table.header} px-6 py-4">${h}</th>`
  ).join('\n') || '';

  const rowsJSX = rows?.map((row: any[]) => 
    `${indent(ctx.depth + 4)}<tr className="${THEME.table.row}">\n` +
    row.map((cell: any) => {
        if(typeof cell === 'object') {
             // Recursive cell rendering
             return `${indent(ctx.depth + 5)}<td className="px-6 py-4">\n${generateNode(cell, { ...ctx, depth: ctx.depth + 6 })}\n${indent(ctx.depth + 5)}</td>`;
        }
        return `${indent(ctx.depth + 5)}<td className="${THEME.table.cell}">${cell}</td>`;
    }).join('\n') +
    `\n${indent(ctx.depth + 4)}</tr>`
  ).join('\n') || '';

  return `${indent(ctx.depth)}<div className="${THEME.table.base}">
${indent(ctx.depth + 1)}<div className="overflow-x-auto">
${indent(ctx.depth + 2)}<table className="w-full text-sm text-left">
${indent(ctx.depth + 3)}<thead className="${THEME.table.header}">
${indent(ctx.depth + 4)}<tr>
${headerJSX}
${indent(ctx.depth + 4)}</tr>
${indent(ctx.depth + 3)}</thead>
${indent(ctx.depth + 3)}<tbody>
${rowsJSX}
${indent(ctx.depth + 3)}</tbody>
${indent(ctx.depth + 2)}</table>
${indent(ctx.depth + 1)}</div>
${indent(ctx.depth)}</div>`;
};

const generateAccordion = (props: any, ctx: GenContext): string => {
  const { items, variant = 'DEFAULT' } = props;
  const containerClass = getThemeProp(THEME.accordion.container, variant, THEME.accordion.container.DEFAULT);
  const itemClass = getThemeProp(THEME.accordion.item, variant, THEME.accordion.item.DEFAULT);
  
  addImport(ctx, 'lucide-react', 'ChevronDown');

  return `${indent(ctx.depth)}<div className="w-full ${containerClass}">
${items.map((item: any) => 
`${indent(ctx.depth + 1)}<details className="${itemClass} group">
${indent(ctx.depth + 2)}<summary className="w-full flex items-center justify-between px-6 py-4 cursor-pointer list-none hover:bg-white/5 transition-colors focus:outline-none">
${indent(ctx.depth + 3)}<span className="font-medium text-sm text-slate-200 group-open:text-indigo-400 transition-colors">${item.title}</span>
${indent(ctx.depth + 3)}<ChevronDown className="w-4 h-4 text-slate-500 transition-transform duration-300 group-open:rotate-180" />
${indent(ctx.depth + 2)}</summary>
${indent(ctx.depth + 2)}<div className="px-6 pb-6 pt-2 border-t border-zinc-800/50 text-slate-400">
${generateChildren(item.content, { ...ctx, depth: ctx.depth + 3 })}
${indent(ctx.depth + 2)}</div>
${indent(ctx.depth + 1)}</details>`
).join('\n')}
${indent(ctx.depth)}</div>`;
};

/* -------------------------------------------------------------------------- */
/*                                MAIN TRAVERSAL                              */
/* -------------------------------------------------------------------------- */

const generateNode = (node: UINode, ctx: GenContext): string => {
  if (!node || typeof node !== 'object') return '';
  const key = Object.keys(node)[0];
  if (!key) return '';

  const props = node[key];

  switch (key) {
    case 'container': return generateContainer(props, ctx);
    case 'text': return generateText(props, ctx);
    case 'button': return generateButton(props, ctx);
    case 'card': return generateCard(props, ctx);
    case 'badge': return generateBadge(props, ctx);
    case 'alert': return generateAlert(props, ctx);
    case 'progress': return generateProgress(props, ctx);
    case 'stat': return generateStat(props, ctx);
    case 'avatar': return generateAvatar(props, ctx);
    case 'hero': return generateHero(props, ctx);
    case 'image': return generateImage(props, ctx);
    case 'input': return generateInput(props, ctx);
    case 'separator': return generateSeparator(props, ctx);
    case 'chart': return generateChart(props, ctx);
    case 'map': return generateMap(props, ctx);
    case 'table': return generateTable(props, ctx);
    case 'accordion': return generateAccordion(props, ctx);
    default: return `${indent(ctx.depth)}{/* Unknown component: ${key} */}`;
  }
};

/* -------------------------------------------------------------------------- */
/*                                EXPORT FUNCTION                             */
/* -------------------------------------------------------------------------- */

export const generateReactCode = (rootNode: UINode): string => {
  if (!rootNode) return '';

  const importsCtx: GenContext = {
    imports: new Set(),
    depth: 2
  };

  addImport(importsCtx, 'react', 'React');

  const jsxBody = generateNode(rootNode, importsCtx);

  const importGroups: Record<string, Set<string>> = {};
  importsCtx.imports.forEach(imp => {
    const [lib, item] = imp.split(':');
    if (!importGroups[lib]) importGroups[lib] = new Set();
    importGroups[lib].add(item);
  });

  let importStatements = '';
  if (importGroups['react']) {
    importStatements += `import React from 'react';\n`;
    delete importGroups['react'];
  }
  
  Object.entries(importGroups).forEach(([lib, items]) => {
    importStatements += `import { ${Array.from(items).join(', ')} } from '${lib}';\n`;
  });

  return `/**
 * Generated by GenUI Architect
 * Tailwind CSS + React (Zero Runtime Dependencies)
 */

${importStatements}
export default function GeneratedComponent() {
  return (
${jsxBody}
  );
}`;
};
