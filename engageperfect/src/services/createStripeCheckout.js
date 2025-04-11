/**
 * File: createStripeCheckout.js
 * Version: 1.0.0
 * Purpose: Service function to create a Stripe checkout session.
 * Leverages Firebase Extensions for Stripe integration.
 */

import { db } from './firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';

/**
 * Creates a Stripe checkout session for subscription or one-time payment
 * @param {string} userId - The user ID
 * @param {string} returnUrl - URL to redirect after checkout
 * @param {string} [priceId] - Optional specific price ID for Flex packs
 * @returns {Promise<string>} Checkout URL
 */
const createStripeCheckout = async (userId, returnUrl, priceId = null) => {
  try {
    // Reference to the checkout_sessions subcollection for the user
    const checkoutSessionRef = collection(
      db,
      'customers',
      userId,
      'checkout_sessions'
    );
    
    // Create the checkout session
    const sessionData = {
      price: priceId, // If null, will show all available products
      success_url: `${returnUrl}/profile?checkout=success`,
      cancel_url: `${returnUrl}/profile?checkout=canceled`,
      // For subscriptions, automatically collect payment information
      // For one-time payments (Flex packs), set to 'required'
      payment_method_collection: priceId && priceId.includes('flex') ? 'always' : 'if_required',
    };
    
    // If no specific price is provided, let the customer choose
    if (!priceId) {
      delete sessionData.price;
      sessionData.line_items = [
        {
          price: 'price_premium_monthly', // Replace with your actual price ID
          quantity: 1,
        },
      ];
      sessionData.mode = 'subscription';
    } else if (priceId === 'flexy') {
      // For flex packs, use one-time payment mode
      delete sessionData.price;
      sessionData.line_items = [
        {
          price: 'price_flex_pack', // Replace with your actual price ID for flex packs
          quantity: 1,
        },
      ];
      sessionData.mode = 'payment';
    }
    
    // Create checkout session in Firestore
    // This triggers the Stripe extension to create a Checkout session
    const docRef = await addDoc(checkoutSessionRef, sessionData);
    
    // Wait for the Cloud Function to create the session
    // Add a small delay to ensure the cloud function has time to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const checkoutSessionSnap = await getDoc(docRef);
    const checkoutSessionData = checkoutSessionSnap.data();
    
    // Return the URL
    return checkoutSessionData.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
};

export default createStripeCheckout;