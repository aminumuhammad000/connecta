import { Icon } from '@iconify/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Logo from '../../../assets/logo.png';
import styles from '../styles/ClientSidebar.module.css';

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClientSidebar = ({ isOpen, onClose }: ClientSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close mobile sidebar after navigation
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose}></div>
      )}
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarInner}>
          {/* Logo */}
          <div className={styles.logoSection}>
            <button onClick={() => handleNavigation('/client-dashboard')} className={styles.logoLink}>
              <img src={Logo} alt="Connecta Logo" className={styles.logoImage} />
            </button>
          </div>

          {/* Navigation */}
          <nav className={styles.nav}>
            <button 
              onClick={() => handleNavigation('/client-dashboard')} 
              className={`${styles.navItem} ${isActive('/client-dashboard') ? styles.active : ''}`}
            >
              <Icon icon="material-symbols:dashboard-outline" className={styles.navIcon} />
              Dashboard
            </button>
            <button 
              onClick={() => handleNavigation('/client/projects')} 
              className={`${styles.navItem} ${isActive('/client/projects') ? styles.active : ''}`}
            >
              <Icon icon="material-symbols:folder-outline" className={styles.navIcon} />
              My Projects
            </button>
            <button 
              onClick={() => handleNavigation('/client/create-job')} 
              className={`${styles.navItem} ${isActive('/client/create-job') ? styles.active : ''}`}
            >
              <Icon icon="material-symbols:auto-awesome-outline" className={styles.navIcon} />
              Create Job
            </button>
            <button 
              onClick={() => handleNavigation('/dashboard')} 
              className={styles.navItem}
            >
              <Icon icon="material-symbols:group-outline" className={styles.navIcon} />
              Find Freelancers
            </button>
            <button 
              onClick={() => handleNavigation('/chats')} 
              className={`${styles.navItem} ${isActive('/chats') ? styles.active : ''}`}
            >
              <Icon icon="material-symbols:chat-bubble-outline" className={styles.navIcon} />
              Messages
            </button>
          </nav>

          {/* Bottom Section */}
          <div className={styles.bottomSection}>
            <button 
              onClick={() => handleNavigation('/edit-profile')} 
              className={styles.navItem}
            >
              <Icon icon="material-symbols:settings-outline" className={styles.navIcon} />
              Settings
            </button>
            <button onClick={handleLogout} className={styles.navItem}>
              <Icon icon="material-symbols:logout" className={styles.navIcon} />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;
