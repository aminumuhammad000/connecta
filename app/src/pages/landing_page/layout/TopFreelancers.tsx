import { useEffect, useState } from 'react';
import { Star, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL, APP_DOMAIN } from '../../../utils/constants';

const TopFreelancers = () => {
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                // Fetch top freelancers sorted by success score and rating
                const response = await fetch(`${API_BASE_URL}/users?userType=freelancer&limit=4`);
                const data = await response.json();

                if (data.success && Array.isArray(data.data)) {
                    setFreelancers(data.data);
                } else {
                    // Fallback if API fails or returns empty
                    setFreelancers([]);
                }
            } catch (error) {
                console.error("Failed to fetch freelancers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFreelancers();
    }, []);

    // Placeholder image generator if no profile image
    const getProfileImage = (user: any) => {
        if (user.profileImage) return user.profileImage;
        return `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random&color=fff`;
    };

    return (
        <section className="py-24 bg-white text-gray-900 border-b border-gray-100">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-2 text-[#FD6730] font-bold text-sm mb-2 uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" />
                            Verified Talent
                        </div>
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">Top Ranked <span className="text-[#FD6730]">Freelancers</span></h2>
                        <p className="text-gray-500 text-lg">Hire the top 1% of talent verified by Connecta.</p>
                    </motion.div>

                    <motion.button
                        whileHover={{ x: 5 }}
                        className="hidden md:flex px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-[#FD6730] hover:text-white hover:border-[#FD6730] transition-all items-center gap-2"
                        onClick={() => window.location.href = `${APP_DOMAIN}/search?type=freelancer`}
                    >
                        View All Talent
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#FD6730]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {freelancers.length > 0 ? (
                            freelancers.map((f, i) => (
                                <motion.div
                                    key={f._id || i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative p-6 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-100 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-500/30 transition-all duration-300 cursor-pointer"
                                    onClick={() => window.location.href = `${APP_DOMAIN}/u/${f._id}`}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative">
                                            <img
                                                src={getProfileImage(f)}
                                                alt={f.firstName}
                                                className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover"
                                            />
                                            {f.isVerified && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                                    <ShieldCheck className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#FD6730] transition-colors line-clamp-1">
                                                {f.firstName} {f.lastName}
                                            </h4>
                                            <p className="text-sm text-gray-500 line-clamp-1">{f.title || 'Freelancer'}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                                            <Star className="w-4 h-4 text-[#FD6730] fill-current" />
                                            <span className="text-gray-900 font-bold text-sm">{f.averageRating || '5.0'}</span>
                                        </div>
                                        <div className="text-gray-900 font-bold text-sm">
                                            {f.hourlyRate ? `₦${f.hourlyRate}/hr` : 'Negotiable'}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-10 text-gray-400">
                                No freelancers found. Be the first to join!
                            </div>
                        )}
                    </div>
                )}

                <button
                    className="md:hidden mt-8 w-full px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-[#FD6730] hover:text-white hover:border-[#FD6730] transition-all flex items-center justify-center gap-2"
                    onClick={() => window.location.href = `${APP_DOMAIN}/search?type=freelancer`}
                >
                    View All Talent
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </section>
    );
};

export default TopFreelancers;
