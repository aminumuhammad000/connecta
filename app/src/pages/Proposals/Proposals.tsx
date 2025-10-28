import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Header from '../../components/Header';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './styles/Proposals.module.css';

interface Proposal {
  _id: string;
  title: string;
  recommended: boolean;
  description: string;
  budget: {
    amount: number;
    currency: string;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  type: 'recommendation' | 'referral';
  referredBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  referredByName?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  level: 'entry' | 'intermediate' | 'expert';
  priceType: 'fixed' | 'hourly';
}

const Proposals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'referrals'>('recommendations');
  const [savedProposals, setSavedProposals] = useState<Set<string>>(new Set());
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader, showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      showLoader();
      
      // Get all proposals (for demo purposes)
      // TODO: Replace with actual user-specific endpoint when auth is implemented
      const response = await fetch(`http://localhost:5000/api/proposals?limit=50`);
      const data = await response.json();

      if (data.success) {
        setProposals(data.data);
        console.log('Loaded proposals:', data.data.length);
      } else {
        showError(data.message || 'Failed to fetch proposals');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      showError('Failed to load proposals. Please try again.');
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    const endFormatted = end.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const formatBudget = (budget: { amount: number; currency: string }): string => {
    return `${budget.currency}${budget.amount.toLocaleString()}`;
  };

  const handleAccept = async (proposalId: string) => {
    try {
      showLoader();
      const response = await fetch(`http://localhost:5000/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Proposal accepted successfully!');
        fetchProposals(); // Refresh the list
      } else {
        showError(data.message || 'Failed to accept proposal');
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      showError('Failed to accept proposal. Please try again.');
    } finally {
      hideLoader();
    }
  };

  const handleDecline = async (proposalId: string) => {
    try {
      showLoader();
      const response = await fetch(`http://localhost:5000/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'declined' }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Proposal declined');
        fetchProposals(); // Refresh the list
      } else {
        showError(data.message || 'Failed to decline proposal');
      }
    } catch (error) {
      console.error('Error declining proposal:', error);
      showError('Failed to decline proposal. Please try again.');
    } finally {
      hideLoader();
    }
  };

  // Filter proposals based on active tab
  const filteredProposals = proposals.filter((proposal: Proposal) => 
    activeTab === 'recommendations' 
      ? proposal.type === 'recommendation' 
      : proposal.type === 'referral'
  );

  const toggleSave = (id: string) => {
    const newSaved = new Set(savedProposals);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedProposals(newSaved);
  };

  if (loading) {
    return (
      <div className={styles.proposalsPage}>
        <Header />
        <div className={styles.loadingContainer}>
          <p>Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.proposalsPage}>
      <Header />

      {/* Page Title */}
      <h1 className={styles.pageTitle}>My proposals</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'recommendations' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          AI Recommendations
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'referrals' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('referrals')}
        >
          Referrals
        </button>
      </div>

      {/* Proposals List */}
      <div className={styles.proposalsList}>
        {filteredProposals.map((proposal: Proposal) => (
          <div key={proposal._id} className={styles.proposalCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.proposalTitle}>{proposal.title}</h2>
                {proposal.recommended && (
                  <span className={styles.recommendedBadge}>Recommended for you</span>
                )}
                {proposal.referredByName && (
                  <span className={styles.referredBadge}>Referred by {proposal.referredByName}</span>
                )}
              </div>
              <div className={styles.cardActions}>
                <button className={styles.iconButton}>
                  <Icon icon="mdi:dislike-outline" />
                </button>
                <button 
                  className={styles.iconButton}
                  onClick={() => toggleSave(proposal._id)}
                >
                  <Icon 
                    icon={savedProposals.has(proposal._id) ? "material-symbols:favorite" : "material-symbols:favorite-outline"} 
                    style={{ color: savedProposals.has(proposal._id) ? '#FD6730' : 'inherit' }}
                  />
                </button>
              </div>
            </div>

            <p className={styles.description}>{proposal.description}</p>

            <p className={styles.budgetInfo}>
              {proposal.priceType === 'fixed' ? 'Fixed-price' : 'Hourly'} - {proposal.level.charAt(0).toUpperCase() + proposal.level.slice(1)} level - Est. Budget: <strong>{formatBudget(proposal.budget)}</strong>
            </p>

            <div className={styles.cardFooter}>
                <div style={{display:"flex", alignItems:"center", gap:"16px", justifyContent:"space-between"}}>
              <div className={styles.buttons}>
                <button 
                  className={styles.acceptButton}
                  onClick={() => handleAccept(proposal._id)}
                >
                  Accept
                </button>
                <button 
                  className={styles.declineButton}
                  onClick={() => handleDecline(proposal._id)}
                >
                  Decline
                </button>
              </div>
              <div className={styles.dateInfo}>
                <Icon icon="material-symbols:calendar-today" className={styles.calendarIcon} />
                <span className={styles.dateText}>{formatDateRange(proposal.dateRange.startDate, proposal.dateRange.endDate)}</span>
              </div>
                </div> 
            </div>
          </div>
        ))}
        
        {filteredProposals.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <p>No {activeTab === 'recommendations' ? 'AI recommendations' : 'referrals'} available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Proposals;
