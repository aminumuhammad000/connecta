import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Icon from '../components/Icon'
import { verificationsAPI } from '../services/api'

interface Verification {
    _id: string
    user: {
        _id: string
        firstName: string
        lastName: string
        email: string
    }
    idType: string
    idNumber: string
    fullName: string
    idFrontImage: string
    idBackImage?: string
    selfieImage?: string
    status: 'pending' | 'approved' | 'rejected'
    adminNotes?: string
    createdAt: string
}

export default function Verifications() {
    const [verifications, setVerifications] = useState<Verification[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>('pending')
    const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [adminNotes, setAdminNotes] = useState('')
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchVerifications()
    }, [filterStatus])

    const fetchVerifications = async () => {
        try {
            setLoading(true)
            const data = await verificationsAPI.getAll({ status: filterStatus !== 'all' ? filterStatus : undefined })
            setVerifications(Array.isArray(data) ? data : data.data || [])
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load verifications')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
        if (!selectedVerification) return

        try {
            setProcessing(true)
            await verificationsAPI.updateStatus(selectedVerification._id, status, adminNotes)
            toast.success(`Verification ${status} successfully`)
            setShowModal(false)
            setSelectedVerification(null)
            setAdminNotes('')
            fetchVerifications()
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${status} verification`)
        } finally {
            setProcessing(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        }
    }

    return (
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-light-primary dark:text-dark-primary">
                        Identity Verifications
                    </h1>
                    <p className="text-text-light-secondary dark:text-dark-secondary mt-1">
                        Review and approve user identity documents
                    </p>
                </div>

                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {['all', 'pending', 'approved', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === status
                                            ? 'bg-primary text-white'
                                            : 'bg-background-light dark:bg-background-dark text-text-light-secondary hover:bg-border-light dark:hover:bg-border-dark'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={fetchVerifications}
                            className="p-2 text-text-light-secondary hover:text-primary transition-colors"
                            title="Refresh"
                        >
                            <Icon name="refresh" size={24} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase">ID Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase">Submitted</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div></td>
                                        </tr>
                                    ))
                                ) : verifications.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-text-light-secondary dark:text-dark-secondary">
                                            No verification requests found
                                        </td>
                                    </tr>
                                ) : (
                                    verifications.map((v) => (
                                        <tr key={v._id} className="hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="font-semibold text-text-light-primary dark:text-dark-primary">
                                                        {v.user?.firstName} {v.user?.lastName}
                                                    </p>
                                                    <p className="text-sm text-text-light-secondary dark:text-dark-secondary">{v.user?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-primary dark:text-dark-primary capitalize">
                                                {v.idType.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(v.status)}`}>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-secondary dark:text-dark-secondary">
                                                {new Date(v.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedVerification(v)
                                                        setShowModal(true)
                                                    }}
                                                    className="text-primary hover:text-primary/80 font-medium text-sm"
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showModal && selectedVerification && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

                        <div className="relative bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                                <h3 className="text-xl font-bold text-text-light-primary dark:text-dark-primary">
                                    Review Verification Request
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-text-light-secondary hover:text-primary">
                                    <Icon name="close" size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-text-light-secondary dark:text-dark-secondary uppercase mb-2">User Information</h4>
                                            <p className="text-lg font-semibold text-text-light-primary dark:text-dark-primary">
                                                {selectedVerification.user.firstName} {selectedVerification.user.lastName}
                                            </p>
                                            <p className="text-text-light-secondary dark:text-dark-secondary">{selectedVerification.user.email}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-text-light-secondary dark:text-dark-secondary uppercase mb-2">ID Details</h4>
                                            <p className="text-text-light-primary dark:text-dark-primary flex justify-between">
                                                <span>Full Name:</span> <span className="font-semibold">{selectedVerification.fullName}</span>
                                            </p>
                                            <p className="text-text-light-primary dark:text-dark-primary flex justify-between">
                                                <span>ID Type:</span> <span className="font-semibold capitalize">{selectedVerification.idType.replace('_', ' ')}</span>
                                            </p>
                                            <p className="text-text-light-primary dark:text-dark-primary flex justify-between">
                                                <span>ID Number:</span> <span className="font-semibold">{selectedVerification.idNumber}</span>
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-text-light-secondary dark:text-dark-secondary uppercase mb-2">Admin Actions</h4>
                                            <textarea
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                placeholder="Add notes for the user (visible if rejected)"
                                                className="w-full p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-dark-primary focus:ring-2 focus:ring-primary/50 outline-none h-32"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-text-light-secondary dark:text-dark-secondary uppercase">Document Images</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-text-light-secondary mb-1">ID Front</p>
                                                <a href={selectedVerification.idFrontImage} target="_blank" rel="noreferrer">
                                                    <img src={selectedVerification.idFrontImage} alt="ID Front" className="w-full rounded-lg border border-border-light dark:border-border-dark hover:opacity-90 transition-opacity" />
                                                </a>
                                            </div>
                                            {selectedVerification.idBackImage && (
                                                <div>
                                                    <p className="text-xs text-text-light-secondary mb-1">ID Back</p>
                                                    <a href={selectedVerification.idBackImage} target="_blank" rel="noreferrer">
                                                        <img src={selectedVerification.idBackImage} alt="ID Back" className="w-full rounded-lg border border-border-light dark:border-border-dark hover:opacity-90 transition-opacity" />
                                                    </a>
                                                </div>
                                            )}
                                            {selectedVerification.selfieImage && (
                                                <div>
                                                    <p className="text-xs text-text-light-secondary mb-1">Selfie with ID</p>
                                                    <a href={selectedVerification.selfieImage} target="_blank" rel="noreferrer">
                                                        <img src={selectedVerification.selfieImage} alt="Selfie" className="w-full rounded-lg border border-border-light dark:border-border-dark hover:opacity-90 transition-opacity" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark/50 flex flex-col sm:flex-row gap-3">
                                <button
                                    disabled={processing}
                                    onClick={() => handleUpdateStatus('rejected')}
                                    className="flex-1 py-3 px-4 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl font-bold transition-colors disabled:opacity-50"
                                >
                                    Reject Request
                                </button>
                                <button
                                    disabled={processing}
                                    onClick={() => handleUpdateStatus('approved')}
                                    className="flex-1 py-3 px-4 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/25 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processing && <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"></div>}
                                    Approve Verification
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
