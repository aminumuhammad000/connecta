import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Header from '../../components/Header';
import styles from './CompleteProfile.module.css';
import { extractTextFromPDF } from '../../api/pdfToText';
import { extractTextFromDocx } from '../../api/docxToText';
import { extractEntities } from '../../api/extractEntities';


const CompleteProfile: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload only PDF or DOCX files');
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

const handleExtractData = async () => {
  if (!selectedFile) return;

  setUploading(true);
  setError('');

  try {
    let text = '';

    // Step 1: Extract raw text from file
    if (selectedFile.type === 'application/pdf') {
      text = await extractTextFromPDF(selectedFile);
    } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDocx(selectedFile);
    } else {
      throw new Error('Unsupported file type');
    }

    if (!text.trim()) throw new Error('No text found in file');

    // Step 2: Extract entities (AI parsing)
    const entityResult = await extractEntities(text);

    if (!entityResult) throw new Error('Entity extraction failed');

    // Step 3: Save parsed result in localStorage
    localStorage.setItem('connecta_extracted_cv_data', JSON.stringify(entityResult));

    // Step 4: Navigate to /edit-profile with extracted data
    navigate('/edit-profile', {
      state: {
        fromAI: true,
        extractedData: entityResult,
      },
    });
  } catch (err: any) {
    console.error('❌ Extraction error:', err);
    setError(err.message || 'Failed to extract data from CV. Please try again.');
  } finally {
    setUploading(false);
  }
};


  const handleManualComplete = () => {
    navigate('/edit-profile');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <div className={styles.contentWrapper}>
        <div className={styles.card}>
          {/* Header Section */}
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <Icon icon="mdi:file-document-outline" className={styles.headerIcon} />
            </div>
            <h1 className={styles.title}>Complete Your Profile</h1>
            <p className={styles.subtitle}>
              To complete your profile, please upload your CV. Our AI will extract information from it and help you build a professional profile.
            </p>
          </div>

          {/* Upload Section */}
          <div 
            className={styles.uploadSection}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="cvUpload"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className={styles.fileInput}
              disabled={uploading}
            />
            
            <label 
              htmlFor="cvUpload" 
              className={`${styles.uploadBox} ${selectedFile ? styles.uploadBoxActive : ''}`}
            >
              <Icon 
                icon={selectedFile ? "mdi:file-check" : "mdi:cloud-upload"} 
                className={styles.uploadIcon} 
              />
              
              {selectedFile ? (
                <div className={styles.fileInfo}>
                  <p className={styles.fileName}>{selectedFile.name}</p>
                  <p className={styles.fileSize}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button 
                    type="button"
                    className={styles.changeFileBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                      const input = document.getElementById('cvUpload') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div className={styles.uploadPrompt}>
                  <p className={styles.uploadText}>
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                  <p className={styles.uploadHint}>
                    PDF or DOCX (max. 10MB)
                  </p>
                </div>
              )}
            </label>

            {error && (
              <div className={styles.errorMessage}>
                <Icon icon="mdi:alert-circle" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Extract Button */}
          <button
            className={styles.extractBtn}
            onClick={handleExtractData}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Icon icon="eos-icons:loading" className={styles.loadingIcon} />
                Extracting Information...
              </>
            ) : (
              <>
                <Icon icon="mdi:robot" />
                Extract Data with AI
              </>
            )}
          </button>

          {/* Manual Link */}
          <div className={styles.manualSection}>
            <p className={styles.orText}>Or</p>
            <button 
              className={styles.manualLink}
              onClick={handleManualComplete}
              disabled={uploading}
            >
              <Icon icon="mdi:pencil" />
              Complete my profile manually
            </button>
          </div>

          {/* Features List */}
          <div className={styles.featuresList}>
            <div className={styles.feature}>
              <Icon icon="mdi:check-circle" className={styles.featureIcon} />
              <span>AI automatically extracts your information</span>
            </div>
            <div className={styles.feature}>
              <Icon icon="mdi:check-circle" className={styles.featureIcon} />
              <span>Review and edit before saving</span>
            </div>
            <div className={styles.feature}>
              <Icon icon="mdi:check-circle" className={styles.featureIcon} />
              <span>Secure and private processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
