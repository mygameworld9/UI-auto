import React from 'react';
import * as Lucide from 'lucide-react';
import { RenderChildren } from './utils';

export const Accordion = ({ items, variant = 'DEFAULT', onAction }: any) => {
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
