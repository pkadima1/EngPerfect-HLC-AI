/**
 * File: DeleteAccountModal.jsx
 * Version: 1.0.0
 * Purpose: Modal for confirming account deletion.
 * Requires password confirmation for security.
 */

import { useState } from 'react';
import { X, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function DeleteAccountModal({ onClose, onDelete }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter your password to confirm deletion');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onDelete(password);
    } catch (err) {
      console.error('Error deleting account:', err);
      
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'Failed to delete account. Please try again.');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Delete Account
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mt-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded">
                {error}
              </div>
            )}
            
            {/* Password confirmation form */}
            <form onSubmit={handleSubmit} className="mt-5">
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Enter your password to confirm
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Your current password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}