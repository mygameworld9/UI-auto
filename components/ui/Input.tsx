
import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useDebounce } from '../../hooks/useDebounce';

export const Input = ({ label, placeholder, inputType = 'text', value = '', onAction, path }: any) => {
  const { theme } = useTheme();
  
  // Local state for immediate feedback
  const [localValue, setLocalValue] = useState(value);
  
  // Sync local state if prop changes from outside (e.g. LLM regeneration)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    // Dispatch patch action only if value is different and path exists
    if (debouncedValue !== value && path && onAction) {
      onAction({
        type: 'PATCH_STATE',
        path,
        payload: { value: debouncedValue } // Patching the component props
      });
    }
  }, [debouncedValue, onAction, path, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <div className={theme.input.base}>
      <label className={theme.input.label}>{label}</label>
      <input 
        type={inputType}
        className={theme.input.field}
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
      />
    </div>
  );
};
