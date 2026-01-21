import React, { useEffect, useState } from 'react';
import {
    Users, Code, CheckCircle, DollarSign, Loader2,
    Smartphone, Palette, Megaphone, FileText, Video,
    Cpu, Music, Briefcase, MessageCircle, Database, PenTool
} from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
    { label: "Programming & Tech", icon: Code, desc: "Build robust platforms" },
    { label: "Graphics & Design", icon: Palette, desc: "Shape visual identities" },
    { label: "Digital Marketing", icon: Megaphone, desc: "Expand your reach" },
    { label: "Writing & Translation", icon: FileText, desc: "Craft compelling copy" },
    { label: "Video & Animation", icon: Video, desc: "Bring stories to life" },
    { label: "AI Services", icon: Cpu, desc: "Leverage smart tech" },
    { label: "Music & Audio", icon: Music, desc: "Create sonic impact" },
    { label: "Business", icon: Briefcase, desc: "Scale operations" },
    { label: "Consulting", icon: MessageCircle, desc: "Expert advice" },
    { label: "Data Science", icon: Database, desc: "Unlock insights" },
    { label: "Engineering", icon: PenTool, desc: "Designed for precision" },
];

const StatsAnalytics = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        freelancersCount: 0,
        completedProjects: 0,
        paymentRevenue: 0,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('https://api.myconnecta.ng/api/analytics/stats');
                const data = await response.json();

                if (data.success && data.data?.overview) {
                    const { totalUsers, freelancersCount, completedProjects, paymentRevenue } = data.data.overview;
                    setStats({
                        totalUsers,
                        freelancersCount,
                        completedProjects,
                        paymentRevenue,
                        loading: false
                    });
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, []);

    // Helper to format numbers (e.g., 1200 -> 1.2k)
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
        return num.toString();
    };

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return '₦' + (amount / 1000000).toFixed(1) + 'M+';
        if (amount >= 1000) return '₦' + (amount / 1000).toFixed(1) + 'k+';
        return '₦' + amount.toLocaleString();
    };

    return (
        <section className="py-20 bg-white relative overflow-hidden text-gray-900 border-b border-gray-100">
            {/* Subtle light gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        Platform <span className="text-[#FD6730]">Growth</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-lg max-w-2xl mx-auto"
                    >
                        Join the fastest growing network of digital professionals. Real-time metrics from our ecosystem.
                    </motion.p>
                </div>

                <div className="text-center mb-8 relative z-10">
                    <span className="bg-orange-50 text-[#FD6730] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-100">
                        Explore Jobs Categories
                    </span>
                </div>

                {/* Categories Auto-Scroll Marquee */}
                <div className="mb-20 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

                    <motion.div
                        className="flex gap-4 w-max"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 30
                        }}
                    >
                        {[...categories, ...categories].map((cat, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-700 font-bold text-sm whitespace-nowrap hover:border-[#FD6730] hover:text-[#FD6730] hover:shadow-lg transition-all cursor-pointer"
                            >
                                <cat.icon className="w-5 h-5 text-[#FD6730]" />
                                {cat.label}
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Stat Card 1: Users */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-orange-500/5 hover:border-[#FD6730]/30 transition-all duration-300 transform hover:-translate-y-2 group"
                    >
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FD6730] transition-colors">
                            <Users className="w-6 h-6 text-[#FD6730] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-1">
                            {stats.loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-300" /> : formatNumber(stats.totalUsers)}
                        </h3>
                        <p className="text-gray-500 font-medium">Total Users</p>
                    </motion.div>

                    {/* Stat Card 2: Freelancers */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-orange-500/5 hover:border-[#FD6730]/30 transition-all duration-300 transform hover:-translate-y-2 group"
                    >
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FD6730] transition-colors">
                            <Code className="w-6 h-6 text-[#FD6730] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-1">
                            {stats.loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-300" /> : formatNumber(stats.freelancersCount)}
                        </h3>
                        <p className="text-gray-500 font-medium">Contributors</p>
                    </motion.div>

                    {/* Stat Card 3: Completed Projects */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-orange-500/5 hover:border-[#FD6730]/30 transition-all duration-300 transform hover:-translate-y-2 group"
                    >
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FD6730] transition-colors">
                            <CheckCircle className="w-6 h-6 text-[#FD6730] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-1">
                            {stats.loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-300" /> : formatNumber(stats.completedProjects)}
                        </h3>
                        <p className="text-gray-500 font-medium">Projects Done</p>
                    </motion.div>

                    {/* Stat Card 4: Revenue */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-orange-500/5 hover:border-[#FD6730]/30 transition-all duration-300 transform hover:-translate-y-2 group"
                    >
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FD6730] transition-colors">
                            <DollarSign className="w-6 h-6 text-[#FD6730] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-1">
                            {stats.loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-300" /> : formatCurrency(stats.paymentRevenue)}
                        </h3>
                        <p className="text-gray-500 font-medium">Total Paid Out</p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default StatsAnalytics;
