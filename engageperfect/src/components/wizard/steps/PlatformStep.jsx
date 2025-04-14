/**
 * File: PlatformStep.jsx
 * Version: 1.0.0
 * Purpose: Third step in the caption generator wizard for selecting social media platform.
 * 
 * This component:
 * - Allows users to select which social media platform they want to create content for
 * - Displays primary options (LinkedIn, Twitter, Facebook) with direct sharing support
 * - Displays limited sharing options (Instagram, TikTok) with appropriate warnings
 * - Shows a popup for platforms with limited sharing capabilities
 * - Remembers user's previous platform selection
 * - Works in both dark and light modes
 * - Mobile-first responsive design
 * 
 * Used by: CaptionGenerator.jsx
 * Uses: WizardContext.jsx
 */

import { useState, useEffect } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';

// Define platform options with icons and sharing capabilities
const PLATFORM_OPTIONS = [
  // Primary platforms with full sharing capability
  { 
    id: 'linkedin', 
    label: 'LinkedIn', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
      </svg>
    ),
    fullSharing: true,
    primary: true,
    brandColor: 'bg-[#0077B5] hover:bg-[#0066a1]'
  },
  { 
    id: 'twitter', 
    label: 'Twitter', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
      </svg>
    ),
    fullSharing: true,
    primary: true,
    brandColor: 'bg-black hover:bg-gray-800'
  },
  { 
    id: 'facebook', 
    label: 'Facebook', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
      </svg>
    ),
    fullSharing: true,
    primary: true,
    brandColor: 'bg-[#1877F2] hover:bg-[#1670e6]'
  },
  
  // Limited sharing platforms
  { 
    id: 'instagram', 
    label: 'Instagram', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
      </svg>
    ),
    fullSharing: false,
    primary: false,
    brandColor: 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:from-[#E1306C] hover:via-[#C13584] hover:to-[#833AB4]'
  },
  { 
    id: 'tiktok', 
    label: 'TikTok', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"></path>
      </svg>
    ),
    fullSharing: false,
    primary: false,
    brandColor: 'bg-black hover:bg-gray-900'
  }
];

export default function PlatformStep() {
  const { formData, updateFormData } = useWizard();
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupPlatform, setPopupPlatform] = useState(null);
  const { user } = useAuth();

  // Initialize the component with existing data if available
  useEffect(() => {
    if (formData.platform) {
      setSelectedPlatform(formData.platform);
    }
    
    // Load user's previous platform selection from Firestore if available
    const loadUserPreferences = async () => {
      if (!user) return;
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().preferences?.platform) {
          const savedPlatform = userDoc.data().preferences.platform;
          // Only set if not already set from formData
          if (!formData.platform) {
            setSelectedPlatform(savedPlatform);
            updateFormData({ platform: savedPlatform });
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, [formData, user, updateFormData]);

  // Handle platform selection
  const handlePlatformSelect = (platformId) => {
    setSelectedPlatform(platformId);
    
    // Save to wizard context
    updateFormData({ platform: platformId });
    
    // Check if platform has limited sharing
    const platform = PLATFORM_OPTIONS.find(p => p.id === platformId);
    if (platform && !platform.fullSharing) {
      setPopupPlatform(platform);
      setShowPopup(true);
    }
    
    // Save user preference if logged in
    saveUserPlatformPreference(platformId);
  };
  
  // Save user's platform preference to Firestore
  const saveUserPlatformPreference = async (platformId) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        'preferences.platform': platformId
      });
    } catch (error) {
      console.error('Error saving platform preference:', error);
    }
  };
  
  // Close the popup
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Select Social Media Platform
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choose where you want to share your content
      </p>
      
      {/* Primary Platforms (LinkedIn, Twitter, Facebook) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLATFORM_OPTIONS.filter(platform => platform.primary).map((platform) => (
          <button
            key={platform.id}
            type="button"
            onClick={() => handlePlatformSelect(platform.id)}
            className={`flex items-center justify-center p-6 rounded-lg transition-colors ${
              selectedPlatform === platform.id
                ? `${platform.brandColor} text-white`
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="mb-2">{platform.icon}</span>
              <span className="font-medium">{platform.label}</span>
            </div>
          </button>
        ))}
      </div>
      
      {/* Limited Sharing Platforms (Instagram, TikTok) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORM_OPTIONS.filter(platform => !platform.primary).map((platform) => (
          <button
            key={platform.id}
            type="button"
            onClick={() => handlePlatformSelect(platform.id)}
            className={`flex items-center justify-center p-6 rounded-lg transition-colors ${
              selectedPlatform === platform.id
                ? `${platform.brandColor} text-white`
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="mb-2">{platform.icon}</span>
              <span className="font-medium">{platform.label}</span>
              <span className="text-xs mt-1 text-amber-500 dark:text-amber-400">
                Limited sharing
              </span>
            </div>
          </button>
        ))}
      </div>
      
      {/* Platform Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Platform Tips</h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Choose the platform where you want to share your content. The caption generator will optimize your content based on the platform's best practices and character limits.
            </p>
          </div>
        </div>
      </div>
      
      {/* Limited Sharing Popup */}
      {showPopup && popupPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Limited Sharing Capability</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  The selected social media platform {popupPlatform.label} doesn't allow direct sharing. You'll need to share using the browser's sharing features, or download the post to share on your favorite social media platform.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}