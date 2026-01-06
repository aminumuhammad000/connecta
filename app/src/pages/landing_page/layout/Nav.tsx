import styles from "../../../styles/layouts/Nav.module.css"
import logo from "../../../assets/logo.png"

const Nav = () => {
  return (
    <div className={styles.Nav}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="logo" className={styles.logo} />
      </div>

      <nav className={styles.navLinks}>
        <a href="#home" className={styles.navLink}>Home</a>
        <a href="#features" className={styles.navLink}>Features</a>
        <a href="#how-it-works" className={styles.navLink}>How It Works</a>
        <a href="#pricing" className={styles.navLink}>Pricing</a>
        <a href="#contact" className={styles.navLink}>Contact</a>
      </nav>

      <div className={styles.authButtons}>
        <a href="https://app.myconnecta.ng" className={styles.login}>Log In</a>
        <a href="https://app.myconnecta.ng" className={styles.signup}>Sign Up</a>
      </div>
    </div>
  )
}

export default Nav
