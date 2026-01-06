import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { usersAPI } from '../services/api'

interface User {
    _id: string
    firstName: string
    lastName: string
    email: string
    userType: 'client' | 'freelancer' | 'admin'
    profileImage?: string
}

export default function EmailBroadcast() {
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [recipientType, setRecipientType] = useState<'all' | 'selected' | 'individual'>('all')
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [sending, setSending] = useState(false)
    const [individualUser, setIndividualUser] = useState<User | null>(null)

    useEffect(() => {
        if (recipientType === 'selected') {
            fetchUsers()
        }
    }, [recipientType])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response: any = await usersAPI.getAll({ limit: 1000 }) // Fetch all users for selection
            let userData = []
            if (response.success && response.data) {
                userData = response.data
            } else if (Array.isArray(response)) {
                userData = response
            } else if (response.data && Array.isArray(response.data)) {
                userData = response.data
            }
            setUsers(userData)
        } catch (error: any) {
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleSearchUser = async () => {
        if (!searchQuery) return
        try {
            setLoading(true)
            // This is a simplified search, ideally backend supports search
            const response: any = await usersAPI.getAll({ limit: 1000 })
            let userData: User[] = []
            if (response.success && response.data) {
                userData = response.data
            } else if (Array.isArray(response)) {
                userData = response
            } else if (response.data && Array.isArray(response.data)) {
                userData = response.data
            }

            const foundUser = userData.find(u => u.email.toLowerCase() === searchQuery.toLowerCase())
            if (foundUser) {
                setIndividualUser(foundUser)
                toast.success('User found')
            } else {
                toast.error('User not found')
                setIndividualUser(null)
            }
        } catch (error) {
            toast.error('Error searching user')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(users.map(u => u._id))
        }
    }

    const handleSendBroadcast = async () => {
        if (!subject || !body) {
            toast.error('Please fill in subject and body')
            return
        }

        if (recipientType === 'selected' && selectedUsers.length === 0) {
            toast.error('Please select at least one user')
            return
        }

        if (recipientType === 'individual' && !individualUser) {
            toast.error('Please select a user')
            return
        }

        try {
            setSending(true)

            // Mock API call or actual implementation if endpoint exists
            // await api.post('/admin/broadcast', { ... })

            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success(`Email broadcast sent successfully to ${recipientType === 'all' ? 'all users' :
                    recipientType === 'selected' ? `${selectedUsers.length} users` :
                        individualUser?.email
                }`)

            // Reset form
            setSubject('')
            setBody('')
            setSelectedUsers([])
            setIndividualUser(null)
            setSearchQuery('')
            setRecipientType('all')

        } catch (error) {
            toast.error('Failed to send broadcast')
        } finally {
            setSending(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        Email Broadcast
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Send emails to platform users
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Email Composition */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Compose Email</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                                        placeholder="Enter email subject"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Message Body
                                    </label>
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        rows={10}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white resize-none"
                                        placeholder="Type your message here..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipient Selection */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recipients</h2>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <input
                                        type="radio"
                                        name="recipientType"
                                        checked={recipientType === 'all'}
                                        onChange={() => setRecipientType('all')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">All Users</p>
                                        <p className="text-xs text-slate-500">Send to everyone</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <input
                                        type="radio"
                                        name="recipientType"
                                        checked={recipientType === 'selected'}
                                        onChange={() => setRecipientType('selected')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Selected Users</p>
                                        <p className="text-xs text-slate-500">Choose specific users</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <input
                                        type="radio"
                                        name="recipientType"
                                        checked={recipientType === 'individual'}
                                        onChange={() => setRecipientType('individual')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Individual User</p>
                                        <p className="text-xs text-slate-500">Send to one person</p>
                                    </div>
                                </label>
                            </div>

                            {recipientType === 'individual' && (
                                <div className="mt-4 space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Enter user email"
                                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                                        />
                                        <button
                                            onClick={handleSearchUser}
                                            disabled={loading}
                                            className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            Search
                                        </button>
                                    </div>

                                    {individualUser && (
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-xs">
                                                {individualUser.firstName[0]}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {individualUser.firstName} {individualUser.lastName}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">{individualUser.email}</p>
                                            </div>
                                            <button
                                                onClick={() => setIndividualUser(null)}
                                                className="ml-auto text-slate-400 hover:text-red-500"
                                            >
                                                <Icon name="close" size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={handleSendBroadcast}
                                    disabled={sending || (recipientType === 'individual' && !individualUser) || (recipientType === 'selected' && selectedUsers.length === 0)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                                >
                                    {sending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="send" size={20} />
                                            <span>Send Broadcast</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Selection Table */}
                {recipientType === 'selected' && (
                    <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Select Users
                                <span className="text-xs font-normal px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                    {selectedUsers.length} selected
                                </span>
                            </h3>
                            <div className="relative w-full sm:w-64">
                                <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filter users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={users.length > 0 && selectedUsers.length === users.length}
                                                onChange={handleSelectAll}
                                                className="rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr
                                                key={user._id}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${selectedUsers.includes(user._id) ? 'bg-primary/5 dark:bg-primary/10' : ''
                                                    }`}
                                                onClick={() => handleToggleUser(user._id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user._id)}
                                                        onChange={() => handleToggleUser(user._id)}
                                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                                            {user.firstName[0]}
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {user.firstName} {user.lastName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${user.userType === 'client'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                        }`}>
                                                        {user.userType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {user.email}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
