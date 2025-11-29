import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
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
          <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Admin Profile & Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 ring-4 ring-primary/20 mb-4"
                    style={{
                      backgroundImage: adminUser?.profileImage || adminUser?.profilePicture
                        ? `url(${adminUser.profileImage || adminUser.profilePicture})`
                        : 'url("https://ui-avatars.com/api/?name=Admin&background=fd6730&color=fff&size=256")',
                    }}
                  />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {adminUser?.firstName || adminUser?.name || 'Admin'} {adminUser?.lastName || 'User'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {adminUser?.email || 'admin@connecta.com'}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mt-3">
                    Administrator
                  </span>
                  
                  <button className="mt-6 w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <Icon name="person_add" size={18} />
                    Change Avatar
                  </button>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Account Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Icon name="check_circle" size={12} />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Member Since</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {new Date(adminUser?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Last Login</span>
                    <span className="text-slate-900 dark:text-white font-medium">Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Profile Information
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-white px-6 font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Icon name="progress_activity" className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="save" size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Change Password
                </h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-white px-6 font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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

             
            </div>
          </div>
        </div>
      </main>
  )
}
