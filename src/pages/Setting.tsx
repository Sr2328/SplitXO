import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, Download, Trash2, Loader, ChevronRight, User, Bell, Lock, Settings as SettingsIcon, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import type { User as SupabaseUser } from '@supabase/auth-js';
import { useNavigate } from 'react-router-dom';
import VerseLoading from '@/components/ui/Verselaoding';

type SettingsGrouped = {
  notifications: Record<string, boolean>;
  privacy: Record<string, boolean>;
  preferences: Record<string, any>;
};

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
  });

  const [settings, setSettings] = useState<SettingsGrouped>({
    notifications: {
      notification_expense_updates: true,
      notification_settlement_reminders: true,
      notification_group_invites: true,
      notification_weekly_report: false,
    },
    privacy: {
      privacy_show_profile: true,
      privacy_show_activity: false,
      privacy_two_factor_auth: false,
    },
    preferences: {
      preference_currency: 'INR',
      preference_default_category: 'food',
      preference_auto_settle: false,
      preference_theme: 'light',
    },
  });

  // Fetch user on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (!user) {
          navigate('/');
          return;
        }
        
        setUser(user);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to authenticate user');
        navigate('/');
      }
    };
    
    initUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate('/');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    }
  }, [user?.id]);

  const fetchSettings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      if (profileData) {
        setProfileData({
          full_name: profileData.full_name || '',
          email: profileData.email || user.email || '',
          avatar_url: profileData.avatar_url || '',
        });
      } else {
        // No profile exists yet, use user data
        setProfileData({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          avatar_url: '',
        });
      }

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Settings error:', settingsError);
        throw settingsError;
      }

      if (settingsData) {
        setSettings({
          notifications: {
            notification_expense_updates: settingsData.notification_expense_updates ?? true,
            notification_settlement_reminders: settingsData.notification_settlement_reminders ?? true,
            notification_group_invites: settingsData.notification_group_invites ?? true,
            notification_weekly_report: settingsData.notification_weekly_report ?? false,
          },
          privacy: {
            privacy_show_profile: settingsData.privacy_show_profile ?? true,
            privacy_show_activity: settingsData.privacy_show_activity ?? false,
            privacy_two_factor_auth: settingsData.privacy_two_factor_auth ?? false,
          },
          preferences: {
            preference_currency: settingsData.preference_currency || 'INR',
            preference_default_category: settingsData.preference_default_category || 'food',
            preference_auto_settle: settingsData.preference_auto_settle ?? false,
            preference_theme: settingsData.preference_theme || 'light',
          },
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (key: string, value: string) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSettingChange = (section: keyof SettingsGrouped, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update or insert profile using upsert
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profileData.full_name,
          email: profileData.email,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Update or insert settings using upsert
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          notification_expense_updates: settings.notifications.notification_expense_updates,
          notification_settlement_reminders: settings.notifications.notification_settlement_reminders,
          notification_group_invites: settings.notifications.notification_group_invites,
          notification_weekly_report: settings.notifications.notification_weekly_report,
          privacy_show_profile: settings.privacy.privacy_show_profile,
          privacy_show_activity: settings.privacy.privacy_show_activity,
          privacy_two_factor_auth: settings.privacy.privacy_two_factor_auth,
          preference_currency: settings.preferences.preference_currency,
          preference_default_category: settings.preferences.preference_default_category,
          preference_auto_settle: settings.preferences.preference_auto_settle,
          preference_theme: settings.preferences.preference_theme,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (settingsError) {
        console.error('Settings update error:', settingsError);
        throw settingsError;
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Show loading screen while checking authentication
  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <VerseLoading />
      </div>
    );
  }

  const sections = {
    account: { title: 'Account', icon: User },
    notifications: { title: 'Notifications', icon: Bell },
    privacy: { title: 'Privacy', icon: Lock },
    preferences: { title: 'Preferences', icon: SettingsIcon },
    data: { title: 'Data', icon: Database },
  };

  const categoryIcons: Record<string, string> = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    shopping: '🛍️',
    utilities: '💡',
    rent: '🏠',
    travel: '✈️',
    healthcare: '🏥',
    other: '📦',
  };

  return (
    <DashboardLayout user={user}>
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white px-4 sm:px-6 py-4 sm:py-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your SplitXo account and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 sm:px-6 py-3 sm:py-4 min-w-min">
            {Object.entries(sections).map(([id, section]) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    activeSection === id
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent size={18} className="flex-shrink-0" />
                  <span className="hidden sm:inline">{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <>
          {/* Account Settings */}
          {activeSection === 'account' && (
            <div className="space-y-4 max-w-3xl">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => handleProfileChange('full_name', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Password & Security</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button className="w-full bg-teal-50 hover:bg-teal-100 text-teal-600 font-medium py-2 sm:py-3 rounded-xl transition text-sm sm:text-base">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="max-w-3xl">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Notification Preferences</h2>
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <div className="flex-1 pr-4">
                        <p className="font-medium text-gray-800 text-sm sm:text-base capitalize">
                          {key.replace(/notification_/g, '').replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                          {key === 'notification_expense_updates' && 'Get notified when expenses are added'}
                          {key === 'notification_settlement_reminders' && 'Reminders about pending settlements'}
                          {key === 'notification_group_invites' && 'Notifications for group invitations'}
                          {key === 'notification_weekly_report' && 'Weekly expense summary'}
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Security */}
          {activeSection === 'privacy' && (
            <div className="max-w-3xl">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Privacy & Security Settings</h2>
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(settings.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <div className="flex-1 pr-4">
                        <p className="font-medium text-gray-800 text-sm sm:text-base capitalize">
                          {key.replace(/privacy_/g, '').replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                          {key === 'privacy_show_profile' && 'Allow others to see your profile'}
                          {key === 'privacy_show_activity' && 'Show activity to group members'}
                          {key === 'privacy_two_factor_auth' && 'Secure your account with 2FA'}
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <div className="max-w-3xl">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">App Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                    <select
                      value={settings.preferences.preference_currency}
                      onChange={(e) => handleSettingChange('preferences', 'preference_currency', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white"
                    >
                      <option value="INR">₹ Indian Rupee</option>
                      <option value="USD">$ US Dollar</option>
                      <option value="EUR">€ Euro</option>
                      <option value="GBP">£ British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Default Expense Category</label>
                    <select
                      value={settings.preferences.preference_default_category}
                      onChange={(e) => handleSettingChange('preferences', 'preference_default_category', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white"
                    >
                      {Object.entries(categoryIcons).map(([value, icon]) => (
                        <option key={value} value={value}>
                          {icon} {value.charAt(0).toUpperCase() + value.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-gray-800 text-sm sm:text-base">Auto-settle Expenses</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Automatically mark expenses as settled</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.preferences.preference_auto_settle}
                        onChange={(e) => handleSettingChange('preferences', 'preference_auto_settle', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data & Storage */}
          {activeSection === 'data' && (
            <div className="max-w-3xl space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Export Data</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Download all your expense data</p>
                <button className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 sm:py-3 px-4 rounded-xl transition text-sm sm:text-base shadow-sm">
                  <Download size={18} className="flex-shrink-0" />
                  <span>Export as JSON</span>
                </button>
              </div>

              <div className="bg-red-50 rounded-2xl p-4 sm:p-6 shadow-sm border border-red-200">
                <h2 className="text-base sm:text-lg font-bold text-red-900 mb-3 sm:mb-4">Danger Zone</h2>
                <div className="space-y-2 sm:space-y-3">
                  <button className="w-full text-left text-red-600 hover:text-red-700 font-medium text-sm p-3 hover:bg-red-100 rounded-xl transition">
                    Clear Application Cache
                  </button>
                  <button className="w-full flex items-center justify-between text-red-600 hover:text-red-700 font-medium text-sm p-3 hover:bg-red-100 rounded-xl transition">
                    <span className="flex items-center gap-2">
                      <Trash2 size={16} className="flex-shrink-0" />
                      <span>Delete My Account</span>
                    </span>
                    <ChevronRight size={16} className="flex-shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button - Fixed at Bottom on Mobile */}
          <div className="fixed bottom-16 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3 sm:p-4 lg:relative lg:bottom-0 lg:bg-transparent lg:backdrop-blur-none lg:border-t-0 lg:p-0 lg:mt-6 z-10">
            <div className="flex gap-3 max-w-3xl">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-md"
              >
                {saving ? <Loader className="animate-spin flex-shrink-0" size={18} /> : <Save size={18} className="flex-shrink-0" />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              {isSaved && (
                <div className="flex items-center text-green-600 font-medium px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap">
                  ✓ Saved
                </div>
              )}
            </div>
          </div>
        </>
      </div>
    </DashboardLayout>
  );
}