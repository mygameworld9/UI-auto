export const DEFAULT_THEME = {
  // --------------------------------------------------------------------------
  // TYPOGRAPHY
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // BUTTONS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // BADGES
  // --------------------------------------------------------------------------
  badge: {
    base: "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border",
    colors: {
      BLUE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      GREEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      RED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      GRAY: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    }
  },

  // --------------------------------------------------------------------------
  // CONTAINER
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // CARDS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // STATS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // INPUTS
  // --------------------------------------------------------------------------
  input: {
     base: "flex flex-col gap-2 w-full group",
     label: "text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors group-focus-within:text-indigo-400",
     field: "w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-zinc-600"
  },

  // --------------------------------------------------------------------------
  // TABLES
  // --------------------------------------------------------------------------
  table: {
    base: "w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50",
    header: "text-xs uppercase bg-zinc-950/50 text-slate-400 border-b border-zinc-800",
    row: "hover:bg-white/5 transition-colors border-b border-zinc-800/50 last:border-0",
    cell: "px-6 py-4 whitespace-nowrap text-slate-300"
  },

  // --------------------------------------------------------------------------
  // SEPARATOR
  // --------------------------------------------------------------------------
  separator: {
    base: "h-px bg-zinc-800 my-8 w-full"
  },

  // --------------------------------------------------------------------------
  // HERO
  // --------------------------------------------------------------------------
  hero: {
    base: "relative w-full overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/5 p-12 md:p-24 flex flex-col",
    gradients: {
      BLUE_PURPLE: 'from-blue-600/30 via-indigo-500/30 to-purple-600/30',
      ORANGE_RED: 'from-orange-500/30 via-red-500/30 to-pink-500/30',
      GREEN_TEAL: 'from-emerald-500/30 via-teal-500/30 to-cyan-500/30',
    }
  },

  // --------------------------------------------------------------------------
  // PROGRESS
  // --------------------------------------------------------------------------
  progress: {
    colors: {
      BLUE: 'bg-indigo-500',
      GREEN: 'bg-emerald-500',
      ORANGE: 'bg-orange-500',
      RED: 'bg-rose-500'
    }
  },

  // --------------------------------------------------------------------------
  // ALERTS
  // --------------------------------------------------------------------------
  alert: {
    base: "p-4 rounded-xl border flex gap-4 items-start",
    variants: {
      INFO: 'bg-blue-900/10 border-blue-500/20 text-blue-300',
      SUCCESS: 'bg-emerald-900/10 border-emerald-500/20 text-emerald-300',
      WARNING: 'bg-orange-900/10 border-orange-500/20 text-orange-300',
      ERROR: 'bg-red-900/10 border-red-500/20 text-red-300',
    }
  },

  // --------------------------------------------------------------------------
  // AVATARS
  // --------------------------------------------------------------------------
  avatar: {
    status: {
      ONLINE: 'bg-emerald-500',
      OFFLINE: 'bg-slate-500',
      BUSY: 'bg-red-500'
    }
  },

  // --------------------------------------------------------------------------
  // IMAGES
  // --------------------------------------------------------------------------
  image: {
    ratios: {
      VIDEO: 'aspect-video',
      SQUARE: 'aspect-square',
      WIDE: 'aspect-[21/9]',
      PORTRAIT: 'aspect-[3/4]'
    }
  },

  // --------------------------------------------------------------------------
  // MAPS
  // --------------------------------------------------------------------------
  map: {
    styles: {
      DARK: { bg: '#18181b', grid: '#27272a' },
      LIGHT: { bg: '#cbd5e1', grid: '#94a3b8' },
      SATELLITE: { bg: '#020617', grid: '#1e293b' }
    }
  },

  // --------------------------------------------------------------------------
  // ACCORDION
  // --------------------------------------------------------------------------
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