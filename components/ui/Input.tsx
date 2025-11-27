import React from 'react';

export const Input = ({ label, placeholder, inputType = 'text' }: any) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors group-focus-within:text-indigo-400">{label}</label>
      <input 
        type={inputType}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-zinc-600"
        placeholder={placeholder}
      />
    </div>
  );
};
