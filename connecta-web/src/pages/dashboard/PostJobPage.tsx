import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { PlusCircle, ShieldCheck, ArrowLeft, Loader2, Briefcase, UserCheck, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { JOB_CATEGORIES, CATEGORY_SKILLS } from '../../utils/categories';

export const PostJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Mode Selection: 'milestone_gig' vs 'collabo_squad' vs 'full_time_contract'
  const [jobType, setJobType] = useState<'milestone_gig' | 'collabo_squad' | 'full_time_contract'>('milestone_gig');

  // Selected Main Category ID
  const [selectedCatId, setSelectedCatId] = useState<string>('tech');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('Web Development');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill out all required project details.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await jobAPI.createJob({
        title,
        category: `${activeCategoryObj.label} - ${selectedSubCat}`,
        budget: Number(budget),
        budgetType,
        duration: Number(duration),
        description,
        jobType,
        locationType,
        location,
        currency,
        monthlySalaryAmount: jobType === 'full_time_contract' ? Number(budget) : undefined,
        probationPeriodDays: Number(probationDays),
        noticePeriodDays: Number(noticeDays),
        benefitsSummary,
        skills: selectedSkills,
        requirements: requirements.split('\n').map((r) => r.trim()).filter(Boolean),
        paymentVerified: true,
      });
      showToast(`${jobType === 'full_time_contract' ? 'Full-Time Contract' : 'Job Listing'} posted successfully!`, 'success');
      navigate('/client/dashboard');
    } catch (err: any) {
      console.error('Error posting job:', err);
      showToast(err.response?.data?.message || 'Failed to post job listing.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
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
          Create New Listing
        </h1>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
          Specify milestone budget, category, required skills, and deliverables to receive proposals from top African professionals.
        </p>
      </div>

      {/* Main Full-Width Card Container */}
      <div className="glass-card" style={{ width: '100%', padding: '36px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>

        {/* 1. Toggle: Milestone Project vs Collabo Squad vs Full-Time Contract */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
            1. Contract Hiring Model
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setJobType('milestone_gig')}
              style={{
                padding: '16px 18px',
                borderRadius: '16px',
                border: jobType === 'milestone_gig' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: jobType === 'milestone_gig' ? 'rgba(253,103,48,0.08)' : 'var(--bg-secondary)',
                color: jobType === 'milestone_gig' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <Briefcase size={18} /> Milestone Gig Project
            </button>

            <button
              type="button"
              onClick={() => setJobType('collabo_squad')}
              style={{
                padding: '16px 18px',
                borderRadius: '16px',
                border: jobType === 'collabo_squad' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: jobType === 'collabo_squad' ? 'rgba(253,103,48,0.08)' : 'var(--bg-secondary)',
                color: jobType === 'collabo_squad' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <PlusCircle size={18} /> Collabo Team Squad
            </button>

            <button
              type="button"
              onClick={() => setJobType('full_time_contract')}
              style={{
                padding: '16px 18px',
                borderRadius: '16px',
                border: jobType === 'full_time_contract' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: jobType === 'full_time_contract' ? 'rgba(253,103,48,0.08)' : 'var(--bg-secondary)',
                color: jobType === 'full_time_contract' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <UserCheck size={18} /> Full-Time Permanent Hire
            </button>
          </div>
        </div>

        {/* 2. Category & Subcategory Picker */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
            2. Category & Specialization
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
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Subcategory / Domain</label>
              <select
                value={selectedSubCat}
                onChange={(e) => setSelectedSubCat(e.target.value)}
                className="input-field"
                style={{ width: '100%', maxWidth: '400px' }}
              >
                {activeCategoryObj.subcategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Listing Title
            </label>
            <input
              type="text"
              placeholder={jobType === 'full_time_contract' ? 'e.g., Senior Full-Stack Remote Lead Engineer' : 'e.g., Mobile Payment Escrow & Chat Feature'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              style={{ width: '100%', fontSize: '0.95rem', padding: '12px 16px' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                {jobType === 'full_time_contract' ? 'Monthly Salary Retainer Amount' : 'Budget Amount'}
              </label>
              <input
                type="number"
                placeholder="2500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="input-field"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontWeight: 700 }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="KES">KES (KSh)</option>
                <option value="GHS">GHS (₵)</option>
                <option value="ZAR">ZAR (R)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Budget Type</label>
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

          {/* Full Time Agreement Parameters */}
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
                Full-Time Contract Terms
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
                  Benefits & Perks Summary
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

          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Delivery Duration (Days)</label>
            <input
              type="number"
              placeholder="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Work Location Type</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as any)}
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-Site (Physical)</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>City / Location</label>
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

          {/* Skill Tags */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Select Required Skills ({selectedSkills.length} selected)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              {availableSkills.map((sk) => {
                const isSelected = selectedSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(253,103,48,0.15)' : 'var(--card-bg)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isSelected && <Check size={12} />} {sk}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Key Requirements (One per line)</label>
            <textarea
              rows={3}
              placeholder="5+ years of experience with Node.js&#10;Strong understanding of Paystack APIs"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="input-field"
              style={{ width: '100%', lineHeight: 1.4 }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Project Description & Deliverables</label>
            <textarea
              rows={5}
              placeholder="Describe the project scope, key features required, API specifications, and delivery expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ width: '100%', lineHeight: 1.5 }}
              required
            />
          </div>

          <div style={{ background: 'rgba(16,185,129,0.08)', padding: '14px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.83rem', color: 'var(--success)', fontWeight: 600 }}>
            <ShieldCheck size={18} /> Verified Escrow Protection will automatically be attached to this listing.
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => navigate('/client/dashboard')}
              style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ padding: '12px 28px', borderRadius: '12px', fontWeight: 700 }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />} Publish Listing
            </motion.button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
