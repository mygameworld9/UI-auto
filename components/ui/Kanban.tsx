
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal } from 'lucide-react';

interface KanbanItem {
  id: string;
  content: string;
  tag?: string;
}

interface KanbanColumn {
  title: string;
  color: string;
  items: (string | KanbanItem)[];
}

export const Kanban = ({ columns = [] }: { columns: KanbanColumn[] }) => {
  return (
    <div className="flex w-full overflow-x-auto gap-6 pb-4 snap-x">
      {columns.map((col, colIdx) => {
        const items = col.items || [];
        const borderColor = col.color ? `border-${col.color.toLowerCase()}-500/30` : 'border-zinc-700';
        const badgeColor = col.color ? `bg-${col.color.toLowerCase()}-500/10 text-${col.color.toLowerCase()}-400` : 'bg-zinc-800 text-zinc-400';

        return (
          <div key={colIdx} className="flex-none w-80 flex flex-col gap-4 snap-start">
            {/* Column Header */}
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ring-2 ring-white/10 ${col.color === 'BLUE' ? 'bg-indigo-500' : col.color === 'GREEN' ? 'bg-emerald-500' : col.color === 'ORANGE' ? 'bg-orange-500' : 'bg-zinc-500'}`} />
                  <span className="font-semibold text-sm text-slate-200">{col.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-500 font-mono">{items.length}</span>
               </div>
               <button className="text-zinc-600 hover:text-zinc-400">
                  <Plus className="w-4 h-4" />
               </button>
            </div>

            {/* Column Body */}
            <div className={`flex-1 min-h-[400px] rounded-2xl bg-zinc-900/40 border border-white/5 p-3 flex flex-col gap-3 backdrop-blur-sm`}>
               {items.map((item, itemIdx) => {
                 const content = typeof item === 'string' ? item : item.content;
                 const tag = typeof item === 'object' ? item.tag : null;

                 return (
                    <motion.div 
                        key={itemIdx}
                        layoutId={`card-${colIdx}-${itemIdx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: itemIdx * 0.1 }}
                        className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-600 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                    >
                        <div className="flex justify-between items-start mb-2">
                           {tag ? (
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-800 text-zinc-400`}>{tag}</span>
                           ) : <div />}
                           <button className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-400 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                           </button>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">
                           {content}
                        </p>
                        
                        {/* Fake Avatar Stack for visual polish */}
                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                           <div className="flex -space-x-2">
                              {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, i) => (
                                <div key={i} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 ring-1 ring-white/10" />
                              ))}
                           </div>
                        </div>
                    </motion.div>
                 );
               })}
               
               <button className="w-full py-2 rounded-lg border border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 hover:border-zinc-700 transition-all text-xs font-medium flex items-center justify-center gap-2 mt-2">
                  <Plus className="w-3 h-3" /> Add Task
               </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
