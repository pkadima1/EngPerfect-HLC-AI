/**
 * File: Login.jsx
 * Version: 1.0.0
 * Purpose: Login page component for EngagePerfect.
 * Features email/password login, Google auth, and forgot password functionality.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from "../components/Logo"; // Fixed import path
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Hooks
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  /**
   * Handle email/password login form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Clear previous errors
    setError('');
    setLoading(true);
    
    try {
      // Attempt to login
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      // Handle specific error codes with friendly messages
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later');
          break;
        default:
          setError(err.message || 'Failed to log in');
      }
      setLoading(false);
    }
  };

  /**
   * Handle Google sign-in
   */
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError('Google sign-in failed. Please try again');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <div style={{ transform: 'scale(2.5)' }}>
                <Logo showText={false} className="h-20 w-auto" />
              </div>
            </div>
          
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Don't have an account? <Link to="/signup" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">Create an account</Link>
            </p>
          </div>
          
          
          {/* Error display */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md border dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md border dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  Forgot your password?
                </Link>
              </div>
            </div>
            
            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          
          {/* Social Login Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>
            
            {/* Google Sign-in button */}
            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" fill="#4285F4" />
                  </g>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Welcome Message */}
      <div className="hidden md:flex md:w-1/2 bg-primary-700 justify-center items-center p-8 min-h-screen fixed right-0">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-4">Welcome Back!</h2>
          <p className="text-lg text-white/90 mb-6">
            Sign in to continue creating engaging content for your social media platforms
          </p>
          <ul className="space-y-3">
            <li className="flex items-center text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Access your drafts and previous content
            </li>
            <li className="flex items-center text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Continue where you left off
            </li>
            <li className="flex items-center text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Track your engagement metrics
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}