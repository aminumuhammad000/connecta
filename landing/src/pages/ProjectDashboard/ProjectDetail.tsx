import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import styles from './styles/ProjectDetail.module.css';
import DetailHeader from "../.././pages/JobDetail/components/JobDetailHeader"
import { useNotification } from '../../contexts/NotificationContext';
import ReviewForm from '../../components/ReviewForm/ReviewForm';

interface Activity {
  date: string;
  description: string;
}

interface Upload {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  summary: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  status: 'ongoing' | 'completed' | 'cancelled';
  statusLabel: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  clientName: string;
  clientVerified: boolean;
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  deliverables: string[];
  activity: Activity[];
  uploads: Upload[];
}

const ProjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { showLoader, hideLoader, showError, showSuccess } = useNotification();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    preview: string | null;
    type: string;
  }>>([]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      showLoader();
      
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`);
      const data = await response.json();

      if (data.success) {
        setProject(data.data);
      } else {
        showError(data.message || 'Failed to fetch project details');
        navigate('/project-dashboard');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      showError('Failed to load project. Please try again.');
      navigate('/project-dashboard');
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleChatClient = () => {
    if (project?.clientId) {
      navigate('/messages', { 
        state: { 
          clientId: project.clientId._id, 
          clientName: project.clientName 
        } 
      });
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!project) return;
    
    try {
      showLoader();
      
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Project marked as completed!');
        // Refresh project data
        fetchProjectDetails();
      } else {
        showError(data.message || 'Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      showError('Failed to update project. Please try again.');
    } finally {
      hideLoader();
    }
  };

  const handleSubmitProject = async () => {
    if (!project || uploadedFiles.length === 0) {
      showError('Please upload at least one file before submitting');
      return;
    }

    try {
      showLoader();
      
      // For now, we'll simulate file uploads by sending metadata
      // In production, you would upload to a file storage service (S3, Cloudinary, etc.)
      // and then send the URLs to the backend
      
      const uploadPromises = uploadedFiles.map(async (uploadedFile) => {
        const fileData = {
          fileName: uploadedFile.file.name,
          fileUrl: `uploads/${uploadedFile.file.name}`, // Simulated URL
          fileType: uploadedFile.file.type,
          uploadedBy: localStorage.getItem('userId') || 'freelancer', // Get from auth context in production
        };

        const response = await fetch(`http://localhost:5000/api/projects/${projectId}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fileData),
        });

        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      
      // Check if all uploads were successful
      const allSuccessful = results.every(result => result.success);

      if (allSuccessful) {
        showSuccess('Files uploaded successfully!');
        setUploadedFiles([]); // Clear uploaded files
        // Refresh project data to show new uploads
        await fetchProjectDetails();
      } else {
        showError('Some files failed to upload');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      showError('Failed to upload files. Please try again.');
    } finally {
      hideLoader();
    }
  };


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

  if (loading || !project) {
    return (
      <div className={styles.projectDetailPage}>
        <div className={styles.header}>
          <DetailHeader
            jobTitle="Project Detail"
            onBack={handleClose}
            onShare={() => {}}
            onSave={() => {}}
          />
        </div>
        <div className={styles.loadingContainer}>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  // Debug: log the full project object before rendering
  console.log('ProjectDetail.tsx project:', project);
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
        <h1 className={styles.projectTitle}>{project.title}</h1>
        
        <div className={styles.statusSection}>
          <span className={`${styles.statusBadge} ${project.status === 'ongoing' ? styles.active : styles.completed}`}>
            {project.statusLabel}
          </span>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Client:</span>
            <span className={styles.infoValue}>
              {project.clientName}
              {project.clientVerified && (
                <Icon icon="material-symbols:verified" className={styles.verifiedIcon} />
              )}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Project Type:</span>
            <span className={styles.infoValue}>
              {project.budget.type === 'fixed' ? 'Fixed price' : 'Hourly rate'}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <p className={styles.summaryText}>{project.summary}</p>
          {project.description && (
            <p className={styles.summaryText}>{project.description}</p>
          )}
          <div className={styles.budgetInfo}>
            <p>
              <strong>Budget:</strong> ${project.budget.amount} {project.budget.currency} ({project.budget.type === 'fixed' ? 'Fixed price' : 'Hourly rate'})
            </p>
            <p>
              <strong>Deadline:</strong> {formatDate(project.dateRange.endDate)}
            </p>
          </div>
        </div>

        {/* Deliverables */}
        {project.deliverables && project.deliverables.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Deliverables</h2>
            <ul className={styles.deliverablesList}>
              {project.deliverables.map((deliverable, index) => (
                <li key={index}>{deliverable}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Project Activity */}
        {project.activity && project.activity.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Project Activity</h2>
            <ul className={styles.activityList}>
              {project.activity.map((activity, index) => (
                <li key={index}>
                  {formatDate(activity.date)} — {activity.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Existing Uploads */}
        {project.uploads && project.uploads.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Uploaded Files</h2>
            <div className={styles.existingUploads}>
              {project.uploads.map((upload, index) => (
                <div key={index} className={styles.uploadItem}>
                  <Icon icon="bxs:file" className={styles.documentIcon} />
                  <span className={styles.fileName}>{upload.fileName}</span>
                  <span className={styles.uploadDate}>
                    {formatDate(upload.uploadedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Section - Only show for completed projects */}
        {project.status === 'completed' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Project Completed!</h2>
            <p className={styles.completedText}>
              This project has been completed. Share your experience by writing a review.
            </p>
            <button 
              className={styles.reviewButton}
              onClick={() => setShowReviewModal(true)}
            >
              <Icon icon="mdi:star" width="20" />
              Write a Review
            </button>
          </div>
        )}

        {/* Upload Section - Only show for ongoing projects */}
        {project.status === 'ongoing' && (
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

            {/* Submit Button */}
            {uploadedFiles.length > 0 && (
              <button 
                className={styles.submitButton}
                onClick={handleSubmitProject}
              >
                Submit Project Files
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button 
            className={styles.chatButton}
            onClick={handleChatClient}
          >
            <span>Chat client</span>
            <Icon icon="fluent:chat-28-regular" />
          </button>
          {project.status === 'ongoing' && (
            <button 
              className={styles.completeButton}
              onClick={handleMarkAsCompleted}
            >
              Mark as completed
            </button>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && project && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <ReviewForm
              projectId={project._id}
              projectTitle={project.title}
              revieweeType="client"
              revieweeName={project.clientName}
              onSuccess={() => {
                setShowReviewModal(false);
                showSuccess('Review submitted successfully!');
              }}
              onCancel={() => setShowReviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
