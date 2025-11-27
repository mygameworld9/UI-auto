import React from 'react';
import * as Lucide from 'lucide-react';

export const Alert = ({ title, description, variant = 'INFO' }: any) => {
  const variants: Record<string, any> = {
    INFO: { style: 'bg-blue-900/10 border-blue-500/20 text-blue-300', icon: Lucide.Info },
    SUCCESS: { style: 'bg-emerald-900/10 border-emerald-500/20 text-emerald-300', icon: Lucide.CheckCircle2 },
    WARNING: { style: 'bg-orange-900/10 border-orange-500/20 text-orange-300', icon: Lucide.AlertTriangle },
    ERROR: { style: 'bg-red-900/10 border-red-500/20 text-red-300', icon: Lucide.XCircle },
  };
  const config = variants[variant] || variants.INFO;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border flex gap-4 items-start ${config.style}`}>
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
