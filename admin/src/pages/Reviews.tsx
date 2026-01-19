import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { reviewsAPI } from '../services/api'

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState<string | null>(null)

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
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-text-light-primary dark:text-dark-primary text-2xl sm:text-3xl font-black leading-tight tracking-tighter">Review Management</p>
          <p className="text-text-light-secondary dark:text-dark-secondary text-sm sm:text-base font-normal leading-normal">View and manage all user reviews and ratings.</p>
        </div>
      </header>

      <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 md:p-6">
        <div className="space-y-3 mb-4">
          {/* Search Bar - Full Width */}
          <div className="relative">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light-secondary dark:text-dark-secondary z-10" />
            <input
              className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-lg text-text-light-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary bg-background-light dark:bg-background-dark placeholder:text-text-light-secondary dark:placeholder:text-dark-secondary text-base font-normal"
              placeholder="Search by user or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Toggle - Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full px-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark rounded-lg font-medium flex items-center justify-between hover:bg-background-light/80 dark:hover:bg-background-dark/80 transition-colors"
          >
            <span className="flex items-center gap-2 text-text-light-primary dark:text-dark-primary">
              <Icon name="filter_list" size={20} />
              Filters
            </span>
            <Icon name={showFilters ? "expand_less" : "expand_more"} size={20} className="text-text-light-secondary dark:text-dark-secondary" />
          </button>

          {/* Desktop Filters */}
          <div className="hidden md:flex gap-3">
            <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Rating: All</p>
              <Icon name="expand_more" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
            <button className="flex h-12 shrink-0 items-center justify-between gap-x-2 rounded-lg bg-background-light dark:bg-background-dark px-4">
              <p className="text-text-light-primary dark:text-dark-primary text-sm font-medium leading-normal">Date Range</p>
              <Icon name="calendar_today" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
            </button>
          </div>

          {/* Mobile Filter Drawer */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
            <div className="space-y-2 pt-2">
              {[
                { label: 'Rating: All', icon: 'star' },
                { label: 'Date Range', icon: 'calendar_today' },
              ].map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => setShowFilters(false)}
                  className="w-full px-4 py-3 min-h-[44px] bg-background-light dark:bg-background-dark text-text-light-primary dark:text-dark-primary rounded-lg font-medium flex items-center gap-2 hover:bg-background-light/80 dark:hover:bg-background-dark/80 transition-colors"
                >
                  <Icon name={filter.icon} size={18} />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>


        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icon name="progress_activity" size={24} className="animate-spin text-primary mb-3" />
              <p className="text-text-light-secondary dark:text-dark-secondary">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Icon name="inbox" size={48} className="text-text-light-secondary dark:text-dark-secondary mb-3" />
              <p className="text-text-light-secondary dark:text-dark-secondary">No reviews found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4 max-w-2xl mx-auto">
                {filteredReviews.map((review) => (
                  <div key={review._id} className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                    {/* Reviewer Info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={review.reviewerId?.profileImage || `https://ui-avatars.com/api/?name=${review.reviewerId?.firstName}+${review.reviewerId?.lastName}&background=f59e0b&color=fff&size=128`}
                          alt={`${review.reviewerId?.firstName} ${review.reviewerId?.lastName}`}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary truncate">
                            {review.reviewerId?.firstName} {review.reviewerId?.lastName}
                          </p>
                          <p className="text-xs text-text-light-secondary dark:text-dark-secondary truncate">
                            {review.reviewerId?.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowActionSheet(showActionSheet === review._id ? null : review._id)}
                        className="p-2 hover:bg-card-light dark:hover:bg-card-dark rounded-lg transition-colors flex-shrink-0"
                        aria-label="Review actions"
                      >
                        <Icon name="more_vert" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
                      </button>
                    </div>

                    {/* Arrow pointing down */}
                    <div className="flex items-center justify-center mb-2">
                      <Icon name="arrow_downward" size={20} className="text-text-light-secondary dark:text-dark-secondary" />
                    </div>

                    {/* Reviewee Info */}
                    <div className="flex items-center gap-3 mb-3 p-3 bg-card-light dark:bg-card-dark rounded-lg">
                      <img
                        src={review.revieweeId?.profileImage || `https://ui-avatars.com/api/?name=${review.revieweeId?.firstName}+${review.revieweeId?.lastName}&background=10b981&color=fff&size=128`}
                        alt={`${review.revieweeId?.firstName} ${review.revieweeId?.lastName}`}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-light-primary dark:text-dark-primary truncate">
                          {review.revieweeId?.firstName} {review.revieweeId?.lastName}
                        </p>
                        <p className="text-xs text-text-light-secondary dark:text-dark-secondary truncate">
                          {review.revieweeId?.email}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <div className="mb-3">
                        <p className="text-xs text-text-light-secondary dark:text-dark-secondary uppercase mb-1">Comment</p>
                        <p className="text-sm text-text-light-primary dark:text-dark-primary">{review.comment}</p>
                        {review.projectId && (
                          <p className="text-xs text-primary mt-1">
                            Project: {review.projectId.title}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-xs text-text-light-secondary dark:text-dark-secondary">
                      {formatDate(review.createdAt)}
                    </div>

                    {/* Mobile Action Sheet */}
                    {showActionSheet === review._id && (
                      <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark space-y-2">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to flag this review?')) {
                              console.log('Flagging review:', review._id)
                              setShowActionSheet(null)
                            }
                          }}
                          className="w-full px-4 py-3 min-h-[44px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg font-medium flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Icon name="flag" size={18} />
                          Flag Review
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
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
                    {filteredReviews.map((review) => (
                      <tr key={review._id} className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
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
                                console.log('Flagging review:', review._id)
                              }
                            }}
                          >
                            <Icon name="flag" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
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
