import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Header from '../Dashboard/components/DashboardHeader';
import styles from './styles/Proposals.module.css';
import Logo from '../../assets/logo.png';

interface Proposal {
  id: number;
  title: string;
  recommended: boolean;
  description: string;
  budget: string;
  dateRange: string;
  type: 'recommendation' | 'referral';
  referredBy?: string;
}

const Proposals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'referrals'>('recommendations');
  const [savedProposals, setSavedProposals] = useState<Set<number>>(new Set());

  const allProposals: Proposal[] = [
    {
      id: 1,
      title: 'UI/UX Designer for Fintech Screenshot',
      recommended: true,
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      budget: '₦150,000',
      dateRange: '15th Oct,2025 - 14th Jan 2026',
      type: 'recommendation'
    },
    {
      id: 2,
      title: 'UI/UX Designer for Fintech Screenshot',
      recommended: true,
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      budget: '₦150,000',
      dateRange: '15th Oct,2025 - 14th Jan 2026',
      type: 'recommendation'
    },
    {
      id: 3,
      title: 'UI/UX Designer for Fintech Screenshot',
      recommended: true,
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      budget: '₦150,000',
      dateRange: '15th Oct,2025 - 14th Jan 2026',
      type: 'recommendation'
    },
    {
      id: 4,
      title: 'UI/UX Designer for Fintech Screenshot',
      recommended: true,
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      budget: '₦150,000',
      dateRange: '15th Oct,2025 - 14th Jan 2026',
      type: 'recommendation'
    },
    {
      id: 5,
      title: 'UI/UX Designer for Fintech Screenshot',
      recommended: false,
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      budget: '₦150,000',
      dateRange: '15th Oct,2025 - 14th Jan 2026',
      type: 'referral',
      referredBy: 'Usman Umar'
    },
    {
      id: 6,
      title: 'UI/UX Designer for Fintech Screenshot',
      recommended: false,
      description: 'Lorem ipsum dolor sit amet consectetur. A et duis mattis vitae enim egestas risus nec. Arcu in velit hac tincidunt quam. Massa gravida velit etiam congue sodales aenean eget.',
      budget: '₦150,000',
      dateRange: '15th Oct,2025 - 14th Jan 2026',
      type: 'referral',
      referredBy: 'Usman Umar'
    }
  ];

  // Filter proposals based on active tab
  const filteredProposals = allProposals.filter(proposal => 
    activeTab === 'recommendations' 
      ? proposal.type === 'recommendation' 
      : proposal.type === 'referral'
  );

  const toggleSave = (id: number) => {
    const newSaved = new Set(savedProposals);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedProposals(newSaved);
  };

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
        {filteredProposals.map((proposal) => (
          <div key={proposal.id} className={styles.proposalCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.proposalTitle}>{proposal.title}</h2>
                {proposal.recommended && (
                  <span className={styles.recommendedBadge}>Recommended for you</span>
                )}
                {proposal.referredBy && (
                  <span className={styles.referredBadge}>Referred by {proposal.referredBy}</span>
                )}
              </div>
              <div className={styles.cardActions}>
                <button className={styles.iconButton}>
                  <Icon icon="mdi:dislike-outline" />
                </button>
                <button 
                  className={styles.iconButton}
                  onClick={() => toggleSave(proposal.id)}
                >
                  <Icon 
                    icon={savedProposals.has(proposal.id) ? "material-symbols:favorite" : "material-symbols:favorite-outline"} 
                    style={{ color: savedProposals.has(proposal.id) ? '#FD6730' : 'inherit' }}
                  />
                </button>
              </div>
            </div>

            <p className={styles.description}>{proposal.description}</p>

            <p className={styles.budgetInfo}>
              Fixed-price - Entry level - Est. Budget: <strong>{proposal.budget}</strong>
            </p>

            <div className={styles.cardFooter}>
                <div style={{display:"flex", alignItems:"center", gap:"16px", justifyContent:"space-between"}}>
              <div className={styles.buttons}>
                <button className={styles.acceptButton}>Accept</button>
                <button className={styles.declineButton}>Decline</button>
              </div>
              <div className={styles.dateInfo}>
                <Icon icon="material-symbols:calendar-today" className={styles.calendarIcon} />
                <span className={styles.dateText}>{proposal.dateRange}</span>
              </div>
                </div> 
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Proposals;
