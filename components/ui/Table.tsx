import React from 'react';
import DynamicRenderer from '../DynamicRenderer';

export const Table = ({ headers, rows, onAction }: any) => {
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
