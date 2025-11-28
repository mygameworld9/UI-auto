
import React from 'react';
import * as Lucide from 'lucide-react';
import { RenderChildren } from './utils';
import { THEME } from './theme';

export const Accordion = ({ items, variant = 'DEFAULT', onAction, path }: any) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!items || !Array.isArray(items)) return null;

  const containerClass = THEME.accordion.container[variant as keyof typeof THEME.accordion.container] || THEME.accordion.container.DEFAULT;
  const itemClass = THEME.accordion.item[variant as keyof typeof THEME.accordion.item] || THEME.accordion.item.DEFAULT;

  return (
    <div className={`w-full ${containerClass}`}>
      {items.map((item: any, i: number) => {
        const isOpen = openIndex === i;
        const content = Array.isArray(item.content) ? item.content : [];
        // The items array is at `path.items`
        // Item i is at `path.items.i`
        // Content is at `path.items.i.content` - but RenderChildren expects UINode[] path?
        // Wait, items is array of objects, not UINodes. item.content is UINode[].
        // So path to content array is `path.items.${i}.content`.
        const contentPath = path ? `${path}.items.${i}.content` : undefined;
        
        return (
          <div key={i} className={itemClass}>
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
