
import React from 'react';
import { useTheme } from '../ThemeContext';

export const Separator = () => {
    const { theme } = useTheme();
    return <div className={theme.separator.base} />;
};
