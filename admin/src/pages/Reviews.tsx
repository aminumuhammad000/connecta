import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { reviewsAPI } from '../services/api'

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter] = useState<number | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await reviewsAPI.getAll()
      console.log('Reviews response:', response)

      // Handle different response formats
      let reviewsData = []
      if (Array.isArray(response)) {
        reviewsData = response
      } else if (response?.success && response?.data) {
        reviewsData = response.data
      } else if (response?.data) {
        reviewsData = Array.isArray(response.data) ? response.data : []
      }

      setReviews(reviewsData)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 text-yellow-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="star"
            size={16}
            className={star <= rating ? 'fill-current' : ''}
          />
        ))}
        <span className="ml-1 text-sm text-text-light-secondary dark:text-dark-secondary">
          ({rating}.0)
        </span>
      </div>
    )
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      searchQuery === '' ||
      review.reviewerId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.reviewerId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.revieweeId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.revieweeId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRating = ratingFilter === null || review.rating === ratingFilter

    return matchesSearch && matchesRating
  })

  return (
    <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-text-light-primary dark:text-dark-primary text-3xl font-black leading-tight tracking-tighter">Review Management</p>
          <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">View and manage all user reviews and ratings.</p>
        </div>
      </header>

      <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="flex flex-col min-w-40 h-12 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-text-light-secondary dark:text-dark-secondary flex bg-background-light dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg">
                  <Icon name="search" />
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light-primary dark:text-dark-primary focus:outline-0 focus:ring-2 focus:ring-primary focus:ring-inset border-none bg-background-light dark:bg-background-dark h-full placeholder:text-text-light-secondary placeholder:dark:text-dark-secondary px-4 pl-2 text-base font-normal leading-normal"
                  placeholder="Search by user or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </label>
          </div>
          <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
            <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Rating: All</p>
            <Icon name="expand_more" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
          </button>
          <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
            <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Date Range</p>
            <Icon name="calendar_today" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Reviewer</th>
                <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Reviewed User</th>
                <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Rating</th>
                <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Comment</th>
                <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary">Date</th>
                <th className="px-4 py-3 text-sm font-medium text-text-light-secondary dark:text-dark-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <Icon name="progress_activity" size={24} className="animate-spin text-primary" />
                    </div>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="inbox" size={48} className="text-text-light-secondary dark:text-dark-secondary" />
                      <p className="text-text-light-secondary dark:text-dark-secondary">No reviews found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review._id} className="border-b border-border-light dark:border-border-dark">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.reviewerId?.profileImage || `https://ui-avatars.com/api/?name=${review.reviewerId?.firstName}+${review.reviewerId?.lastName}&background=f59e0b&color=fff&size=128`}
                          alt={`${review.reviewerId?.firstName} ${review.reviewerId?.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">
                            {review.reviewerId?.firstName} {review.reviewerId?.lastName}
                          </p>
                          <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                            {review.reviewerId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.revieweeId?.profileImage || `https://ui-avatars.com/api/?name=${review.revieweeId?.firstName}+${review.revieweeId?.lastName}&background=10b981&color=fff&size=128`}
                          alt={`${review.revieweeId?.firstName} ${review.revieweeId?.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary">
                            {review.revieweeId?.firstName} {review.revieweeId?.lastName}
                          </p>
                          <p className="text-xs text-text-light-secondary dark:text-dark-secondary">
                            {review.revieweeId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary max-w-xs">
                      <p className="truncate">{review.comment}</p>
                      {review.projectId && (
                        <p className="text-xs text-primary mt-1">
                          Project: {review.projectId.title}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-light-secondary dark:text-dark-secondary whitespace-nowrap">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        className="text-text-light-secondary dark:text-dark-secondary hover:text-red-500"
                        onClick={() => {
                          if (confirm('Are you sure you want to flag this review?')) {
                            // Handle flag action
                            console.log('Flagging review:', review._id)
                          }
                        }}
                      >
                        <Icon name="flag" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-light dark:border-border-dark">
          <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        </div>
      </div>
    </main>
  )
}
