/**
 * File: StepIndicator.jsx
 * Version: 1.0.0
 * Purpose: Displays the step progress indicator for the wizard.
 * 
 * This component:
 * - Shows all steps in the wizard
 * - Highlights the current active step
 * - Shows completed steps
 * - Provides visual progress tracking
 * - Supports clicking on steps for navigation (if step is completed)
 * 
 * Used by: WizardLayout.jsx
 * Uses: WizardContext.jsx
 */

import { useWizard } from '../../context/WizardContext';
import { CheckIcon } from 'lucide-react';

export default function StepIndicator() {
  const { 
    steps, 
    currentStep, 
    goToStep, 
    isStepCompleted,
    completedSteps
  } = useWizard();
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          // Determine step status
          const isActive = currentStep === index;
          const isCompleted = isStepCompleted(index);
          const isPending = !isActive && !isCompleted;
          
          // Determine if this step can be clicked (completed steps and current+1)
          const canClick = isCompleted || index === Object.keys(completedSteps).length;
          
          return (
            <div key={step.id} className="flex-1 relative">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => canClick && goToStep(index)}
                  disabled={!canClick}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-transparent border-gray-400 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  } ${canClick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                
                {/* Step Label */}
                <span 
                  className={`mt-2 text-xs ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-medium' 
                      : isCompleted 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connecting Line (except for last step) */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-4 left-1/2 right-0 h-[2px] ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}