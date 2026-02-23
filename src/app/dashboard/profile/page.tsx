'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { apiPut, apiGet } from '@/lib/utils/api';
import DeleteAccountModal from '@/components/shared/DeleteAccountModal';
import ChangePasswordModal from '@/components/shared/ChangePasswordModal';

interface CustomerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  zipPostalCode: string;
  country: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);
  
  const [profile, setProfile] = useState<CustomerProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    zipPostalCode: '',
    country: '',
  });
  
  const [errors, setErrors] = useState<Partial<CustomerProfile>>({});

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet<any>('/auth/me');
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          streetAddress: data.streetAddress || '',
          city: data.city || '',
          stateProvince: data.stateProvince || '',
          zipPostalCode: data.zipPostalCode || '',
          country: data.country || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerProfile> = {};
    
    // First name validation
    if (!profile.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (profile.firstName.trim().length > 100) {
      newErrors.firstName = 'First name must not exceed 100 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(profile.firstName.trim())) {
      newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    // Last name validation
    if (!profile.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (profile.lastName.trim().length > 100) {
      newErrors.lastName = 'Last name must not exceed 100 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(profile.lastName.trim())) {
      newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    // Email validation (read-only, but validate format)
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone number validation (optional)
    if (profile.phoneNumber && profile.phoneNumber.trim()) {
      const phone = profile.phoneNumber.trim();
      if (phone.length < 7 || phone.length > 20) {
        newErrors.phoneNumber = 'Phone number must be between 7 and 20 characters';
      } else if (!/^[0-9\-\+\s\(\)]+$/.test(phone)) {
        newErrors.phoneNumber = 'Phone number can only contain numbers, spaces, hyphens, plus, and parentheses';
      }
    }
    
    // Street address validation (optional)
    if (profile.streetAddress && profile.streetAddress.trim().length > 255) {
      newErrors.streetAddress = 'Street address must not exceed 255 characters';
    }
    
    // City validation (optional)
    if (profile.city && profile.city.trim()) {
      const city = profile.city.trim();
      if (city.length > 100) {
        newErrors.city = 'City must not exceed 100 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(city)) {
        newErrors.city = 'City can only contain letters, spaces, hyphens, and apostrophes';
      }
    }
    
    // State/Province validation (optional)
    if (profile.stateProvince && profile.stateProvince.trim().length > 100) {
      newErrors.stateProvince = 'State/Province must not exceed 100 characters';
    }
    
    // ZIP code validation (optional)
    if (profile.zipPostalCode && profile.zipPostalCode.trim()) {
      const zip = profile.zipPostalCode.trim();
      if (zip.length < 1 || zip.length > 20) {
        newErrors.zipPostalCode = 'ZIP code must be between 1 and 20 characters';
      } else if (!/^[0-9\-]+$/.test(zip)) {
        newErrors.zipPostalCode = 'ZIP code can only contain numbers and hyphens';
      }
    }
    
    // Country validation (optional)
    if (profile.country && profile.country.trim().length > 100) {
      newErrors.country = 'Country must not exceed 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const response = await apiPut<CustomerProfile>('/auth/profile', profile);
      setProfile(response);
      setShowSuccess(true);
      setIsEditing(false);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof CustomerProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings</p>
      </div>

      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-400 font-medium">Profile updated successfully!</p>
        </div>
      )}

      {changePasswordSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-400 font-medium">Password changed successfully!</p>
        </div>
      )}

      {deleteSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-400 font-medium">Account deleted successfully. Redirecting to login...</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{fullName}</h2>
                <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 capitalize mt-1">
                  {user?.role || 'Customer'} Account
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  ✏️ Edit Profile
                </button>
              )}
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                🔐 Change Password
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                    errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                />
                {isEditing && !errors.firstName && profile.firstName.trim() && (
                  <span className="absolute right-3 top-2.5 text-green-500">✓</span>
                )}
              </div>
              {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                    errors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                />
                {isEditing && !errors.lastName && profile.lastName.trim() && (
                  <span className="absolute right-3 top-2.5 text-green-500">✓</span>
                )}
              </div>
              {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={true}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                  errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                    errors.phoneNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                />
                {isEditing && !errors.phoneNumber && profile.phoneNumber.trim() && (
                  <span className="absolute right-3 top-2.5 text-green-500">✓</span>
                )}
              </div>
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Street Address</label>
              <input
                type="text"
                value={profile.streetAddress}
                onChange={(e) => handleChange('streetAddress', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => handleChange('city', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State / Province</label>
              <input
                type="text"
                value={profile.stateProvince}
                onChange={(e) => handleChange('stateProvince', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ZIP / Postal Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.zipPostalCode}
                  onChange={(e) => handleChange('zipPostalCode', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
                    errors.zipPostalCode ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                />
                {isEditing && !errors.zipPostalCode && profile.zipPostalCode.trim() && (
                  <span className="absolute right-3 top-2.5 text-green-500">✓</span>
                )}
              </div>
              {errors.zipPostalCode && <p className="mt-1 text-sm text-red-500">{errors.zipPostalCode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => handleChange('country', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleSave}
                disabled={isSaving || Object.keys(errors).length > 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setErrors({});
                }}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={() => setDeleteSuccess(true)}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          setChangePasswordSuccess(true);
          setTimeout(() => setChangePasswordSuccess(false), 3000);
        }}
      />
    </div>
  );
}
