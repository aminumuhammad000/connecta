import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../../contexts/AuthContext';
import ClientSidebar from '../components/ClientSidebar';
import ClientHeader from '../components/ClientHeader';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Notification settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [whatsappNotif, setWhatsappNotif] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [proposalAlerts, setProposalAlerts] = useState(true);

  const fullName = `${user?.firstName} ${user?.lastName}`;
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0ea5e9&color=fff&size=128`;

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match!');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage('Password must be at least 8 characters!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPasswordMessage('✓ Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage(data.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordMessage('Error changing password');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/users/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailNotif,
          smsNotif,
          whatsappNotif,
          projectUpdates,
          messageAlerts,
          proposalAlerts,
        }),
      });
      alert('Notification settings saved!');
    } catch (error) {
      alert('Error saving settings');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ClientHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main style={{ flex: 1, padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          {/* Profile Header */}
          <div style={{ background: 'white', borderRadius: 16, padding: 32, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <img src={avatar} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid #0ea5e9' }} />
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{fullName}</h1>
                <p style={{ margin: '8px 0 0', fontSize: 16, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon icon="mdi:email-outline" /> {user?.email}
                </p>
                <span style={{ display: 'inline-block', marginTop: 12, padding: '6px 16px', background: '#dbeafe', color: '#1e40af', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>
                  {user?.userType === 'client' ? 'Client' : 'Freelancer'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #e5e7eb' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'profile' ? '3px solid #0ea5e9' : '3px solid transparent',
                color: activeTab === 'profile' ? '#0ea5e9' : '#64748b',
                fontWeight: activeTab === 'profile' ? 600 : 400,
                fontSize: 15,
                cursor: 'pointer',
                marginBottom: -2,
              }}
            >
              <Icon icon="mdi:account" style={{ marginRight: 8, fontSize: 20 }} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'security' ? '3px solid #0ea5e9' : '3px solid transparent',
                color: activeTab === 'security' ? '#0ea5e9' : '#64748b',
                fontWeight: activeTab === 'security' ? 600 : 400,
                fontSize: 15,
                cursor: 'pointer',
                marginBottom: -2,
              }}
            >
              <Icon icon="mdi:lock" style={{ marginRight: 8, fontSize: 20 }} />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'notifications' ? '3px solid #0ea5e9' : '3px solid transparent',
                color: activeTab === 'notifications' ? '#0ea5e9' : '#64748b',
                fontWeight: activeTab === 'notifications' ? 600 : 400,
                fontSize: 15,
                cursor: 'pointer',
                marginBottom: -2,
              }}
            >
              <Icon icon="mdi:bell" style={{ marginRight: 8, fontSize: 20 }} />
              Notifications
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700 }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company name"
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
              </div>
              <button
                style={{
                  marginTop: 24,
                  padding: '12px 32px',
                  background: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Icon icon="mdi:content-save" style={{ marginRight: 8 }} />
                Save Changes
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700 }}>Change Password</h2>
              <div style={{ maxWidth: 500 }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15 }}
                  />
                </div>
                {passwordMessage && (
                  <p style={{ padding: 12, background: passwordMessage.includes('✓') ? '#d1fae5' : '#fee2e2', color: passwordMessage.includes('✓') ? '#065f46' : '#991b1b', borderRadius: 8, marginBottom: 20 }}>
                    {passwordMessage}
                  </p>
                )}
                <button
                  onClick={handlePasswordChange}
                  style={{
                    padding: '12px 32px',
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Icon icon="mdi:lock-reset" style={{ marginRight: 8 }} />
                  Change Password
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 700 }}>Notification Settings</h2>
              
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>Notification Channels</h3>
                {[
                  { icon: 'mdi:email', label: 'Email Notifications', state: emailNotif, setState: setEmailNotif },
                  { icon: 'mdi:message-text', label: 'SMS Alerts', state: smsNotif, setState: setSmsNotif },
                  { icon: 'mdi:whatsapp', label: 'WhatsApp Notifications', state: whatsappNotif, setState: setWhatsappNotif },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Icon icon={item.icon} style={{ fontSize: 24, color: '#0ea5e9' }} />
                      <span style={{ fontSize: 15, fontWeight: 500, color: '#1e293b' }}>{item.label}</span>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28 }}>
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={(e) => item.setState(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: item.state ? '#0ea5e9' : '#cbd5e1',
                        transition: '0.3s',
                        borderRadius: 28,
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: 20,
                          width: 20,
                          left: item.state ? 28 : 4,
                          bottom: 4,
                          background: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                        }} />
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>Alert Preferences</h3>
                {[
                  { icon: 'mdi:briefcase', label: 'Project Updates', desc: 'Get notified about project milestones', state: projectUpdates, setState: setProjectUpdates },
                  { icon: 'mdi:message', label: 'Message Alerts', desc: 'Receive alerts for new messages', state: messageAlerts, setState: setMessageAlerts },
                  { icon: 'mdi:file-document', label: 'Proposal Alerts', desc: 'Notifications for new proposals', state: proposalAlerts, setState: setProposalAlerts },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <Icon icon={item.icon} style={{ fontSize: 24, color: '#0ea5e9' }} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#1e293b' }}>{item.label}</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{item.desc}</div>
                      </div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28 }}>
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={(e) => item.setState(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: item.state ? '#0ea5e9' : '#cbd5e1',
                        transition: '0.3s',
                        borderRadius: 28,
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: 20,
                          width: 20,
                          left: item.state ? 28 : 4,
                          bottom: 4,
                          background: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                        }} />
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveNotifications}
                style={{
                  padding: '12px 32px',
                  background: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Icon icon="mdi:content-save" style={{ marginRight: 8 }} />
                Save Notification Settings
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
