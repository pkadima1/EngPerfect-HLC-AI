/**
 * File: ThemeToggle.jsx
 * Version: 1.1.0
 * Purpose: Dropdown menu for switching between light, dark, and system themes.
 */

import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get the current theme icon
  const getThemeIcon = () => {
    if (theme === themes.light) return <Sun size={18} />;
    if (theme === themes.dark) return <Moon size={18} />;
    return <Monitor size={18} />;
  };

  // Get the current theme label
  const getThemeLabel = () => {
    if (theme === themes.light) return "Light";
    if (theme === themes.dark) return "Dark";
    return "System";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Toggle theme</span>
        {getThemeIcon()}
        <span className="hidden sm:inline text-sm font-medium">{getThemeLabel()}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
          <button
            onClick={() => { setTheme(themes.light); setIsOpen(false); }}
            className={`flex items-center w-full px-4 py-2 text-sm ${theme === themes.light ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <Sun size={16} className="mr-2" />
            Light
          </button>
          
          <button
            onClick={() => { setTheme(themes.dark); setIsOpen(false); }}
            className={`flex items-center w-full px-4 py-2 text-sm ${theme === themes.dark ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <Moon size={16} className="mr-2" />
            Dark
          </button>
          
          <button
            onClick={() => { setTheme(themes.system); setIsOpen(false); }}
            className={`flex items-center w-full px-4 py-2 text-sm ${theme === themes.system ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <Monitor size={16} className="mr-2" />
            System
          </button>
        </div>
      )}
    </div>
  );
}