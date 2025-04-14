/**
 * File: GoalStep.jsx
 * Version: 1.0.0
 * Purpose: Fourth step in the caption generator wizard for selecting content goal.
 * 
 * This component:
 * - Provides selection of different content goals (Grow Audience, Drive Sales, etc.)
 * - Uses a grid of colorful cards with icons for each goal option
 * - Stores the user's selection in the wizard context and Firestore for future use
 * - Supports both dark and light mode with appropriate styling
 * - Follows mobile-first responsive design principles
 * 
 * Used by: CaptionGenerator.jsx
 * Uses: WizardContext.jsx, Firebase Firestore
 */

import { useState, useEffect } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';

// Define goal options with icons, colors, and descriptions
const GOAL_OPTIONS = [
  {
    id: 'grow_audience',
    label: 'Grow Audience',
    description: 'Expand your follower base and reach',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M16 6a3 3 0 100-6 3 3 0 000 6zM16 8a5 5 0 00-5 5v6h10v-6a5 5 0 00-5-5zM2 13a2 2 0 012-2h4a2 2 0 012 2v6H2v-6z"></path>
        <path d="M8 0a3 3 0 100 6 3 3 0 000-6z" fillOpacity="0.5"></path>
      </svg>
    ),
    bgColor: 'bg-green-400',
    hoverColor: 'hover:bg-green-500',
    textColor: 'text-green-900'
  },
  {
    id: 'drive_sales',
    label: 'Drive Sales',
    description: 'Convert followers into customers',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M5.5 21c0-.2.14-.32.23-.42.4-.4.77-.76 1.68-1.77C8.5 17.6 10.07 17 12 17c1.93 0 3.5.6 4.6 1.8.9 1.02 1.28 1.39 1.68 1.79.1.1.23.22.23.41H5.5z"></path>
        <path d="M12 3a3 3 0 100 6 3 3 0 000-6zM12 1a5 5 0 110 10 5 5 0 010-10zm11 20v-2a3 3 0 00-3-3h-1a1 1 0 010-2h1a5 5 0 015 5v2h-2zm-2-10a1 1 0 100-2 1 1 0 000 2zm0-4a3 3 0 110 6 3 3 0 010-6zm-18 7a1 1 0 100 2h1a3 3 0 013 3v2h2v-2a5 5 0 00-5-5H3zm0-3a3 3 0 110-6 3 3 0 010 6zm0 2a1 1 0 100-2 1 1 0 000 2z"></path>
      </svg>
    ),
    bgColor: 'bg-blue-400',
    hoverColor: 'hover:bg-blue-500',
    textColor: 'text-blue-900'
  },
  {
    id: 'boost_engagement',
    label: 'Boost Engagement',
    description: 'Increase likes, comments and shares',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12.76 4.43c.3-.38.67-.76 1.12-1.12C15 2.42 17.19 2 19.6 2c1.45 0 2.39 1.47 1.7 2.7-2.02 3.58-5.46 5.3-9.85 5.3h-1.87c-1.12 0-1.36.9-.68 1.74l7.65 5.96c.72.64.86 1.8.3 2.6l-.97 1.5c-.5.78-1.56.98-2.3.35L4.24 15.2c-.97-.77-1.09-2.18-.27-3.1l3.67-4.18c.4-.4.29-1.04-.23-1.24-.74-.27-1.02-1.23-.63-1.97L7.43 3.1c.24-.5.83-.73 1.33-.5.5.24.73.83.5 1.33l-.48 1c-.12.25-.01.55.25.68.25.12.55.01.68-.25l.77-1.77c.23-.64 1-.85 1.48-.42l.8.92c.3.3.23.8-.15 1l-.95.47c-.23.12-.3.42-.15.63z"></path>
      </svg>
    ),
    bgColor: 'bg-orange-400',
    hoverColor: 'hover:bg-orange-500',
    textColor: 'text-orange-900'
  },
  {
    id: 'share_knowledge',
    label: 'Share Knowledge',
    description: 'Educate and provide value',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.806 5 19c0-.101.009-.191.024-.273.112-.576.584-.717.988-.727H21V4a2 2 0 00-2-2zm0 9l-2-1-2 1V4h4v7z"></path>
      </svg>
    ),
    bgColor: 'bg-purple-400',
    hoverColor: 'hover:bg-purple-500',
    textColor: 'text-purple-900'
  },
  {
    id: 'brand_awareness',
    label: 'Brand Awareness',
    description: 'Increase visibility and recognition',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm4-2.5c-.7 0-1.3-.1-1.8-.3-.2-.1-.5-.1-.8-.1-.3 0-.6 0-.8.1-.5.2-1.1.3-1.8.3-2.6 0-3.8-1.6-3.8-1.6 1.3.9 3 .8 3.9.7.1 0 .2 0 .3-.1.7-.1 1.3-.3 2.1-.3s1.4.1 2.1.3c.1 0 .2 0 .3.1.9.1 2.7.2 3.9-.7 0 0-1.1 1.6-3.6 1.6zm.3-5.3c-.9 0-1.6-.7-1.6-1.6 0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6c0 .9-.7 1.6-1.6 1.6zm-8.6 0c-.9 0-1.6-.7-1.6-1.6 0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6c0 .9-.7 1.6-1.6 1.6z"></path>
      </svg>
    ),
    bgColor: 'bg-pink-400',
    hoverColor: 'hover:bg-pink-500',
    textColor: 'text-pink-900'
  },
  {
    id: 'build_community',
    label: 'Build Community',
    description: 'Foster relationships with followers',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5c.2-.38.5-.73.9-1.03.41-.3 1.07-.51 2.1-.51h5c1.03 0 1.69.21 2.1.51.4.3.7.65.9 1.03-1.21.95-2.76 1.5-4.5 1.5-1.74 0-3.29-.55-4.5-1.5zm4.5-3.5h1c3.31 0 6-1.79 6-4v-1H5v1c0 2.21 2.69 4 6 4z"></path>
      </svg>
    ),
    bgColor: 'bg-yellow-400',
    hoverColor: 'hover:bg-yellow-500',
    textColor: 'text-yellow-900'
  }
];

export default function GoalStep() {
  const { formData, updateFormData } = useWizard();
  const [selectedGoal, setSelectedGoal] = useState('');
  const { user } = useAuth();
  
  // Initialize component with existing data if available
  useEffect(() => {
    if (formData.goal) {
      setSelectedGoal(formData.goal);
    }
    
    // Load user's previous goal selection from Firestore if available
    const loadUserPreferences = async () => {
      if (!user) return;
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().preferences?.goal) {
          const savedGoal = userDoc.data().preferences.goal;
          // Only set if not already set from formData
          if (!formData.goal) {
            setSelectedGoal(savedGoal);
            updateFormData({ goal: savedGoal });
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, [formData, user, updateFormData]);

  // Handle goal selection
  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId);
    
    // Save to wizard context
    updateFormData({ goal: goalId });
    
    // Save user preference if logged in
    saveUserGoalPreference(goalId);
  };
  
  // Save user's goal preference to Firestore
  const saveUserGoalPreference = async (goalId) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        'preferences.goal': goalId
      });
    } catch (error) {
      console.error('Error saving goal preference:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Select your content goal
      </h2>
      
      {/* Goal options grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selectedGoal === goal.id;
          
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => handleGoalSelect(goal.id)}
              className={`relative rounded-lg p-6 transition-all ${
                isSelected 
                  ? `${goal.bgColor} text-white ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900 ring-blue-500`
                  : `${goal.bgColor} bg-opacity-90 dark:bg-opacity-80 ${goal.hoverColor} hover:bg-opacity-100 dark:hover:bg-opacity-90`
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-white bg-opacity-20 mb-3">
                  {goal.icon}
                </div>
                <h3 className="text-lg font-medium text-white">{goal.label}</h3>
                <p className="text-sm mt-1 text-white text-opacity-90">{goal.description}</p>
              </div>
              
              {isSelected && (
                <div className="absolute top-3 right-3 bg-white bg-opacity-90 dark:bg-opacity-80 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Additional instruction */}
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Select the primary goal for your content
      </p>
    </div>
  );
}