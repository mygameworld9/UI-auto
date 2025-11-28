import React from 'react';
import { useTheme } from '../ThemeContext';

export const Typography = ({ content, variant = 'BODY', color = 'DEFAULT', font = 'SANS' }: any) => {
  const { theme } = useTheme();

  const styles = theme.typography.variants;
  const colors = theme.typography.colors;
  const fonts = theme.typography.fonts;

  const currentFontStyle = fonts[font as keyof typeof fonts] ? { fontFamily: fonts[font as keyof typeof fonts] } : {};
  // If font is a class name (e.g. font-sans) use it, if it contains special chars treat as style
  const fontClass = fonts[font as keyof typeof fonts] || fonts.SANS;
  const isClass = !fontClass.includes('"');

  return (
    <div 
      className={`${styles[variant as keyof typeof styles] || styles.BODY} ${colors[color as keyof typeof colors] || colors.DEFAULT} ${isClass ? fontClass : ''}`}
      style={!isClass ? { fontFamily: fontClass.replace('font-', '') } : {}}
    >
      {content}
    </div>
  );
};