/**
 * File: ToneStep.jsx
 * Version: 1.1.0
 * Purpose: Fifth step in the caption generator wizard for selecting content tone.
 * 
 * This component:
 * - Allows users to select the tone/style for their caption (Professional, Casual, etc.)
 * - Uses a grid of vibrant colored cards with custom icons for each tone option
 * - Stores the user's selection in the wizard context and Firestore for future use
 * - Supports both dark and light mode with appropriate styling
 * - Follows mobile-first responsive design principles
 * - Matches the visual design in the provided mockups
 * 
 * Used by: CaptionGenerator.jsx
 * Uses: WizardContext.jsx, Firebase Firestore
 */

import { useState, useEffect } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';

// Define tone options with custom styling and improved icons
const TONE_OPTIONS = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Formal and business-like approach',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-5-2v2H9V4h6zM8 8h12v3H4V8h4zm-4 11V13h6v1h8v-1h6l.001 6H4z"></path>
      </svg>
    ),
    bgColor: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Relaxed and friendly tone',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
        <path d="M14.829 9.172a1 1 0 0 0-1.414 0l-1.829 1.829-1.828-1.829a1.001 1.001 0 0 0-1.414 1.414L9.586 12l-1.242 1.243a1 1 0 1 0 1.414 1.414L11.586 13l1.243 1.243a1 1 0 0 0 1.414-1.414L12.414 12l1.415-1.414a1 1 0 0 0 0-1.414z"></path>
      </svg>
    ),
    bgColor: 'bg-cyan-400',
    hoverColor: 'hover:bg-cyan-500'
  },
  {
    id: 'humorous',
    label: 'Humorous',
    description: 'Fun and entertaining style',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
        <path d="M12 18c4 0 5-4 5-4H7s1 4 5 4zm5.5-8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
      </svg>
    ),
    bgColor: 'bg-amber-400',
    hoverColor: 'hover:bg-amber-500'
  },
  {
    id: 'persuasive',
    label: 'Persuasive',
    description: 'Convincing and compelling',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
        <path d="M13 7h-2v6h2V7zm0 8h-2v2h2v-2z"></path>
      </svg>
    ),
    bgColor: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  },
  {
    id: 'inspirational',
    label: 'Inspirational',
    description: 'Motivating and uplifting',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12.1 2.7l3.7 7.6 8.2 1.2-5.9 5.8 1.4 8.2-7.4-3.9-7.4 3.9 1.4-8.2-5.9-5.8 8.2-1.2z"></path>
      </svg>
    ),
    bgColor: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600'
  },
  {
    id: 'educational',
    label: 'Educational',
    description: 'Informative and instructive',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M21 3h-7a2.98 2.98 0 0 0-2 .78A2.98 2.98 0 0 0 10 3H3a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h5.758c.526 0 1.042.214 1.414.586l1.121 1.121c.009.009.021.012.03.021.086.079.182.149.294.196h.002a.996.996 0 0 0 .762 0h.002c.112-.047.208-.117.294-.196.009-.009.021-.012.03-.021l1.121-1.121A2.015 2.015 0 0 1 15.242 20H21a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.758 18H4V5h6c.552 0 1 .449 1 1v12.689A4.032 4.032 0 0 0 8.758 18zM20 18h-4.758c-.799 0-1.584.246-2.242.689V6c0-.551.448-1 1-1h6v13z"></path>
      </svg>
    ),
    bgColor: 'bg-green-500',
    hoverColor: 'hover:bg-green-600'
  }
];

export default function ToneStep() {
  const { formData, updateFormData } = useWizard();
  const [selectedTone, setSelectedTone] = useState('');
  const { user } = useAuth();
  
  // Initialize component with existing data if available
  useEffect(() => {
    if (formData.tone) {
      setSelectedTone(formData.tone);
    }
    
    // Load user's previous tone selection from Firestore if available
    const loadUserPreferences = async () => {
      if (!user) return;
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().preferences?.tone) {
          const savedTone = userDoc.data().preferences.tone;
          // Only set if not already set from formData
          if (!formData.tone) {
            setSelectedTone(savedTone);
            updateFormData({ tone: savedTone });
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, [formData, user, updateFormData]);

  // Handle tone selection
  const handleToneSelect = (toneId) => {
    setSelectedTone(toneId);
    
    // Save to wizard context
    updateFormData({ tone: toneId });
    
    // Save user preference if logged in
    saveUserTonePreference(toneId);
  };
  
  // Save user's tone preference to Firestore
  const saveUserTonePreference = async (toneId) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        'preferences.tone': toneId
      });
    } catch (error) {
      console.error('Error saving tone preference:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Select the tone for your caption
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choose the writing style that best fits your content
      </p>
      
      {/* Tone options grid - matching the layout in Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {TONE_OPTIONS.map((tone) => {
          const isSelected = selectedTone === tone.id;
          
          return (
            <button
              key={tone.id}
              type="button"
              onClick={() => handleToneSelect(tone.id)}
              className={`relative rounded-lg p-6 text-center transition-all border ${
                isSelected ? 'border-white dark:border-white' : 'border-transparent'
              } ${tone.bgColor} text-white`}
            >
              <div className="flex flex-col items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-full mb-3">
                  <span className="text-white">
                    {tone.icon}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-white">
                  {tone.label}
                </h3>
                <p className="text-sm mt-1 text-white text-opacity-90">
                  {tone.description}
                </p>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Help text */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select the tone that best fits your content
        </p>
      </div>
      
      {/* Generate button - visible at all times and more prominent as in Image 1 */}
      <div className="flex justify-center mt-8">
        <button
          type="button"
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            selectedTone 
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 bg-opacity-50 dark:bg-blue-600 dark:bg-opacity-50 text-white cursor-not-allowed'
          }`}
          disabled={!selectedTone}
        >
          Generate
        </button>
      </div>
    </div>
  );
}