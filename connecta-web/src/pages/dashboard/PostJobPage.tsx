import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Briefcase,
  UserCheck,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { JOB_CATEGORIES, CATEGORY_SKILLS } from '../../utils/categories';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';

export const PostJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { formatDualPrice } = useCurrency();

  // Wizard Step State (1 to 4)
  const [step, setStep] = useState<number>(1);

  // Contract Mode Selection: 'milestone_gig' vs 'collabo_squad' vs 'full_time_contract'
  const [jobType, setJobType] = useState<'milestone_gig' | 'collabo_squad' | 'full_time_contract'>('milestone_gig');

  // Sector / Category Selection
  const [selectedCatId, setSelectedCatId] = useState<string>('tech');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('Web Development');

  // Form Fields
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('2500');
  const [budgetType, setBudgetType] = useState<'fixed' | 'hourly'>('fixed');
  const [duration, setDuration] = useState('30');
  const [currency, setCurrency] = useState('USD');
  const [probationDays, setProbationDays] = useState('30');
  const [noticeDays, setNoticeDays] = useState('30');
  const [benefitsSummary, setBenefitsSummary] = useState('Paid annual leave, remote equipment allowance, health insurance reimbursement.');
  const [locationType, setLocationType] = useState<'remote' | 'onsite' | 'hybrid'>('remote');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React Native', 'Node.js', 'TypeScript']);
  const [submitting, setSubmitting] = useState(false);

  const activeCategoryObj = JOB_CATEGORIES.find((c) => c.id === selectedCatId) || JOB_CATEGORIES[0];
  const availableSkills = CATEGORY_SKILLS[selectedCatId] || CATEGORY_SKILLS['tech'];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!title.trim()) {
        showToast('Please enter a descriptive title for your job listing.', 'error');
        return;
      }
    }
    if (step === 2) {
      if (selectedSkills.length === 0) {
        showToast('Please select at least one required skill tag for your listing.', 'error');
        return;
      }
    }
    if (step === 3) {
      if (Number(budget) <= 0) {
        showToast('Please enter a valid budget / retainer amount.', 'error');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill out all required project details.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await jobAPI.createJob({
        title: title.trim(),
        category: `${activeCategoryObj.label} - ${selectedSubCat}`,
        budget: Number(budget),
        budgetType,
        duration: Number(duration),
        description: description.trim(),
        jobType,
        locationType,
        location: location.trim(),
        currency,
        monthlySalaryAmount: jobType === 'full_time_contract' ? Number(budget) : undefined,
        probationPeriodDays: Number(probationDays),
        noticePeriodDays: Number(noticeDays),
        benefitsSummary: benefitsSummary.trim(),
        skills: selectedSkills,
        requirements: requirements.split('\n').map((r) => r.trim()).filter(Boolean),
        paymentVerified: true,
      });

      showToast(
        `${jobType === 'full_time_contract' ? 'Full-Time Contract' : 'Job Listing'} posted successfully!`,
        'success'
      );
      navigate('/client/dashboard');
    } catch (err: any) {
      console.error('Error posting job:', err);
      showToast(err.response?.data?.message || 'Failed to post job listing.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const STEP_TITLES = [
    '1. Role Type & Sector',
    '2. Skills & Location',
    '3. Budget & Terms',
    '4. Scope & Review',
  ];

  return (
    <DashboardLayout>
      {/* Top Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--bg-tertiary)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Post a New Role / Project
        </h1>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
          Follow our 4-step wizard to define your project parameters and match with top African professionals.
        </p>
      </div>

      {/* Step Progress Tracker Bar */}
      <div className="glass-card" style={{ padding: '18px 24px', borderRadius: '18px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignItems: 'center' }}>
          {STEP_TITLES.map((stLabel, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;

            return (
              <div
                key={stepNum}
                onClick={() => isDone && setStep(stepNum)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: isDone ? 'pointer' : 'default',
                  opacity: isActive || isDone ? 1 : 0.45,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isDone ? '#10B981' : isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>
                  {isDone ? <Check size={16} /> : stepNum}
                </div>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                  display: 'none',
                  whiteSpace: 'nowrap',
                }} className="desktop-step-label">
                  {stLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="glass-card" style={{ padding: '36px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">

            {/* ================= STEP 1: Contract Model & Title ================= */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    Step 1: Contract Model & Role Title
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Select how you want to hire and provide a descriptive title for your job listing.
                  </p>
                </div>

                {/* Contract Model Cards */}
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
                    Contract Model Selection
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setJobType('milestone_gig')}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '16px',
                        border: jobType === 'milestone_gig' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: jobType === 'milestone_gig' ? 'rgba(253,103,48,0.08)' : 'var(--bg-secondary)',
                        color: jobType === 'milestone_gig' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '6px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={20} />
                        <span>Milestone Gig Project</span>
                      </div>
                      <span style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        Deliverable-based project with escrow milestone releases.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJobType('collabo_squad')}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '16px',
                        border: jobType === 'collabo_squad' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: jobType === 'collabo_squad' ? 'rgba(253,103,48,0.08)' : 'var(--bg-secondary)',
                        color: jobType === 'collabo_squad' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '6px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={20} />
                        <span>Collabo Team Squad</span>
                      </div>
                      <span style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        Hire a coordinated squad of multi-disciplinary experts.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setJobType('full_time_contract')}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '16px',
                        border: jobType === 'full_time_contract' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: jobType === 'full_time_contract' ? 'rgba(253,103,48,0.08)' : 'var(--bg-secondary)',
                        color: jobType === 'full_time_contract' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '6px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCheck size={20} />
                        <span>Full-Time Permanent</span>
                      </div>
                      <span style={{ fontSize: '0.76rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        Long-term remote hire with monthly retainer salary & benefits.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Job Title Input */}
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Listing / Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={jobType === 'full_time_contract' ? 'e.g. Lead Senior Full-Stack Engineer (Node.js & React)' : 'e.g. Mobile Payment Escrow & Chat Integration'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.98rem', padding: '14px 16px' }}
                  />
                </div>

                {/* Sector & Category Picker */}
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    Sector & Industry Category
                  </label>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    {JOB_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCatId(cat.id);
                          if (cat.subcategories.length > 0) setSelectedSubCat(cat.subcategories[0]);
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '12px',
                          border: selectedCatId === cat.id ? 'none' : '1px solid var(--border-color)',
                          background: selectedCatId === cat.id ? 'var(--primary)' : 'var(--bg-secondary)',
                          color: selectedCatId === cat.id ? '#fff' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {activeCategoryObj.subcategories.length > 0 && (
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Specialization / Domain
                      </label>
                      <select
                        value={selectedSubCat}
                        onChange={(e) => setSelectedSubCat(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', maxWidth: '400px', fontWeight: 700 }}
                      >
                        {activeCategoryObj.subcategories.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: Skills & Work Location ================= */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    Step 2: Skills & Work Location
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Specify required skill tags for the {activeCategoryObj.label} sector and delivery timeline.
                  </p>
                </div>

                {/* Skill Tag Chips */}
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    Select Required Skill Tags ({selectedSkills.length} selected)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    {availableSkills.map((sk) => {
                      const isSelected = selectedSkills.includes(sk);
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '16px',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            background: isSelected ? 'rgba(253,103,48,0.15)' : 'var(--card-bg)',
                            color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isSelected && <Check size={13} />} {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Timeframe & Work Mode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                      {jobType === 'full_time_contract' ? 'Expected Start Within (Days)' : 'Delivery Timeframe (Days)'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={jobType === 'full_time_contract' ? '7' : '30'}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                    {jobType === 'full_time_contract' ? (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                        Ongoing full-time job. How soon should the hired employee start?
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                        Estimated days to complete and deliver project scope.
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                      Location Mode
                    </label>
                    <select
                      value={locationType}
                      onChange={(e) => setLocationType(e.target.value as any)}
                      className="input-field"
                      style={{ width: '100%', fontWeight: 700 }}
                    >
                      <option value="remote">Remote (Worldwide / Africa)</option>
                      <option value="onsite">On-Site (Physical Office)</option>
                      <option value="hybrid">Hybrid Work Mode</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                      City / Country Base
                    </label>
                    <input
                      type="text"
                      placeholder="Lagos, Nigeria"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: Budget & Contract Terms ================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    Step 3: Budget & Contract Terms
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Define currency, payout amounts, and permanent contract agreement terms.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                      {jobType === 'full_time_contract' ? 'Monthly Salary Retainer' : 'Project Budget Amount'} *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', fontSize: '1rem', fontWeight: 800 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                      Payout Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', fontWeight: 700 }}
                    >
                      {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                      Budget Structure
                    </label>
                    <select
                      value={budgetType}
                      onChange={(e) => setBudgetType(e.target.value as any)}
                      className="input-field"
                      style={{ width: '100%' }}
                    >
                      <option value="fixed">{jobType === 'full_time_contract' ? 'Monthly Retainer' : 'Fixed Price'}</option>
                      <option value="hourly">Hourly Rate</option>
                    </select>
                  </div>
                </div>

                {/* Full Time Contract Additional Terms */}
                {jobType === 'full_time_contract' && (
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                      Full-Time Employment Agreement Parameters
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                          Probation Period (Days)
                        </label>
                        <input
                          type="number"
                          value={probationDays}
                          onChange={(e) => setProbationDays(e.target.value)}
                          className="input-field"
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                          Notice Period (Days)
                        </label>
                        <input
                          type="number"
                          value={noticeDays}
                          onChange={(e) => setNoticeDays(e.target.value)}
                          className="input-field"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                        Benefits & Compensation Summary
                      </label>
                      <textarea
                        value={benefitsSummary}
                        onChange={(e) => setBenefitsSummary(e.target.value)}
                        className="input-field"
                        style={{ width: '100%' }}
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ================= STEP 4: Scope & Requirements Review ================= */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    Step 4: Project Scope & Deliverables Review
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Provide full requirements and review your listing summary before publishing.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Key Requirements (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 5+ years experience in React & Node.js&#10;Familiarity with Paystack Payment Gateways&#10;Strong communication skills"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', lineHeight: 1.4 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Project Description & Detailed Deliverables Scope *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe the overall scope, key milestones, deliverables, tech stack requirements, and expectations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', lineHeight: 1.5 }}
                  />
                </div>

                {/* Summary Card */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', background: 'rgba(253,103,48,0.1)', color: 'var(--primary)' }}>
                        {activeCategoryObj.label} - {selectedSubCat}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 0' }}>
                        {title}
                      </h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatDualPrice(Number(budget))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {jobType === 'full_time_contract' ? 'Monthly Salary' : budgetType}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>📍 {location} ({locationType})</span>
                    <span>⏱️ Delivery: {duration} days</span>
                    <span>🏷️ Skills: {selectedSkills.slice(0, 3).join(', ')}</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(16,185,129,0.08)', padding: '14px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.83rem', color: 'var(--success)', fontWeight: 600 }}>
                  <ShieldCheck size={18} /> Paystack Escrow Protection will automatically be attached to this listing.
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
            </div>

            <div>
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary"
                  style={{ padding: '12px 26px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  Continue to Step {step + 1} <ArrowRight size={16} />
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '14px 32px', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                  Publish Job Listing
                </motion.button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
