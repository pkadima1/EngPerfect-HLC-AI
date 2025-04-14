/**
 * File: CaptionGenerator.jsx
 * Version: 1.0.0
 * Purpose: Main page component for the caption generator.
 * 
 * This component:
 * - Sets up the wizard flow for caption generation
 * - Currently only implements the first two steps (Upload Media, Select Niche)
 * - Additional steps will be added one by one
 * 
 * Uses: WizardContext.jsx, WizardLayout.jsx, Step Components
 */

import { useState } from 'react';
import { WizardProvider, useWizard } from '../context/WizardContext';
import WizardLayout from '../components/wizard/WizardLayout';
// Import implemented step components
import UploadMediaStep from '../components/wizard/steps/UploadMediaStep';
import SelectNicheStep from '../components/wizard/steps/SelectNicheStep';
// Placeholder components for future steps - to be implemented later
// These are commented out until we implement them
// import PlatformStep from '../components/wizard/steps/PlatformStep';
// import GoalStep from '../components/wizard/steps/GoalStep';
// import ToneStep from '../components/wizard/steps/ToneStep';
// import GeneratedCaptionsStep from '../components/wizard/steps/GeneratedCaptionsStep';

// Define the steps for the caption generation process
// For now, we'll only include the first two steps that we've implemented
const WIZARD_STEPS = [
  { id: 'upload_media', label: 'Upload Media', component: UploadMediaStep },
  { id: 'select_niche', label: 'Select Niche', component: SelectNicheStep },
  // Placeholder steps with temporary components
  { id: 'platform', label: 'Platform', component: PlaceholderStep },
  { id: 'goal', label: 'Goal', component: PlaceholderStep },
  { id: 'tone', label: 'Tone', component: PlaceholderStep },
  { id: 'generated_captions', label: 'Generated Captions', component: PlaceholderStep },
];

// Placeholder component for steps not yet implemented
function PlaceholderStep() {
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Coming Soon
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        This step is currently under development.
      </p>
    </div>
  );
}

export default function CaptionGenerator() {
  // State to track if wizard is complete
  const [isComplete, setIsComplete] = useState(false);
  // State to store final form data
  const [finalData, setFinalData] = useState(null);

  // Handle wizard completion
  const handleComplete = (formData) => {
    setIsComplete(true);
    setFinalData(formData);
    // Here you would typically save the data or perform other actions
    console.log('Wizard completed with data:', formData);
  };

  // Validate each step before allowing to proceed
  const validateStep = (stepIndex, formData) => {
    switch (stepIndex) {
      case 0: // Upload Media
        // Either have media or chosen text-only
        return !!(formData.mediaUrl || formData.isTextOnly);
      
      case 1: // Select Niche
        // Must have a niche selected
        return !!formData.niche;
      
      // Other steps will be added as they are implemented
      default:
        return true; // Default to true for placeholder steps
    }
  };

  // Initial form data (empty)
  const initialData = {
    media: null,
    mediaUrl: '',
    mediaType: '',
    niche: '',
    platform: '',
    goal: '',
    tone: '',
    generatedCaptions: [],
    selectedCaption: null
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Caption Generator
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create engaging captions for your social media posts with AI assistance
          </p>
        </div>

        {/* Wizard */}
        <WizardProvider steps={WIZARD_STEPS} initialData={initialData}>
          <WizardLayout onComplete={handleComplete} validateStep={validateStep}>
            <ActiveStepContent />
          </WizardLayout>
        </WizardProvider>
      </div>
    </div>
  );
}

// Helper component to render the active step
function ActiveStepContent() {
  const { currentStep, steps } = useWizard();
  const StepComponent = steps[currentStep]?.component;

  if (!StepComponent) {
    return <div>Step not found</div>;
  }

  return <StepComponent />;
}