
import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_THEME, ThemeType } from './ui/theme';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: Partial<ThemeType>) => void;
  resetTheme: () => void;
  isGenerating: boolean;
  setIsGenerating: (is: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  resetTheme: () => {},
  isGenerating: false,
  setIsGenerating: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setInternalTheme] = useState<ThemeType>(DEFAULT_THEME);
  const [isGenerating, setIsGenerating] = useState(false);

  const setTheme = (newTheme: Partial<ThemeType>) => {
    // Deep merge or simple spread depending on needs. 
    // For now, assume the agent generates a compatible structure we can spread.
    // In production, use deepmerge.
    setInternalTheme(prev => ({ ...prev, ...newTheme }));
  };

  const resetTheme = () => {
    setInternalTheme(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme, isGenerating, setIsGenerating }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
