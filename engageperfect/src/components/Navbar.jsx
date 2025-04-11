/**
 * File: Navbar.jsx
 * Version: 1.1.0
 * Purpose: Global navigation component for the EngagePerfect application.
 * Features responsive design, logo, theme toggle, and authentication buttons.
 * Shows sign in/sign up for non-authenticated users and user menu for authenticated users.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Settings, LogIn } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Determine which nav links to show based on authentication status
  const renderNavLinks = () => {
    if (user) {
      // Show authenticated user links
      return (
        <>
          <Link 
            to="/dashboard" 
            className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Dashboard
          </Link>
          <Link 
            to="/new-caption" 
            className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            New Caption
          </Link>
          <Link 
            to="/new-blog" 
            className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            New Blog
          </Link>
        </>
      );
    }
    
    // Default return empty for unauthenticated users - no specific nav links
    return null;
  };

  // Determine what to show on the right side of navbar based on authentication
  const renderAuthSection = () => {
    if (user) {
      // Show user profile menu for authenticated users
      return (
        <div className="ml-3 relative">
          <button
            type="button"
            className="flex text-sm bg-gray-200 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            id="user-menu"
            aria-expanded="false"
            aria-haspopup="true"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200">
              {user?.photoURL ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                />
              ) : (
                <User size={16} />
              )}
            </div>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                <p className="font-medium">{user?.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User size={16} className="mr-2" />
                Your Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      );
    } else {
      // Show sign in/sign up buttons for unauthenticated users
      return (
        <div className="flex items-center space-x-2">
          <Link
            to="/login"
            state={{ from: location }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-300 dark:border-gray-600 rounded-md"
          >
            <span className="flex items-center">
              <LogIn size={16} className="mr-1" />
              Sign in
            </span>
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
          >
            Sign up
          </Link>
        </div>
      );
    }
  };

  // Render mobile menu content based on authentication status
  const renderMobileMenu = () => {
    if (user) {
      // Authenticated user mobile menu
      return (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/new-caption"
              className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              New Caption
            </Link>
            <Link
              to="/new-blog"
              className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              New Blog
            </Link>
          </div>
          
          {/* Mobile user options */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                {user?.photoURL ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">{user?.displayName || 'User'}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Your Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-4 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // Unauthenticated user mobile menu
      return (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/login"
              state={{ from: location }}
              className="flex items-center px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <LogIn size={16} className="mr-2" />
              Sign in
            </Link>
            <Link
              to="/signup"
              className="block px-4 py-2 text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign up
            </Link>
          </div>
        </div>
      );
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {renderNavLinks()}
            
            {/* Theme Toggle */}
            <div className="ml-2">
              <ThemeToggle />
            </div>
            
            {/* Auth Section (Profile dropdown or Sign in/up buttons) */}
            {renderAuthSection()}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && renderMobileMenu()}
    </nav>
  );
}