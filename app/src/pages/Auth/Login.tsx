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
        showSuccess('Login successful! Redirecting to dashboard...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
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
      <div className={styles.header}>
        <img src={Logo} alt="Connecta Logo" className={styles.logo} />
        <h1 className={styles.title}>Login in to Connecta</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            color: 'red', 
            padding: '10px', 
            marginBottom: '15px', 
            backgroundColor: '#fee', 
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div className={styles.inputContainer}>
          <div className={styles.inputBox}>
            <Icon icon="majesticons:user-line" className={styles.inputIcon} />
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.inputBox}>
            <Icon icon="carbon:password" className={styles.inputIcon} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <Icon 
              icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} 
              className={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        <button type="submit" className={styles.signinBtn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button type="button" className={`${styles.socialBtn} ${styles.googleBtn}`}>
          <Icon icon="logos:google-icon" className={styles.socialIcon} />
          Continue with Google
        </button>

        <button type="button" className={`${styles.socialBtn} ${styles.appleBtn}`}>
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
