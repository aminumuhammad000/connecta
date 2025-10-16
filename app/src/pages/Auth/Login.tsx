import styles from '../../styles/pages/auth/login.module.css'
import Logo from '../../assets/logo.png'
import { Icon } from '@iconify/react'

const Login = () => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.header}>
        <img src={Logo} alt="Connecta Logo" className={styles.logo} />
        <h1 className={styles.title}>Login in to Connecta</h1>
      </div>

      <form className={styles.form}>
        <div className={styles.inputContainer}>
          <div className={styles.inputBox}>
            <Icon icon="majesticons:user-line" className={styles.inputIcon} />
            <input type="text" placeholder="Username or Email" />
          </div>

          <div className={styles.inputBox}>
            <Icon icon="carbon:password" className={styles.inputIcon} />
            <input type="password" placeholder="Password" />
            <Icon icon="mdi:eye-off-outline" className={styles.eyeIcon} />
          </div>
        </div>

        <button className={styles.signinBtn}>Signin</button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button className={`${styles.socialBtn} ${styles.googleBtn}`}>
          <Icon icon="logos:google-icon" className={styles.socialIcon} />
          Continue with Google
        </button>

        <button className={`${styles.socialBtn} ${styles.appleBtn}`}>
          <Icon icon="logos:apple" className={styles.socialIcon} />
          Continue with Apple
        </button>

        <div className={styles.footerText}>
          <p>Don't have a connecta account?</p>
          <a href="/auth" className={styles.signupLink}>Sign up</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
