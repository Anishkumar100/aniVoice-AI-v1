'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { authAPI } from '@/lib/api/auth';
import conversationAPI from '@/lib/api/conversations';
import { paymentAPI } from '@/lib/api/payment';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar,
  MessageSquare,
  Crown,
  Loader2,
  Save,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logoutUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    conversationCount: 0,
    messageCount: 0,
    isPremium: false
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ Security Question form
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    currentSecurityQuestion: ''
  });

  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [updatingSecurity, setUpdatingSecurity] = useState(false);

  useEffect(() => {
    fetchData();
    fetchSecurityQuestions();
  }, []);

  const fetchSecurityQuestions = async () => {
    try {
      const questions = await authAPI.getSecurityQuestions();
      setSecurityQuestions(questions);
    } catch (error) {
      console.error('Error fetching security questions:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profile = await authAPI.getProfile();
      setProfileForm({
        name: profile.name || '',
        email: profile.email || ''
      });

      // ✅ Set current security question
      setSecurityForm(prev => ({
        ...prev,
        currentSecurityQuestion: profile.securityQuestion || '',
        securityQuestion: profile.securityQuestion || ''
      }));

      // Fetch stats
      const [conversations, subscription] = await Promise.all([
        conversationAPI.getAllConversations(),
        paymentAPI.getSubscription().catch(() => ({ hasPremiumAccess: false }))
      ]);

      const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);

      setStats({
        conversationCount: conversations.length,
        messageCount: totalMessages,
        isPremium: subscription.hasPremiumAccess,
        memberSince: profile.createdAt
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setSaving(true);
      await authAPI.updateProfile(profileForm);
      toast.success('Profile updated successfully', { icon: '✅' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await authAPI.changePassword(passwordForm);
      toast.success('Password changed successfully', { icon: '🔒' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // ✅ Handle Security Question Update
  const handleSecurityUpdate = async (e) => {
    e.preventDefault();

    if (!securityForm.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!securityForm.securityAnswer.trim()) {
      toast.error('Security answer is required');
      return;
    }

    try {
      setUpdatingSecurity(true);
      await authAPI.updateSecurityQuestion({
        currentPassword: securityForm.currentPassword,
        securityQuestion: securityForm.securityQuestion,
        securityAnswer: securityForm.securityAnswer
      });
      
      toast.success('Security question updated successfully', { icon: '🛡️' });
      
      // Clear form
      setSecurityForm({
        currentPassword: '',
        securityQuestion: securityForm.securityQuestion,
        securityAnswer: '',
        currentSecurityQuestion: securityForm.securityQuestion
      });
      
      // Refresh profile data
      fetchData();
    } catch (error) {
      console.error('Error updating security question:', error);
      toast.error(error.response?.data?.message || 'Failed to update security question');
    } finally {
      setUpdatingSecurity(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your conversations and data will be permanently deleted.'
    );

    if (!confirmed) return;

    const doubleCheck = window.prompt('Type "DELETE" to confirm account deletion:');
    
    if (doubleCheck !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    try {
      await authAPI.deleteAccount();
      toast.success('Account deleted successfully');
      logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-2 border-gray-200 dark:border-gray-800 rounded-full" />
            <div className="absolute inset-0 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950">
      <div className="container max-w-4xl py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 shadow-lg shadow-rose-500/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-purple-600 dark:from-white dark:via-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.conversationCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Conversations</p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.messageCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Messages Sent</p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.isPremium ? 'bg-amber-100 dark:bg-amber-950/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <Crown className={`w-5 h-5 ${stats.isPremium ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.isPremium ? 'Pro' : 'Free'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Plan Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-rose-600" />
            Profile Information
          </h2>
          
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-rose-500 transition-all text-sm"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-rose-500 transition-all text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {stats.memberSince && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2">
                <Calendar className="w-4 h-4" />
                <span>Member since {new Date(stats.memberSince).toLocaleDateString()}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-rose-500/30 transition-all font-medium disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-600" />
            Change Password
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-rose-500 transition-all text-sm pr-12"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-rose-500 transition-all text-sm pr-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-rose-500 transition-all text-sm pr-12"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Changing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ✅ Security Question Section (NEW) */}
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-600" />
            Security Question
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Update your security question for account recovery
          </p>

          {/* Current Security Question Display */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Question</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {securityForm.currentSecurityQuestion || 'Not set'}
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSecurityUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showSecurityPassword ? 'text' : 'password'}
                  value={securityForm.currentPassword}
                  onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-rose-500 transition-all text-sm"
                  placeholder="Enter your password to verify"
                />
                <button
                  type="button"
                  onClick={() => setShowSecurityPassword(!showSecurityPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecurityPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Security Question
              </label>
              <select
                value={securityForm.securityQuestion}
                onChange={(e) => setSecurityForm({...securityForm, securityQuestion: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-rose-500 transition-all text-sm"
              >
                {securityQuestions.map((question, index) => (
                  <option key={index} value={question}>{question}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Answer
              </label>
              <input
                type="text"
                value={securityForm.securityAnswer}
                onChange={(e) => setSecurityForm({...securityForm, securityAnswer: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-rose-500 transition-all text-sm"
                placeholder="Your new answer"
              />
            </div>

            <button
              type="submit"
              disabled={updatingSecurity}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all font-medium disabled:opacity-50"
            >
              {updatingSecurity ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Update Security Question</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
