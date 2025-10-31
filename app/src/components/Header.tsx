import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';
import styles from '../styles/components/Header.module.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleDashboard = () => {
    const userType = localStorage.getItem('userType') || 'freelancer';
    navigate(`/${userType}/dashboard`);
    setIsMenuOpen(false);
  };

  const handleProfile = () => {
    const userType = localStorage.getItem('userType') || 'freelancer';
    navigate(`/${userType}/profile`);
    setIsMenuOpen(false);
  };

  const handleConnectaAI = () => {
    const userType = localStorage.getItem('userType') || 'freelancer';
    navigate(`/${userType}/ai`);
    setIsMenuOpen(false);
  };

  const handleChats = () => {
    const userType = localStorage.getItem('userType') || 'freelancer';
    navigate(`/${userType}/chats`);
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.header}>
      {/* Navigation Bar */}
      <div className={styles.navBar}>
        <Icon 
          icon="pajamas:hamburger" 
          className={styles.hamburgerIcon} 
          onClick={toggleMenu}
        />
        
        <div className={styles.logo}>
          <img className={styles.logoicon} src={Logo} alt="Connecta Logo" />
        </div>

        <Icon icon="ri:search-ai-line" className={styles.hamburgerIcon} onClick={handleConnectaAI} />
      </div>

      {/* Hamburger Menu */}
      {isMenuOpen && (
        <>
          <div className={styles.overlay} onClick={toggleMenu}></div>
          <div className={styles.menuDrawer}>
            <div className={styles.menuHeader}>
              <h3 className={styles.menuTitle}>Menu</h3>
              <Icon 
                icon="mdi:close" 
                className={styles.closeIcon} 
                onClick={toggleMenu}
              />
            </div>

            <div className={styles.menuItems}>
              <div className={styles.menuItem} onClick={handleDashboard}>
                <Icon icon="mdi:view-dashboard" className={styles.menuItemIcon} />
                <span className={styles.menuItemText}>Dashboard</span>
              </div>

              <div className={styles.menuItem} onClick={handleChats}>
                <Icon icon="mdi:message-text" className={styles.menuItemIcon} />
                <span className={styles.menuItemText}>Chats</span>
              </div>

              <div className={styles.menuItem} onClick={handleProfile}>
                <Icon icon="mdi:account-circle" className={styles.menuItemIcon} />
                <span className={styles.menuItemText}>Profile</span>
              </div>

              <div className={styles.menuItem} onClick={handleConnectaAI}>
                <Icon icon="ri:search-ai-line" className={styles.menuItemIcon} />
                <span className={styles.menuItemText}>Connecta AI</span>
              </div>

              <div className={styles.menuDivider}></div>

              <div className={styles.menuItem} onClick={handleLogout}>
                <Icon icon="mdi:logout" className={styles.menuItemIcon} />
                <span className={styles.menuItemText}>Logout</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};  

export default Header;
