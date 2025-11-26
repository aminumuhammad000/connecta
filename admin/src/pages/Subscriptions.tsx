import { useEffect, useState } from 'react';
import { subscriptionsAPI } from '../services/api';
import Icon from '../components/Icon';

interface Subscription {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    userType: string;
  };
  plan: string;
  amount: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  paymentReference: string;
  createdAt: string;
}

interface SubscriptionStats {
  activeSubscriptions: number;
  monthlyRevenue: number;
  weeklyRevenue: Array<{ date: string; amount: number; subscriptions: number }>;
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
      const data = await subscriptionsAPI.getAll();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await subscriptionsAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      await subscriptionsAPI.cancel(subscriptionId);
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
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
    const statusStyles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusStyles[status as keyof typeof statusStyles] || statusStyles.cancelled
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredSubscriptions = subscriptions
    .filter((sub) => {
      if (filter !== 'all' && sub.status !== filter) return false;
      if (
        searchTerm &&
        !sub.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !sub.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-light-primary dark:text-dark-primary">
            Premium Subscriptions
          </h1>
          <p className="text-sm text-text-light-secondary dark:text-dark-secondary mt-1">
            Manage all premium membership subscriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <p className="text-xs text-purple-600 dark:text-purple-300 font-medium">
              ₦5,000/month
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">
              Active Subscriptions
            </p>
            <Icon name="verified" className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">
            {stats?.activeSubscriptions || 0}
          </p>
          <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
            Premium members
          </p>
        </div>

        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">
              Total Subscriptions
            </p>
            <Icon name="receipt_long" className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">
            {subscriptions.length}
          </p>
          <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
            All time
          </p>
        </div>

        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">
              Monthly Revenue
            </p>
            <Icon name="trending_up" className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">
            {formatCurrency(stats?.monthlyRevenue || 0)}
          </p>
          <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
            This month
          </p>
        </div>

        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary">
              Total Revenue
            </p>
            <Icon name="account_balance_wallet" className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-text-light-primary dark:text-dark-primary mt-2">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-text-light-secondary dark:text-dark-secondary mt-1">
            All time
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary"
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-bg-light dark:bg-bg-dark text-text-light-primary dark:text-dark-primary hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All ({subscriptions.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-primary text-white'
                  : 'bg-bg-light dark:bg-bg-dark text-text-light-primary dark:text-dark-primary hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Active ({subscriptions.filter((s) => s.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'expired'
                  ? 'bg-primary text-white'
                  : 'bg-bg-light dark:bg-bg-dark text-text-light-primary dark:text-dark-primary hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Expired ({subscriptions.filter((s) => s.status === 'expired').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-primary text-white'
                  : 'bg-bg-light dark:bg-bg-dark text-text-light-primary dark:text-dark-primary hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Cancelled ({subscriptions.filter((s) => s.status === 'cancelled').length})
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                <th className="px-6 py-4 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Payment Ref
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-light-secondary dark:text-dark-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Icon name="inbox" className="text-text-light-secondary dark:text-dark-secondary mb-2" size={48} />
                      <p className="text-text-light-secondary dark:text-dark-secondary">
                        No subscriptions found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <tr
                    key={subscription._id}
                    className="hover:bg-bg-light dark:hover:bg-bg-dark transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <Icon name="person" className="text-purple-600 dark:text-purple-300" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-text-light-primary dark:text-dark-primary">
                            {subscription.userId?.name || 'N/A'}
                          </p>
                          <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                            {subscription.userId?.email || 'N/A'}
                          </p>
                          <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                            {subscription.userId?.userType || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        {subscription.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text-light-primary dark:text-dark-primary">
                        {formatCurrency(subscription.amount)}
                      </p>
                      <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                        {subscription.currency}
                      </p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(subscription.status)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-light-primary dark:text-dark-primary">
                        {formatDate(subscription.startDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-light-primary dark:text-dark-primary">
                        {formatDate(subscription.endDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-text-light-secondary dark:text-dark-secondary">
                        {subscription.paymentReference || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => handleCancelSubscription(subscription._id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
