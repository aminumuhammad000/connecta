import '../../styles/pages/auth/auth.modules.css';
import Logo from '../../assets/logo.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Auth = () => {
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    if (selectedRole) {
      localStorage.setItem('userType', selectedRole);
      navigate(`/signup?role=${selectedRole}`);
    }
  };

  const userType = localStorage.getItem('userType');
  console.log(userType);

  const buttonText =
    selectedRole === 'client'
      ? 'Create Client Account'
      : selectedRole === 'freelancer'
      ? 'Create Freelancer Account'
      : 'Next';

  return (
    <div className="auth-container">
      {/* Logo Section */}
      <div className="logo-section">
        <img className="logo" src={Logo} alt="Connecta Logo" />
      </div>

      {/* Title */}
      <h2 className="auth-title">Join as a Client or Freelancer</h2>

      {/* Role Options */}
      <div className="role-options">
        {/* Client Card */}
        <div
          className={`role-card ${selectedRole === 'client' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('client')}
        >
          <div className="role-header">
            <div className="role-icon"><Icon icon="healthicons:city-worker" /></div>
            <input
              className="client"
              type="radio"
              checked={selectedRole === 'client'}
              readOnly
            />
          </div>
          <p className="card-text">I’m a client, hiring for a project</p>
        </div>

        {/* Freelancer Card */}
        <div
          className={`role-card ${selectedRole === 'freelancer' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('freelancer')}
        >
          <div className="role-header">
            <div className="role-icon">
              <Icon icon="streamline-cyber-color:business-laptop" />
            </div>
            <input
              className="radio"
              type="radio"
              checked={selectedRole === 'freelancer'}
              readOnly
            />
          </div>
          <p className="card-text">I’m a freelancer, looking for work</p>
        </div>
      </div>

      {/* Create Account Button */}
      <button
        className={`create-account ${!selectedRole ? 'disabled' : ''}`}
        onClick={handleCreateAccount}
        disabled={!selectedRole}
      >
        {buttonText}
      </button>

      {/* Footer */}
      <p className="auth-footer">
        Already have an account? <a href="/login">Log In</a>
      </p>
    </div>
  );
};

export default Auth;
