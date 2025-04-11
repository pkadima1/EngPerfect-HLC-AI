/**
 * File: Profile.jsx
 * Version: 1.0.0
 * Purpose: User profile page component for EngagePerfect.
 * Displays user information, subscription details, usage statistics,
 * and allows profile editing and management.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { db, auth, storage } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Edit, 
  User, 
  LogOut, 
  UploadCloud,
  Trash2,
  CreditCard,
  Clock,
  Lock,
  Camera,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import EditProfileModal from '../components/profile/EditProfileModal';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import DeleteAccountModal from '../components/profile/DeleteAccountModal';
import UpgradeSubscriptionModal from '../components/profile/UpgradeSubscriptionModal';
import ProgressBar from '../components/ui/ProgressBar';
import StatsCard from '../components/profile/StatsCard';
import PlatformShareCard from '../components/profile/PlatformShareCard';
import createStripeCheckout from '../services/createStripeCheckout';
import { toast } from 'react-hot-toast';

export default function Profile() {
  // User and profile state
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showUpgradeSubscription, setShowUpgradeSubscription] = useState(false);
  
  // Avatar upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const navigate = useNavigate();

  // Fetch user profile data from Firestore
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setProfile({
            id: userDoc.id,
            ...userDoc.data()
          });
        } else {
          // Create a default profile if it doesn't exist
          const defaultProfile = {
            displayName: user.displayName || 'User',
            email: user.email,
            photoURL: user.photoURL || '',
            createdAt: serverTimestamp(),
            plan_type: "free",
            requests_limit: 75,
            requests_used: 0,
            preferences: {}
          };
          
          await updateDoc(userDocRef, defaultProfile);
          setProfile({
            id: user.uid,
            ...defaultProfile
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [user]);

  /**
   * Handle profile picture upload
   */
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create storage reference
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      
      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        // Progress callback
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        // Error callback
        (error) => {
          console.error("Upload failed:", error);
          toast.error('Failed to upload image. Please try again.');
          setIsUploading(false);
        },
        // Complete callback
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Update user profile in Firebase Auth
            await updateProfile(user, { photoURL: downloadURL });
            
            // Update Firestore document
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { photoURL: downloadURL });
            
            // Update local state
            setProfile(prev => ({
              ...prev,
              photoURL: downloadURL
            }));
            
            toast.success('Profile picture updated successfully');
          } catch (err) {
            console.error("Error updating profile with new image:", err);
            toast.error('Failed to update profile picture');
          } finally {
            setIsUploading(false);
          }
        }
      );
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  /**
   * Update profile information (name, email, etc.)
   */
  const updateProfileInfo = async (updatedData) => {
    try {
      // Update displayName in Firebase Auth if it has changed
      if (updatedData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { 
          displayName: updatedData.displayName 
        });
      }
      
      // Update email in Firebase Auth if it has changed
      if (updatedData.email !== user.email) {
        await updateEmail(auth.currentUser, updatedData.email);
      }
      
      // Update Firestore document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: updatedData.displayName,
        email: updatedData.email,
        preferences: updatedData.preferences || profile.preferences || {}
      });
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        displayName: updatedData.displayName,
        email: updatedData.email,
        preferences: updatedData.preferences || prev.preferences || {}
      }));
      
      toast.success('Profile updated successfully');
      setShowEditProfile(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/requires-recent-login') {
        toast.error('For security, please log out and log back in to change your email');
      } else {
        toast.error('Failed to update profile: ' + err.message);
      }
    }
  };

  /**
   * Change user password
   */
  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Change password
      await updatePassword(auth.currentUser, newPassword);
      
      toast.success('Password updated successfully');
      setShowChangePassword(false);
    } catch (err) {
      console.error("Error changing password:", err);
      
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to change password: ' + err.message);
      }
    }
  };

  /**
   * Delete user account
   */
  const deleteAccount = async (password) => {
    try {
      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete the user from Firebase Auth
      await deleteUser(auth.currentUser);
      
      toast.success('Account deleted successfully');
      navigate('/signup');
    } catch (err) {
      console.error("Error deleting account:", err);
      
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/wrong-password') {
        toast.error('Password is incorrect');
      } else {
        toast.error('Failed to delete account: ' + err.message);
      }
    }
  };

  /**
   * Redirect to Stripe customer portal for subscription management
   */
  const manageSubscription = async () => {
    try {
      const portalUrl = await createStripeCheckout(user.uid, window.location.origin);
      window.location.href = portalUrl;
    } catch (err) {
      console.error("Error redirecting to customer portal:", err);
      toast.error('Failed to open subscription management portal');
    }
  };

  /**
   * Buy Flex pack for additional requests
   */
  const buyFlexPack = async () => {
    try {
      const checkoutUrl = await createStripeCheckout(
        user.uid, 
        window.location.origin, 
        'price_flexy' // Replace with your actual Flex pack price ID
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Error creating checkout session:", err);
      toast.error('Failed to create checkout session');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-red-500 mb-2">Error Loading Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Format date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Handle regular date
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return 'N/A';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
      {/* Profile Header */}
      <div className="bg-purple-600 dark:bg-purple-700 rounded-lg overflow-hidden mb-8">
        <div className="relative p-6">
          {/* Profile Actions */}
          <button
            onClick={() => setShowEditProfile(true)}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
          >
            <Edit size={14} className="mr-1" />
            Edit Profile
          </button>
          
          {/* User Information */}
          <div className="flex flex-col md:flex-row items-center md:items-start text-white">
            {/* Avatar with upload functionality */}
            <div className="relative w-24 h-24 mb-4 md:mb-0 md:mr-6">
              <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
                {profile?.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                    <User size={40} className="text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Upload button */}
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center cursor-pointer border-2 border-white dark:border-gray-700 hover:bg-gray-700 transition-colors"
              >
                <Camera size={14} className="text-white" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
              
              {/* Upload progress indicator */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="text-center">
                    <div className="h-1 w-16 bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white mt-1">{Math.round(uploadProgress)}%</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* User details */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile?.displayName || 'User'}</h1>
              <div className="flex items-center justify-center md:justify-start text-white text-opacity-90 mt-1">
                <span className="text-sm">{profile?.email}</span>
              </div>
              
              {/* Subscription details */}
              <div className="flex flex-col md:flex-row md:items-center mt-2 space-y-2 md:space-y-0 md:space-x-6">
                <div className="flex items-center justify-center md:justify-start text-white text-opacity-80 text-sm">
                  <Calendar size={14} className="mr-1" />
                  <span>Member since: {formatDate(profile?.createdAt)}</span>
                </div>
                
                <div className="flex items-center justify-center md:justify-start text-white text-opacity-80 text-sm">
                  <CreditCard size={14} className="mr-1" />
                  <span>
                    Subscription: 
                    <span className="ml-1 font-medium">
                      {profile?.plan_type === 'premium' 
                        ? 'Premium Plan' 
                        : profile?.plan_type === 'basic' 
                          ? 'Basic Plan' 
                          : profile?.plan_type === 'flexy' 
                            ? 'Flex Pack' 
                            : 'Free Plan'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Usage Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage Statistics</h2>
        
        {/* Current Plan */}
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Plan: 
              <span className="ml-1 text-purple-600 dark:text-purple-400 font-semibold">
                {profile?.plan_type === 'premium' 
                  ? 'Premium Plan' 
                  : profile?.plan_type === 'basic' 
                    ? 'Basic Plan' 
                    : profile?.plan_type === 'flexy' 
                      ? 'Flex Pack' 
                      : 'Free Plan'}
              </span>
            </h3>
            
            {/* Only show renewal date for premium/basic plans */}
            {(profile?.plan_type === 'premium' || profile?.plan_type === 'basic') && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Renews in: {profile?.next_billing_date 
                  ? formatDate(profile.next_billing_date) 
                  : '30 days'}
              </p>
            )}
          </div>
          
          {/* Renews in X days badge */}
          <div className="mt-2 md:mt-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <Clock size={12} className="mr-1" />
              Renews in: 181 days
            </span>
          </div>
        </div>
        
        {/* Usage progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Request Usage</h3>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {profile?.requests_used || 0}/{profile?.requests_limit || 75}
            </span>
          </div>
          <ProgressBar 
            value={profile?.requests_used || 0} 
            max={profile?.requests_limit || 75}
            className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
            fillClassName="bg-blue-600 dark:bg-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {profile?.requests_limit - profile?.requests_used || 75} requests remaining
          </p>
        </div>
        
        {/* Subscription actions */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Display different buttons based on subscription status */}
          {profile?.plan_type === 'free' ? (
            <>
              <button 
                onClick={() => setShowUpgradeSubscription(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Upgrade to Premium
              </button>
              <button
                onClick={buyFlexPack}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Buy Flex Pack
              </button>
            </>
          ) : (
            <>
              <button
                onClick={manageSubscription}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Manage Subscription
              </button>
              
              {/* Only show "Buy Flex Pack" button for basic/premium plans */}
              {(profile?.plan_type === 'premium' || profile?.plan_type === 'basic') && (
                <button
                  onClick={buyFlexPack}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Add Flex packs for additional requests
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Low credit warning */}
        {profile?.requests_used >= (profile?.requests_limit * 0.8) && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">You're out low on requests!</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  {profile?.plan_type === 'free' 
                    ? 'Upgrade to Premium for more requests or buy a Flex Pack.' 
                    : 'Consider adding a Flex Pack for additional requests.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Posts Generated"
          count={0}
          icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
          subtitle="Limit: 150/month"
        />
        
        <StatsCard 
          title="Drafts Saved"
          count={0}
          icon={<Edit className="h-5 w-5 text-purple-500" />}
          subtitle="Limits: 25"
        />
        
        <StatsCard 
          title="Posts Shared"
          count={0}
          icon={<UploadCloud className="h-5 w-5 text-green-500" />}
          subtitle="Across all platforms"
        />
      </div>
      
      {/* Shares by Platform */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shares by Platform</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <PlatformShareCard platform="twitter" count={0} />
          <PlatformShareCard platform="linkedin" count={0} />
          <PlatformShareCard platform="facebook" count={0} />
          <PlatformShareCard platform="other" count={0} />
        </div>
      </div>
      
      {/* Recent Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h2>
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <p>No posts shared yet</p>
        </div>
      </div>
      
      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Lock size={14} className="mr-1.5" />
              Change Password
            </button>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => setShowDeleteAccount(true)}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-800 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 size={14} className="mr-1.5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showEditProfile && (
        <EditProfileModal 
          profile={profile}
          onClose={() => setShowEditProfile(false)}
          onSubmit={updateProfileInfo}
        />
      )}
      
      {showChangePassword && (
        <ChangePasswordModal 
          onClose={() => setShowChangePassword(false)}
          onSubmit={changePassword}
        />
      )}
      
      {showDeleteAccount && (
        <DeleteAccountModal 
          onClose={() => setShowDeleteAccount(false)}
          onDelete={deleteAccount}
        />
      )}
      
      {showUpgradeSubscription && (
        <UpgradeSubscriptionModal 
          onClose={() => setShowUpgradeSubscription(false)}
          onSelectPlan={manageSubscription}
          currentPlan={profile?.plan_type}
        />
      )}
    </div>
  );
}