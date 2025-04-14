/**
 * File: WizardLayout.jsx
 * Version: 1.0.0
 * Purpose: Main layout component for the multi-step wizard UI.
 * 
 * This component:
 * - Renders the step indicator progress bar
 * - Shows the active step content
 * - Handles the navigation buttons (Previous, Next, Finish)
 * - Maintains the overall wizard layout
 * - Validates step completion before allowing next
 * 
 * Used by: CaptionGenerator.jsx
 * Uses: WizardContext.jsx, StepIndicator.jsx
 */

import { useWizard } from '../../context/WizardContext';
import StepIndicator from './StepIndicator';

export default function WizardLayout({ children, onComplete, validateStep }) {
  const { 
    currentStep, 
    isFirstStep, 
    isLastStep, 
    goToNextStep, 
    goToPrevStep,
    steps,
    formData
  } = useWizard();
  
  // Determine if the current step is valid and can proceed
  const canProceed = () => {
    // If validateStep function is provided, use it
    if (validateStep) {
      return validateStep(currentStep, formData);
    }
    
    // Default validation - check if media exists for the first step
    if (currentStep === 0) {
      // For the media upload step, either mediaUrl or isTextOnly must be true
      return !!(formData.mediaUrl || formData.isTextOnly);
    }
    
    // By default, allow proceeding
    return true;
  };
  
  // Handle the finish/complete action
  const handleComplete = () => {
    if (onComplete && canProceed()) {
      onComplete(formData);
    }
  };
  
  // Handle next button click with validation
  const handleNext = () => {
    if (canProceed()) {
      goToNextStep();
    }
  };

    return (
      <div className="flex flex-col w-full max-w-6xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator />
        </div>
        
        {/* Active Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          {children}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          {/* Previous Button (hidden on first step) */}
          <button
            type="button"
            onClick={goToPrevStep}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isFirstStep 
                ? 'opacity-0 cursor-default' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            disabled={isFirstStep}
          >
            Previous
          </button>
          
          {/* Next/Finish Button */}
          <button
            type="button"
            onClick={isLastStep ? handleComplete : handleNext}
            disabled={!canProceed()}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              canProceed()
                ? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                : 'bg-blue-300 dark:bg-blue-900 text-white cursor-not-allowed'
            } transition-colors`}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    );
  }