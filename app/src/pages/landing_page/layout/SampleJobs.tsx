import React, { useEffect, useState } from 'react';
import { Briefcase, Clock, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SampleJobs = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Fetch recent active jobs
                const response = await fetch('https://api.myconnecta.ng/api/jobs?limit=4&status=active');
                const data = await response.json();

                if (data.success && Array.isArray(data.data)) {
                    setJobs(data.data);
                } else {
                    setJobs([]);
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Helper to format time (e.g., "2h ago")
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    // Helper to assign random colors for variety (consistent based on index)
    const getJobColor = (index: number) => {
        const colors = [
            "bg-blue-50 border-blue-100 text-blue-600",
            "bg-orange-50 border-orange-100 text-[#FD6730]",
            "bg-purple-50 border-purple-100 text-purple-600",
            "bg-green-50 border-green-100 text-green-600"
        ];
        return colors[index % colors.length];
    };

    return (
        <section className="py-24 bg-white border-b border-gray-100 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500 font-bold text-xs mb-4 uppercase tracking-wider">
                            <Briefcase className="w-3 h-3" />
                            Live Opportunities
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                            Explore <span className="text-[#FD6730]">Jobs In Demand</span>
                        </h2>
                    </motion.div>
                    <motion.button
                        whileHover={{ x: 5 }}
                        className="hidden md:flex items-center gap-2 text-gray-500 font-bold hover:text-[#FD6730] transition-colors"
                        onClick={() => window.location.href = '/search'}
                    >
                        View All Gigs <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>

                {/* Unique "Pod" / "Card" Layout */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#FD6730]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {jobs.length > 0 ? (
                            jobs.map((job, i) => {
                                const colorClass = getJobColor(i);
                                const borderColor = colorClass.split(' ')[1].replace('bg-', 'border-'); // Extract border color roughly

                                return (
                                    <motion.div
                                        key={job._id || i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className={`p-6 rounded-3xl border-2 ${borderColor} bg-white shadow-xl shadow-gray-100 relative group cursor-pointer`}
                                        onClick={() => window.location.href = `https://app.myconnecta.ng/job/${job._id}`}
                                    >
                                        {/* Top Badge */}
                                        <div className={`inline-block px-3 py-1 rounded-lg ${colorClass} text-xs font-bold mb-4`}>
                                            {job.paymentType === 'fixed' ? 'Fixed Price' : 'Hourly'}
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#FD6730] transition-colors line-clamp-2 min-h-[3.5rem]">
                                            {job.title}
                                        </h3>

                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatTimeAgo(job.createdAt || job.posted)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {job.locationType === 'remote' ? 'Remote' : job.location || 'On-site'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div>
                                                <span className="text-xs text-gray-400 font-bold uppercase">Budget</span>
                                                <div className="text-lg font-black text-gray-900">
                                                    {job.budget ? `₦${job.budget.toLocaleString()}` : 'Negotiable'}
                                                </div>
                                            </div>
                                            <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FD6730] group-hover:text-white transition-all">
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-4 text-center py-10 text-gray-400">
                                No active jobs found. Check back soon!
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile View All Button */}
                <button className="md:hidden mt-8 w-full py-4 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:border-[#FD6730] hover:text-[#FD6730] transition-all flex items-center justify-center gap-2">
                    View All Gigs <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </section>
    );
};

export default SampleJobs;
