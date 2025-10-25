import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import jwtDecode from 'jwt-decode';
import { jwtDecode } from "jwt-decode";
import { Icon } from '@iconify/react';
import styles from '../../styles/pages/auth/signup.module.css';
import Logo from '../../assets/logo.png';

// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') as 'client' | 'freelancer';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    helpfulEmails: true,
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle normal signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userType: role }),
      });

      const data = await response.json();
      console.log('Signup Response:', data);

      if (response.ok) {
        alert('Signup successful!');
        navigate('/login');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google signup
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const { email, given_name, family_name, picture } = decoded;

      const response = await fetch(`${API_BASE_URL}/users/google-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: given_name,
          lastName: family_name,
          profileImage: picture,
          userType: role,
        }),
      });

      const data = await response.json();
      console.log('Google Signup Response:', data);

      if (response.ok) {
        alert('Google signup successful!');
        navigate('/dashboard');
      } else {
        alert(data.message || 'Google signup failed');
      }
    } catch (error) {
      console.error('Google signup error:', error);
    }
  };

  const handleGoogleError = () => {
    alert('Google sign-in failed. Please try again.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRoleSwitch = () => {
    const newRole = role === 'client' ? 'freelancer' : 'client';
    navigate(`/signup?role=${newRole}`);
  };

  const title =
    role === 'client' ? 'Sign up to hire freelancer' : 'Sign up to find job';
  const footerText =
    role === 'client'
      ? { question: 'Need a job?', link: 'Join as Freelancer' }
      : { question: 'Want to hire a freelancer?', link: 'Join as client' };

  return (
    <div className={styles.signupContainer} data-role={role}>
      <div className={styles.header}>
        <img src={Logo} alt="Connecta Logo" className={styles.logo} />
        <h1 className={styles.title}>{title}</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Google Signup */}
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </GoogleOAuthProvider>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        {/* Normal Signup */}
        <div className={styles.nameFields}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>First name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Last name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.passwordField}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password (8+ characters)"
              className={styles.input}
              required
            />
            <button
              type="button"
              className={styles.eyeToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon
                icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'}
                className={styles.eyeIcon}
              />
            </button>
          </div>
        </div>

        <button type="submit" className={styles.createAccountBtn} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          {footerText.question}{' '}
          <span className={styles.footerLink} onClick={handleRoleSwitch}>
            {footerText.link}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
