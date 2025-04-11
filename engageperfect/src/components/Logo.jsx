/**
 * File: Logo.jsx
 * Version: 1.0.0
 * Purpose: EngagePerfect logo component with brand logo and name.
 * Can be used throughout the application for consistent branding.
 */

import React from 'react';
import logoImage from '../assets/EngPerfect.png'; // Adjust the path as necessary


export default function Logo({ showText = true, className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo image */}
      <img 
        src={logoImage} 
        alt="EngagePerfect Logo" 
        className="h-8 w-auto mr-2" 
      />
      
      {/* Only show the text if showText is true */}
      {showText && (
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          EngagePerfect
        </span>
      )}
    </div>
  );
}