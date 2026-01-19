import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { settingsAPI } from '../services/api'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'email' | 'apikeys' | 'security'>('general')
  const [settings, setSettings] = useState({
    platformName: 'Connecta',
    commissionRate: 15,
    minWithdrawal: 50,
    autoApproveProjects: false,
    emailNotifications: true,
    maintenanceMode: false,
    allowNewRegistrations: true,
    smtpProvider: 'other',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false,
    smtpFromEmail: '',
    smtpFromName: 'Connecta',
    // API Keys
    openrouterApiKey: '',
    huggingfaceApiKey: '',
    googleClientId: '',
    googleClientSecret: '',
    googleCallbackUrl: '',
    // AI Config
    aiProvider: 'openai' as 'openai' | 'gemini',
    openaiApiKey: '',
    geminiApiKey: '',
  })

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.success && response.data) {
        const s = response.data.smtp;
        const a = response.data.apiKeys;
        const ai = response.data.ai || {};
        setSettings(prev => ({
          ...prev,
          smtpProvider: s.provider || 'other',
          smtpHost: s.host || '',
          smtpPort: s.port || 587,
          smtpUser: s.user || '',
          smtpPass: s.pass || '',
          smtpSecure: s.secure || false,
          smtpFromEmail: s.fromEmail || '',
          smtpFromName: s.fromName || 'Connecta',
          openrouterApiKey: a?.openrouter || '',
          huggingfaceApiKey: a?.huggingface || '',
          googleClientId: a?.google?.clientId || '',
          googleClientSecret: a?.google?.clientSecret || '',
          googleCallbackUrl: a?.google?.callbackUrl || '',
          aiProvider: ai.provider || 'openai',
          openaiApiKey: ai.openaiApiKey || '',
          geminiApiKey: ai.geminiApiKey || '',
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'email') {
        const smtpData = {
          provider: settings.smtpProvider,
          host: settings.smtpHost,
          port: settings.smtpPort,
          user: settings.smtpUser,
          pass: settings.smtpPass,
          secure: settings.smtpSecure,
          fromEmail: settings.smtpFromEmail,
          fromName: settings.smtpFromName,
        };
        await settingsAPI.updateSmtp(smtpData);
        toast.success('Email settings saved successfully!');
      } else if (activeTab === 'apikeys') {
        const apiKeysData = {
          openrouter: settings.openrouterApiKey,
          huggingface: settings.huggingfaceApiKey,
          google: {
            clientId: settings.googleClientId,
            clientSecret: settings.googleClientSecret,
            callbackUrl: settings.googleCallbackUrl,
          },
          ai: {
            provider: settings.aiProvider,
            openaiApiKey: settings.openaiApiKey,
            geminiApiKey: settings.geminiApiKey,
          }
        };
        await settingsAPI.updateApiKeys(apiKeysData);
        toast.success('API keys saved successfully!');
      } else {
        // Save other settings logic (placeholder)
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  }

  const handleReset = () => {
    toast.success('Settings reset to defaults')
  }

  return (
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
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4 sticky top-20 lg:top-24 z-10">
              <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-0 space-y-0 lg:space-y-1 pb-2 lg:pb-0 scrollbar-hide">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'general'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                >
                  <Icon name="tune" size={20} />
                  <span className="text-sm font-medium">General</span>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'payments'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                >
                  <Icon name="payments" size={20} />
                  <span className="text-sm font-medium">Payments</span>
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'email'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                >
                  <Icon name="mail" size={20} />
                  <span className="text-sm font-medium">Email & Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab('apikeys')}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'apikeys'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                >
                  <Icon name="key" size={20} />
                  <span className="text-sm font-medium">API Keys</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === 'security'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-light-secondary dark:text-dark-secondary hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                >
                  <Icon name="security" size={20} />
                  <span className="text-sm font-medium">Security</span>
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
                      onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
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
                      onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
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
                      onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
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
                      Email Provider
                    </label>
                    <select
                      value={settings.smtpProvider}
                      onChange={(e) => setSettings({ ...settings, smtpProvider: e.target.value })}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="other">Other (Custom SMTP)</option>
                      <option value="gmail">Gmail</option>
                    </select>
                  </div>

                  {settings.smtpProvider === 'other' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          value={settings.smtpHost}
                          onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                          placeholder="smtp.example.com"
                          className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={settings.smtpPort}
                          onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                          placeholder="587"
                          className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">
                            Secure Connection (SSL/TLS)
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.smtpSecure}
                            onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      {settings.smtpProvider === 'gmail' ? 'Gmail Address' : 'SMTP Username'}
                    </label>
                    <input
                      type="text"
                      value={settings.smtpUser}
                      onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                      placeholder={settings.smtpProvider === 'gmail' ? 'yourapp@gmail.com' : 'user@example.com'}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      {settings.smtpProvider === 'gmail' ? 'App Password' : 'SMTP Password'}
                    </label>
                    <input
                      type="password"
                      value={settings.smtpPass}
                      onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                      placeholder="••••••••"
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {settings.smtpProvider === 'gmail' && (
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
                        Use an App Password, not your regular Gmail password.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.smtpFromEmail}
                      onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })}
                      placeholder="noreply@connecta.com"
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.smtpFromName}
                      onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
                      placeholder="Connecta"
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

            {/* API Keys Settings */}
            {activeTab === 'apikeys' && (
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  AI & API Keys Configuration
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      🔐 <strong>Security Note:</strong> These API keys are sensitive. Handle them with care and never share them publicly.
                    </p>
                  </div>

                  {/* AI Provider Selection */}
                  <div className="border-b border-border-light dark:border-border-dark pb-4 mb-4">
                    <h3 className="text-lg font-semibold text-text-light-primary dark:text-dark-primary mb-3">
                      AI Agent Configuration
                    </h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                        AI Provider
                      </label>
                      <select
                        value={settings.aiProvider}
                        onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value as 'openai' | 'gemini' })}
                        className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="openai">OpenAI / OpenRouter</option>
                        <option value="gemini">Google Gemini</option>
                      </select>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
                        Select the AI provider for the Connecta Agent.
                      </p>
                    </div>

                    {settings.aiProvider === 'openai' && (
                      <div>
                        <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                          OpenAI / OpenRouter API Key
                        </label>
                        <input
                          type="password"
                          value={settings.openaiApiKey}
                          onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                          placeholder="sk-..."
                          className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}

                    {settings.aiProvider === 'gemini' && (
                      <div>
                        <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                          Gemini API Key
                        </label>
                        <input
                          type="password"
                          value={settings.geminiApiKey}
                          onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                          placeholder="AIza..."
                          className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border-light dark:border-border-dark pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-text-light-primary dark:text-dark-primary mb-3">
                      Other Integrations
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                          Hugging Face API Key
                        </label>
                        <input
                          type="password"
                          value={settings.huggingfaceApiKey}
                          onChange={(e) => setSettings({ ...settings, huggingfaceApiKey: e.target.value })}
                          placeholder="hf_..."
                          className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border-light dark:border-border-dark pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-text-light-primary dark:text-dark-primary mb-3">
                      Google OAuth Configuration
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={settings.googleClientId}
                          onChange={(e) => setSettings({ ...settings, googleClientId: e.target.value })}
                          placeholder="855950020031-..."
                          className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                          Client Secret
                        </label>
                        <input
                          type="password"
                          value={settings.googleClientSecret}
                          onChange={(e) => setSettings({ ...settings, googleClientSecret: e.target.value })}
                          placeholder="GOCSPX-..."
                          className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                          Callback URL
                        </label>
                        <input
                          type="text"
                          value={settings.googleCallbackUrl}
                          onChange={(e) => setSettings({ ...settings, googleCallbackUrl: e.target.value })}
                          placeholder="http://localhost:5000/auth/google/callback"
                          className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
                          Google OAuth redirect URI
                        </p>
                      </div>
                    </div>
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
                        onChange={(e) => setSettings({ ...settings, autoApproveProjects: e.target.checked })}
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
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
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
                        onChange={(e) => setSettings({ ...settings, allowNewRegistrations: e.target.checked })}
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
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 min-h-[44px] sm:h-11 rounded-lg border border-border-light dark:border-border-dark text-text-light-primary dark:text-dark-primary px-6 font-medium hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              >
                <Icon name="refresh" size={20} />
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 min-h-[44px] sm:h-11 rounded-lg bg-primary text-white px-6 font-medium hover:opacity-90 transition-opacity"
              >
                <Icon name="save" size={20} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
