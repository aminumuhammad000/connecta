import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from './EditProfile.module.css';
import userImage from '../../assets/user.png';
import Logo from '../../assets/connecta.png';

export const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: 'Mustapha Hussein',
    email: 'mypaddess@gmail.com',
    phone: '+234 814 678 9087',
    location: 'Kano, Nigeria',
    professionalSummary: '',
    yourSkills: '',
    hardSkills: '',
    educationalSummary: ''
  });

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
      <div className={styles.header}>
        <button className={styles.menuButton}>
          <Icon icon="lucide:menu" className={styles.menuIcon} />
        </button>
        <img src={Logo} alt="Connecta" className={styles.logo} />
        <div className={styles.spacer}></div>
      </div>

      {/* Title */}
      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>My profile</h1>
      </div>

      {/* Profile Photo Section */}
      <div className={styles.profilePhotoSection}>
        <div className={styles.photoContainer}>
          <img src={userImage} alt="Profile" className={styles.profilePhoto} />
          <button className={styles.editPhotoButton}>
            <Icon icon="lucide:pencil" className={styles.editIcon} />
          </button>
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.userName}>Mustapha Hussein</h2>
          <div className={styles.location}>
            <Icon icon="lucide:map-pin" className={styles.locationIcon} />
            <span>Kano, Nigeria</span>
          </div>
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[1,2,3,4,5].map(star => (
                <Icon key={star} icon="lucide:star" className={styles.star} />
              ))}
            </div>
            <span className={styles.ratingText}>4.9</span>
          </div>
          <p className={styles.successRate}>Job Success Rate: 98%</p>
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

        {/* Resume */}
        <div className={styles.inputGroup}>
          <div className={styles.labelWithIcon}>
            <label className={styles.label}>Resume</label>
            <Icon icon="lucide:help-circle" className={styles.helpIcon} />
          </div>
          <div className={styles.fileUpload}>
            <p className={styles.uploadText}>
              Upload your professional resume to let clients view your experience 
              in the information they prefer.
            </p>
            <button className={styles.uploadButton}>
              <Icon icon="lucide:upload" className={styles.uploadIcon} />
              Upload
            </button>
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

        {/* Language Section */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Language</h3>
            <Icon icon="lucide:help-circle" className={styles.helpIcon} />
          </div>
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
      </div>
    </div>
  );
};