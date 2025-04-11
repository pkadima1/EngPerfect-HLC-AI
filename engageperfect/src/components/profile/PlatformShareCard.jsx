/**
 * File: PlatformShareCard.jsx
 * Version: 1.0.0
 * Purpose: Displays social media platform sharing statistics.
 * Used in the profile page to show content sharing by platform.
 */

import { Twitter, Linkedin, Facebook, Share2 } from 'lucide-react';

export default function PlatformShareCard({ platform, count }) {
  // Platform-specific config
  const platformConfig = {
    twitter: {
      name: 'Twitter',
      icon: <Twitter size={20} className="text-blue-400" />,
      backgroundColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: <Linkedin size={20} className="text-blue-600" />,
      backgroundColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    facebook: {
      name: 'Facebook',
      icon: <Facebook size={20} className="text-blue-800" />,
      backgroundColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    other: {
      name: 'Other Apps',
      icon: <Share2 size={20} className="text-purple-600" />,
      backgroundColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300'
    }
  };

  const config = platformConfig[platform] || platformConfig.other;
  
  return (
    <div className={`${config.backgroundColor} rounded-lg p-4 text-center`}>
      <div className="flex justify-center mb-2">
        {config.icon}
      </div>
      <p className={`font-medium ${config.textColor}`}>{config.name}</p>
      <p className="text-2xl font-bold mt-1 dark:text-white">{count}</p>
    </div>
  );
}