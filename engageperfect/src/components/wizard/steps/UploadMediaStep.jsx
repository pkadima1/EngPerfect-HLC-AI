/**
 * File: UploadMediaStep.jsx
 * Version: 1.1.0
 * Purpose: First step in the caption generator wizard for uploading and editing media.
 * 
 * This component:
 * - Provides drag & drop functionality for media uploads
 * - Supports file selection via dialog
 * - Allows camera capture on supported devices
 * - Shows media preview with editing capabilities
 * - Supports filters: grayscale, sepia, invert, blur, brightness, contrast
 * - Includes editing tools: rotate, counter-rotate, crop, add text, reset, save
 * - Validates file types and sizes
 * - Updates the wizard context with the edited media
 * - Validates step completion before proceeding
 * 
 * Used by: CaptionGenerator.jsx
 * Uses: WizardContext.jsx
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { 
  Upload, 
  Camera, 
  AlertCircle, 
  X, 
  RotateCw, 
  RotateCcw, 
  Crop, 
  Type, 
  RefreshCw, 
  Check 
} from 'lucide-react';

// Add a new import for emoji picker (you'll need to install it)
// npm install emoji-picker-react
import EmojiPicker from 'emoji-picker-react';

export default function UploadMediaStep() {
  const { formData, updateFormData, goToNextStep } = useWizard();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const mediaContainerRef = useRef(null);
  const textOverlayRef = useRef(null);
  // Add a new ref for the camera input
  const cameraInputRef = useRef(null);
  
  // Media editing state
  const [filter, setFilter] = useState('none');
  const [rotation, setRotation] = useState(0);
  
  // Add these new states for cropping
  const [cropStart, setCropStart] = useState({ x: 50, y: 90});
  const [cropEnd, setCropEnd] = useState({ x: 50, y: 90});
  const [isCropping, setIsCropping] = useState(false);
  const [cropPreview, setCropPreview] = useState(null);
  
  const [isAddingText, setIsAddingText] = useState(false);
  const [textOverlay, setTextOverlay] = useState('');
  // Find and update the text overlay position state
  // We'll add a bottom position option
  const [textPosition, setTextPosition] = useState({ x: 50, y: 90}); // Default to bottom center
  const [editHistory, setEditHistory] = useState([]);
  const [currentEdit, setCurrentEdit] = useState(0);
  
  // Add these new state variables
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // Add new state for emoji picker visibility
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Add a new state for text rotation
  const [textRotation, setTextRotation] = useState(0);
  const [isRotatingText, setIsRotatingText] = useState(false);
  const rotationHandleRef = useRef(null);
  
  // Supported file types
  const supportedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'video/mp4', 
    'video/quicktime', 
    'video/x-msvideo'
  ];
  
  // Max file size (50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  
  // Available filters
  const filters = [
    { id: 'none', label: 'None' },
    { id: 'grayscale', label: 'Grayscale' },
    { id: 'sepia', label: 'Sepia' },
    { id: 'invert', label: 'Invert' },
    { id: 'blur', label: 'Blur' },
    { id: 'brightness', label: 'Brightness' },
    { id: 'contrast', label: 'Contrast' }
  ];
  
  // Initialize component with existing data if any
  useEffect(() => {
    if (formData.mediaUrl) {
      setShowEditor(true);
      
      // Restore editing state if available
      if (formData.filter) setFilter(formData.filter);
      if (formData.rotation) setRotation(formData.rotation);
      if (formData.textOverlay) setTextOverlay(formData.textOverlay);
      if (formData.textPosition) setTextPosition(formData.textPosition);
      if (formData.textRotation !== undefined) setTextRotation(formData.textRotation);
    }
  }, [formData]);
  
  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  // Handle file selection via drag & drop or file input
  const handleFileSelection = useCallback((file) => {
    setError('');
    
    // Validate file type
    if (!supportedTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload an image or video.');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 50MB.');
      return;
    }
    
    // Create object URL for preview
    const mediaUrl = URL.createObjectURL(file);
    
    // Determine media type
    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
    
    // Reset editing state
    setFilter('none');
    setRotation(0);
    setIsCropping(false);
    setIsAddingText(false);
    setTextOverlay('');
    setTextPosition({ x: 50, y: 90});
    setEditHistory([]);
    setCurrentEdit(0);
    
    // Update wizard data
    updateFormData({
      media: file,
      mediaUrl,
      mediaType,
      filter: 'none',
      rotation: 0,
      textOverlay: '',
      textPosition: { x: 50, y: 90},
      filtersApplied: []
    });
    
    // Show editor
    setShowEditor(true);
  }, [updateFormData, supportedTypes]);
  
  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  }, [handleFileSelection]);
  
  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelection(file);
    }
  }, [handleFileSelection]);
  
  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  
  // Handle camera capture - using separate camera input
  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };
  
  // Remove selected media
  const removeMedia = () => {
    // Revoke object URL to avoid memory leaks
    if (formData.mediaUrl) {
      URL.revokeObjectURL(formData.mediaUrl);
    }
    
    // Reset media data
    updateFormData({
      media: null,
      mediaUrl: '',
      mediaType: '',
      filter: '',
      rotation: 0,
      textOverlay: '',
      textPosition: { x: 50, y: 90 },
      filtersApplied: []
    });
    
    // Hide editor
    setShowEditor(false);
  };
  
  // Create text-only caption (no media)
  const createTextOnlyCaption = () => {
    // Set a flag indicating this is a text-only caption
    updateFormData({
      media: null,
      mediaUrl: '',
      mediaType: 'text-only',
      isTextOnly: true
    });
    
    // Since this is valid, allow proceeding to next step
    goToNextStep();
  };
  
  // Apply filter
  const applyFilter = (filterId) => {
    setFilter(filterId);
    
    // Track filters applied
    const filtersApplied = formData.filtersApplied || [];
    if (filterId !== 'none' && !filtersApplied.includes(filterId)) {
      updateFormData({
        filter: filterId,
        filtersApplied: [...filtersApplied, filterId]
      });
    } else {
      updateFormData({
        filter: filterId
      });
    }
  };
  
  // Rotate media
  const rotateMedia = (direction) => {
    const newRotation = direction === 'clockwise' 
      ? (rotation + 90) % 360 
      : (rotation - 90 + 360) % 360;
    
    setRotation(newRotation);
    updateFormData({ rotation: newRotation });
  };
  
  // Add a function to handle mouse down on the image when in crop mode
  const handleCropStart = (e) => {
    if (!isCropping) return;
    
    const rect = mediaContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setCropStart({ x, y });
    setCropEnd({ x, y }); // Initialize end to start
  };

  // Add a function to handle mouse move when cropping
  const handleCropMove = (e) => {
    if (!isCropping || !cropStart) return;
    
    const rect = mediaContainerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    
    setCropEnd({ x, y });
  };

  // Add a function to handle mouse up when cropping
  const handleCropEnd = () => {
    if (!isCropping || !cropStart || !cropEnd) return;
    
    // Only proceed if we have a meaningful crop area
    const minSize = 0.05; // 5% of the image
    if (Math.abs(cropEnd.x - cropStart.x) < minSize || Math.abs(cropEnd.y - cropStart.y) < minSize) {
      return;
    }
    
    // Normalize crop coordinates (make sure start is top-left, end is bottom-right)
    const normalizedCrop = {
      startX: Math.min(cropStart.x, cropEnd.x),
      startY: Math.min(cropStart.y, cropEnd.y),
      endX: Math.max(cropStart.x, cropEnd.x),
      endY: Math.max(cropStart.y, cropEnd.y)
    };
    
    // For images, we can use canvas to crop
    if (formData.mediaType === 'image' && imageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size proportional to crop area
      const imgWidth = imageRef.current.naturalWidth;
      const imgHeight = imageRef.current.naturalHeight;
      
      canvas.width = (normalizedCrop.endX - normalizedCrop.startX) * imgWidth;
      canvas.height = (normalizedCrop.endY - normalizedCrop.startY) * imgHeight;
      
      // Draw the cropped portion of the image
      ctx.drawImage(
        imageRef.current,
        normalizedCrop.startX * imgWidth,
        normalizedCrop.startY * imgHeight,
        canvas.width,
        canvas.height,
        0, 0, canvas.width, canvas.height
      );
      
      // Convert to data URL
      const croppedUrl = canvas.toDataURL(formData.media.type);
      
      // Update preview with cropped image
      setCropPreview(croppedUrl);
    }
  };

  // Add a function to apply the crop
  const applyCrop = () => {
    if (cropPreview) {
      // Revoke the old object URL to avoid memory leaks
      if (formData.mediaUrl) {
        URL.revokeObjectURL(formData.mediaUrl);
      }
      
      // Update form data with cropped image
      updateFormData({
        mediaUrl: cropPreview,
        // Keep other properties the same
      });
      
      // Reset crop mode
      setIsCropping(false);
      setCropPreview(null);
    }
  };

  // Add a function to cancel crop
  const cancelCrop = () => {
    setIsCropping(false);
    setCropPreview(null);
  };

  // Update the toggleCropMode function
  const toggleCropMode = () => {
    if (isCropping) {
      // If already in crop mode, exit it
      setIsCropping(false);
      setCropPreview(null);
    } else {
      // Enter crop mode
      setIsCropping(true);
      setIsAddingText(false); // Turn off text mode when entering crop mode
    }
  };
  
  // Toggle text overlay mode
  const toggleTextMode = () => {
    setIsAddingText(!isAddingText);
    if (isAddingText) {
      // Turning off text mode
      if (textOverlay) {
        // Save the current text state to formData before exiting text mode
        updateFormData({ 
          textOverlay,
          textPosition,
          textRotation
        });
      }
    } else {
      // Turning on text mode, disable crop mode
      setIsCropping(false);
    }
  };
  
  // Handle text overlay changes
  const handleTextChange = (e) => {
    setTextOverlay(e.target.value);
    updateFormData({ textOverlay: e.target.value });
  };
  
  // Handle text position changes
  const handleTextPositionChange = (x, y) => {
    const newPosition = { 
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
    setTextPosition(newPosition);
    updateFormData({ textPosition: newPosition });
  };
  
  // Add a function to position text at the bottom
  const positionTextAtBottom = () => {
    const newPosition = { x: 50, y: 90 }; // 90% from the top (near bottom)
    setTextPosition(newPosition);
    updateFormData({ textPosition: newPosition });
    console.log("Text positioned at bottom");
  };
  
  // Handle text overlay drag start
  const handleTextDragStart = (e) => {
    if (!isAddingText) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Record the initial mouse position
    setDragStartPos({
      mouseX: e.clientX,
      mouseY: e.clientY,
      textX: textPosition.x,
      textY: textPosition.y
    });
    
    setIsDraggingText(true);
  };
  
  // Handle text overlay drag move
  const handleTextDragMove = (e) => {
    if (!isDraggingText || !isAddingText) return;
    
    const rect = mediaContainerRef.current.getBoundingClientRect();
    
    // Calculate deltas in pixels
    const deltaX = e.clientX - dragStartPos.mouseX;
    const deltaY = e.clientY - dragStartPos.mouseY;
    
    // Convert to percentage of container
    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = (deltaY / rect.height) * 100;
    
    // Calculate new position
    const newX = dragStartPos.textX + deltaXPercent;
    const newY = dragStartPos.textY + deltaYPercent;
    
    // Update position with bounds checking
    handleTextPositionChange(newX, newY);
  };
  
  // Handle text overlay drag end
  const handleTextDragEnd = () => {
    if (isDraggingText) {
      setIsDraggingText(false);
      // Final position update to formData
      updateFormData({ textPosition });
    }
  };
  
  // Add a function to handle text rotation
  const handleRotationStart = (e) => {
    if (!isAddingText) return;
    e.preventDefault();
    e.stopPropagation();
    setIsRotatingText(true);
  };

  const handleRotationMove = (e) => {
    if (!isRotatingText || !isAddingText) return;
    
    const rect = mediaContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + (rect.width * textPosition.x / 100);
    const centerY = rect.top + (rect.height * textPosition.y / 100);
    
    // Calculate angle between center of text and current mouse position
    const angle = Math.atan2(
      e.clientY - centerY,
      e.clientX - centerX
    ) * (180 / Math.PI);
    
    // Update rotation state
    setTextRotation(angle);
  };

  const handleRotationEnd = () => {
    if (isRotatingText) {
      setIsRotatingText(false);
      updateFormData({ textRotation });
    }
  };

  // Reset all edits
  const resetEdits = () => {
    setFilter('none');
    setRotation(0);
    setTextRotation(0);
    setIsCropping(false);
    setIsAddingText(false);
    setTextOverlay('');
    setTextPosition({ x: 50, y: 90});
    
    updateFormData({
      filter: 'none',
      rotation: 0,
      textRotation: 0,
      textOverlay: '',
      textPosition: { x: 50, y: 90},
      filtersApplied: []
    });
  };
  
  // Save edits
  const saveEdits = () => {
    // Here we would actually apply the edits to the media file
    // For simplicity, we'll just update the form data
    updateFormData({
      editsSaved: true,
      textOverlay,
      textPosition,
      textRotation,
      filter,
      rotation
    });
  };
  
  // Get filter CSS
  const getFilterStyle = () => {
    switch (filter) {
      case 'grayscale':
        return 'grayscale(100%)';
      case 'sepia':
        return 'sepia(100%)';
      case 'invert':
        return 'invert(100%)';
      case 'blur':
        return 'blur(5px)';
      case 'brightness':
        return 'brightness(150%)';
      case 'contrast':
        return 'contrast(150%)';
      default:
        return 'none';
    }
  };
  
  // Check if the step is complete and can proceed
  const isStepComplete = () => {
    return formData.mediaUrl || formData.isTextOnly;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Section - Upload Area */}
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Welcome, User
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload your media or capture directly to get human-like AI-powered captions.
        </p>
        
        {/* Drag & Drop Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-700'
          } ${error ? 'border-red-300 dark:border-red-700' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="flex flex-col items-center justify-center h-48">
            {/* Upload icon */}
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Drag & drop your media here, or click to select
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supports images and videos up to 50MB
            </p>
            
            {/* Error message */}
            {error && (
              <div className="flex items-center mt-4 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={openFileDialog}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </button>
          
          <button
            type="button"
            onClick={handleCameraCapture}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Camera className="w-4 h-4 mr-2" />
            Use Camera
          </button>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
          
          {/* Add another input element for camera capture */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileInputChange}
            capture="user" // Use "user" for front camera or "environment" for back camera
          />
        </div>
        
        {/* Camera Error Message */}
        {cameraError && (
          <div className="mt-2 text-red-500 text-sm">
            {cameraError}
            <button 
              className="ml-2 underline" 
              onClick={() => {
                setCameraError('');
                handleCameraCapture();
              }}
            >
              Try again
            </button>
          </div>
        )}
        
        {/* Text-Only Option */}
        <div className="mt-6 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
        </div>
        <button
          type="button"
          onClick={createTextOnlyCaption}
          className="mt-3 w-full text-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Create text-only caption
          </span>
        </button>
      </div>
      
      {/* Right Section - Media Preview with Editor */}
      <div className="w-full md:w-1/2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {formData.mediaUrl && showEditor ? (
          <div 
            className="relative" 
            ref={mediaContainerRef}
          >
            {/* Remove button */}
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-gray-800/70 flex items-center justify-center text-white hover:bg-gray-900/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Media preview */}
            <div 
              className="h-80 w-full relative overflow-hidden"
              onMouseDown={(e) => {
                if (isCropping) handleCropStart(e);
              }}
              onMouseMove={(e) => {
                if (isDraggingText) {
                  handleTextDragMove(e);
                } else if (isRotatingText) {
                  handleRotationMove(e);
                } else if (isCropping) {
                  handleCropMove(e);
                }
              }}
              onMouseUp={() => {
                if (isDraggingText) {
                  handleTextDragEnd();
                } else if (isRotatingText) {
                  handleRotationEnd();
                } else if (isCropping) {
                  handleCropEnd();
                }
              }}
              onMouseLeave={() => {
                if (isDraggingText) {
                  handleTextDragEnd();
                } else if (isRotatingText) {
                  handleRotationEnd();
                } else if (isCropping) {
                  handleCropEnd();
                }
              }}
            >
              {cropPreview ? (
                <img
                  src={cropPreview}
                  alt="Crop preview"
                  className="w-full h-full object-contain"
                />
              ) : formData.mediaType === 'image' ? (
                <img
                  ref={imageRef}
                  src={formData.mediaUrl}
                  alt="Uploaded media"
                  className="w-full h-full object-contain transition-transform"
                  style={{ 
                    filter: getFilterStyle(),
                    transform: `rotate(${rotation}deg)`,
                    cursor: isCropping ? 'crosshair' : 'default'
                  }}
                />
              ) : formData.mediaType === 'video' ? (
                <video
                  ref={videoRef}
                  src={formData.mediaUrl}
                  controls
                  className="w-full h-full object-contain"
                  style={{ 
                    filter: getFilterStyle(),
                    transform: `rotate(${rotation}deg)`
                  }}
                />
              ) : null}
              
              {/* Crop selection overlay */}
              {isCropping && !cropPreview && cropStart && cropEnd && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                  style={{
                    left: `${Math.min(cropStart.x, cropEnd.x) * 100}%`,
                    top: `${Math.min(cropStart.y, cropEnd.y) * 100}%`,
                    width: `${Math.abs(cropEnd.x - cropStart.x) * 100}%`,
                    height: `${Math.abs(cropEnd.y - cropStart.y) * 100}%`
                  }}
                />
              )}
              
              {/* Text Overlay */}
              {textOverlay && (
                <div 
                  ref={textOverlayRef}
                  className={`absolute text-white text-2xl font-bold text-center px-4 py-2 bg-black/50 rounded ${
                    isAddingText ? 'ring-2 ring-blue-400' : ''
                  }`}
                  style={{
                    left: `${textPosition.x}%`,
                    top: `${textPosition.y}%`,
                    transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
                    cursor: isAddingText ? 'move' : 'default',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                  onMouseDown={handleTextDragStart}
                >
                  {textOverlay}
                  
                  {/* Rotation handle */}
                  {isAddingText && (
                    <>
                      <div 
                        ref={rotationHandleRef}
                        className="absolute w-5 h-5 bg-blue-500 rounded-full cursor-move -top-7 left-1/2 transform -translate-x-1/2"
                        onMouseDown={handleRotationStart}
                      />
                      <div 
                        className="absolute w-0.5 h-7 bg-blue-500 -top-7 left-1/2 transform -translate-x-1/2 pointer-events-none"
                      />
                    </>
                  )}
                </div>
              )}
              
              {/* Crop Actions - Show if cropPreview exists */}
              {cropPreview && (
                <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-4 p-2 bg-black/70">
                  <button
                    onClick={applyCrop}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Apply Crop
                  </button>
                  <button
                    onClick={cancelCrop}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {/* Editor Controls */}
            <div className="bg-gray-900 p-4">
              {/* Filters */}
              <div className="mb-4">
                <p className="text-white text-sm mb-2">Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.map(filterOption => (
                    <button
                      key={filterOption.id}
                      type="button"
                      onClick={() => applyFilter(filterOption.id)}
                      className={`px-3 py-1 text-xs rounded ${
                        filter === filterOption.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {filterOption.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Edit Tools */}
              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => rotateMedia('counter-clockwise')}
                  className="flex flex-col items-center justify-center p-2 text-gray-300 hover:text-white"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span className="text-xs mt-1">Rotate</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => rotateMedia('clockwise')}
                  className="flex flex-col items-center justify-center p-2 text-gray-300 hover:text-white"
                >
                  <RotateCw className="w-5 h-5" />
                  <span className="text-xs mt-1">Counter</span>
                </button>
                
                <button
                  type="button"
                  onClick={toggleCropMode}
                  className={`flex flex-col items-center justify-center p-2 ${
                    isCropping
                      ? 'text-blue-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Crop className="w-5 h-5" />
                  <span className="text-xs mt-1">Crop</span>
                </button>
                
                <button
                  type="button"
                  onClick={toggleTextMode}
                  className={`flex flex-col items-center justify-center p-2 ${
                    isAddingText
                      ? 'text-blue-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Type className="w-5 h-5" />
                  <span className="text-xs mt-1">Text</span>
                </button>
                
                <button
                  type="button"
                  onClick={resetEdits}
                  className="flex flex-col items-center justify-center p-2 text-gray-300 hover:text-white"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-xs mt-1">Reset</span>
                </button>
                
                <button
                  type="button"
                  onClick={saveEdits}
                  className="flex flex-col items-center justify-center p-2 text-gray-300 hover:text-white"
                >
                  <Check className="w-5 h-5" />
                  <span className="text-xs mt-1">Save</span>
                </button>
              </div>
              
              {/* Text Input (shown when text mode is active) */}
              {isAddingText && (
                <div className="mt-4">
                  <div className="relative">
                    <textarea
                      value={textOverlay}
                      onChange={handleTextChange}
                      placeholder="Enter text to overlay"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-2 bottom-2 text-gray-400 hover:text-white"
                    >
                      😊
                    </button>
                  </div>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="relative z-10 mt-1">
                      <div className="absolute bottom-full right-0 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setTextOverlay(prev => prev + emojiData.emoji);
                            updateFormData({ textOverlay: textOverlay + emojiData.emoji });
                            setShowEmojiPicker(false);
                          }}
                          searchDisabled
                          skinTonesDisabled
                          height={320}
                          width={320}
                          theme="dark"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTextRotation(0);
                          updateFormData({ textRotation: 0 });
                        }}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Reset rotation
                      </button>
                      <span className="text-xs text-gray-500">|</span>
                      <button
                        type="button"
                        onClick={positionTextAtBottom}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Position at bottom
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">
                      {Math.round(textRotation)}°
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-80 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600">
            Media preview will appear here
          </div>
        )}
      </div>
    </div>
  );
}