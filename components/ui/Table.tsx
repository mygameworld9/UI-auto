
import React from 'react';
import DynamicRenderer from '../DynamicRenderer';
import { THEME } from './theme';

export const Table = ({ headers, rows, onAction, path }: any) => {
  return (
    <div className={THEME.table.base}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className={THEME.table.header}>
            <tr>
              {headers?.map((h: string, i: number) => (
                <th key={i} className="px-6 py-4 font-semibold tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows?.map((row: any[], i: number) => (
              <tr key={i} className={THEME.table.row}>
                {row.map((cell: any, j: number) => {
                   // row path: path.rows.i
                   // cell path: path.rows.i.j
                   const cellPath = path ? `${path}.rows.${i}.${j}` : undefined;
                   return (
                    <td key={j} className={THEME.table.cell}>
                      {typeof cell === 'string' || typeof cell === 'number' ? cell : (
                          <div className="scale-90 origin-left">
                            <DynamicRenderer node={cell} onAction={onAction} path={cellPath} />
                          </div>
                      )}
                    </td>
                   );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
