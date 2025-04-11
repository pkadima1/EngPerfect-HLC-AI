/**
 * File: ChangePasswordModal.jsx
 * Version: 1.0.0
 * Purpose: Modal for changing user password.
 * Validates current password and ensures new password meets requirements.
 */

import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await onSubmit({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle specific errors
      if (error.code === 'auth/wrong-password') {
        setErrors({
          currentPassword: 'Current password is incorrect'
        });
      } else {
        setErrors({
          form: error.message || 'An error occurred. Please try again.'
        });
      }
    } finally {
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Change Password
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form-level error */}
            {errors.form && (
              <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded">
                {errors.form}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label 
                  htmlFor="currentPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Current Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.currentPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.currentPassword}
                  </p>
                )}
              </div>
              
              {/* New Password */}
              <div>
                <label 
                  htmlFor="newPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.newPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.newPassword}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              {/* Confirm Password */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Confirm New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              
              {/* Actions */}
              <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}