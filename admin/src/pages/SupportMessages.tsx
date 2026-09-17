import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Icon from '../components/Icon';
import { contactAPI } from '../services/api';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    category?: string;
    priority?: string;
    createdAt: string;
    status: 'Submitted' | 'In Progress' | 'Reviewed' | 'Resolved' | 'new' | 'read' | 'archived' | string;
    adminResponse?: string;
}

const SupportMessages = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('Submitted');
    const [adminResponseText, setAdminResponseText] = useState<string>('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await contactAPI.getAll();
            if (response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMessage = (msg: ContactMessage) => {
        setSelectedMessage(msg);
        setNewStatus(msg.status || 'Submitted');
        setAdminResponseText(msg.adminResponse || '');
    };

    const handleUpdateStatus = async () => {
        if (!selectedMessage) return;
        setUpdatingStatus(true);
        try {
            const res = await contactAPI.updateStatus(selectedMessage._id, newStatus, adminResponseText);
            if (res.success) {
                toast.success('Ticket updated successfully');
                setSelectedMessage((prev) => prev ? { ...prev, status: newStatus, adminResponse: adminResponseText } : null);
                setMessages((prev) => prev.map(m => m._id === selectedMessage._id ? { ...m, status: newStatus, adminResponse: adminResponseText } : m));
            } else {
                toast.error(res.message || 'Failed to update ticket');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update ticket');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleReply = (msg: ContactMessage) => {
        window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject}`;
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            (msg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (msg.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || (msg.status || '').toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s === 'resolved') {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Resolved</span>;
        }
        if (s === 'reviewed') {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Reviewed</span>;
        }
        if (s === 'in progress') {
            return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">In Progress</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Submitted</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support & Help Tickets</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and respond to user requests</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Resolved">Resolved</option>
                    </select>

                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading requests...</div>
                ) : filteredMessages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No requests found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredMessages.map((msg) => (
                                    <tr key={msg._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">{msg.name || 'User'}</span>
                                                <span className="text-xs text-gray-500">{msg.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {msg.category || 'General Support'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate font-medium">
                                            {msg.subject}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(msg.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleSelectMessage(msg)}
                                                className="text-primary hover:text-primary-dark font-medium text-sm"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Message & Status Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Support Request</h2>
                                <p className="text-xs text-gray-500">{selectedMessage.category || 'General Support'}</p>
                            </div>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <Icon name="close" size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">User</label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {(selectedMessage.name || 'U').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{selectedMessage.name}</p>
                                            <p className="text-xs text-gray-500">{selectedMessage.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Date Submitted</label>
                                    <p className="text-gray-900 dark:text-white font-medium text-sm">
                                        {new Date(selectedMessage.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Subject</label>
                                <p className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                                    {selectedMessage.subject}
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Message</label>
                                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                    {selectedMessage.message}
                                </p>
                            </div>

                            {/* Status & Response Management */}
                            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Update Ticket Status
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {(['Submitted', 'In Progress', 'Reviewed', 'Resolved'] as const).map((st) => (
                                            <button
                                                key={st}
                                                type="button"
                                                onClick={() => setNewStatus(st)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    newStatus.toLowerCase() === st.toLowerCase()
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                                }`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                        Admin Response (visible to user in dashboard)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={adminResponseText}
                                        onChange={(e) => setAdminResponseText(e.target.value)}
                                        placeholder="Write resolution notes or feedback for the user..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex justify-between items-center sticky bottom-0">
                            <button
                                onClick={() => handleReply(selectedMessage)}
                                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                            >
                                <Icon name="reply" size={16} />
                                Email Direct
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={updatingStatus}
                                    className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {updatingStatus ? 'Updating...' : 'Save & Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportMessages;
