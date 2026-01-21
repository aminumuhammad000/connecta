import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { authAPI, uploadsAPI } from '../services/api'

export default function Profile() {
  const [adminUser, setAdminUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      if (response.success && response.data) {
        const user = response.data
        setAdminUser(user)
        setFormData((prev) => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
        }))
        // Update localStorage to keep it in sync
        localStorage.setItem('admin_user', JSON.stringify(user))
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Fallback to localStorage if API fails
      const user = localStorage.getItem('admin_user')
      if (user) {
        const parsed = JSON.parse(user)
        setAdminUser(parsed)
        setFormData((prev) => ({
          ...prev,
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          email: parsed.email || '',
        }))
      }
    }
  }

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
      const response = await authAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      })

      if (response.success) {
        const updatedUser = response.data
        localStorage.setItem('admin_user', JSON.stringify(updatedUser))
        setAdminUser(updatedUser)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(response.message || 'Failed to update profile')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
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
      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      if (response.success) {
        toast.success('Password updated successfully!')
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        toast.error(response.message || 'Failed to update password')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-light-primary dark:text-dark-primary">
            Admin Profile & Settings
          </h1>
          <p className="text-text-light-secondary dark:text-dark-secondary mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 ring-4 ring-primary/20 mb-4 mx-auto"
                    style={{
                      backgroundImage: adminUser?.profileImage
                        ? `url(${adminUser.profileImage})`
                        : 'url("https://ui-avatars.com/api/?name=Admin&background=fd6730&color=fff&size=256")',
                    }}
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full size-24 mx-auto opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Icon name="photo_camera" size={24} className="text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          try {
                            const uploadRes = await uploadsAPI.upload(file)
                            if (uploadRes.success && uploadRes.url) {
                              const updateRes = await authAPI.updateProfile({ profileImage: uploadRes.url })
                              if (updateRes.success) {
                                setAdminUser(updateRes.data)
                                localStorage.setItem('admin_user', JSON.stringify(updateRes.data))
                                toast.success('Avatar updated!')
                              }
                            }
                          } catch (err) {
                            toast.error('Failed to upload avatar')
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <h3 className="text-lg font-semibold text-text-light-primary dark:text-dark-primary">
                  {adminUser?.firstName || 'Admin'} {adminUser?.lastName || 'User'}
                </h3>
                <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
                  {adminUser?.email || 'admin@connecta.com'}
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mt-3">
                  Administrator
                </span>

              </div>

              <div className="border-t border-border-light dark:border-border-dark mt-6 pt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-light-secondary dark:text-dark-secondary">Account Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Icon name="check_circle" size={12} />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-light-secondary dark:text-dark-secondary">Member Since</span>
                  <span className="text-text-light-primary dark:text-dark-primary font-medium">
                    {new Date(adminUser?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-light-secondary dark:text-dark-secondary">Last Login</span>
                  <span className="text-text-light-primary dark:text-dark-primary font-medium">Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
              <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary mb-4">
                Profile Information
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
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
                    className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm">
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
                    className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full h-11 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
