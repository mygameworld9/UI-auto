
import React from 'react';
import { useTheme } from '../ThemeContext';

export const Input = ({ label, placeholder, inputType = 'text' }: any) => {
  const { theme } = useTheme();
  return (
    <div className={theme.input.base}>
      <label className={theme.input.label}>{label}</label>
      <input 
        type={inputType}
        className={theme.input.field}
        placeholder={placeholder}
      />
    </div>
  );
};
