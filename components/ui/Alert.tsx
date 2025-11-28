
import React from 'react';
import * as Lucide from 'lucide-react';
import { useTheme } from '../ThemeContext';

export const Alert = ({ title, description, variant = 'INFO' }: any) => {
  const { theme } = useTheme();
  const styles = theme.alert.variants[variant as keyof typeof theme.alert.variants] || theme.alert.variants.INFO;
  
  const icons: Record<string, any> = {
    INFO: Lucide.Info,
    SUCCESS: Lucide.CheckCircle2,
    WARNING: Lucide.AlertTriangle,
    ERROR: Lucide.XCircle,
  };

  const Icon = icons[variant] || icons.INFO;

  return (
    <div className={`${theme.alert.base} ${styles}`}>
      <div className="mt-0.5 p-1 bg-white/5 rounded-full">
         <Icon className="w-4 h-4 flex-shrink-0" />
      </div>
      <div>
        <h5 className="font-semibold text-sm mb-1">{title}</h5>
        <p className="text-xs opacity-80 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
