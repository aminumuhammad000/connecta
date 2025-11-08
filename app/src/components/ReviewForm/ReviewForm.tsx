import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
  projectId: string;
  projectTitle: string;
  revieweeType: 'freelancer' | 'client';
  revieweeName: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

const REVIEW_TAGS = {
  freelancer: [
    'Professional',
    'Great Communication',
    'On Time',
    'High Quality Work',
    'Would Hire Again',
    'Creative',
    'Technical Expert',
    'Problem Solver',
  ],
  client: [
    'Clear Requirements',
    'Responsive',
    'Fair',
    'Easy to Work With',
    'Timely Payments',
    'Professional',
    'Good Communicator',
    'Respectful',
  ],
};

const ReviewForm = ({
  projectId,
  projectTitle,
  revieweeType,
  revieweeName,
  onSuccess,
  onCancel,
}: ReviewFormProps) => {
  const { showLoader, hideLoader, showError, showSuccess } = useNotification();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = REVIEW_TAGS[revieweeType];

  const handleSubmit = async () => {
    if (rating === 0) {
      showError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      showError('Please write at least 10 characters');
      return;
    }

    showLoader();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          rating,
          comment: comment.trim(),
          tags: selectedTags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        hideLoader();
        showSuccess('Review submitted successfully!');
        onSuccess();
      } else {
        hideLoader();
        showError(data.message || 'Failed to submit review');
      }
    } catch (error) {
      hideLoader();
      showError('Failed to submit review. Please try again.');
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Write a Review</h2>
          <p className={styles.subtitle}>
            For <strong>{revieweeName}</strong> on project: {projectTitle}
          </p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className={styles.closeButton}>
            <Icon icon="mdi:close" width="24" />
          </button>
        )}
      </div>

      {/* Rating Section */}
      <div className={styles.section}>
        <label className={styles.label}>
          <Icon icon="mdi:star" width="20" />
          Overall Rating
        </label>
        <div className={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={styles.starButton}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Icon
                icon={star <= (hoveredRating || rating) ? 'mdi:star' : 'mdi:star-outline'}
                width="40"
                className={star <= (hoveredRating || rating) ? styles.starFilled : styles.starEmpty}
              />
            </button>
          ))}
          <span className={styles.ratingText}>
            {rating > 0 ? (
              <>
                {rating === 5 && '⭐ Excellent'}
                {rating === 4 && '👍 Great'}
                {rating === 3 && '😊 Good'}
                {rating === 2 && '😐 Fair'}
                {rating === 1 && '😕 Poor'}
              </>
            ) : (
              'Select a rating'
            )}
          </span>
        </div>
      </div>

      {/* Tags Section */}
      <div className={styles.section}>
        <label className={styles.label}>
          <Icon icon="mdi:tag-multiple" width="20" />
          Tags (Optional)
        </label>
        <div className={styles.tagsGrid}>
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`${styles.tag} ${
                selectedTags.includes(tag) ? styles.tagSelected : ''
              }`}
            >
              {selectedTags.includes(tag) && (
                <Icon icon="mdi:check" width="16" />
              )}
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Comment Section */}
      <div className={styles.section}>
        <label className={styles.label}>
          <Icon icon="mdi:message-text" width="20" />
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Share your experience working with ${revieweeName}...`}
          className={styles.textarea}
          maxLength={1000}
        />
        <div className={styles.charCount}>
          {comment.length}/1000 characters
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {onCancel && (
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || comment.trim().length < 10}
          className={styles.submitButton}
        >
          <Icon icon="mdi:send" width="20" />
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;
