'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import { apiPut, apiGet } from '@/modules/shared-common/utils/api';
import ChangePasswordModal from '@/modules/authentication/components/ChangePasswordModal';
import DeleteAccountModal from '@/modules/authentication/components/DeleteAccountModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/modules/shared-common/components/ui/tabs';
import { Card } from '@/modules/shared-common/components/ui/card';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';
import { PhoneInput } from '@/modules/shared-common/components/ui/phone-input';
import { Alert } from '@/modules/shared-common/components/ui/alert';

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
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
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
        <Alert variant="success" title="Success" message="Profile updated successfully!" />
      )}

      {changePasswordSuccess && (
        <Alert variant="success" title="Success" message="Password changed successfully!" />
      )}

      <Card>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
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
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start border-b border-slate-200 dark:border-slate-800 rounded-none bg-transparent p-0">
            <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600">
              Profile Info
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600">
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600">
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                <Input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  error={errors.firstName}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                <Input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  error={errors.lastName}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled={true}
                  error={errors.email}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                <PhoneInput
                  value={profile.phoneNumber}
                  onChange={(val) => handleChange('phoneNumber', val)}
                  disabled={!isEditing}
                />
                {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Street Address</label>
                <Input
                  type="text"
                  value={profile.streetAddress}
                  onChange={(e) => handleChange('streetAddress', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City</label>
                <Input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State / Province</label>
                <Input
                  type="text"
                  value={profile.stateProvince}
                  onChange={(e) => handleChange('stateProvince', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ZIP / Postal Code</label>
                <Input
                  type="text"
                  value={profile.zipPostalCode}
                  onChange={(e) => handleChange('zipPostalCode', e.target.value)}
                  disabled={!isEditing}
                  error={errors.zipPostalCode}
                />
                {errors.zipPostalCode && <p className="mt-1 text-sm text-red-500">{errors.zipPostalCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Country</label>
                <Input
                  type="text"
                  value={profile.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || Object.keys(errors).length > 0}
                  variant="default"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setErrors({});
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}

            {!isEditing && (
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="default"
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="security" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Password & Security</h3>
              <Button
                onClick={() => setShowChangePasswordModal(true)}
                variant="default"
              >
                Change Password
              </Button>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Add an extra layer of security by requiring a verification code when you sign in.
              </p>
              <a
                href="/dashboard/security"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Manage 2FA
              </a>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
                Your personal data will be anonymized in compliance with GDPR regulations.
              </p>
              <Button
                onClick={() => setShowDeleteAccountModal(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Delete Account
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Theme Preference</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">Choose your preferred theme for the platform</p>
              <div className="flex gap-4">
                <Button variant="outline">Light Mode</Button>
                <Button variant="outline">Dark Mode</Button>
                <Button variant="outline">System Default</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          setChangePasswordSuccess(true);
          setTimeout(() => setChangePasswordSuccess(false), 3000);
        }}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
      />
    </div>
  );
}

