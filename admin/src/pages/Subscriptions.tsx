import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { subscriptionsAPI } from '../services/api';
import Icon from '../components/Icon';
import AppLayout from '../components/AppLayout';

interface Subscription {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    isPremium: boolean;
  };
  plan: string;
  amount: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  paymentReference: string;
  autoRenew: boolean;
  createdAt: string;
}

interface SubscriptionStats {
  activeSubscriptions: number;
  totalSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  monthlyRevenue: number;
  totalRevenue: number;
  pricePerSubscription: number;
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsAPI.getAll();
      console.log('Subscriptions response:', response);
      setSubscriptions(response.subscriptions || []);
      if (response.subscriptions && response.subscriptions.length === 0) {
        toast('No subscriptions found', { icon: 'ℹ️' });
      }
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error(error.response?.data?.message || 'Failed to load subscriptions');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await subscriptionsAPI.getStats();
      console.log('Stats response:', response);
      setStats(response.data || response);
    } catch (error: any) {
      console.error('Error fetching subscription stats:', error);
      toast.error('Failed to load subscription statistics');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      await subscriptionsAPI.cancel(subscriptionId);
      toast.success('Subscription cancelled successfully');
      fetchSubscriptions();
      fetchStats();
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to reactivate this subscription?')) return;

    try {
      await subscriptionsAPI.reactivate(subscriptionId);
      toast.success('Subscription reactivated successfully');
      fetchSubscriptions();
      fetchStats();
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to reactivate subscription');
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) return;

    try {
      await subscriptionsAPI.delete(subscriptionId);
      toast.success('Subscription deleted successfully');
      fetchSubscriptions();
      fetchStats();
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to delete subscription');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: 'check_circle'
      },
      expired: {
        bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: 'schedule'
      },
      cancelled: {
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
        icon: 'cancel'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.cancelled;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg}`}>
        <Icon name={config.icon} size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filter !== 'all' && sub.status !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        sub.paymentReference?.toLowerCase().includes(search) ||
        sub.userId?.firstName?.toLowerCase().includes(search) ||
        sub.userId?.lastName?.toLowerCase().includes(search) ||
        sub.userId?.email?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Premium Subscriptions
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage all premium membership subscriptions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90 uppercase">Active Subscriptions</p>
                  <p className="text-2xl font-bold mt-1">{stats?.activeSubscriptions || 0}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Icon name="verified" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90 uppercase">Total Subscriptions</p>
                  <p className="text-2xl font-bold mt-1">{subscriptions.length}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Icon name="receipt_long" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90 uppercase">Monthly Revenue</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Icon name="trending_up" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90 uppercase">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Icon name="account_balance_wallet" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by user name, email, or payment reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  All ({subscriptions.length})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'active'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Active ({subscriptions.filter((s) => s.status === 'active').length})
                </button>
                <button
                  onClick={() => setFilter('expired')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'expired'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Expired ({subscriptions.filter((s) => s.status === 'expired').length})
                </button>
                <button
                  onClick={() => setFilter('cancelled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'cancelled'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Cancelled ({subscriptions.filter((s) => s.status === 'cancelled').length})
                </button>
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Payment Ref
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Auto Renew
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Icon name="inbox" className="text-slate-400 mb-3" size={48} />
                          <p className="text-slate-600 dark:text-slate-400 font-medium">
                            No subscriptions found
                          </p>
                          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((subscription) => (
                      <tr
                        key={subscription._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Icon name="person" className="text-white" size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {subscription.userId?.firstName} {subscription.userId?.lastName}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {subscription.userId?.email}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                                subscription.userId?.userType === 'freelancer'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                <Icon name={subscription.userId?.userType === 'freelancer' ? 'person' : 'business'} size={10} />
                                {subscription.userId?.userType}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            <Icon name="workspace_premium" size={14} />
                            {subscription.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(subscription.amount)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {subscription.currency}
                          </p>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(subscription.status)}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-900 dark:text-white">
                            {formatDate(subscription.startDate)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-900 dark:text-white">
                            {formatDate(subscription.endDate)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            {subscription.paymentReference || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {subscription.autoRenew ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <Icon name="check_circle" size={12} />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
                              <Icon name="cancel" size={12} />
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {subscription.status === 'active' && (
                              <button
                                onClick={() => handleCancelSubscription(subscription._id)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                                title="Cancel Subscription"
                              >
                                <Icon name="block" size={18} className="text-red-600 dark:text-red-400" />
                              </button>
                            )}
                            {(subscription.status === 'expired' || subscription.status === 'cancelled') && (
                              <button
                                onClick={() => handleReactivateSubscription(subscription._id)}
                                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors group"
                                title="Reactivate Subscription"
                              >
                                <Icon name="check_circle" size={18} className="text-green-600 dark:text-green-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSubscription(subscription._id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                              title="Delete Subscription"
                            >
                              <Icon name="delete" size={18} className="text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
