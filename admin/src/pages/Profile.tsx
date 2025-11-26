import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'

export default function Profile() {
  const [adminUser, setAdminUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const user = localStorage.getItem('admin_user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        setAdminUser(parsed)
        setFormData((prev) => ({
          ...prev,
          name: parsed.name || '',
          email: parsed.email || '',
        }))
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Update localStorage
      const updatedUser = {
        ...adminUser,
        name: formData.name,
        email: formData.email,
      }
      localStorage.setItem('admin_user', JSON.stringify(updatedUser))
      setAdminUser(updatedUser)
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast.success('Password updated successfully!')
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-light-primary dark:text-dark-primary">
              Admin Profile & Settings
            </h1>
            <p className="text-text-light-secondary dark:text-dark-secondary mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 ring-4 ring-primary/20 mb-4"
                    style={{
                      backgroundImage: adminUser?.profilePicture
                        ? `url(${adminUser.profilePicture})`
                        : 'url("https://ui-avatars.com/api/?name=Admin&background=fd6730&color=fff&size=256")',
                    }}
                  />
                  <h3 className="text-lg font-semibold text-text-light-primary dark:text-dark-primary">
                    {adminUser?.name || 'Admin User'}
                  </h3>
                  <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
                    {adminUser?.email || 'admin@connecta.com'}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mt-3">
                    Administrator
                  </span>
                  
                  <button className="mt-6 w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary text-sm font-medium hover:bg-primary/10">
                    <Icon name="person_add" size={18} />
                    Change Avatar
                  </button>
                </div>

                <div className="border-t border-border-light dark:border-border-dark mt-6 pt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-light-secondary dark:text-dark-secondary">Account Status</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-light-secondary dark:text-dark-secondary">Member Since</span>
                    <span className="text-text-light-primary dark:text-dark-primary">
                      {new Date(adminUser?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-light-secondary dark:text-dark-secondary">Last Login</span>
                    <span className="text-text-light-primary dark:text-dark-primary">Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  Profile Information
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-white px-6 font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Icon name="progress_activity" className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="person_add" size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                  Change Password
                </h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-white px-6 font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Icon name="progress_activity" className="animate-spin" size={20} />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Icon name="lock" size={20} />
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-200 dark:border-red-900/50">
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                  Irreversible actions that affect your admin account
                </p>
                <button
                  onClick={() => toast.error('This action requires additional confirmation')}
                  className="flex items-center gap-2 h-10 rounded-lg border-2 border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 px-4 font-medium hover:bg-red-600 hover:text-white dark:hover:bg-red-400 dark:hover:text-white transition-colors"
                >
                  <Icon name="delete" size={18} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
