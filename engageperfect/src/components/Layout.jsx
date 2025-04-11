/**
 * File: Layout.jsx
 * Version: 1.0.1
 * Purpose: Layout wrapper component for the EngagePerfect application.
 * Provides consistent layout structure with Navbar for all routes.
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <Outlet />
      </main>
    </div>
  );
}