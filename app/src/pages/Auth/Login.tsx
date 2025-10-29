import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import styles from '../../styles/pages/auth/login.module.css';
import Logo from '../../assets/logo.png';
import { Icon } from '@iconify/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showLoader, hideLoader, showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    showLoader();

    try {
      console.log('Attempting login with:', { email: formData.email });
      console.log('API URL:', `${API_BASE_URL}/users/signin`);

      const response = await fetch(`${API_BASE_URL}/users/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Login Response:', data);

      if (response.ok && data.token) {
        // Store token and user data
        login(data.token, data.user);
        showSuccess('Login successful! Redirecting...');
        
        // Redirect based on user type
        setTimeout(() => {
          if (data.user.userType === 'client') {
            navigate('/client-dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } else {
        showError(data.message || 'Login failed. Please check your credentials.');
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', err.message);
      showError(`Something went wrong: ${err.message}. Please try again.`);
      setError(`Something went wrong: ${err.message}. Please try again.`);
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Desktop: Left Side - Brand Section */}
      <div className={styles.leftSection}>
        <div className={styles.brandContent}>
          <div className={styles.brandHeader}>
            <img src={Logo} alt="Connecta Logo" className={styles.brandIcon} />
          </div>
          <h2 className={styles.brandTitle}>The future of work, connected by AI.</h2>
          <p className={styles.brandDescription}>
            Find the best talent or your next big opportunity with our intelligent matching platform.
          </p>
          <div className={styles.brandImageContainer}>
            <div className={styles.brandImagePlaceholder}></div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className={styles.rightSection}>
        <div className={styles.formWrapper}>
          {/* Mobile Logo */}
          <div className={styles.mobileHeader}>
            <img src={Logo} alt="Connecta Logo" className={styles.mobileLogo} />
          </div>

          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Welcome Back</h1>
            <p className={styles.formSubtitle}>Log in to access your dashboard.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorBox}>
                {error}
              </div>
            )}

            <div className={styles.inputContainer}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email address</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Password</label>
                <div className={styles.passwordWrapper}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password"
                    placeholder="Enter your password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                  <Icon 
                    icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} 
                    className={styles.eyeIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <a href="#" className={styles.forgotLink}>Forgot Password?</a>
            </div>

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'Signing in...' : 'Log In'}
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button type="button" className={styles.socialBtn}>
              <Icon icon="flat-color-icons:google" className={styles.socialIcon} />
              Continue with Google
            </button>

            <button type="button" className={styles.socialBtn}>
              <Icon icon="ic:baseline-apple" className={styles.socialIcon} />
              Continue with Apple
            </button>

            <div className={styles.footerText}>
              <p>Don't have an account? <a href="/auth" className={styles.signupLink}>Sign Up</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
