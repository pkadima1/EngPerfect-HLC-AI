/**
 * File: Signup.jsx
 * Version: 1.0.0
 * Purpose: Signup page component for EngagePerfect.
 * Features complete user registration form with validation.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from "../components/Logo"; // Fixed import path
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

export default function Signup() {
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Hooks
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  /**
   * Validate the form and return whether it's valid
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validate display name
    if (!displayName) {
      newErrors.displayName = 'Full name is required';
    }
    
    // Validate email
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate terms agreement
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Clear previous errors
    setError('');
    setLoading(true);
    
    try {
      // Create user
      await signup(displayName, email, password);
      navigate('/dashboard');
    } catch (err) {
      // Handle specific error codes with friendly messages
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        default:
          setError(err.message || 'Failed to create account');
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
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed. Please try again');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Signup Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <div style={{ transform: 'scale(2.5)' }}>
                <Logo showText={false} className="h-20 w-auto" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">Sign in</Link>
            </p>
          </div>
          
          {/* Error display */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-md border ${errors.displayName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Your username"
                />
              </div>
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.displayName}</p>
              )}
            </div>
            
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
                  className={`w-full px-4 py-2 rounded-md border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-md border ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-md border ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
            
            {/* Terms of Service */}
            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${errors.terms ? 'border-red-500' : ''} dark:border-gray-600 dark:bg-gray-800`}
              />
              <label htmlFor="agree-terms" className={`ml-2 block text-sm ${errors.terms ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                I agree to the <Link to="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.terms}</p>
            )}
            
            {/* Submit button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating account...' : 'Sign up'}
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
      
      {/* Right Panel - App Info */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 justify-center items-center p-8 min-h-screen fixed right-0">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-4">EngagePerfect AI</h2>
          <p className="text-lg text-white/90 mb-6">
            Create engaging social media content in seconds with our AI-powered platform
          </p>
          <ul className="space-y-3">
            <li className="flex items-center text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Generate captions for any platform
            </li>
            <li className="flex items-center text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Optimize your social media presence
            </li>
            <li className="flex items-center text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Share content directly to your accounts
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}