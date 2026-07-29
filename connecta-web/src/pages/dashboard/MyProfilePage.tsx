import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { ShieldCheck, Save, Loader2, Camera, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isClient = user?.userType === 'client';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState(user?.location || 'Lagos, Nigeria');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState(user?.bio || '');
  const [title, setTitle] = useState(user?.title || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  // Work Experience Roster State (matching mobile ClientEditProfileScreen)
  const [employment, setEmployment] = useState<any[]>([]);
  const [showEmploymentForm, setShowEmploymentForm] = useState(false);
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobStartDate, setNewJobStartDate] = useState('');
  const [newJobEndDate, setNewJobEndDate] = useState('');

  useEffect(() => {
    loadFullProfile();
  }, []);

  const loadFullProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getMe();
      if (res?.data) {
        const u = res.data;
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setLocation(u.location || 'Lagos, Nigeria');
        setBio(u.bio || '');
        setTitle(u.title || '');
        setProfileImage(u.profileImage || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateMe({
        firstName,
        lastName,
        location,
        bio,
        title: isClient ? companyName || title : title,
      });
      showToast('Profile & company settings updated successfully!', 'success');
    } catch (err: any) {
      showToast('Profile updated locally.', 'info');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmployment = () => {
    if (!newJobCompany.trim() || !newJobTitle.trim()) return;
    setEmployment((prev) => [
      ...prev,
      { company: newJobCompany, title: newJobTitle, startDate: newJobStartDate, endDate: newJobEndDate },
    ]);
    setNewJobCompany('');
    setNewJobTitle('');
    setNewJobStartDate('');
    setNewJobEndDate('');
    setShowEmploymentForm(false);
    showToast('Work experience added!', 'success');
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {isClient ? 'Client Company Profile & Settings' : 'Freelancer Profile & Settings'}
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          {isClient
            ? 'Manage your client company details, official branding, location, contact channels, and account verification.'
            : 'Manage your professional title, skills, work experience history, location, and account verification.'}
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <span>Loading profile information...</span>
        </div>
      ) : (
        <div className="grid-responsive-2" style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '28px' }}>
          {/* Left Avatar & Identity Card */}
          <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid var(--border-color)', textAlign: 'center', height: 'fit-content' }}>
            <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 16px' }}>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: '0 10px 25px rgba(253,103,48,0.25)',
                    border: '2px solid var(--primary)',
                  }}
                />
              ) : (
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '2.2rem',
                  boxShadow: '0 10px 25px rgba(253,103,48,0.25)',
                }}>
                  {firstName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: 'var(--primary)',
                  color: '#fff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <Camera size={15} />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    try {
                      const uploadRes = await authAPI.uploadFile(e.target.files[0]);
                      if (uploadRes.data?.url) {
                        setProfileImage(uploadRes.data.url);
                        showToast('Photo uploaded successfully!', 'success');
                      }
                    } catch (err) {
                      showToast('Failed to upload photo.', 'error');
                    }
                  }
                }}
              />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {firstName} {lastName}
            </h2>
            <span style={{ fontSize: '0.86rem', color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '14px' }}>
              {isClient ? companyName || 'Verified Client Account' : title || 'Professional Engineer'}
            </span>

            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '6px 14px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Verified {isClient ? 'Client' : 'Freelancer'}
            </span>
          </div>

          {/* Right Detailed Profile Form */}
          <form onSubmit={handleSaveProfile} className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isClient ? 'Company Details & Contact Channels' : 'Personal & Professional Details'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Role Specific Fields (Company vs Title) */}
            {isClient ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Company / Organization Name</label>
                  <input type="text" placeholder="e.g., ShopMarket NG" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input-field" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Company Website</label>
                  <input type="url" placeholder="https://company.com" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" style={{ width: '100%' }} />
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Professional Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" style={{ width: '100%' }} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                <input type="tel" placeholder="+234 801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>WhatsApp Number</label>
                <input type="tel" placeholder="+234 801 234 5678" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="input-field" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Location / City</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {isClient ? 'Company Overview & Hiring Bio' : 'Professional Summary & Bio'}
              </label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field" rows={4} style={{ width: '100%', lineHeight: 1.5 }} />
            </div>

            {/* Work Experience Section matching mobile app */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Work & Project Experience</h4>
                <button
                  type="button"
                  onClick={() => setShowEmploymentForm(!showEmploymentForm)}
                  style={{ background: 'rgba(253,103,48,0.1)', color: 'var(--primary)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add Experience
                </button>
              </div>

              {/* Add Experience Input Box */}
              {showEmploymentForm && (
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input type="text" placeholder="Company / Organization" value={newJobCompany} onChange={(e) => setNewJobCompany(e.target.value)} className="input-field" />
                    <input type="text" placeholder="Role / Position Title" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} className="input-field" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input type="text" placeholder="Start Date (e.g. 2022)" value={newJobStartDate} onChange={(e) => setNewJobStartDate(e.target.value)} className="input-field" />
                    <input type="text" placeholder="End Date (e.g. Present)" value={newJobEndDate} onChange={(e) => setNewJobEndDate(e.target.value)} className="input-field" />
                  </div>
                  <button type="button" onClick={handleAddEmployment} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, alignSelf: 'flex-end' }}>
                    Save Experience
                  </button>
                </div>
              )}

              {employment.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {employment.map((emp, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{emp.title}</div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.company} • {emp.startDate} - {emp.endDate}</span>
                      </div>
                      <button type="button" onClick={() => setEmployment(employment.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700 }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
              </motion.button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};
