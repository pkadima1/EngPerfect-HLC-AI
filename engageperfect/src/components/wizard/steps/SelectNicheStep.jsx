/**
 * File: SelectNicheStep.jsx
 * Version: 1.0.0
 * Purpose: Second step in the caption generator wizard for selecting content niche.
 * 
 * This component:
 * - Provides pre-defined niche options as selectable cards
 * - Allows custom niche input
 * - Updates the wizard context with the selected niche
 * - Validates the input before allowing to proceed
 * 
 * Used by: CaptionGenerator.jsx
 * Uses: WizardContext.jsx
 */

import { useState, useEffect } from 'react';
import { useWizard } from '../../../context/WizardContext';

// Pre-defined niche options
const NICHE_OPTIONS = [
  { id: 'business', label: 'Business & Entrepreneurship' },
  { id: 'fitness', label: 'Fitness & Health' },
  { id: 'food', label: 'Food & Cooking' },
  { id: 'travel', label: 'Travel & Adventure' },
  { id: 'fashion', label: 'Fashion & Beauty' },
  { id: 'tech', label: 'Technology & Gadgets' },
  { id: 'art', label: 'Art & Design' },
  { id: 'education', label: 'Education & Learning' },
  { id: 'motivation', label: 'Motivation & Inspiration' },
  { id: 'entertainment', label: 'Entertainment & Media' },
  { id: 'parenting', label: 'Parenting & Family' },
  { id: 'finance', label: 'Finance & Investing' }
];

export default function SelectNicheStep() {
  const { formData, updateFormData } = useWizard();
  const [customNiche, setCustomNiche] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  
  // Initialize from existing form data
  useEffect(() => {
    if (formData.niche) {
      // Check if it's one of our predefined niches
      const isPredefined = NICHE_OPTIONS.some(option => option.id === formData.niche);
      
      if (isPredefined) {
        setSelectedNiche(formData.niche);
      } else {
        setCustomNiche(formData.niche);
        setSelectedNiche('custom');
      }
    }
  }, [formData.niche]);
  
  // Handle niche selection
  const handleNicheSelection = (nicheId) => {
    setSelectedNiche(nicheId);
    
    // Update wizard form data
    if (nicheId === 'custom') {
      updateFormData({ niche: customNiche });
    } else {
      updateFormData({ niche: nicheId });
    }
  };
  
  // Handle custom niche input
  const handleCustomNicheChange = (e) => {
    const value = e.target.value;
    setCustomNiche(value);
    
    if (selectedNiche === 'custom') {
      updateFormData({ niche: value });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Select Your Niche
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choose the industry or topic for your content to get more relevant captions.
      </p>
      
      {/* Niche Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {NICHE_OPTIONS.map((niche) => (
          <button
            key={niche.id}
            type="button"
            onClick={() => handleNicheSelection(niche.id)}
            className={`p-4 rounded-lg border ${
              selectedNiche === niche.id
                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            } transition-colors`}
          >
            <span className="block text-sm font-medium">{niche.label}</span>
          </button>
        ))}
        
        {/* Custom niche option */}
        <button
          type="button"
          onClick={() => handleNicheSelection('custom')}
          className={`p-4 rounded-lg border ${
            selectedNiche === 'custom'
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          } transition-colors`}
        >
          <span className="block text-sm font-medium">Custom</span>
        </button>
      </div>
      
      {/* Custom niche input */}
      {selectedNiche === 'custom' && (
        <div className="mt-4">
          <label 
            htmlFor="custom-niche" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Enter your custom niche or interest
          </label>
          <input
            type="text"
            id="custom-niche"
            value={customNiche}
            onChange={handleCustomNicheChange}
            placeholder="e.g., Sustainability, Pet Care, Music Production"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {customNiche.length}/100 characters
          </p>
        </div>
      )}
    </div>
  );
}