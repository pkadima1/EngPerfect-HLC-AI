/**
 * File: ProgressBar.jsx
 * Version: 1.0.0
 * Purpose: Reusable progress bar component with customizable appearance.
 */

export default function ProgressBar({ 
    value, 
    max, 
    className = "", 
    fillClassName = "" 
  }) {
    // Calculate percentage
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    return (
      <div className={`w-full ${className}`}>
        <div 
          className={`${fillClassName}`} 
          style={{ width: `${percentage}%` }}
        ></div>
        </div>
      );
    }