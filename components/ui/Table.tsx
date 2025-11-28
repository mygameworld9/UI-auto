
import React from 'react';
import DynamicRenderer from '../DynamicRenderer';
import { useTheme } from '../ThemeContext';

export const Table = ({ headers, rows, onAction, path }: any) => {
  const { theme } = useTheme();
  return (
    <div className={theme.table.base}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className={theme.table.header}>
            <tr>
              {headers?.map((h: string, i: number) => (
                <th key={i} className="px-6 py-4 font-semibold tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows?.map((row: any[], i: number) => (
              <tr key={i} className={theme.table.row}>
                {row.map((cell: any, j: number) => {
                   const cellPath = path ? `${path}.rows.${i}.${j}` : undefined;
                   return (
                    <td key={j} className={theme.table.cell}>
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
