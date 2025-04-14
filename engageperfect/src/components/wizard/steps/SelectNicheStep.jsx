/**
 * File: SelectNicheStep.jsx
 * Version: 1.2.0
 * Purpose: Second step in the caption generator wizard for selecting content niche/industry.
 * 
 * This component:
 * - Provides a text input for custom niche entry (limited to 100 characters)
 * - Offers quick selection of common industry niches
 * - Auto-fills the text field when a niche is selected for further customization
 * - Keeps the niche card highlighted even when customizing the text
 * - Validates user input
 * - Updates the wizard context with the selected niche
 * - Preserves previously selected niche when revisiting
 * 
 * Used by: CaptionGenerator.jsx
 * Uses: WizardContext.jsx
 */

import { useState, useEffect } from 'react';
import { useWizard } from '../../../context/WizardContext';

// Predefined niche options with icons
const NICHE_OPTIONS = [
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'technology', label: 'Technology', icon: '📱' },
  { id: 'art-design', label: 'Art & Design', icon: '🎨' },
  { id: 'seo-marketing', label: 'SEO & Marketing', icon: '📊' },
  { id: 'fitness', label: 'Fitness', icon: '🏋️' },
  { id: 'food-cooking', label: 'Food & Cooking', icon: '🍳' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'photography', label: 'Photography', icon: '📷' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' }
];

export default function SelectNicheStep() {
  const { formData, updateFormData } = useWizard();
  const [customNiche, setCustomNiche] = useState('');
  const [selectedNicheId, setSelectedNicheId] = useState('');
  const [error, setError] = useState('');
  const [isCustomized, setIsCustomized] = useState(false);

  // Effect: Initialize from existing data if available
  useEffect(() => {
    // Set initial values from formData
    if (formData.nicheSelected) {
      setSelectedNicheId(formData.nicheSelected);
      
      // Find the matching niche option to set the custom text field
      const selectedNiche = NICHE_OPTIONS.find(niche => niche.id === formData.nicheSelected);
      if (selectedNiche) {
        // If text field has been customized from the original niche label
        if (formData.nicheInput && formData.nicheInput !== selectedNiche.label) {
          setCustomNiche(formData.nicheInput);
          setIsCustomized(true);
        } else {
          setCustomNiche(selectedNiche.label);
          setIsCustomized(false);
        }
      }
    } else if (formData.nicheInput) {
      setCustomNiche(formData.nicheInput);
      setSelectedNicheId(''); // Clear selected niche if only custom input exists
      setIsCustomized(false);
    }
  }, [formData]);

  // Handle custom niche input change
  const handleCustomNicheChange = (e) => {
    const value = e.target.value;
    
    // Limit to 100 characters
    if (value.length <= 100) {
      setCustomNiche(value);
      
      // Clear any existing error
      if (error) setError('');

      // Check if a niche is selected
      if (selectedNicheId) {
        // Find selected niche option to compare with input
        const selectedNiche = NICHE_OPTIONS.find(niche => niche.id === selectedNicheId);
        
        // Mark as customized if different from the original label
        setIsCustomized(value !== selectedNiche.label);
        
        // Update form data but keep selectedNicheId
        updateFormData({
          nicheSelected: selectedNicheId,
          nicheInput: value,
          niche: value // For backward compatibility
        });
      } else {
        // No niche selected, just update the input
        updateFormData({
          nicheInput: value,
          nicheSelected: '',
          niche: value // For backward compatibility
        });
      }
    }
  };

  // Handle predefined niche selection
  const handleNicheSelect = (niche) => {
    // Select this niche
    setSelectedNicheId(niche.id);
    setIsCustomized(false);
    
    // Set the text field to the selected niche label (auto-fill)
    setCustomNiche(niche.label);
    
    // Update form data with selected niche
    updateFormData({
      nicheSelected: niche.id,
      nicheInput: niche.label,
      niche: niche.label // For backward compatibility
    });
    
    // Clear any error message
    if (error) setError('');
  };

  // Clear selection completely
  const clearSelection = () => {
    setSelectedNicheId('');
    setIsCustomized(false);
    setCustomNiche('');
    updateFormData({
      nicheSelected: '',
      nicheInput: '',
      niche: ''
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Enter your content niche
      </h2>
      
      {/* Custom niche input */}
      <div>
        <div className="relative">
          <input
            type="text"
            value={customNiche}
            onChange={handleCustomNicheChange}
            placeholder="Enter your niche or select from options below"
            className={`w-full px-4 py-3 rounded-lg border ${
              selectedNicheId 
                ? 'border-blue-300 dark:border-blue-700 focus:ring-blue-500' 
                : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
            maxLength={100}
          />
          {customNiche && (
            <button
              onClick={clearSelection}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex justify-between mt-1">
          {customNiche && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {customNiche.length}/100
            </p>
          )}
          {isCustomized && selectedNicheId && (
            <p className="text-xs text-blue-500 dark:text-blue-400">
              Custom version of selected niche
            </p>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
      
      {/* Predefined niches */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Or quickly select from common niches
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NICHE_OPTIONS.map((niche) => (
            <button
              key={niche.id}
              type="button"
              onClick={() => handleNicheSelect(niche)}
              className={`flex items-center p-3 rounded-lg border ${
                selectedNicheId === niche.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              } transition-colors`}
            >
              <span className="text-xl mr-3">{niche.icon}</span>
              <span className="text-sm font-medium">{niche.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Info text for customization */}
      {selectedNicheId && (
        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <span className="font-medium">Tip:</span> You can customize the selected niche in the text field above to make it more specific to your content.
          </p>
        </div>
      )}
    </div>
  );
}