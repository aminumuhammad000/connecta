import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/pages/auth/signup.module.css';
import Logo from '../../assets/logo.png';
import { Icon } from '@iconify/react';

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
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { ...formData, role });
  };

  const handleRoleSwitch = () => {
    const newRole = role === 'client' ? 'freelancer' : 'client';
    navigate(`/signup?role=${newRole}`);
  };

  // Dynamic content based on role
  const title = role === 'client' ? 'Sign up to hire freelancer' : 'Sign up to find job';
  const footerText = role === 'client' 
    ? { question: 'Need a job?', link: 'Join as Freelancer' }
    : { question: 'Want to hire a freelancer?', link: 'Join as client' };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.header}>
        <img src={Logo} alt="Connecta Logo" className={styles.logo} />
      </div>

      <h1 className={styles.title}>{title}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <button type="button" className={styles.googleBtn}>
          <div className={styles.googleIcon}>
            <Icon icon="logos:google-icon" className={styles.googleLogo} />
          </div>
          Continue with Google
        </button>

        <div className={styles.divider}>
          <span>or</span>
        </div>

       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div className={styles.nameFields} style={{ display: "inline-flex", gap: "10px" }}>
    <div className={styles.fieldGroup}>
      <label className={styles.label}>First name</label>
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleInputChange}
        placeholder="Enter your first name"
        className={styles.input}
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
      />
    </div>
  </div>
</div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            className={styles.input}
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
              placeholder="Create a new password (8 or more characters)"
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon 
                icon={showPassword ? "mdi:eye-outline" : "mdi:eye-off-outline"} 
                className={styles.eyeIcon} 
              />
            </button>
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="helpfulEmails"
              checked={formData.helpfulEmails}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Send you helpful emails to find rewarding work and job deals
            </span>
          </label>
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Yes, i understand and agree to the{' '}
              <span className={styles.link}>Connecta Terms and Conditions</span>, including the{' '}
              <span className={styles.link}>User Agreement</span> and{' '}
              <span className={styles.link}>Privacy Policy</span>.
            </span>
          </label>
        </div>

        <button type="submit" className={styles.createAccountBtn}>
          Create Account
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
