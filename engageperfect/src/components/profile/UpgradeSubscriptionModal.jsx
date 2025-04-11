/**
 * File: UpgradeSubscriptionModal.jsx
 * Version: 1.0.0
 * Purpose: Modal for displaying subscription plan options.
 * Allows users to upgrade from free to premium plans.
 */

import { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function UpgradeSubscriptionModal({ onClose, onSelectPlan, currentPlan }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Define plans
  const plans = [
    {
      id: 'basic_month',
      name: 'Basic',
      price: '9.99',
      interval: 'month',
      features: [
        'Up to 75 requests per month',
        'Access to all basic content types',
        'Download as PNG, JPG, PDF',
        'Standard support'
      ],
      highlight: false
    },
    {
      id: 'premium_month',
      name: 'Premium',
      price: '29.99',
      interval: 'month',
      features: [
        'Up to 250 requests per month',
        'Access to all premium content types',
        'All export formats',
        'Priority support',
        'Content analytics',
        'API access'
      ],
      highlight: true
    },
    {
      id: 'premium_year',
      name: 'Premium (Annual)',
      price: '299.99',
      interval: 'year',
      features: [
        'Up to 3000 requests per year',
        'Access to all premium content types',
        'All export formats',
        'Priority support',
        'Content analytics',
        'API access',
        '15% savings compared to monthly'
      ],
      highlight: false
    }
  ];

  // Handle plan selection
  const handleSelectPlan = async (planId) => {
    setSelectedPlan(planId);
    setLoading(true);
    
    try {
      await onSelectPlan(planId);
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle max-w-4xl w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Choose Your Plan
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Upgrade to get access to more features and increased request limits
              </p>
            </div>
            
            {/* Plans grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`rounded-lg border ${
                    plan.highlight 
                      ? 'border-purple-500 dark:border-purple-400 shadow-md' 
                      : 'border-gray-200 dark:border-gray-700'
                  } overflow-hidden`}
                >
                  {/* Plan highlight badge */}
                  {plan.highlight && (
                    <div className="bg-purple-500 text-white text-xs font-bold uppercase py-1 text-center">
                      Most Popular
                    </div>
                  )}
                  
                  {/* Plan header */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        /{plan.interval}
                      </span>
                    </div>
                    
                    {/* Plan features */}
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Select button */}
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading || currentPlan === plan.id}
                      className={`mt-8 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        plan.highlight 
                          ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                      } ${
                        currentPlan === plan.id ? 'bg-gray-400 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading && selectedPlan === plan.id
                        ? 'Processing...'
                        : currentPlan === plan.id
                          ? 'Current Plan'
                          : 'Select Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Alternative option */}
            <div className="mt-10 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Need a custom solution or prefer to pay as you go?
              </p>
              <button
                onClick={() => handleSelectPlan('flexy')}
                className="text-purple-600 dark:text-purple-400 font-medium"
              >
                View Flex Pack options
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}