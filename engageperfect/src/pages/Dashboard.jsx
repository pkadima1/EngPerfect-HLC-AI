/**
 * File: Dashboard.jsx
 * Version: 1.0.0
 * Purpose: Main dashboard for authenticated users.
 * Displays usage information and content creation options.
 */

import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.displayName || 'User'}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Start creating engaging social media content with EngagePerfect
        </p>
      </div>

      {/* Usage Stats Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Plan</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">Free</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">Available Requests</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">74 / 75</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Generated Posts</p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">1</p>
          </div>
        </div>
      </div>

      {/* Create New Content Cards */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Caption Generator Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </div>
            <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Social Media Caption</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate engaging captions for your social media posts with AI assistance.
          </p>
          <button className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Create Caption
          </button>
        </div>

        {/* Blog Generator Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
            </div>
            <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Blog Post</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create SEO-optimized blog posts with AI. Include images and structured content.
          </p>
          <button className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            Create Blog Post
          </button>
        </div>
      </div>

      {/* Recent Content (Placeholder) */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Content</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            You haven't created any content yet. Start by creating a caption or blog post above!
          </p>
        </div>
      </div>
    </div>
  );
}