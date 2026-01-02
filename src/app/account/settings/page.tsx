'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Lock, Loader2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();

  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      try {
        const response = await fetch('/api/account/profile');
        if (response.ok) {
          const data = await response.json();
          setFirstName(data.user?.firstName || '');
          setLastName(data.user?.lastName || '');
          setPhone(data.user?.phone || '');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    }

    if (session?.user?.id) {
      loadUserData();
    }
  }, [session?.user?.id]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone: phone || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfileSuccess(true);
      // Update session with new name
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: `${firstName} ${lastName}`,
        },
      });

      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const passwordRequirements = [
    { met: newPassword.length >= 10, text: 'At least 10 characters' },
    { met: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
    { met: /[a-z]/.test(newPassword), text: 'One lowercase letter' },
    { met: /[0-9]/.test(newPassword), text: 'One number' },
    { met: /[^A-Za-z0-9]/.test(newPassword), text: 'One special character' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl text-ivory">Account Settings</h2>

      {/* Profile Information */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-display text-lg text-ivory">Profile Information</h3>
            <p className="text-gray text-sm">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="form-input w-full"
                required
                disabled={profileLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="form-input w-full"
                required
                disabled={profileLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={session?.user?.email || ''}
              className="form-input w-full opacity-50"
              disabled
            />
            <p className="text-gray text-xs mt-1">Email cannot be changed</p>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number <span className="text-gray">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input w-full"
              placeholder="(555) 555-5555"
              disabled={profileLoading}
            />
          </div>

          {profileError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              <Check className="w-4 h-4 flex-shrink-0" />
              Profile updated successfully
            </div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            className="btn btn-primary"
          >
            {profileLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-display text-lg text-ivory">Change Password</h3>
            <p className="text-gray text-sm">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input w-full pr-12"
                required
                disabled={passwordLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray hover:text-ivory transition-colors"
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input w-full pr-12"
                required
                disabled={passwordLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray hover:text-ivory transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="mt-3 space-y-1.5">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.text}
                    className={`flex items-center gap-2 text-xs ${
                      req.met ? 'text-green-400' : 'text-gray'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                    {req.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input w-full"
              required
              disabled={passwordLoading}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              <Check className="w-4 h-4 flex-shrink-0" />
              Password changed successfully
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="btn btn-primary"
          >
            {passwordLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
