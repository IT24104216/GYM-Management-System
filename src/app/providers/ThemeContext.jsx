/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import muiTheme from '@/shared/theme/muiTheme';

const ThemeContext = createContext(null);

const THEME_KEY = 'gympro_theme_mode';

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'light';
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  // Merge the mode override into the base muiTheme
  const theme = createTheme({
    ...muiTheme,
    palette: { ...muiTheme.palette, mode },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside <AppThemeProvider>');
  return ctx;
}

export default ThemeContext;
