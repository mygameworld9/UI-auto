
import React from 'react';
import * as Lucide from 'lucide-react';
import { useTheme } from '../ThemeContext';

export const StatCard = ({ label, value, trend, trendDirection }: any) => {
  const { theme } = useTheme();
  const isUp = trendDirection === 'UP';
  const isDown = trendDirection === 'DOWN';
  
  const trendClass = isUp ? theme.stat.trend.UP : isDown ? theme.stat.trend.DOWN : theme.stat.trend.NEUTRAL;

  return (
    <div className={theme.stat.base}>
      <div className={theme.stat.decorator}>
         <div className={theme.stat.decoratorBlur} />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className={theme.stat.label}>{label}</span>
      </div>
      
      <div className="flex items-baseline gap-3 relative z-10">
          <div className={theme.stat.value}>
            {value}
          </div>
          {trend && (
            <span className={`${theme.stat.trend.base} ${trendClass}`}>
                {isUp ? <Lucide.TrendingUp className="w-3 h-3 mr-1" /> : isDown ? <Lucide.TrendingDown className="w-3 h-3 mr-1" /> : <Lucide.Minus className="w-3 h-3 mr-1" />}
                {trend}
            </span>
            )}
      </div>
    </div>
  );
};
