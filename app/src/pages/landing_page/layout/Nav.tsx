import styles from "../../../styles/layouts/Nav.module.css"
import { Icon } from '@iconify/react';
import logo from "../../../assets/logo.png"
import { Link } from "react-router-dom";

const Nav = () => {
  return (
    <div className={styles.Nav}>
    <div className={styles.menuContainer}>
      <button className={styles.menu}>
        <Icon icon="pajamas:hamburger" />
      </button>
      <img src={logo} alt="logo" className={styles.logo}/>
      </div>
      <button className={styles.signin}><Link to="auth" id="link">Sign up</Link></button>
    </div>
  )
}

export default Nav
