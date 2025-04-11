/**
 * File: ThemeProvider.jsx
 * Version: 1.0.1
 * Purpose: Theme context provider for the application.
 * Provides theme control and preferences detection.
 */

import { createContext, useContext, useEffect, useState } from 'react';

// Create a theme context
const ThemeContext = createContext();

// Theme options
const themes = {
  light: 'light',
  dark: 'dark',
  system: 'system'
};

export function ThemeProvider({ children }) {
  // Initialize theme from localStorage or defaults to system
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || themes.system;
  });
  
  // Effect to detect system theme changes
  useEffect(() => {
    // Apply the theme based on preferences or defaults to system
    const applyTheme = () => {
      const root = document.documentElement;
      
      // Remove any existing theme class
      root.classList.remove('dark', 'light');
      
      if (theme === themes.dark) {
        root.classList.add('dark');
      } else if (theme === themes.system) {
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        }
      }
      
      // Save theme preference to localStorage
      localStorage.setItem('theme', theme);
    };
    
    applyTheme();
    
    // Listen for system theme changes when in system mode
    if (theme === themes.system) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Function to handle theme changes based on system preference changes
      const handleChange = (e) => {
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      
      // Add event listener
      mediaQuery.addEventListener('change', handleChange);
      
      // Clean up
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Provide context value with current theme and setter function
  const value = {
    theme,
    setTheme,
    themes,
    isDarkMode: document.documentElement.classList.contains('dark')
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}