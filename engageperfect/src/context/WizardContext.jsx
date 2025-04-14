/**
 * File: WizardContext.jsx
 * Version: 1.0.0
 * Purpose: Provides context for managing state across a multi-step wizard flow.
 * 
 * This context manages:
 * - Current active step
 * - Step completion status
 * - Form data for each step
 * - Navigation between steps
 * 
 * Used by: WizardLayout.jsx, StepIndicator.jsx, and all wizard step components
 */

import { createContext, useContext, useState, useMemo } from 'react';

// Create the context
const WizardContext = createContext(null);

// Custom hook for using the wizard context
export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

// Provider component
export const WizardProvider = ({ children, steps, initialData = {} }) => {
  // Current active step index
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form data for all steps
  const [formData, setFormData] = useState(initialData);
  
  // Track which steps have been completed
  const [completedSteps, setCompletedSteps] = useState({});
  
  // Derive total number of steps
  const totalSteps = steps.length;
  
  // Check if current step is the first step
  const isFirstStep = currentStep === 0;
  
  // Check if current step is the last step
  const isLastStep = currentStep === totalSteps - 1;
  
  // Get current step ID
  const currentStepId = steps[currentStep]?.id;
  
  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      // Mark current step as completed
      setCompletedSteps(prev => ({
        ...prev,
        [currentStepId]: true
      }));
      
      // Move to next step
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Jump to a specific step (if allowed)
  const goToStep = (stepIndex) => {
    // Only allow jumping to completed steps or the next available step
    const isCompletedStep = Object.keys(completedSteps).length >= stepIndex;
    const isNextAvailableStep = stepIndex === Object.keys(completedSteps).length;
    
    if (stepIndex >= 0 && stepIndex < totalSteps && (isCompletedStep || isNextAvailableStep)) {
      setCurrentStep(stepIndex);
    }
  };
  
  // Update form data for the current step
  const updateFormData = (newData) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  };
  
  // Check if a step is completed
  const isStepCompleted = (stepIndex) => {
    return !!completedSteps[steps[stepIndex]?.id];
  };
  
  // Reset the wizard
  const resetWizard = (newInitialData = {}) => {
    setCurrentStep(0);
    setFormData(newInitialData);
    setCompletedSteps({});
  };
  
  // Context value
  const value = useMemo(() => ({
    currentStep,
    formData,
    steps,
    totalSteps,
    isFirstStep,
    isLastStep,
    currentStepId,
    goToNextStep,
    goToPrevStep,
    goToStep,
    updateFormData,
    isStepCompleted,
    resetWizard,
    completedSteps
  }), [currentStep, formData, steps, totalSteps, isFirstStep, isLastStep, currentStepId, completedSteps]);
  
  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};