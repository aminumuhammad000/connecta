import { useState } from 'react'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'email' | 'security' | 'database'>('general')
  const [settings, setSettings] = useState({
    platformName: 'Connecta',
    commissionRate: 15,
    minWithdrawal: 50,
    autoApproveProjects: false,
    emailNotifications: true,
    maintenanceMode: false,
    allowNewRegistrations: true,
  })

  const handleSave = () => {
    // Save settings logic
    toast.success('Settings saved successfully!')
  }

  const handleReset = () => {
    toast.success('Settings reset to defaults')
  }

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-light-primary dark:text-dark-primary">
              Platform Settings
            </h1>
            <p className="text-text-light-secondary dark:text-dark-secondary mt-1">
              Configure global platform settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4 sticky top-4">
                <nav className="space-y-1">
                  <button 
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'general' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <Icon name="tune" size={20} />
                    <span className="text-sm font-medium">General</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('payments')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'payments' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <Icon name="payments" size={20} />
                    <span className="text-sm font-medium">Payments</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('email')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'email' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <Icon name="mail" size={20} />
                    <span className="text-sm font-medium">Email & Notifications</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'security' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <Icon name="security" size={20} />
                    <span className="text-sm font-medium">Security</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('database')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'database' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <Icon name="storage" size={20} />
                    <span className="text-sm font-medium">Database</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* General Settings */}
              {activeTab === 'general' && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  General Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.commissionRate}
                      onChange={(e) => setSettings({...settings, commissionRate: Number(e.target.value)})}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
                      Platform commission on completed projects
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Minimum Withdrawal Amount ($)
                    </label>
                    <input
                      type="number"
                      value={settings.minWithdrawal}
                      onChange={(e) => setSettings({...settings, minWithdrawal: Number(e.target.value)})}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Payments Settings */}
              {activeTab === 'payments' && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  Payment Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Payment Gateway
                    </label>
                    <select className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Paystack</option>
                      <option>Flutterwave</option>
                      <option>Stripe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Currency
                    </label>
                    <select className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>NGN (₦)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Transaction Fee (%)
                    </label>
                    <input
                      type="number"
                      placeholder="2.5"
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Email & Notifications */}
              {activeTab === 'email' && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  Email & Notification Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      placeholder="587"
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      placeholder="noreply@connecta.com"
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      placeholder="5"
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Database Settings */}
              {activeTab === 'database' && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  Database Management
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Total Users</span>
                      <span className="text-sm font-bold text-primary">11</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Total Projects</span>
                      <span className="text-sm font-bold text-primary">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Database Size</span>
                      <span className="text-sm font-bold text-primary">12.5 MB</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-blue-500 text-white font-medium hover:opacity-90">
                      <Icon name="backup" size={20} />
                      Create Backup
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border border-border-light dark:border-border-dark text-text-light-primary dark:text-dark-primary font-medium hover:bg-background-light dark:hover:bg-background-dark">
                      <Icon name="restore" size={20} />
                      Restore
                    </button>
                  </div>
                  <div className="pt-4 border-t border-border-light dark:border-border-dark">
                    <button className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-red-500 text-white font-medium hover:opacity-90">
                      <Icon name="delete_forever" size={20} />
                      Clear All Data
                    </button>
                    <p className="text-xs text-text-light-secondary dark:text-dark-secondary text-center mt-2">
                      Warning: This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>
              )}

              {/* Feature Toggles - Show only on General tab */}
              {activeTab === 'general' && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  Feature Toggles
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">
                        Auto-Approve Projects
                      </p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                        Automatically approve new project postings
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoApproveProjects}
                        onChange={(e) => setSettings({...settings, autoApproveProjects: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">
                        Email Notifications
                      </p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                        Send email notifications to users
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">
                        Allow New Registrations
                      </p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                        Allow new users to register on the platform
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowNewRegistrations}
                        onChange={(e) => setSettings({...settings, allowNewRegistrations: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
                    <div>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        Maintenance Mode
                      </p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                        Disable platform access for maintenance
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 dark:peer-focus:ring-red-300/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              )}

              {/* System Information - Show only on General tab */}
              {activeTab === 'general' && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  System Information
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-light-secondary dark:text-dark-secondary mb-1">Version</p>
                    <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">v1.0.0</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-light-secondary dark:text-dark-secondary mb-1">Environment</p>
                    <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">Development</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-light-secondary dark:text-dark-secondary mb-1">Database</p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Connected</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-light-secondary dark:text-dark-secondary mb-1">Last Backup</p>
                    <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">2 hours ago</p>
                  </div>
                </div>
              </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 h-11 rounded-lg border border-border-light dark:border-border-dark text-text-light-primary dark:text-dark-primary px-6 font-medium hover:bg-background-light dark:hover:bg-background-dark"
                >
                  <Icon name="refresh" size={20} />
                  Reset to Defaults
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 h-11 rounded-lg bg-primary text-white px-6 font-medium hover:opacity-90"
                >
                  <Icon name="save" size={20} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
