import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from './EditProfile.module.css';
import userImage from '../../assets/user.png';
// import Logo from '../../assets/connecta.png';
import Header from '../../components/Header';
import axios from 'axios';

export const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [displayName, setDisplayName] = useState<string>('Mustapha Hussein');
  const [displayLocation, setDisplayLocation] = useState<string>('Kano, Nigeria');
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(4.9);
  const [successRate, setSuccessRate] = useState<string>('98%');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    fullName: 'Mustapha Hussein',
    email: 'mypaddess@gmail.com',
    phone: '+234 814 678 9087',
    location: 'Kano, Nigeria',
    professionalSummary: '',
    yourSkills: '',
    hardSkills: '',
    educationalSummary: '',
    education: '',
    languages: '',
    employmentHistory: '',
    otherExperience: '',
    certifications: ''
  });

  // Structured Education (first entry)
  const [educationForm, setEducationForm] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '', // YYYY-MM-DD
    endDate: '',   // YYYY-MM-DD
  });

  // Prefill from localStorage (connecta_extracted_cv_data) or navigation state
  useEffect(() => {
    const toISODate = (val: any): string => {
      if (!val) return '';
      const s = String(val).trim();
      // If already yyyy-mm-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      // dd/mm/yyyy or mm/dd/yyyy → attempt parse
      const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (m) {
        const [_, a, b, y] = m;
        const mm = String(Math.min(12, Math.max(1, Number(a)))).padStart(2, '0');
        const dd = String(Math.min(31, Math.max(1, Number(b)))).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
      }
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${mm}-${dd}`;
      }
      return '';
    };

    const mapExtractedToForm = (data: any) => {
      if (!data) return;
      const name = data.name || '';
      const email = data.email || '';
      const phone = data.phone || '';
      // location may be array
      const locationValue = Array.isArray(data.location) && data.location.length > 0
        ? String(data.location[0])
        : (data.location || formData.location || '');
      const skills = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '');
      const hardSkills = Array.isArray(data.skills)
        ? data.skills.join(', ')
        : (data.hardSkills || data.skills || '');
      const education = Array.isArray(data.organizations)
        ? data.organizations.join(', ')
        : (data.organizations || '');

      setFormData(prev => ({
        ...prev,
        fullName: name || prev.fullName,
        email: email || prev.email,
        phone: phone || prev.phone,
        location: locationValue || prev.location,
        yourSkills: skills || prev.yourSkills,
        hardSkills: hardSkills || prev.hardSkills,
        educationalSummary: education || prev.educationalSummary,
        // Best-effort prefill additional sections if present in extracted data
        education: education || prev.education,
        languages: (Array.isArray((data as any).languages) ? (data as any).languages.join(', ') : ((data as any).languages || '')) || prev.languages,
        employmentHistory: (Array.isArray((data as any).employment) ? (data as any).employment.join('\n') : ((data as any).employment || '')) || prev.employmentHistory,
        otherExperience: (Array.isArray((data as any).experience) ? (data as any).experience.join('\n') : ((data as any).experience || '')) || prev.otherExperience,
        certifications: (Array.isArray((data as any).certifications) ? (data as any).certifications.join('\n') : ((data as any).certifications || '')) || prev.certifications,
      }));

      // Prefill structured education: support multiple shapes
      const eduArrayPrimary: any[] = (data as any).education || (data as any).educations || [];
      const eduObjDirect: any = (data as any).education || (data as any).educations;
      if (Array.isArray(eduArrayPrimary) && eduArrayPrimary.length > 0) {
        const e = eduArrayPrimary[0] || {};
        setEducationForm((prev) => ({
          institution: e.institution || e.school || prev.institution,
          degree: e.degree || prev.degree,
          fieldOfStudy: e.fieldOfStudy || e.field || prev.fieldOfStudy,
          startDate: toISODate(e.startDate) || prev.startDate,
          endDate: toISODate(e.endDate) || prev.endDate,
        }));
      } else if (eduObjDirect && typeof eduObjDirect === 'object' && !Array.isArray(eduObjDirect)) {
        const e = eduObjDirect as any;
        setEducationForm((prev) => ({
          institution: e.institution || e.school || prev.institution,
          degree: e.degree || prev.degree,
          fieldOfStudy: e.fieldOfStudy || e.field || prev.fieldOfStudy,
          startDate: toISODate(e.startDate) || prev.startDate,
          endDate: toISODate(e.endDate) || prev.endDate,
        }));
      } else {
        // Sometimes data may store flat keys
        const inst = (data as any).institution || (data as any).school;
        const deg = (data as any).degree;
        const fos = (data as any).fieldOfStudy || (data as any).field;
        const sd = toISODate((data as any).startDate);
        const ed = toISODate((data as any).endDate);
        if (inst || deg || fos || sd || ed) {
          setEducationForm((prev) => ({
            institution: inst || prev.institution,
            degree: deg || prev.degree,
            fieldOfStudy: fos || prev.fieldOfStudy,
            startDate: sd || prev.startDate,
            endDate: ed || prev.endDate,
          }));
        }
      }

      // Languages: support language, languages, languageList
      const langs = (data as any).languages || (data as any).languageList || (data as any).language;
      if (langs) {
        const normalized = Array.isArray(langs) ? langs.join(', ') : String(langs);
        setFormData(prev => ({ ...prev, languages: prev.languages || normalized }));
      }

      // Employment: support employment/work/experiences arrays
      const empArr = (data as any).employment || (data as any).work || (data as any).experiences || [];
      if (Array.isArray(empArr) && empArr.length > 0) {
        const joined = empArr.map((e: any) => {
          const line = [e.position, e.company].filter(Boolean).join(' - ');
          const dur = [e.startDate, e.endDate].filter(Boolean).join(' to ');
          return [line, dur, e.description].filter(Boolean).join('\n');
        }).join('\n');
        setFormData(prev => ({ ...prev, employmentHistory: prev.employmentHistory || joined }));
      }

      // Certifications
      const certs = (data as any).certifications || (data as any).certs || [];
      if (Array.isArray(certs) && certs.length > 0) {
        setFormData(prev => ({ ...prev, certifications: prev.certifications || certs.join('\n') }));
      }
    };

    // Prefer data passed via navigation state
    if (location?.state?.extractedData) {
      mapExtractedToForm(location.state.extractedData);
      return;
    }

    try {
      const stored = localStorage.getItem('connecta_extracted_cv_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        mapExtractedToForm(parsed);
      }
    } catch (_) {
      // ignore invalid JSON
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch profile from API (name, location, rating, success rate)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const resp = await axios.get(`${baseUrl}/profiles/me`, { headers });
        const profile = resp.data;
        const user = profile?.user || {};
        if (profile?._id) setProfileId(profile._id);

        const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        if (name) {
          setDisplayName(name);
          setFormData(prev => ({ ...prev, fullName: prev.fullName || name }));
        }

        const loc = profile?.location || profile?.city || profile?.address || '';
        if (loc) {
          setDisplayLocation(String(loc));
          setFormData(prev => ({ ...prev, location: prev.location || String(loc) }));
        }

        if (user.profileImage) setProfileImg(user.profileImage);

        if (typeof profile?.rating === 'number') setRating(profile.rating);
        if (profile?.successRate) setSuccessRate(String(profile.successRate));
      } catch (_) {
        // Ignore; fall back to defaults
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      // Build payload mapping
      const userId = localStorage.getItem('userId');
      const parseLines = (text: string) => text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const parseList = (text: string) => text.split(',').map(s => s.trim()).filter(Boolean);

      // Build education only if the required fields are present
      const educationArray = (educationForm.degree && educationForm.fieldOfStudy && educationForm.startDate)
        ? [{
            institution: educationForm.institution || undefined,
            degree: educationForm.degree,
            fieldOfStudy: educationForm.fieldOfStudy,
            startDate: educationForm.startDate,
            ...(educationForm.endDate ? { endDate: educationForm.endDate } : {}),
          }]
        : [];

      const languages = parseList(formData.languages).map((lang) => ({ language: lang, proficiency: 'basic' }));
      const employment = parseLines(formData.employmentHistory).map((line) => ({ company: line, position: '', description: line }));

      const payload: any = {
        ...(formData.phone ? { phoneNumber: formData.phone } : {}),
        ...(formData.location ? { location: formData.location } : {}),
        ...(educationArray.length ? { education: educationArray } : {}),
        ...(languages.length ? { languages } : {}),
        ...(employment.length ? { employment } : {}),
      };

      if (profileId) {
        await axios.put(`${baseUrl}/profiles/${profileId}`, payload, { headers });
      } else {
        if (!userId) {
          alert('Missing userId. Please sign in again.');
          return;
        }
        await axios.post(`${baseUrl}/profiles`, { user: userId, ...payload }, { headers });
      }
      alert('Profile saved successfully');
    } catch (e: any) {
      console.error('Failed to save profile', e?.response?.data || e);
      const msg = e?.response?.data?.message || e?.message || 'Failed to save profile';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPortfolio = () => {
    navigate('/add-portfolio');
  };

  return (
    <div className={styles.editProfilePage}>
      {/* Header */}
      <Header />

      {/* Title */}
      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>My profile</h1>
      </div>

      {/* Profile Photo Section */}
      <div className={styles.profilePhotoSection}>
        <div className={styles.photoContainer}>
          <img src={profileImg || userImage} alt="Profile" className={styles.profilePhoto} />
          <button className={styles.editPhotoButton}>
            <Icon icon="lucide:pencil" className={styles.editIcon} />
          </button>
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.userName}>{displayName}</h2>
          <div className={styles.location}>
            <Icon icon="lucide:map-pin" className={styles.locationIcon} />
            <span>{displayLocation}</span>
          </div>
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[1,2,3,4,5].map(star => (
                <Icon key={star} icon="lucide:star" className={styles.star} />
              ))}
            </div>
            <span className={styles.ratingText}>{rating}</span>
          </div>
          <p className={styles.successRate}>Job Success Rate: {successRate}</p>
        </div>
      </div>

      {/* Complete Your Profile Banner */}
      <div className={styles.completeBanner}>
        <h3 className={styles.completeTitle}>Complete Your Profile</h3>
        <p className={styles.completeSubtitle}>
          Fill out all necessary areas to build your expertise and stand out with 
          a professional presence to clients you want to work with.
        </p>
      </div>

      {/* Form Fields */}
      <div className={styles.formContainer}>
        {/* Full Name */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Full name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        {/* Email */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Email address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        {/* Phone */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Phone number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        {/* Location */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Location</label>
          <div className={styles.selectContainer}>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="Kano, Nigeria">Kano, Nigeria</option>
              <option value="Lagos, Nigeria">Lagos, Nigeria</option>
              <option value="Abuja, Nigeria">Abuja, Nigeria</option>
            </select>
            <Icon icon="lucide:chevron-down" className={styles.chevronIcon} />
          </div>
        </div>

        

        {/* Professional Summary */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Add your professional summary</label>
          <textarea
            name="professionalSummary"
            value={formData.professionalSummary}
            onChange={handleInputChange}
            className={styles.textarea}
            rows={4}
          />
          <div className={styles.textareaFooter}>
            <span className={styles.charCount}>0/5,000</span>
            <button className={styles.saveBtn}>Save</button>
          </div>
        </div>

        {/* Your Skills */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Your Skills</label>
          <input
            type="text"
            name="yourSkills"
            value={formData.yourSkills}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter skills"
          />
          <button className={styles.addButton}>Add skill</button>
        </div>

        {/* Hard Skills */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Hard Skills</label>
          <input
            type="text"
            name="hardSkills"
            value={formData.hardSkills}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Enter skills"
          />
          <button className={styles.addButton}>Add Skill</button>
        </div>

        {/* Educational Summary */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Add your educational and certification summary</label>
          <textarea
            name="educationalSummary"
            value={formData.educationalSummary}
            onChange={handleInputChange}
            className={styles.textarea}
            rows={4}
          />
          <div className={styles.textareaFooter}>
            <span className={styles.charCount}>0/1,000</span>
            <button className={styles.saveBtn}>Save</button>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Portfolio</h3>
            <button className={styles.addButton} onClick={handleAddPortfolio}>
              <Icon icon="lucide:plus" className={styles.addIcon} />
            </button>
          </div>
          <p className={styles.sectionSubtitle}>
            Attract and 3 Show more There do not from others days have 
            earned a good reputation management.
          </p>
        </div>

        {/* Education Section */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Education</h3>
            <Icon icon="lucide:help-circle" className={styles.helpIcon} />
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Institution</label>
          <input
            type="text"
            name="institution"
            value={educationForm.institution}
            onChange={(e) => setEducationForm((prev) => ({ ...prev, institution: e.target.value }))}
            className={styles.input}
            placeholder="ABC University"
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Degree</label>
          <input
            type="text"
            name="degree"
            value={educationForm.degree}
            onChange={(e) => setEducationForm((prev) => ({ ...prev, degree: e.target.value }))}
            className={styles.input}
            placeholder="B.Sc."
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Field of Study</label>
          <input
            type="text"
            name="fieldOfStudy"
            value={educationForm.fieldOfStudy}
            onChange={(e) => setEducationForm((prev) => ({ ...prev, fieldOfStudy: e.target.value }))}
            className={styles.input}
            placeholder="Computer Science"
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={educationForm.startDate}
            onChange={(e) => setEducationForm((prev) => ({ ...prev, startDate: e.target.value }))}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>End Date</label>
          <input
            type="date"
            name="endDate"
            value={educationForm.endDate}
            onChange={(e) => setEducationForm((prev) => ({ ...prev, endDate: e.target.value }))}
            className={styles.input}
          />
        </div>

        {/* Language Section */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Language</h3>
            <Icon icon="lucide:help-circle" className={styles.helpIcon} />
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Languages</label>
          <input
            type="text"
            name="languages"
            value={formData.languages}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="e.g., English (Fluent), French (Basic)"
          />
        </div>

        {/* Employment History Section */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Employment history</h3>
            <Icon icon="lucide:help-circle" className={styles.helpIcon} />
          </div>
          <p className={styles.sectionSubtitle}>
            Add employment history to showcase your path skills to clients.
          </p>
          <button className={styles.addEmploymentButton}>Add employment</button>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Employment history</label>
          <textarea
            name="employmentHistory"
            value={formData.employmentHistory}
            onChange={handleInputChange}
            className={styles.textarea}
            rows={5}
            placeholder="e.g., Frontend Developer - XYZ Ltd (2021-2023)\n- Built React apps ..."
          />
        </div>

        {/* Other Experience Section */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Other experience</h3>
            <Icon icon="lucide:help-circle" className={styles.helpIcon} />
          </div>
          <p className={styles.sectionSubtitle}>
            Add any other experience that makes you stand out.
          </p>
          <button className={styles.addExperienceButton}>Add experience</button>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Other experience</label>
          <textarea
            name="otherExperience"
            value={formData.otherExperience}
            onChange={handleInputChange}
            className={styles.textarea}
            rows={4}
            placeholder="e.g., Open-source contributions, hackathons, volunteer work"
          />
        </div>

        {/* Certifications Section */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Certifications</h3>
            <Icon icon="lucide:help-circle" className={styles.helpIcon} />
          </div>
          <p className={styles.sectionSubtitle}>
            Listing your certifications can help prove your specific 
            knowledge or specialization in a subject or tool.
          </p>
          <button className={styles.addCertificationButton}>Add certificate</button>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Certifications</label>
          <textarea
            name="certifications"
            value={formData.certifications}
            onChange={handleInputChange}
            className={styles.textarea}
            rows={4}
            placeholder="e.g., AWS Certified Cloud Practitioner (2024)"
          />
        </div>

        {/* Save Button */}
        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};