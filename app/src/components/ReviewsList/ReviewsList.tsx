import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import styles from './ReviewsList.module.css';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  tags: string[];
  reviewerId: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  projectId: {
    _id: string;
    title: string;
  };
  response?: string;
  respondedAt?: string;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
}

interface ReviewsListProps {
  userId: string;
  showStats?: boolean;
}

const ReviewsList = ({ userId, showStats = true }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    if (showStats) {
      fetchStats();
    }
  }, [userId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/user/${userId}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            icon={star <= rating ? 'mdi:star' : 'mdi:star-outline'}
            width="20"
            className={star <= rating ? styles.starFilled : styles.starEmpty}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Icon icon="eos-icons:loading" width="48" />
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Stats Section */}
      {showStats && stats.totalReviews > 0 && (
        <div className={styles.statsCard}>
          <div className={styles.statsMain}>
            <div className={styles.ratingBadge}>
              <Icon icon="mdi:star" width="32" />
              <span className={styles.averageRating}>{stats.averageRating.toFixed(1)}</span>
            </div>
            <div className={styles.statsInfo}>
              <p className={styles.totalReviews}>{stats.totalReviews} Reviews</p>
              <div className={styles.stars}>
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className={styles.distribution}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={rating} className={styles.distributionRow}>
                  <span className={styles.distributionLabel}>{rating}★</span>
                  <div className={styles.distributionBar}>
                    <div
                      className={styles.distributionFill}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={styles.distributionCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <Icon icon="mdi:comment-remove-outline" width="64" />
            <h3>No Reviews Yet</h3>
            <p>This user hasn't received any reviews yet.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className={styles.reviewCard}>
              {/* Reviewer Info */}
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  {review.reviewerId.profilePicture ? (
                    <img
                      src={review.reviewerId.profilePicture}
                      alt={`${review.reviewerId.firstName} ${review.reviewerId.lastName}`}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {review.reviewerId.firstName[0]}{review.reviewerId.lastName[0]}
                    </div>
                  )}
                  <div>
                    <h4 className={styles.reviewerName}>
                      {review.reviewerId.firstName} {review.reviewerId.lastName}
                    </h4>
                    <p className={styles.projectTitle}>
                      <Icon icon="mdi:briefcase-outline" width="14" />
                      {review.projectId.title}
                    </p>
                  </div>
                </div>
                <div className={styles.reviewMeta}>
                  {renderStars(review.rating)}
                  <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                </div>
              </div>

              {/* Tags */}
              {review.tags && review.tags.length > 0 && (
                <div className={styles.tags}>
                  {review.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      <Icon icon="mdi:check-circle" width="14" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comment */}
              <p className={styles.reviewComment}>{review.comment}</p>

              {/* Response */}
              {review.response && (
                <div className={styles.response}>
                  <div className={styles.responseHeader}>
                    <Icon icon="mdi:reply" width="18" />
                    <span>Response</span>
                  </div>
                  <p className={styles.responseText}>{review.response}</p>
                  <span className={styles.responseDate}>
                    {formatDate(review.respondedAt!)}
                  </span>
                </div>
              )}

              {/* Helpful Votes */}
              <div className={styles.reviewFooter}>
                <span className={styles.helpful}>
                  <Icon icon="mdi:thumb-up-outline" width="16" />
                  Helpful ({review.helpfulCount})
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
