import { Icon } from '@iconify/react';
import styles from '../styles/ProfileDetails.module.css';
import Logo from '../../../assets/logo.png';

export const Header = () => (
  <header className={styles.header}>
    <button aria-label="Open menu" className={styles.menuButton}>
      <Icon icon="lucide:menu" className={styles.menuIcon} />
    </button>
    <img src={Logo} alt="Connecta Logo" className={styles.logo} />
    <div className={styles.spacer}></div>
  </header>
);
