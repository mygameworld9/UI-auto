import React from 'react';
import { useTheme } from '../ThemeContext';
import { UIAction } from '../../types';

export const Input = ({ label, placeholder, value, inputType = 'text', onAction, path }: any) => {
  const { theme } = useTheme();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onAction && path) {
        onAction({
            type: 'PATCH_STATE',
            path: path,
            payload: e.target.value
        } as UIAction);
    }
  };

  return (
    <div className={theme.input.base}>
      <label className={theme.input.label}>{label}</label>
      <input 
        type={inputType}
        className={theme.input.field}
        placeholder={placeholder}
        value={value || ''}
        onChange={handleChange}
      />
    </div>
  );
};