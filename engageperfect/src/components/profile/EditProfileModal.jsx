/**
 * File: EditProfileModal.jsx
 * Version: 1.0.0
 * Purpose: Modal for editing user profile information.
 * Allows updating display name, email, and user preferences.
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditProfileModal({ profile, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    preferences: {
      defaultPlatform: '',
      defaultTone: '',
      defaultNiche: '',
      defaultGoal: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        email: profile.email || '',
        preferences: {
          defaultPlatform: profile.preferences?.defaultPlatform || '',
          defaultTone: profile.preferences?.defaultTone || '',
          defaultNiche: profile.preferences?.defaultNiche || '',
          defaultGoal: profile.preferences?.defaultGoal || ''
        }
      });
    }
  }, [profile]);

  // Validate form input
  const validateForm = () => {
    const newErrors = {};
    
    // Validate display name
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Set form-level error for server-side validation failures
      if (error.code === 'auth/requires-recent-login') {
        setErrors({ 
          form: 'For security, please log out and log back in to change your email.' 
        });
      } else if (error.code === 'auth/email-already-in-use') {
        setErrors({
          email: 'This email is already in use by another account.'
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested preferences
    if (name.startsWith('preferences.')) {
      const preferenceField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [preferenceField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
                Edit Profile
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
            
            {/* Edit profile form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label 
                    htmlFor="displayName" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    id="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.displayName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.displayName}
                    </p>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
                
                {/* Preferences Section */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Default Content Preferences
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Default Platform */}
                    <div>
                      <label 
                        htmlFor="defaultPlatform" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Default Platform
                      </label>
                      <select
                        name="preferences.defaultPlatform"
                        id="defaultPlatform"
                        value={formData.preferences.defaultPlatform}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        <option value="">Select Platform</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter</option>
                        <option value="facebook">Facebook</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="tiktok">TikTok</option>
                      </select>
                    </div>
                    
                    {/* Default Tone */}
                    <div>
                      <label 
                        htmlFor="defaultTone" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Default Tone
                      </label>
                      <select
                        name="preferences.defaultTone"
                        id="defaultTone"
                        value={formData.preferences.defaultTone}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        <option value="">Select Tone</option>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="humorous">Humorous</option>
                        <option value="inspirational">Inspirational</option>
                        <option value="educational">Educational</option>
                      </select>
                    </div>
                    
                    {/* Default Niche */}
                    <div>
                      <label 
                        htmlFor="defaultNiche" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Default Niche
                      </label>
                      <select
                        name="preferences.defaultNiche"
                        id="defaultNiche"
                        value={formData.preferences.defaultNiche}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        <option value="">Select Niche</option>
                        <option value="technology">Technology</option>
                        <option value="business">Business</option>
                        <option value="health">Health & Fitness</option>
                        <option value="fashion">Fashion</option>
                        <option value="food">Food</option>
                        <option value="travel">Travel</option>
                        <option value="education">Education</option>
                      </select>
                    </div>
                    
                    {/* Default Goal */}
                    <div>
                      <label 
                        htmlFor="defaultGoal" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Default Goal
                      </label>
                      <select
                        name="preferences.defaultGoal"
                        id="defaultGoal"
                        value={formData.preferences.defaultGoal}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        <option value="">Select Goal</option>
                        <option value="engagement">Boost Engagement</option>
                        <option value="awareness">Build Awareness</option>
                        <option value="followers">Grow Followers</option>
                        <option value="sales">Drive Sales</option>
                        <option value="traffic">Generate Traffic</option>
                        <option value="leads">Generate Leads</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form actions */}
              <div className="mt-8 flex justify-end space-x-3">
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
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}