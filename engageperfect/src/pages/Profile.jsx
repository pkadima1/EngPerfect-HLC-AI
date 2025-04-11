/**
 * File: Profile.jsx
 * Version: 1.1.0
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
  deleteDoc, 
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
  // Get auth context including updateProfile function
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showUpgradeSubscription, setShowUpgradeSubscription] = useState(false);

  // Fetch user profile data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setProfile({
              id: user.uid,
              ...userDoc.data(),
              displayName: user.displayName || userDoc.data().displayName || 'User',
              email: user.email || userDoc.data().email,
              photoURL: user.photoURL || userDoc.data().photoURL
            });
          } else {
            // Create a default profile if none exists
            const defaultProfile = {
              displayName: user.displayName || 'User',
              email: user.email,
              createdAt: serverTimestamp(),
              plan_type: 'free',
              requests_used: 0,
              requests_limit: 75,
              preferences: {},
              stats: {
                totalContentCreated: 0,
                monthlyContentCreated: 0,
                avgGenerationTime: 0,
                platformDistribution: {
                  twitter: 0,
                  linkedin: 0,
                  facebook: 0,
                  other: 0
                }
              }
            };
            await updateDoc(userDocRef, defaultProfile);
            setProfile({
              id: user.uid,
              ...defaultProfile
            });
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Handle profile photo upload
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Update the storage path to use profile_pictures folder
      const storageRef = ref(storage, `profile_pictures/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          toast.error('Failed to upload image: ' + error.message);
          setIsUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Use the updateProfile from context
            if (typeof updateProfile === 'function') {
              await updateProfile({
                displayName: user.displayName,
                photoURL: downloadURL
              });
            } else {
              console.error("updateProfile is not a function");
              toast.error("Could not update profile photo. Please try again later.");
              setIsUploading(false);
              return;
            }
            
            // Update Firestore directly as a fallback
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
              photoURL: downloadURL
            });
            
            // Update local state
            setProfile(prev => ({
              ...prev,
              photoURL: downloadURL
            }));
            
            toast.success('Profile photo updated successfully');
          } catch (err) {
            console.error("Error updating profile with new photo:", err);
            toast.error('Failed to update profile with new photo: ' + err.message);
          } finally {
            setIsUploading(false);
          }
        }
      );
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error('Failed to upload photo: ' + error.message);
      setIsUploading(false);
    }
  };

  // Handle profile update
  const updateProfileInfo = async (updatedData) => {
    try {
      // Use the updateProfile function from context
      if (typeof updateProfile === 'function') {
        await updateProfile({
          displayName: updatedData.displayName,
          email: updatedData.email,
          preferences: updatedData.preferences
        });
      } else {
        // Fallback if updateProfile is not available from context
        // Update Firebase Auth display name
        await auth.currentUser.updateProfile({
          displayName: updatedData.displayName
        });
        
        // Update email if it changed
        if (updatedData.email !== user.email) {
          await updateEmail(auth.currentUser, updatedData.email);
        }
        
        // Update Firestore
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          displayName: updatedData.displayName,
          email: updatedData.email,
          preferences: updatedData.preferences || {}
        });
      }
      
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
        toast.error('Failed to update profile: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // Handle password change
  const handlePasswordChange = async (data) => {
    try {
      // Reauthenticate the user first
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Then change the password
      await updatePassword(auth.currentUser, data.newPassword);
      
      toast.success('Password changed successfully');
      setShowChangePassword(false);
    } catch (err) {
      console.error("Error changing password:", err);
      if (err.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to change password: ' + err.message);
      }
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (password) => {
    try {
      // Reauthenticate the user first
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete the user document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      await deleteDoc(userDocRef);
      
      // Delete the user from Firebase Auth
      await deleteUser(auth.currentUser);
      
      toast.success('Your account has been deleted');
      navigate('/signup');
    } catch (err) {
      console.error("Error deleting account:", err);
      if (err.code === 'auth/wrong-password') {
        toast.error('Password is incorrect');
      } else {
        toast.error('Failed to delete account: ' + err.message);
      }
    }
  };

  // Handle subscription upgrade
  const handleUpgradeSubscription = async (planType) => {
    try {
      // Create checkout session and redirect to payment
      const checkoutUrl = await createStripeCheckout(user.uid, window.location.origin, planType);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Error upgrading subscription:", err);
      toast.error('Failed to upgrade subscription: ' + err.message);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Profile</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="relative p-6">
          {/* Profile Actions */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => setShowEditProfile(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1.5 rounded-md text-sm flex items-center transition-colors"
            >
              <Edit size={16} className="mr-1.5" />
              Edit Profile
            </button>
            <button
              onClick={() => setShowChangePassword(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1.5 rounded-md text-sm flex items-center transition-colors"
            >
              <Lock size={16} className="mr-1.5" />
              Change Password
            </button>
          </div>
          
          {/* User Information */}
          <div className="flex flex-col md:flex-row items-center md:items-start text-white">
            {/* Avatar with upload functionality */}
            <div className="relative w-24 h-24 mb-4 md:mb-0 md:mr-6">
              <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden shadow-md border-2 border-white">
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
                  onChange={handlePhotoUpload}
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
              
              {/* Subscription badge */}
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                  <CreditCard size={12} className="mr-1" />
                  {profile?.plan_type === 'premium' 
                    ? 'Premium Plan' 
                    : profile?.plan_type === 'basic' 
                      ? 'Basic Plan' 
                      : 'Free Plan'}
                </span>
              </div>
              
              {/* Member since */}
              <div className="flex items-center justify-center md:justify-start text-white text-opacity-80 text-sm mt-2">
                <Calendar size={14} className="mr-1.5" />
                <span>Member since: {formatDate(profile?.createdAt)}</span>
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
                  : '181 days'}
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
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500"
              style={{ width: `${((profile?.requests_used || 0) / (profile?.requests_limit || 75)) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {(profile?.requests_limit || 75) - (profile?.requests_used || 0)} requests remaining
          </p>
        </div>
        
        {/* Low credit warning */}
        {((profile?.requests_used || 0) / (profile?.requests_limit || 75)) > 0.8 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">You're running out of requests!</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  {profile?.plan_type === 'free' 
                    ? 'Upgrade to Premium for more requests or buy a Flex Pack.' 
                    : 'Consider adding a Flex Pack for additional requests.'}
                </p>
                <div className="mt-3 flex space-x-3">
                  {profile?.plan_type === 'free' && (
                    <button 
                      onClick={() => setShowUpgradeSubscription(true)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-700"
                    >
                      Upgrade Plan
                    </button>
                  )}
                  <button 
                    onClick={() => handleUpgradeSubscription('flexy')}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-700"
                  >
                    Add Flex Pack
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Subscription actions */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
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
                onClick={() => handleUpgradeSubscription('flexy')}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Buy Flex Pack
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleUpgradeSubscription('manage')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Manage Subscription
              </button>
              
              {/* Only show "Buy Flex Pack" button for basic/premium plans */}
              {(profile?.plan_type === 'premium' || profile?.plan_type === 'basic') && (
                <button
                  onClick={() => handleUpgradeSubscription('flexy')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Add Flex Pack
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
              <UploadCloud size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Content Created
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {profile?.stats?.totalContentCreated || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Limit: 150/month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
              <Edit size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Drafts Saved
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {profile?.stats?.draftsSaved || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Limit: 25
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Posts Shared
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {profile?.stats?.postsShared || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Across all platforms
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shares by Platform */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Distribution by Platform</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <PlatformShareCard platform="twitter" count={profile?.stats?.platformDistribution?.twitter || 0} />
          <PlatformShareCard platform="linkedin" count={profile?.stats?.platformDistribution?.linkedin || 0} />
          <PlatformShareCard platform="facebook" count={profile?.stats?.platformDistribution?.facebook || 0} />
          <PlatformShareCard platform="other" count={profile?.stats?.platformDistribution?.other || 0} />
        </div>
      </div>
      
      {/* Recent Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h2>
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          <UploadCloud size={40} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <p className="text-lg font-medium">No posts shared yet</p>
          <p className="mt-1">Your published content will appear here</p>
        </div>
      </div>
      
      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center text-red-600 dark:text-red-400 mb-6">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h2 className="text-lg font-semibold">Danger Zone</h2>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
             <div className="mb-4 sm:mb-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Once deleted, your account and all associated data will be permanently removed.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteAccount(true)}
              className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-700 text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
            >
              <Trash2 size={16} className="mr-2" />
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
          onSubmit={handlePasswordChange}
        />
      )}
      
      {showDeleteAccount && (
        <DeleteAccountModal 
          onClose={() => setShowDeleteAccount(false)}
          onDelete={handleDeleteAccount}
        />
      )}
      
      {showUpgradeSubscription && (
        <UpgradeSubscriptionModal 
          onClose={() => setShowUpgradeSubscription(false)}
          onSelectPlan={handleUpgradeSubscription}
          currentPlan={profile?.plan_type || 'free'}
        />
      )}
    </div>
  );
}