import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from './styles/ProjectDetail.module.css';
import DetailHeader from "../.././pages/JobDetail/components/JobDetailHeader"

const ProjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    preview: string | null;
    type: string;
  }>>([]);

  const handleClose = () => {
    navigate('/project-dashboard');
  };

  const handleFileUpload = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const fileType = file.type.split('/')[0]; // 'image', 'video', 'audio', etc.
      
      if (fileType === 'image' || fileType === 'video') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedFiles(prev => [...prev, {
            file,
            preview: reader.result as string,
            type: fileType
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-media files, just add without preview
        setUploadedFiles(prev => [...prev, {
          file,
          preview: null,
          type: 'document'
        }]);
      }
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  return (
    <div className={styles.projectDetailPage}>
      {/* Header */}
      <div className={styles.header}>
        <DetailHeader
          jobTitle="Project Detail"
          onBack={handleClose}
          onShare={() => {}}
          onSave={() => {}}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h1 className={styles.projectTitle}>UI/UX Designer for Fintech Screenshot Design</h1>
        
        <div className={styles.statusSection}>
          <span className={styles.statusBadge}>Active</span>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Client:</span>
            <span className={styles.infoValue}>
              Mustapha Hussein
              <Icon icon="material-symbols:verified" className={styles.verifiedIcon} />
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Project Type:</span>
            <span className={styles.infoValue}>One-time project</span>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <p className={styles.summaryText}>
            We need a UI/UX designer to create one professional screenshot design for our fintech mobile app. This will be used for app store presentation and marketing.
          </p>
          <p className={styles.summaryText}>
            You'll design a single high-quality mobile app screenshot with a modern, professional fintech aesthetic. The design should be clean, visually appealing, and presentation-ready. One screenshot design with source files in Figma.
          </p>
          <div className={styles.budgetInfo}>
            <p><strong>Budget:</strong> $25 USD (Fixed price)</p>
            <p><strong>Deadline:</strong> 14th Jan 2026</p>
          </div>
        </div>

        {/* Deliverables */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Deliverables</h2>
          <ul className={styles.deliverablesList}>
            <li>Figma design for responsive landing page</li>
            <li>Hero banner with call-to-action</li>
            <li>Product highlight section</li>
            <li>About or brand story section</li>
            <li>Contact or newsletter sign-up</li>
          </ul>
        </div>

        {/* Project Activity */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Project Activity</h2>
          <ul className={styles.activityList}>
            <li>12th Oct 2025 — Client approved milestone</li>
            <li>8th Oct 2025 — Uploaded first draft</li>
            <li>6th Oct 2025 — Project assigned</li>
          </ul>
        </div>

        {/* Upload Section */}
        <div 
          className={`${styles.uploadSection} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />
          <div className={styles.uploadIcons}>
            <button 
              className={styles.uploadIconButton}
              onClick={() => handleFileUpload('image/*')}
              title="Upload Image"
            >
              <Icon icon="majesticons:image" />
            </button>
            <button 
              className={styles.uploadIconButton}
              onClick={() => handleFileUpload('video/*')}
              title="Upload Video"
            >
              <Icon icon="uil:video" />
            </button>
            <button 
              className={styles.uploadIconButton}
              onClick={() => handleFileUpload('.txt,.doc,.docx')}
              title="Upload Text Document"
            >
              <Icon icon="tabler:txt" />
            </button>
            <button 
              className={styles.uploadIconButton}
              onClick={() => handleFileUpload('*')}
              title="Upload Link/URL"
            >
              <Icon icon="mdi:link-variant" />
            </button>
            <button 
              className={styles.uploadIconButton}
              onClick={() => handleFileUpload('.pdf,.doc,.docx,.zip')}
              title="Upload File"
            >
              <Icon icon="ic:baseline-link" />
            </button>
            <button 
              className={styles.uploadIconButton}
              onClick={() => handleFileUpload('audio/*')}
              title="Upload Audio"
            >
              <Icon icon="uil:music" />
            </button>
          </div>
          <p className={styles.uploadText}>Upload file / project here</p>
          
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className={styles.uploadedFilesContainer}>
              {uploadedFiles.map((uploadedFile, index) => (
                <div key={index} className={styles.filePreview}>
                  {uploadedFile.type === 'image' && uploadedFile.preview && (
                    <img 
                      src={uploadedFile.preview} 
                      alt={uploadedFile.file.name}
                      className={styles.previewImage}
                    />
                  )}
                  {uploadedFile.type === 'video' && uploadedFile.preview && (
                    <video 
                      src={uploadedFile.preview} 
                      controls
                      className={styles.previewVideo}
                    />
                  )}
                  {uploadedFile.type === 'document' && (
                    <div className={styles.documentPreview}>
                      <Icon icon="bxs:file" className={styles.documentIcon} />
                      <span className={styles.fileName}>{uploadedFile.file.name}</span>
                    </div>
                  )}
                  <button 
                    className={styles.removeButton}
                    onClick={() => removeFile(index)}
                    title="Remove file"
                  >
                    <Icon icon="maki:cross" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.chatButton}>
            <span>Chat client</span>
            <Icon icon="fluent:chat-28-regular" />
          </button>
          <button className={styles.completeButton}>
            Mark as completed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
