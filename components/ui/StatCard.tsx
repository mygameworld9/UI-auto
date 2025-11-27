import React from 'react';
import * as Lucide from 'lucide-react';

export const StatCard = ({ label, value, trend, trendDirection }: any) => {
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
