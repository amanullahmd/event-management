'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { getOrganizerById } from '@/lib/dummy-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Building2, MapPin, Globe, Shield, Bell, Trash2 } from 'lucide-react';

interface OrganizerProfile {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  website: string;
  description: string;
}

export default function OrganizerProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const organizer = user ? getOrganizerById(user.id) : null;

  const [profile, setProfile] = useState<OrganizerProfile>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 987-6543',
    businessName: organizer?.businessName || 'My Events Company',
    businessAddress: '456 Event Plaza, Suite 100',
    website: 'https://myevents.com',
    description: 'Professional event organizer specializing in tech conferences and workshops.',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    salesAlerts: true,
    weeklyReports: true,
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
    if (organizer) {
      setProfile(prev => ({
        ...prev,
        businessName: organizer.businessName,
      }));
    }
  }, [user, organizer]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowSuccess(true);
    setIsEditing(false);
    setIsSaving(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChange = (field: keyof OrganizerProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your organizer account</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
            <span className="text-xl">✓</span> Profile updated successfully!
          </p>
        </div>
      )}

      {/* Profile Card */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    organizer?.verificationStatus === 'verified' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {organizer?.verificationStatus || 'Pending'} Organizer
                  </span>
                </div>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="bg-violet-600 hover:bg-violet-700 text-white">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Building2 className="w-4 h-4" /> Business Name
              </label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4" /> Business Address
              </label>
              <input
                type="text"
                value={profile.businessAddress}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4" /> Website
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => handleChange('website', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Business Description
              </label>
              <textarea
                value={profile.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed resize-none"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <Button onClick={handleSave} disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Security */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Security
        </h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 30 days ago</p>
          </div>
          <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notification Preferences
        </h2>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive text messages' },
            { key: 'salesAlerts', label: 'Sales Alerts', desc: 'Get notified when tickets are sold' },
            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly performance summaries' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
              <button
                onClick={() => setPreferences(p => ({ ...p, [key]: !p[key as keyof typeof preferences] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  preferences[key as keyof typeof preferences] ? 'bg-violet-600' : 'bg-gray-300 dark:bg-slate-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences[key as keyof typeof preferences] ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-white dark:bg-slate-800 border-red-200 dark:border-red-900/50 p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5" /> Danger Zone
        </h2>
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Delete Account</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your organizer account</p>
          </div>
          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400">
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white dark:bg-slate-800 max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
            <div className="space-y-4">
              <input type="password" placeholder="Current Password" className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
              <input type="password" placeholder="New Password" className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
              <input type="password" placeholder="Confirm New Password" className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
            </div>
            <div className="flex gap-3 mt-6">
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">Change Password</Button>
              <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
