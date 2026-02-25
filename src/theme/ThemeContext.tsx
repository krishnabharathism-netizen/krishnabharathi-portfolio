// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { COLORS, ThemeMode, Theme } from './theme';

interface ThemeContextType {
  mode: ThemeMode;
  colors: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark', // Changed from 'dark' to 'light'
  colors: COLORS.dark, // Changed from COLORS.dark to COLORS.light
  toggleTheme: () => {},
  isDark: false, // Changed from true to false
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark'); // Changed from 'light' to 'dark'

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colors: COLORS[mode],
        toggleTheme,
        isDark: mode === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
