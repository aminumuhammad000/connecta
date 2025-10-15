import styles from "../../../styles/layouts/Nav.module.css"
import { Icon } from '@iconify/react';
import logo from "../../../assets/logo.png"

const Nav = () => {
  return (
    <div className={styles.Nav}>
    <div className={styles.menuContainer}>
      <button className={styles.menu}>
        <Icon icon="pajamas:hamburger" />
      </button>
      <img src={logo} alt="logo" className={styles.logo}/>
      </div>
      <button className={styles.signin}>Sign up</button>
    </div>
  )
}

export default Nav
