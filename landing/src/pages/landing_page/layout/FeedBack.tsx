import React, { useState, useEffect } from 'react';
import { Quote, Star, X, MessageSquarePlus } from 'lucide-react';
import { getFeaturedTestimonials, submitGuestReview } from '../../../api/testimonials';
import { AnimatePresence, motion } from 'framer-motion';

interface Testimonial {
  text: string;
  name: string;
  role: string;
  img: string;
  rating?: number;
  tags?: string[];
}

const FeedBack = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fallback static data in case API fails
  const fallbackReviews: Testimonial[] = [
    {
      text: "Connecta changed how I freelance. The 'Collabo' workspace is a game changer for remote teams. It feels like we are in the same room!",
      name: "Emily R.",
      role: "Product Designer",
      img: "https://i.pravatar.cc/150?u=e"
    },
    {
      text: "Finally, a platform that doesn't just treat us like numbers. The community vibe and AI matching are spot on. Highly recommended!",
      name: "David K.",
      role: "Frontend Dev",
      img: "https://i.pravatar.cc/150?u=f"
    },
    {
      text: "I hired a full dev team in 24 hours using Connecta AI. The quality of talent here is unmatched compared to other platforms.",
      name: "Sarah M.",
      role: "Startup Founder",
      img: "https://i.pravatar.cc/150?u=g"
    }
  ];

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await getFeaturedTestimonials(3);

      if (response.success && response.data && response.data.length > 0) {
        setReviews(response.data);
      } else {
        setReviews(fallbackReviews);
      }
      setError(false);
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
      setReviews(fallbackReviews);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.comment) return;

    try {
      setSubmitting(true);
      await submitGuestReview(formData);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
        setFormData({ name: '', role: '', rating: 5, comment: '' });
        fetchTestimonials(); // Refresh list
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-block p-3 rounded-full bg-orange-100 mb-4 animate-bounce">
            <Quote className="w-6 h-6 text-[#FD6730] fill-current" />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Success <span className="text-[#FD6730]">Stories</span>
          </h2>
          <p className="text-gray-500 mb-8">
            Don't just take our word for it. Here's what the Connecta community has to say.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-full text-gray-700 font-semibold hover:bg-gray-50 hover:border-orange-200 hover:text-[#FD6730] transition-all duration-300 group"
          >
            <MessageSquarePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Write a Review
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD6730]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
                {/* Review Rating if available */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w - 4 h - 4 ${idx < (r.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} `}
                    />
                  ))}
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed italic flex-grow">"{r.text}"</p>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-50 mt-auto">
                  <img src={r.img} alt={r.name} className="w-12 h-12 rounded-full border-2 border-orange-100 object-cover" />
                  <div>
                    <h5 className="font-bold text-gray-900">{r.name}</h5>
                    <p className="text-xs text-[#FD6730] font-bold uppercase tracking-wider">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              {submitSuccess ? (
                <div className="p-8 text-center py-16">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-500">Your feedback has been submitted successfully.</p>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Share Feedback</h3>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Role (Optional)</label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none bg-white cursor-pointer"
                      >
                        <option value="" disabled>Select a role</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Client">Client</option>
                        <option value="Visitor">Visitor</option>
                        <option value="Tester">Tester</option>
                      </select>
                      <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w - 8 h - 8 ${star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} `}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                      <textarea
                        required
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                        placeholder="Tell us about your experience..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-[#FD6730] text-white rounded-xl font-bold text-lg hover:bg-[#e05520] transition-colors shadow-lg shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};


export default FeedBack;
