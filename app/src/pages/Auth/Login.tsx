import '../../styles/pages/auth//login.module.css'
import Logo from '../../assets/logo.png'
import { Icon } from '@iconify/react'

const Login = () => {
  return (
    <div className="login-container">
      <div className="logo-section">
        <img src={Logo} alt="Connecta Logo" className="logo" />
      </div>

      <h2 className="login-title">Login in to Connecta</h2>

      <div className="form-section">
        <div className="input-box">
          <Icon icon="mdi:user-outline" className="input-icon" />
          <input type="text" placeholder="Username or Email" />
        </div>

        <div className="input-box">
          <Icon icon="mdi:lock-outline" className="input-icon" />
          <input type="password" placeholder="Password" />
          <Icon icon="mdi:eye-off-outline" className="eye-icon" />
        </div>

        <button className="signin-btn">Signin</button>

        <div className="divider">
          <span>or</span>
        </div>

        <button className="google-btn">
          <img src="" alt="Google" className="icon" />
          Continue with Google
        </button>

        <button className="apple-btn">
          <img src="" alt="Apple" className="icon" />
          Continue with Apple
        </button>

        <p className="signup-text">
          Don’t have a connecta account? <span className="signup-link">Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
