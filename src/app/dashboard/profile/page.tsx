'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';

/**
 * Customer Profile interface with extended fields
 */
interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Customer Profile Page
 * Displays and allows editing of customer profile information
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */
export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Profile form state
  const [profile, setProfile] = useState<CustomerProfile>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
  });
  
  // Form validation errors
  const [errors, setErrors] = useState<Partial<CustomerProfile>>({});
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    eventReminders: true,
  });

  // Update profile when user changes
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerProfile> = {};
    
    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (profile.phone && !/^[\d\s\-\+\(\)]+$/.test(profile.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (profile.zipCode && !/^[\d\-]+$/.test(profile.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, this would update the user in the backend
      // For now, we just show success message
      setShowSuccess(true);
      setIsEditing(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input change
  const handleChange = (field: keyof CustomerProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle preference change
  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
            <p className="text-green-700 dark:text-green-400 font-medium">
              Profile updated successfully!
            </p>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        {/* Profile Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 capitalize mt-1">
                  {user?.role || 'Customer'} Account
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                  errors.name
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                  errors.email
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                  errors.phone
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => handleChange('city', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                State / Province
              </label>
              <input
                type="text"
                value={profile.state}
                onChange={(e) => handleChange('state', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                value={profile.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                  errors.zipCode
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => handleChange('country', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setErrors({});
                  // Reset to original values
                  setProfile({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: '+1 (555) 123-4567',
                    address: '123 Main Street',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94102',
                    country: 'United States',
                  });
                }}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Security
        </h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last changed 30 days ago
            </p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive order confirmations and updates via email' },
            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive text messages for important updates' },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional offers and event recommendations' },
            { key: 'eventReminders', label: 'Event Reminders', description: 'Get reminded about upcoming events you have tickets for' },
          ].map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">{label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
              </div>
              <button
                onClick={() => handlePreferenceChange(key as keyof typeof preferences)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences[key as keyof typeof preferences]
                    ? 'bg-indigo-600'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
                role="switch"
                aria-checked={preferences[key as keyof typeof preferences]}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences[key as keyof typeof preferences]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">Delete Account</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Permanently delete your account and all associated data
            </p>
          </div>
          <button className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium">
            Delete Account
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

/**
 * Password Change Modal Component
 */
function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Change Password
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✓</div>
            <p className="text-green-600 dark:text-green-400 font-medium">
              Password changed successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
