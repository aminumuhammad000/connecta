import { useState, useEffect } from 'react';
import ClientSidebar from './components/ClientSidebar';
import ClientHeader from './components/ClientHeader';
import CreateJobSection from './components/CreateJobSection';
import FindFreelancersSection from './components/FindFreelancersSection';
import MessagesPanel from './components/MessagesPanel';
import DashboardStats from './components/DashboardStats';
import { dashboardAPI } from '../../api/dashboard';
import styles from './styles/ClientDashboard.module.css';

interface DashboardData {
  stats: {
    activeJobs: number;
    totalCandidates: number;
    unreadMessages: number;
  };
  freelancers: any[];
  messages: any[];
}

const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: { activeJobs: 0, totalCandidates: 0, unreadMessages: 0 },
    freelancers: [],
    messages: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, freelancersResponse, messagesResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getFreelancers(),
        dashboardAPI.getMessages(),
      ]);

      setDashboardData({
        stats: statsResponse.stats,
        freelancers: freelancersResponse.freelancers || [],
        messages: messagesResponse.messages || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={styles.mainContent}>
          <ClientHeader onMenuClick={toggleSidebar} />
          <main className={styles.main}>
            <div className={styles.loader}>
              <div className={styles.spinner}></div>
              <p>Loading dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={styles.mainContent}>
        <ClientHeader onMenuClick={toggleSidebar} />
        
        <main className={styles.main}>
          <div className={styles.leftColumn}>
            <DashboardStats stats={dashboardData.stats} />
            <CreateJobSection />
            <FindFreelancersSection freelancers={dashboardData.freelancers} />
          </div>
          
          <div className={styles.rightColumn}>
            <MessagesPanel messages={dashboardData.messages} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
