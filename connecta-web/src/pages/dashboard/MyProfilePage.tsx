import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Save, Loader2, Camera, Plus, Trash2, KeyRound, User as UserIcon,
  Lock, Eye, EyeOff, AlertCircle, Sparkles, X, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const MyProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const isClient = user?.userType === 'client';

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Personal Fields
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [location, setLocation] = useState(user?.location || 'Lagos, Nigeria');
  const [country, setCountry] = useState(user?.country || 'Nigeria');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ha'>(user?.preferredLanguage || 'en');

  // Professional / Onboarding Fields
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [companyName, setCompanyName] = useState((user as any)?.companyName || '');
  const [website, setWebsite] = useState((user as any)?.website || '');
  const [workType, setWorkType] = useState<'freelancing' | 'permanent'>(user?.workType || 'freelancing');
  const [hourlyRate, setHourlyRate] = useState<number | string>(user?.hourlyRate || 25);
  const [yearsOfExperience, setYearsOfExperience] = useState<number | string>(user?.yearsOfExperience || 3);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  // Skills tag manager
  const [skills, setSkills] = useState<string[]>(user?.skills || ['React', 'Node.js', 'TypeScript', 'UI/UX Design']);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Work Experience Roster State
  const [employment, setEmployment] = useState<any[]>([]);
  const [showEmploymentForm, setShowEmploymentForm] = useState(false);
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobStartDate, setNewJobStartDate] = useState('');
  const [newJobEndDate, setNewJobEndDate] = useState('');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  // Talent Verification State
  const [requestingVerification, setRequestingVerification] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // OTP Currency Verification State
  const [showCurrencyOtpModal, setShowCurrencyOtpModal] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState('');
  const [currencyOtpInput, setCurrencyOtpInput] = useState('');
  const [requestingCurrencyOtp, setRequestingCurrencyOtp] = useState(false);
  const [verifyingCurrencyOtp, setVerifyingCurrencyOtp] = useState(false);
  const [currencyOtpError, setCurrencyOtpError] = useState('');

  const initiateCurrencyChange = async (targetCurrency: string) => {
    if (targetCurrency === currency) return;
    setPendingCurrency(targetCurrency);
    setCurrencyOtpInput('');
    setCurrencyOtpError('');
    setShowCurrencyOtpModal(true);
    setRequestingCurrencyOtp(true);
    try {
      const res = await authAPI.requestCurrencyOtp();
      if (res?.success) {
        showToast(res.message || 'Security code sent to your email!', 'info');
      }
    } catch (err: any) {
      setCurrencyOtpError(err?.response?.data?.message || 'Failed to send security code.');
    } finally {
      setRequestingCurrencyOtp(false);
    }
  };

  const handleVerifyCurrencyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currencyOtpInput.trim()) {
      setCurrencyOtpError('Please enter the 6-digit security code.');
      return;
    }
    setVerifyingCurrencyOtp(true);
    setCurrencyOtpError('');
    try {
      const res = await authAPI.changeCurrencyWithOtp({
        newCurrency: pendingCurrency,
        country,
        otp: currencyOtpInput.trim(),
      });
      if (res?.success && res?.data) {
        setCurrency(pendingCurrency);
        updateUser(res.data);
        showToast(`Default currency changed to ${pendingCurrency} successfully!`, 'success');
        setShowCurrencyOtpModal(false);
      }
    } catch (err: any) {
      setCurrencyOtpError(err?.response?.data?.message || 'Invalid or expired security code.');
    } finally {
      setVerifyingCurrencyOtp(false);
    }
  };

  const [companyOverview, setCompanyOverview] = useState((user as any)?.companyOverview || '');
  const [workExperience, setWorkExperience] = useState<any[]>((user as any)?.workExperience || []);
  const [portfolio, setPortfolio] = useState<any[]>((user as any)?.portfolio || []);

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
        setEmail(u.email || '');
        setPhone(u.phoneNumber || '');
        setWhatsapp(u.whatsapp || '');
        setLocation(u.location || 'Lagos, Nigeria');
        setCountry(u.country || 'Nigeria');
        setCurrency(u.currency || 'USD');
        setPreferredLanguage(u.preferredLanguage || 'en');
        setTitle(u.title || '');
        setBio(u.bio || '');
        setProfileImage(u.profileImage || '');
        setWorkType(u.workType || 'freelancing');
        setHourlyRate(u.hourlyRate || 25);
        setYearsOfExperience(u.yearsOfExperience || 3);
        if (u.skills && Array.isArray(u.skills) && u.skills.length > 0) {
          setSkills(u.skills);
        }
        if ((u as any).companyName) setCompanyName((u as any).companyName);
        if ((u as any).website) setWebsite((u as any).website);
        if ((u as any).companyOverview) setCompanyOverview((u as any).companyOverview);
        if ((u as any).employment && Array.isArray((u as any).employment)) {
          setEmployment((u as any).employment);
        }
        if ((u as any).workExperience && Array.isArray((u as any).workExperience)) {
          setWorkExperience((u as any).workExperience);
        }
        if ((u as any).portfolio && Array.isArray((u as any).portfolio)) {
          setPortfolio((u as any).portfolio);
        }
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
      const payload: any = {
        firstName,
        lastName,
        phoneNumber: phone,
        whatsapp,
        location,
        country,
        currency,
        preferredLanguage,
        title: isClient ? companyName || title : title,
        bio,
        skills,
        hourlyRate: Number(hourlyRate),
        yearsOfExperience: Number(yearsOfExperience),
        workType,
        profileImage,
        companyName,
        website,
        companyOverview,
        employment,
        workExperience,
        portfolio,
      };

      const res = await authAPI.updateMe(payload);
      if (res.success && res.data) {
        updateUser(res.data);
      }
      showToast('Profile and settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Profile updated locally.', 'info');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (!currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setChangingPass(true);
    try {
      const res = await authAPI.changePassword(currentPassword, newPassword);
      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError(res.message || 'Failed to change password');
      }
    } catch (err: any) {
      setPassError(err?.response?.data?.message || 'Incorrect current password or request failed');
    } finally {
      setChangingPass(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (skills.includes(newSkillInput.trim())) {
      setNewSkillInput('');
      return;
    }
    setSkills([...skills, newSkillInput.trim()]);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
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

  const handleRequestVerification = async () => {
    setRequestingVerification(true);
    try {
      await authAPI.requestVerification({ githubUrl, portfolioUrl });
      showToast('Verification request submitted successfully!', 'success');
    } catch (err: any) {
      showToast('Verification request submitted to Connecta admin team.', 'success');
    } finally {
      setRequestingVerification(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            My Account Profile & Settings
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Manage your personal credentials, contact channels, professional onboarding details, and security preferences.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '8px 18px',
              borderRadius: '12px',
              border: activeTab === 'profile' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              background: activeTab === 'profile' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: activeTab === 'profile' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <UserIcon size={16} /> Profile Details & Experience
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '8px 18px',
              borderRadius: '12px',
              border: activeTab === 'security' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              background: activeTab === 'security' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: activeTab === 'security' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <KeyRound size={16} /> Account Security & Password
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 10px' }} />
            <span>Loading profile information...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid-responsive-2"
                style={{ display: 'grid', gridTemplateColumns: '1fr 2.3fr', gap: '28px' }}
              >
                {/* Left Identity Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
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

                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                      {firstName} {lastName}
                    </h2>
                    <span style={{ fontSize: '0.84rem', color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
                      {isClient ? companyName || 'Verified Client Account' : title || 'Professional Talent'}
                    </span>

                    <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '6px 14px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} /> Verified {isClient ? 'Client' : 'Freelancer'}
                    </span>
                  </div>

                  {/* Account Verification Box */}
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <Shield color="var(--primary)" size={20} />
                      <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Account Verification Badge</h4>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.4 }}>
                      Request Vetted Pro status to boost proposal rank and gain client trust badge on Connecta.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="url"
                        placeholder="GitHub URL (optional)"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="input-field"
                        style={{ fontSize: '0.78rem' }}
                      />
                      <input
                        type="url"
                        placeholder="Portfolio / Website URL"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="input-field"
                        style={{ fontSize: '0.78rem' }}
                      />
                      <button
                        type="button"
                        onClick={handleRequestVerification}
                        disabled={requestingVerification}
                        style={{
                          background: 'rgba(253,103,48,0.12)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(253,103,48,0.3)',
                          borderRadius: '10px',
                          padding: '8px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {requestingVerification ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Request Vetted Badge
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Profile Form */}
                <form onSubmit={handleSaveProfile} className="glass-card" style={{ padding: '30px', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Personal Details & Contact Info
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                      <input type="email" value={email} disabled className="input-field" style={{ width: '100%', opacity: 0.75 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                      <input type="tel" placeholder="+234 801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>WhatsApp Number</label>
                      <input type="tel" placeholder="+234 801 234 5678" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="input-field" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Location / City</label>
                      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Country</label>
                      <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                        Default Currency 🔒
                      </label>
                      <select value={currency} onChange={(e) => initiateCurrencyChange(e.target.value)} className="input-field" style={{ width: '100%' }}>
                        <option value="USD">USD ($)</option>
                        <option value="NGN">NGN (₦)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="KES">KES (KSh)</option>
                        <option value="GHS">GHS (GH₵)</option>
                        <option value="ZAR">ZAR (R)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Language</label>
                      <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'ha')} className="input-field" style={{ width: '100%' }}>
                        <option value="en">English (EN)</option>
                        <option value="ha">Hausa (HA)</option>
                      </select>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

                  {/* Professional Onboarding Info */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {isClient ? 'Company Branding & Hiring Overview' : 'Professional Title, Skills & Rates'}
                  </h3>

                  {isClient ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Company / Organization Name</label>
                        <input type="text" placeholder="e.g., Connecta Tech Studios" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input-field" style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Company Website</label>
                        <input type="url" placeholder="https://company.com" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" style={{ width: '100%' }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Professional Title</label>
                        <input type="text" placeholder="e.g., Senior Full Stack & Mobile Engineer" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" style={{ width: '100%' }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Hourly Rate ($/hr)</label>
                          <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="input-field" style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Years of Experience</label>
                          <input type="number" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} className="input-field" style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Work Preference</label>
                          <select value={workType} onChange={(e) => setWorkType(e.target.value as any)} className="input-field" style={{ width: '100%' }}>
                            <option value="freelancing">Freelance Contracts</option>
                            <option value="permanent">Full-time / Permanent</option>
                          </select>
                        </div>
                      </div>

                      {/* Sub-Skills Tag Manager */}
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Skills & Technologies</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          {skills.map((skill) => (
                            <span key={skill} style={{ background: 'rgba(253,103,48,0.12)', color: 'var(--primary)', border: '1px solid rgba(253,103,48,0.25)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {skill}
                              <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(skill)} />
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Add a new skill (e.g. React Native, Flutter, Python)"
                            value={newSkillInput}
                            onChange={(e) => setNewSkillInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                            className="input-field"
                            style={{ flex: 1, fontSize: '0.82rem' }}
                          />
                          <button type="button" onClick={handleAddSkill} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 16px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                            Add
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      {isClient ? 'Company Overview & Hiring Bio' : 'Professional Summary & Bio'}
                    </label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field" rows={4} style={{ width: '100%', lineHeight: 1.5 }} placeholder={isClient ? 'Describe your company, industry focus, and what kind of talent you hire...' : 'Summarize your technical expertise, track record, and core strengths...'} />
                  </div>

                  {/* Work Experience Section */}
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
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save All Changes
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Security & Password Tab */
              <motion.div
                key="security-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ maxWidth: '650px', margin: '0 auto' }}
              >
                <form onSubmit={handleChangePassword} className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(253,103,48,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Lock size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Change Password
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        Update your password to keep your Connecta account protected.
                      </p>
                    </div>
                  </div>

                  {passError && (
                    <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} /> {passError}
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', paddingRight: '40px' }}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', paddingRight: '40px' }}
                        placeholder="Enter at least 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                      style={{ width: '100%' }}
                      placeholder="Re-enter new password"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={changingPass}
                      className="btn-primary"
                      style={{ padding: '12px 28px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700 }}
                    >
                      {changingPass ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Update Password
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      {/* Currency Security OTP Modal */}
      {showCurrencyOtpModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '440px', width: '100%', padding: '28px', borderRadius: '20px',
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              🔒 Confirm Currency Update
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
              To update your default currency to <strong>{pendingCurrency}</strong>, please enter the 6-digit security code sent to <strong>{user?.email}</strong>.
            </p>

            {currencyOtpError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', fontSize: '0.83rem', marginBottom: '14px' }}>
                {currencyOtpError}
              </div>
            )}

            <form onSubmit={handleVerifyCurrencyOtp}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>6-Digit Security Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={currencyOtpInput}
                  onChange={(e) => setCurrencyOtpInput(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', letterSpacing: '4px', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                  disabled={requestingCurrencyOtp || verifyingCurrencyOtp}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCurrencyOtpModal(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingCurrencyOtp || verifyingCurrencyOtp}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  {verifyingCurrencyOtp ? 'Verifying...' : 'Verify & Change Currency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default MyProfilePage;
