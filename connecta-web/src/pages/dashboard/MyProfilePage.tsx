import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Save, Loader2, Camera, Plus, Trash2, KeyRound, User as UserIcon,
  Lock, Eye, EyeOff, AlertCircle, Sparkles, X, Shield, FileText, UploadCloud, GraduationCap, Globe, Briefcase,
  ExternalLink, Check, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';

export const MyProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const routerLocation = useLocation();
  const { currencies = [], setSelectedCurrency } = useCurrency();
  const isClient = user?.userType === 'client';

  const getInitialTab = () => {
    if (window.location.pathname.includes('/settings')) return 'security';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'settings' || tab === 'security') return 'security';
    if (tab && ['personal', 'professional', 'languages', 'experience', 'education'].includes(tab)) {
      return tab as any;
    }
    return 'personal';
  };

  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'languages' | 'experience' | 'education' | 'security'>(getInitialTab);

  useEffect(() => {
    if (routerLocation.pathname.includes('/settings')) {
      setActiveTab('security');
    } else {
      const params = new URLSearchParams(routerLocation.search);
      const tab = params.get('tab');
      if (tab === 'settings' || tab === 'security') {
        setActiveTab('security');
      }
    }
  }, [routerLocation.pathname, routerLocation.search]);

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
  const [portfolioWebsite, setPortfolioWebsite] = useState((user as any)?.portfolioWebsite || (user as any)?.website || '');
  const [portfolioWebsiteError, setPortfolioWebsiteError] = useState('');

  const validateUrl = (urlStr: string): boolean => {
    if (!urlStr || !urlStr.trim()) return true;
    const trimmed = urlStr.trim();
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i;
    return urlRegex.test(trimmed);
  };

  const handleDirectCurrencyChange = async (newCode: string) => {
    setCurrency(newCode);
    setSelectedCurrency(newCode);
    try {
      const res = await authAPI.updateMe({ currency: newCode });
      if (res?.success && res?.data) {
        updateUser(res.data);
      }
      showToast(`Default currency updated to ${newCode} successfully!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update currency', 'error');
    }
  };

  const [workType, setWorkType] = useState<'freelancing' | 'permanent'>(user?.workType || 'freelancing');
  const [hourlyRate, setHourlyRate] = useState<number | string>(user?.hourlyRate || 25);
  const [yearsOfExperience, setYearsOfExperience] = useState<number | string>(user?.yearsOfExperience || 3);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [resume, setResume] = useState((user as any)?.resume || (user as any)?.cv || '');
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('CV file size must be under 10MB', 'error');
      return;
    }
    setUploadingResume(true);
    try {
      const res = await authAPI.uploadFile(file);
      const url = res?.data?.url || (res as any)?.url;
      if (url) {
        setResume(url);
        const updateRes = await authAPI.updateMe({ resume: url, cv: url });
        if (updateRes.success && updateRes.data) {
          updateUser(updateRes.data);
        }
        showToast('CV / Resume uploaded successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'CV upload failed.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

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
  const [education, setEducation] = useState<any[]>((user as any)?.education || []);
  const [languages, setLanguages] = useState<string[]>((user as any)?.languages || ['English']);
  const [newLangInput, setNewLangInput] = useState('');
  const [portfolio, setPortfolio] = useState<any[]>((user as any)?.portfolio || []);

  useEffect(() => {
    loadFullProfile();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      if (user.firstName && !firstName) setFirstName(user.firstName);
      if (user.lastName && !lastName) setLastName(user.lastName);
      if (user.profileImage && !profileImage) setProfileImage(user.profileImage);
      if ((user as any)?.resume || (user as any)?.cv) setResume((user as any)?.resume || (user as any)?.cv);
    }
  }, [user]);

  const loadFullProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getMe();
      const u = (res as any)?.data?.user || res?.data || (res as any)?.user || user;
      if (u) {
        setEmail(u.email || user?.email || '');
        setFirstName(u.firstName || user?.firstName || '');
        setLastName(u.lastName || user?.lastName || '');
        setPhone(u.phoneNumber || user?.phoneNumber || '');
        setWhatsapp(u.whatsapp || (user as any)?.whatsapp || '');
        setLocation(u.location || user?.location || 'Lagos, Nigeria');
        setCountry(u.country || user?.country || 'Nigeria');
        setCurrency(u.currency || user?.currency || 'USD');
        setPreferredLanguage(u.preferredLanguage || user?.preferredLanguage || 'en');
        setTitle(u.title || user?.title || '');
        setBio(u.bio || user?.bio || '');
        setProfileImage(u.profileImage || user?.profileImage || '');
        setWorkType(u.workType || user?.workType || 'freelancing');
        setHourlyRate(u.hourlyRate || user?.hourlyRate || 25);
        setYearsOfExperience(u.yearsOfExperience || user?.yearsOfExperience || 3);
        if (u.resume || u.cv) setResume(u.resume || u.cv);
        if (u.skills && Array.isArray(u.skills) && u.skills.length > 0) {
          setSkills(u.skills);
        }
        if ((u as any).languages && Array.isArray((u as any).languages) && (u as any).languages.length > 0) {
          setLanguages((u as any).languages);
        }
        if ((u as any).companyName) setCompanyName((u as any).companyName);
        if ((u as any).website) setWebsite((u as any).website);
        const pWeb = (u as any).portfolioWebsite || (u as any).website || '';
        if (pWeb) {
          setPortfolioWebsite(pWeb);
          if (!isClient) setWebsite(pWeb);
        }
        if ((u as any).companyOverview) setCompanyOverview((u as any).companyOverview);
        if ((u as any).employment && Array.isArray((u as any).employment)) {
          setEmployment((u as any).employment);
        }
        if ((u as any).workExperience && Array.isArray((u as any).workExperience)) {
          setWorkExperience((u as any).workExperience);
        }
        if ((u as any).education && Array.isArray((u as any).education)) {
          setEducation((u as any).education);
        }
        if ((u as any).portfolio && Array.isArray((u as any).portfolio)) {
          setPortfolio((u as any).portfolio);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      if (user?.email) setEmail(user.email);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCv = async () => {
    try {
      const updateRes = await authAPI.updateMe({ resume: '', cv: '' });
      if (updateRes.success && updateRes.data) {
        updateUser(updateRes.data);
      }
      setResume('');
      showToast('CV removed from profile', 'info');
    } catch (err: any) {
      showToast('Failed to remove CV', 'error');
    }
  };

  const handleAddLanguage = () => {
    if (!newLangInput.trim()) return;
    if (languages.includes(newLangInput.trim())) {
      setNewLangInput('');
      return;
    }
    setLanguages([...languages, newLangInput.trim()]);
    setNewLangInput('');
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setLanguages(languages.filter((l) => l !== langToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (portfolioWebsite && !validateUrl(portfolioWebsite)) {
      setPortfolioWebsiteError('Please enter a valid website URL (e.g. https://yourportfolio.com)');
      showToast('Please enter a valid portfolio website URL', 'error');
      setSaving(false);
      return;
    }

    const finalPortfolioWebsite = portfolioWebsite ? (
      portfolioWebsite.startsWith('http://') || portfolioWebsite.startsWith('https://')
        ? portfolioWebsite.trim()
        : `https://${portfolioWebsite.trim()}`
    ) : '';

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
        languages,
        education,
        hourlyRate: Number(hourlyRate),
        yearsOfExperience: Number(yearsOfExperience),
        workType,
        profileImage,
        resume,
        cv: resume,
        companyName,
        website: isClient ? website : (finalPortfolioWebsite || website),
        portfolioWebsite: finalPortfolioWebsite,
        companyOverview,
        employment,
        workExperience,
        portfolio,
      };

      const res = await authAPI.updateMe(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        if (currency) {
          setSelectedCurrency(currency);
        }
        showToast('Profile and settings saved successfully!', 'success');
      }
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
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
        {/* Ultra-Minimalist Profile Hero Banner */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid var(--border-color)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}>
                    {firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                  title="Upload Photo"
                >
                  <Camera size={9} />
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

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {firstName} {lastName}
                  </h1>
                  <span title="Verified Account" style={{ display: 'inline-flex', flexShrink: 0 }}>
                    <ShieldCheck size={15} color="#10B981" />
                  </span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, background: 'rgba(253,103,48,0.08)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '6px', flexShrink: 0, textTransform: 'capitalize' }}>
                    {user?.userType || 'User'}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>
                  {email}
                </div>
              </div>
            </div>

            {/* Save Button */}
            {activeTab !== 'security' && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                type="button"
                disabled={saving}
                className="btn-primary"
                style={{ padding: '7px 16px', borderRadius: '9px', fontSize: '0.8rem', fontWeight: 600 }}
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Changes
              </motion.button>
            )}
          </div>
        </div>

          {/* Prominent Connected Tree Node Timeline Bar */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '10px 14px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            overflowX: 'auto',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '600px',
              position: 'relative',
            }}>
              {/* Underlying Horizontal Tree Branch Line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '20px',
                right: '20px',
                height: '2px',
                background: 'var(--border-color)',
                transform: 'translateY(-50%)',
                zIndex: 1,
              }} />

              {[
                { id: 'personal', label: 'Personal', icon: <UserIcon size={13} /> },
                { id: 'professional', label: 'Professional', icon: <Briefcase size={13} /> },
                ...(!isClient ? [
                  { id: 'languages', label: 'Languages', icon: <Globe size={13} /> },
                  { id: 'experience', label: 'Experience', icon: <Briefcase size={13} /> },
                  { id: 'education', label: 'Education', icon: <GraduationCap size={13} /> },
                ] : []),
                { id: 'security', label: 'Settings', icon: <Lock size={13} /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isActive ? 'var(--card-bg)' : 'var(--bg-primary)',
                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: isActive ? '0 4px 12px rgba(253, 103, 48, 0.18)' : '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {/* Node Dot / Icon */}
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isActive ? 'rgba(253, 103, 48, 0.12)' : 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      flexShrink: 0
                    }}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        {loading ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <span style={{ fontSize: '0.88rem' }}>Loading account details...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Animated Tab Content Sections */}
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}
                >
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 16px', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                    Personal & Contact Details
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>First Name</label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Last Name</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email Address (Primary)</label>
                      <input type="email" value={email} disabled className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem', opacity: 0.7, background: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                      <input type="tel" placeholder="+234 801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>WhatsApp</label>
                      <input type="tel" placeholder="+234 801 234 5678" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>City / Location</label>
                      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Country</label>
                      <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Default Currency</label>
                        <button
                          type="button"
                          onClick={() => setActiveTab('security')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline'
                          }}
                        >
                          Change in Settings
                        </button>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={(() => {
                          const list = currencies && currencies.length > 0 ? currencies : Object.values(SUPPORTED_CURRENCIES);
                          const curObj = list.find((c) => c.code === currency);
                          return curObj ? `${curObj.flag || '🌐'} ${curObj.code} (${curObj.symbol}) — ${curObj.name}` : currency;
                        })()}
                        className="input-field no-icon"
                        style={{
                          padding: '10px 14px',
                          fontSize: '0.88rem',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          cursor: 'not-allowed',
                          border: '1px solid var(--border-color)',
                        }}
                        title="Currency can be updated in the Settings tab"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Language</label>
                      <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'ha')} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }}>
                        <option value="en">English (EN)</option>
                        <option value="ha">Hausa (HA)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'professional' && (
                <motion.div
                  key="professional-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}
                >
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 16px', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                    {isClient ? 'Company Overview' : 'Professional Profile'}
                  </h3>

                  {isClient ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Company Name</label>
                        <input type="text" placeholder="e.g. Connecta Studios" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Company Website</label>
                        <input type="url" placeholder="https://company.com" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Professional Title</label>
                          <input type="text" placeholder="e.g. Senior Full-Stack Engineer" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block' }}>
                              Portfolio Website <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                            </label>
                            {portfolioWebsite && !portfolioWebsiteError && (
                              <a
                                href={portfolioWebsite.startsWith('http') ? portfolioWebsite : `https://${portfolioWebsite}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                              >
                                Visit <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                          <input
                            type="url"
                            placeholder="https://yourportfolio.com or github.com/user"
                            value={portfolioWebsite}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPortfolioWebsite(val);
                              if (val.trim() && !validateUrl(val)) {
                                setPortfolioWebsiteError('Please enter a valid website URL (e.g. https://yourportfolio.com)');
                              } else {
                                setPortfolioWebsiteError('');
                              }
                            }}
                            className="input-field no-icon"
                            style={{
                              padding: '10px 14px',
                              fontSize: '0.88rem',
                              borderColor: portfolioWebsiteError ? '#EF4444' : undefined,
                            }}
                          />
                          {portfolioWebsiteError && (
                            <div style={{ color: '#EF4444', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertCircle size={12} /> {portfolioWebsiteError}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Hourly Rate ($/hr)</label>
                          <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Years of Experience</label>
                          <input type="number" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Work Preference</label>
                          <select value={workType} onChange={(e) => setWorkType(e.target.value as any)} className="input-field no-icon" style={{ padding: '10px 14px', fontSize: '0.88rem' }}>
                            <option value="freelancing">Freelance</option>
                            <option value="permanent">Full-Time / Permanent</option>
                          </select>
                        </div>
                      </div>

                      {/* Skills Manager */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Skills & Expertise</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                          {skills.map((skill) => (
                            <span key={skill} style={{
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-color)',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              {skill}
                              <X size={12} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => handleRemoveSkill(skill)} />
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Add skill (e.g. React, Node.js, Python)"
                            value={newSkillInput}
                            onChange={(e) => setNewSkillInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                            className="input-field no-icon"
                            style={{ flex: 1, padding: '8px 12px', fontSize: '0.84rem' }}
                          />
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            style={{
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              padding: '0 14px',
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      {isClient ? 'Company Bio' : 'Professional Summary'}
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="input-field no-icon"
                      rows={3}
                      style={{ padding: '12px', fontSize: '0.88rem', lineHeight: 1.5, resize: 'vertical' }}
                      placeholder={isClient ? 'Describe your company and hiring needs...' : 'Brief summary of your background, experience, and strengths...'}
                    />
                  </div>

                  {!isClient && (
                    <div style={{ paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                        CV / Resume Attachment (PDF, DOCX)
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={20} color="var(--primary)" />
                          <div>
                            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {resume ? 'CV Document Attached' : 'No CV uploaded yet'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                              {resume ? (
                                <a href={resume} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>
                                  View attached document
                                </a>
                              ) : (
                                'Upload PDF or DOCX format (Max 10MB)'
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: 'rgba(253, 103, 48, 0.08)',
                            color: 'var(--primary)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {uploadingResume ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                            {resume ? 'Update CV' : 'Upload CV'}
                            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} style={{ display: 'none' }} />
                          </label>

                          {resume && (
                            <button
                              type="button"
                              onClick={handleRemoveCv}
                              title="Remove CV"
                              style={{
                                padding: '8px',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.08)',
                                color: '#EF4444',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'languages' && !isClient && (
                <motion.div
                  key="languages-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}
                >
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 12px', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                    Spoken Languages
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {languages.map((lang) => (
                      <span key={lang} style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        color: '#3B82F6',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Globe size={13} />
                        {lang}
                        <X size={13} style={{ cursor: 'pointer' }} onClick={() => handleRemoveLanguage(lang)} />
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add language (e.g. Hausa, French)..."
                      value={newLangInput}
                      onChange={(e) => setNewLangInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); } }}
                      className="input-field no-icon"
                      style={{ flex: 1, padding: '8px 14px', fontSize: '0.86rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '0 16px',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'experience' && !isClient && (
                <motion.div
                  key="experience-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', margin: 0, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                      Work Experience
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowEmploymentForm(!showEmploymentForm)}
                      style={{
                        background: 'transparent',
                        color: 'var(--primary)',
                        border: 'none',
                        padding: '0',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={14} /> Add Position
                    </button>
                  </div>

                  {showEmploymentForm && (
                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      marginBottom: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="text" placeholder="Company" value={newJobCompany} onChange={(e) => setNewJobCompany(e.target.value)} className="input-field no-icon" style={{ padding: '8px 12px', fontSize: '0.84rem' }} />
                        <input type="text" placeholder="Role / Title" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} className="input-field no-icon" style={{ padding: '8px 12px', fontSize: '0.84rem' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="text" placeholder="Start Date (e.g. 2022)" value={newJobStartDate} onChange={(e) => setNewJobStartDate(e.target.value)} className="input-field no-icon" style={{ padding: '8px 12px', fontSize: '0.84rem' }} />
                        <input type="text" placeholder="End Date (e.g. Present)" value={newJobEndDate} onChange={(e) => setNewJobEndDate(e.target.value)} className="input-field no-icon" style={{ padding: '8px 12px', fontSize: '0.84rem' }} />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddEmployment}
                        className="btn-primary"
                        style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, alignSelf: 'flex-end' }}
                      >
                        Save Position
                      </button>
                    </div>
                  )}

                  {(workExperience.length > 0 || employment.length > 0) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {workExperience.map((exp: any, idx: number) => (
                        <div key={`we-${idx}`} style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{exp.role || exp.title}</div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{exp.company} {exp.period && `• ${exp.period}`}</span>
                            {exp.description && <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{exp.description}</p>}
                          </div>
                          <button type="button" onClick={() => setWorkExperience(workExperience.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', opacity: 0.7 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {employment.map((emp, idx) => (
                        <div key={`emp-${idx}`} style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{emp.title}</div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{emp.company} {emp.startDate && `• ${emp.startDate} - ${emp.endDate || 'Present'}`}</span>
                          </div>
                          <button type="button" onClick={() => setEmployment(employment.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', opacity: 0.7 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                      No work experience listed yet.
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === 'education' && !isClient && (
                <motion.div
                  key="education-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}
                >
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 14px', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                    Education & Qualifications
                  </h3>
                  {education.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {education.map((edu: any, idx: number) => (
                        <div key={`edu-${idx}`} style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                              {edu.degree || 'Degree'} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {edu.school || edu.institution} {edu.year && `• ${edu.year}`}
                            </span>
                          </div>
                          <button type="button" onClick={() => setEducation(education.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', opacity: 0.7 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                      No education details listed yet.
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="settings-section"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                  {/* Dedicated Currency & Regional Preferences Card */}
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(253,103,48,0.1)', border: '1px solid rgba(253,103,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Globe size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          Currency & Regional Settings
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                          Select your primary currency for bids, payments, and balances.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'end' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                          Primary Display & Billing Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => handleDirectCurrencyChange(e.target.value)}
                          className="input-field no-icon"
                          style={{ padding: '10px 14px', fontSize: '0.88rem', width: '100%' }}
                        >
                          {(currencies && currencies.length > 0 ? currencies : Object.values(SUPPORTED_CURRENCIES)).map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag || '🌐'} {c.code} ({c.symbol}) — {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <CheckCircle2 size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Active: <strong style={{ color: 'var(--text-primary)' }}>{currency}</strong> (auto-converted throughout platform)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Settings & Preferences Card */}
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 16px', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                      Account & Notification Settings
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Availability Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>Availability Status</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Show green online badge for new job invites</div>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                          <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, background: 'var(--primary)', borderRadius: '20px', transition: '0.2s' }} />
                          <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.2s', transform: 'translateX(18px)' }} />
                        </label>
                      </div>

                      {/* Email Notifications Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>Email Notifications</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Receive emails for proposal updates & direct messages</div>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                          <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, background: 'var(--primary)', borderRadius: '20px', transition: '0.2s' }} />
                          <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.2s', transform: 'translateX(18px)' }} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Password Security Card */}
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                        <Lock size={17} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          Change Security Password
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                          Update your login password securely.
                        </p>
                      </div>
                    </div>

                    {passError && (
                      <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                        <AlertCircle size={15} /> {passError}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Current Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showCurrentPass ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="input-field no-icon"
                            style={{ padding: '10px 38px 10px 14px', fontSize: '0.88rem' }}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          >
                            {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>New Password</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type={showNewPass ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="input-field no-icon"
                              style={{ padding: '10px 38px 10px 14px', fontSize: '0.88rem' }}
                              placeholder="At least 6 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPass(!showNewPass)}
                              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                              {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field no-icon"
                            style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleChangePassword}
                          disabled={changingPass}
                          className="btn-primary"
                          style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          {changingPass ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Update Password
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Currency Security OTP Modal */}
        {showCurrencyOtpModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}>
            <div style={{
              maxWidth: '400px', width: '100%', padding: '24px', borderRadius: '16px',
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 16px 40px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Confirm Currency Change
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.5 }}>
                To set primary currency to <strong>{pendingCurrency}</strong>, enter the 6-digit verification code sent to <strong>{user?.email}</strong>.
              </p>

              {currencyOtpError && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.8rem', marginBottom: '12px' }}>
                  {currencyOtpError}
                </div>
              )}

              <form onSubmit={handleVerifyCurrencyOtp}>
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={currencyOtpInput}
                    onChange={(e) => setCurrencyOtpInput(e.target.value)}
                    className="input-field no-icon"
                    style={{ width: '100%', letterSpacing: '4px', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', padding: '10px' }}
                    disabled={requestingCurrencyOtp || verifyingCurrencyOtp}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCurrencyOtpModal(false)}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestingCurrencyOtp || verifyingCurrencyOtp}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px' }}
                  >
                    {verifyingCurrencyOtp ? 'Verifying...' : 'Confirm'}
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

