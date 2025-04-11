import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo"; // Fixed import path


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(email);
      setMessage("Check your email for further instructions");
    } catch (error) {
      setError("Failed to reset password: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Password Reset Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div style={{ transform: 'scale(2.5)' }}>
                <Logo showText={false} className="h-12 w-auto" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              We'll send you an email with instructions to reset your password
            </p>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}
          
          {message && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                    {message}
                  </h3>
                </div>
              </div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Reset Password"}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Back to login
                </Link>
              </div>
              <div className="text-sm">
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Need an account?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right Panel - Message */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 justify-center items-center p-8 min-h-screen fixed right-0">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-4">Password Recovery</h2>
          <p className="text-lg text-white/90 mb-6">
            Don't worry! It happens to the best of us. Enter your email and we'll help you reset your password.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Check your email inbox
            </li>
            <li className="flex items-center text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Click the reset link we send you
            </li>
            <li className="flex items-center text-white">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Create a new secure password
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}