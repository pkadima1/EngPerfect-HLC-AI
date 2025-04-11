/**
 * File: StatsCard.jsx
 * Version: 1.0.0
 * Purpose: Displays a statistic with icon, count, and subtitle.
 * Used in the profile page to display user statistics.
 */

export default function StatsCard({ title, count, icon, subtitle }) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{count}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            {icon}
          </div>
        </div>
      </div>
    );
  }