import React, { useState, useEffect } from "react";
import { Search, Briefcase, Users, Star, DollarSign, Code, Zap, Globe, Rocket, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../assets/logo.png";
import { APP_DOMAIN } from "../../../utils/constants";

const Hero = () => {
    const [active, setActive] = useState("freelancer");
    const [index, setIndex] = useState(0);
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        const typeParam = active === 'freelancer' ? 'freelancer' : 'job';
        if (!query.trim()) {
            window.location.href = `${APP_DOMAIN}/search?type=${typeParam}`;
            return;
        }
        window.location.href = `${APP_DOMAIN}/search?q=${encodeURIComponent(query)}&type=${typeParam}`;
    };

    const titles = [
        "Not Just Jobs, The Right Ones",
        "Where Talent Meets Opportunity",
        "Your Skills. Our Universe. Infinite Possibilities",
        "Stop Searching. Start Connecting.",
        "The Professional Network That Actually Works",
        "Hire The Top 1% Without The Hassle",
        "Global Talent, One Click Away",
        "Build Your Dream Team In Minutes",
        "Freelancing, Reimagined For The Future",
        "Your Next Big Break Is Right Here"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % titles.length);
        }, 3500);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-white text-gray-900 selection:bg-orange-100 selection:text-orange-600">
            {/* Dynamic Background Decoration - Animated Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-orange-50/80 rounded-full blur-3xl opacity-60"
                />
                <motion.div
                    animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-orange-100/60 rounded-full blur-3xl opacity-60"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-blue-50/50 rounded-full blur-3xl opacity-30"
                />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left z-20">
                        <div className="h-[180px] lg:h-[220px] mb-4 flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                <motion.h1
                                    key={index}
                                    initial={{ opacity: 0, y: 20, rotateX: 90 }}
                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                    exit={{ opacity: 0, y: -20, rotateX: -90 }}
                                    transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                                    className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-gray-900"
                                >
                                    {titles[index].split(',').map((part, i) => (
                                        <span key={i} className="block">
                                            {i === 1 ? <span className="text-[#FD6730] drop-shadow-sm">{part}</span> : part}
                                        </span>
                                    ))}
                                </motion.h1>
                            </AnimatePresence>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-gray-500 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                        >
                            One login, endless gigs. Our AI matches you with the perfect project or freelancer instantly.
                        </motion.p>

                        {/* Enhanced Search & Tabs */}
                        <motion.div
                            className="bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-2xl shadow-orange-500/10 border border-white max-w-xl mx-auto lg:mx-0 relative z-30"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            whileHover={{ scale: 1.01, boxShadow: "0 25px 50px -12px rgba(253, 103, 48, 0.15)" }}
                        >
                            <div className="flex gap-2 p-1 bg-gray-50/80 rounded-2xl mb-3">
                                <button
                                    onClick={() => setActive("freelancer")}
                                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${active === 'freelancer' ? 'bg-white text-[#FD6730] shadow-sm scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Users className="w-4 h-4" />
                                    Find Freelancer
                                </button>
                                <button
                                    onClick={() => setActive("jobs")}
                                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${active === 'jobs' ? 'bg-white text-[#FD6730] shadow-sm scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Browse Jobs
                                </button>
                            </div>

                            <div className="relative group">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={active === 'freelancer' ? "Try 'React Developer' or 'Logo Designer'..." : "Try 'Frontend Project' or 'SEO Expert'..."}
                                    className="w-full bg-white border-2 border-transparent bg-gray-50 focus:bg-white focus:border-[#FD6730]/30 rounded-2xl py-5 pl-6 pr-16 outline-none transition-all text-gray-700 font-medium placeholder:text-gray-400 focus:shadow-lg focus:shadow-orange-500/5"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-3 top-3 bottom-3 aspect-square bg-[#FD6730] hover:bg-[#e05625] text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-orange-500/20 group-hover:scale-105 active:scale-95"
                                >
                                    <Search className="w-6 h-6" />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-8"
                        >
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <img key={i} src={`https://i.pravatar.cc/150?u=${i + 10}`} className="w-10 h-10 rounded-full border-2 border-white shadow-md" alt="User" />
                                ))}
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border-2 border-white">+2k</div>
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                <span className="text-[#FD6730] font-bold">4.9/5</span> rating from verified users
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Visual: "Expanded Universe" */}
                    <div className="w-full lg:w-1/2 relative h-[600px] flex items-center justify-center hidden md:flex perspective-[1000px]">

                        {/* Central "Sun" / Logo Core */}
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="relative w-64 h-64 z-20"
                        >
                            {/* Glow behind */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FD6730] to-[#FF8F6B] rounded-full blur-2xl opacity-50 animate-pulse"></div>

                            {/* White Circle Container */}
                            <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-[0_20px_60px_rgba(253,103,48,0.4)] border-4 border-orange-50">
                                {/* Logo Image */}
                                <img src={logo} alt="Connecta Logo" className="w-32 h-32 object-contain drop-shadow-lg" />
                            </div>
                        </motion.div>

                        {/* Orbit 1 - Fast & Close */}
                        <motion.div
                            className="absolute w-[380px] h-[380px] border border-orange-100/50 rounded-full z-10"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                        >
                            <motion.div className="absolute top-0 left-1/2 -ml-8 -mt-8 bg-white p-4 rounded-3xl shadow-xl shadow-orange-500/10 border border-orange-50 text-blue-500 flex flex-col items-center" whileHover={{ scale: 1.15, rotate: -10 }}>
                                <Code className="w-8 h-8 mb-1" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Dev</span>
                            </motion.div>
                            <motion.div className="absolute bottom-0 left-1/2 -ml-6 -mb-6 bg-white p-3 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-50 text-purple-500" whileHover={{ scale: 1.15 }}>
                                <Globe className="w-6 h-6" />
                            </motion.div>
                        </motion.div>

                        {/* Orbit 2 - Slower & Wider */}
                        <motion.div
                            className="absolute w-[550px] h-[550px] border border-dashed border-gray-200 rounded-full z-0"
                            animate={{ rotate: -360 }}
                            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
                        >
                            <motion.div className="absolute top-1/2 right-0 -mr-6 -mt-6 bg-white p-4 rounded-full shadow-lg shadow-gray-200 border border-gray-50 text-yellow-500" whileHover={{ scale: 1.25 }}>
                                <Star className="w-8 h-8 fill-current" />
                            </motion.div>
                            <motion.div className="absolute top-1/2 left-0 -ml-8 -mt-8 bg-white px-5 py-3 rounded-2xl shadow-xl shadow-gray-200 border border-gray-50 flex items-center gap-2" whileHover={{ scale: 1.1 }}>
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-gray-600">New Gig</span>
                            </motion.div>
                            {/* Extra element on orbit 2 */}
                            <motion.div className="absolute bottom-[15%] right-[15%] bg-white p-3 rounded-2xl shadow-lg text-[#FD6730]" whileHover={{ scale: 1.2 }}>
                                <Rocket className="w-6 h-6" />
                            </motion.div>
                        </motion.div>

                        {/* Floating Badges */}
                        <motion.div
                            className="absolute top-20 right-10 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl border border-white text-sm font-bold text-gray-600 flex items-center gap-3 z-30"
                            animate={{ y: [-15, 15, -15] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            Verified Talent
                        </motion.div>
                        <motion.div
                            className="absolute bottom-32 left-0 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl border border-white text-sm font-bold text-gray-600 flex items-center gap-3 z-30"
                            animate={{ y: [15, -15, 15] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <DollarSign className="w-5 h-5 text-[#FD6730]" />
                            Secure Pay
                        </motion.div>

                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
