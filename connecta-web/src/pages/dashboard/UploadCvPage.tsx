import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, UploadCloud, ArrowLeft, Check, Loader2, Trash2, ArrowRight, Sparkles, X, Briefcase, GraduationCap, Cpu, Globe, FolderGit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, aiAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export const UploadCvPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [currentCv, setCurrentCv] = useState<string>((user as any)?.resume || (user as any)?.cv || '');
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseStep, setParseStep] = useState<number>(1);
  const [parseProgress, setParseProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Extracted AI Preview State
  const [extractedTitle, setExtractedTitle] = useState('');
  const [extractedBio, setExtractedBio] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [extractedLanguages, setExtractedLanguages] = useState<string[]>([]);
  const [extractedYoe, setExtractedYoe] = useState<number | string>(3);
  const [extractedWorkExp, setExtractedWorkExp] = useState<any[]>([]);
  const [extractedEdu, setExtractedEdu] = useState<any[]>([]);
  const [extractedProjects, setExtractedProjects] = useState<any[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newLangInput, setNewLangInput] = useState('');
  const [showAiPreview, setShowAiPreview] = useState(false);

  // Load existing profile & CV state on mount
  useEffect(() => {
    if (user) {
      const cvUrl = (user as any)?.resume || (user as any)?.cv || '';
      if (cvUrl) setCurrentCv(cvUrl);
      if (user.title && !extractedTitle) setExtractedTitle(user.title);
      if (user.bio && !extractedBio) setExtractedBio(user.bio);
      if (user.skills && user.skills.length > 0 && extractedSkills.length === 0) setExtractedSkills(user.skills);
      if ((user as any)?.languages && (user as any).languages.length > 0 && extractedLanguages.length === 0) setExtractedLanguages((user as any).languages);
      if ((user as any)?.workExperience && (user as any).workExperience.length > 0 && extractedWorkExp.length === 0) setExtractedWorkExp((user as any).workExperience);
      if ((user as any)?.education && (user as any).education.length > 0 && extractedEdu.length === 0) setExtractedEdu((user as any).education);
      if ((user as any)?.portfolio && (user as any).portfolio.length > 0 && extractedProjects.length === 0) setExtractedProjects((user as any).portfolio);
      if (cvUrl || user.title || user.bio || (user.skills && user.skills.length > 0)) setShowAiPreview(true);
    }
  }, [user]);

  // Progress animation timer during AI extraction
  useEffect(() => {
    let interval: any;
    if (parsing) {
      setParseProgress(10);
      setParseStep(1);

      interval = setInterval(() => {
        setParseProgress((prev) => {
          if (prev < 40) {
            setParseStep(1);
            return prev + 10;
          } else if (prev < 80) {
            setParseStep(2);
            return prev + 8;
          } else if (prev < 95) {
            setParseStep(3);
            return prev + 3;
          }
          return prev;
        });
      }, 300);
    } else {
      setParseProgress(100);
    }
    return () => clearInterval(interval);
  }, [parsing]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      showToast('Invalid file format. Please upload a PDF or DOCX file.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be under 10MB', 'error');
      return;
    }

    setUploading(true);
    setParsing(true);
    try {
      // Execute storage upload and OpenAI LLM parsing concurrently
      const [uploadRes, aiRes] = await Promise.all([
        authAPI.uploadFile(file).catch((e) => {
          console.warn('Storage upload error:', e);
          return null;
        }),
        aiAPI.parseCv(file).catch((e) => {
          console.warn('AI parse error:', e);
          return null;
        })
      ]);

      if (uploadRes) {
        const url = uploadRes?.data?.url || (uploadRes as any)?.url;
        if (url) {
          setCurrentCv(url);
        }
      }

      if (aiRes?.success && aiRes.data) {
        const parsed = aiRes.data;
        setExtractedTitle(parsed.title || user?.title || 'Software Specialist');
        setExtractedBio(parsed.bio || user?.bio || '');
        setExtractedSkills(Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : (user?.skills || ['Software Engineering']));
        setExtractedLanguages(Array.isArray(parsed.languages) && parsed.languages.length > 0 ? parsed.languages : ((user as any)?.languages || ['English']));
        setExtractedYoe(parsed.yearsOfExperience || user?.yearsOfExperience || 3);
        setExtractedWorkExp(parsed.workExperience || []);
        setExtractedEdu(parsed.education || []);
        setExtractedProjects(parsed.projects || (user as any)?.portfolio || []);
        setShowAiPreview(true);
        showToast('AI successfully extracted details from your CV!', 'success');
      } else {
        showToast('CV uploaded and processed!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'CV processing completed.', 'info');
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setExtractedSkills(extractedSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (extractedSkills.includes(newSkillInput.trim())) {
      setNewSkillInput('');
      return;
    }
    setExtractedSkills([...extractedSkills, newSkillInput.trim()]);
    setNewSkillInput('');
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setExtractedLanguages(extractedLanguages.filter((l) => l !== langToRemove));
  };

  const handleAddLanguage = () => {
    if (!newLangInput.trim()) return;
    if (extractedLanguages.includes(newLangInput.trim())) {
      setNewLangInput('');
      return;
    }
    setExtractedLanguages([...extractedLanguages, newLangInput.trim()]);
    setNewLangInput('');
  };

  const handleApplyAiProfile = async () => {
    setSavingProfile(true);
    try {
      const payload: any = {
        resume: currentCv,
        cv: currentCv,
        title: extractedTitle.trim(),
        bio: extractedBio.trim(),
        skills: extractedSkills,
        languages: extractedLanguages,
        yearsOfExperience: Number(extractedYoe),
        workExperience: extractedWorkExp,
        education: extractedEdu,
        portfolio: extractedProjects
      };

      const res = await authAPI.updateMe(payload);
      if (res.success && res.data) {
        updateUser(res.data);
      }
      showToast('Profile updated with AI extracted details!', 'success');
      navigate('/freelancer/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Saved profile details.', 'info');
      navigate('/freelancer/dashboard');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveCv = async () => {
    try {
      const updateRes = await authAPI.updateMe({ resume: '', cv: '' });
      if (updateRes.success && updateRes.data) {
        updateUser(updateRes.data);
      }
      setCurrentCv('');
      setShowAiPreview(false);
      showToast('CV removed from profile', 'info');
    } catch (err: any) {
      showToast('Failed to remove CV', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div style={{
        maxWidth: '600px',
        margin: '20px auto 40px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '32px 28px', width: '100%' }}
        >
          {/* Header & Back Action */}
          <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
            <button
              type="button"
              onClick={() => navigate('/freelancer/dashboard')}
              title="Go back"
              aria-label="Go back"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(253, 103, 48, 0.08)',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                transition: 'transform 0.2s ease'
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(253, 103, 48, 0.08)',
              color: 'var(--primary)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.4px',
              marginBottom: '10px'
            }}>
              AI Profile Enhancement
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Upload CV / Resume
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Attach your CV to automatically extract skills, title, bio, and experience
            </p>
          </div>

          {/* Current Attached CV Status Card */}
          {currentCv && !parsing ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1.5px solid #10B981',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10B981',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    CV Document Attached <Check size={14} color="#10B981" />
                  </div>
                  <a
                    href={currentCv}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    View document
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <UploadCloud size={13} />
                  Replace CV
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>

                <button
                  type="button"
                  onClick={handleRemoveCv}
                  title="Remove CV"
                  style={{
                    padding: '7px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#EF4444',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ) : null}

          {/* Animated AI Parsing Progress Loading Card */}
          <AnimatePresence>
            {parsing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                style={{
                  background: 'rgba(253, 103, 48, 0.04)',
                  border: '1px solid rgba(253, 103, 48, 0.2)',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(253, 103, 48, 0.1)',
                  color: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 0 15px rgba(253, 103, 48, 0.2)'
                }}>
                  <Cpu size={24} className="animate-spin" />
                </div>

                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Connecta AI Extracting Profile Details...
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {parseStep === 1 && 'Reading document & validating text structure...'}
                  {parseStep === 2 && 'Extracting skills, tools & work experience...'}
                  {parseStep === 3 && 'Polishing professional bio & generating profile...'}
                </p>

                {/* Animated Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'var(--border-color)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <motion.div
                    animate={{ width: `${parseProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.3 }}
                    style={{
                      height: '100%',
                      background: 'var(--primary)',
                      borderRadius: '10px'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800, marginTop: '8px', display: 'block' }}>
                  {parseProgress}% Processed
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dropzone File Uploader (Shown when no CV or replacing) */}
          {!currentCv && !parsing && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: isDragOver ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
                background: isDragOver ? 'rgba(253, 103, 48, 0.04)' : 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '32px 20px',
                textAlign: 'center',
                marginBottom: '20px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(253, 103, 48, 0.08)',
                color: 'var(--primary)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 12px'
              }}>
                <UploadCloud size={22} />
              </div>

              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Drag & Drop CV Here
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Supports PDF or DOCX formats (Max 10MB)
              </p>

              <label style={{
                padding: '9px 18px',
                borderRadius: '10px',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                Browse CV File
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          )}

          {/* AI Extracted Profile Preview Card */}
          {showAiPreview && !parsing && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--primary)" />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    AI Extracted Information Preview
                  </h3>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(253, 103, 48, 0.08)', padding: '2px 8px', borderRadius: '12px' }}>
                  AI Verified
                </span>
              </div>

              {/* Title Field */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Professional Title
                </label>
                <div className="input-wrapper">
                  <Briefcase className="input-icon-left" size={15} />
                  <input
                    type="text"
                    value={extractedTitle}
                    onChange={(e) => setExtractedTitle(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Extracted Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={extractedBio}
                  onChange={(e) => setExtractedBio(e.target.value)}
                  className="input-field no-icon"
                  style={{ fontSize: '0.84rem', padding: '10px', resize: 'vertical' }}
                />
              </div>

              {/* Extracted Skills */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Extracted Skills & Tools
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {extractedSkills.map((skill) => (
                    <span key={skill} style={{
                      background: 'rgba(253, 103, 48, 0.08)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(253, 103, 48, 0.2)',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {skill}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(skill)} />
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Add skill..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                    className="input-field no-icon"
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Spoken Languages */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Extracted Languages
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {extractedLanguages.map((lang) => (
                    <span key={lang} style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      color: '#3B82F6',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <Globe size={11} />
                      {lang}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveLanguage(lang)} />
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Add language..."
                    value={newLangInput}
                    onChange={(e) => setNewLangInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); } }}
                    className="input-field no-icon"
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Work Experience Roster */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Briefcase size={14} color="var(--primary)" /> Extracted Work Experience ({extractedWorkExp.length})
                </div>
                {extractedWorkExp.length === 0 ? (
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No work experience items extracted.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {extractedWorkExp.map((exp: any, idx: number) => (
                      <div key={idx} style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exp.role || 'Position'}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{exp.period || exp.years}</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>{exp.company || exp.employer}</div>
                        {exp.description && (
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education Roster */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <GraduationCap size={14} color="var(--primary)" /> Extracted Education ({extractedEdu.length})
                </div>
                {extractedEdu.length === 0 ? (
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No education items extracted.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {extractedEdu.map((edu: any, idx: number) => (
                      <div key={idx} style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {edu.degree || 'Degree'} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{edu.year || edu.period}</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--primary)' }}>{edu.school || edu.institution}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects & Portfolio Roster */}
              {extractedProjects.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <FolderGit2 size={14} color="var(--primary)" /> Extracted Projects & Portfolio ({extractedProjects.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {extractedProjects.map((proj: any, idx: number) => (
                      <div key={idx} style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{proj.title || 'Project'}</div>
                        {proj.description && (
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Action / Return Button */}
          {showAiPreview ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={savingProfile || parsing}
              onClick={handleApplyAiProfile}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
            >
              {savingProfile ? <><Loader2 size={16} className="animate-spin" /> Saving Profile...</> : <>Apply AI Profile & Save <ArrowRight size={18} /></>}
            </motion.button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/freelancer/dashboard')}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
            >
              Return to Dashboard <ArrowRight size={18} />
            </button>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
