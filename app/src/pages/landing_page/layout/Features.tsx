import React, { useState, useEffect } from 'react';
import { Bot, Zap, Bell, Users, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Features = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const features = [
        {
            id: 0,
            title: "AI Job Scouting",
            desc: "Stop tab-switching. Connecta crawls the entire web to bring relevant gigs from every major platform straight to your dashboard instantly.",
            icon: Bot,
            color: "text-white",
            bg: "bg-[#FD6730]",
            gradient: "from-orange-500 to-red-500"
        },
        {
            id: 1,
            title: "Smart Matching",
            desc: "Our AI analyzes your skills, portfolio, and past ratings to match you with valid clients. No more spam applications.",
            icon: Zap,
            color: "text-white",
            bg: "bg-yellow-500",
            gradient: "from-yellow-400 to-orange-500"
        },
        {
            id: 2,
            title: "Connecta Collabo",
            desc: "The world's first dedicated workspace for freelance teams. Chat, share files, and manage tasks in one unified room.",
            icon: Users,
            color: "text-white",
            bg: "bg-blue-600",
            gradient: "from-blue-500 to-indigo-600"
        },
        {
            id: 3,
            title: "Secure Escrow",
            desc: "Get paid on time, every time. Funds are held securely until milestones are met. Powered by Stripe & Paystack.",
            icon: ShieldCheck,
            color: "text-white",
            bg: "bg-green-600",
            gradient: "from-green-500 to-teal-600"
        },
        {
            id: 4,
            title: "Instant Alerts",
            desc: "Be the first to apply. Get real-time notifications via WhatsApp or Email the second a relevant job drops.",
            icon: Bell,
            color: "text-white",
            bg: "bg-purple-600",
            gradient: "from-purple-500 to-pink-600"
        },
        {
            id: 5,
            title: "Auto-Proposals",
            desc: "Let AI draft your cover letters based on the job description and your profile. Apply 10x faster.",
            icon: FileText,
            color: "text-white",
            bg: "bg-pink-600",
            gradient: "from-pink-500 to-rose-600"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % features.length);
        }, 4000); // Change every 4 seconds
        return () => clearInterval(interval);
    }, []);

    // Helper to determine card position in the stack
    const getCardStyle = (index: number) => {
        // Calculate distance from active index, handling wrap-around for smooth infinite loop feeling ideally,
        // but simple modulo distance is easeier for the stack visual.
        // We only want to show: Active, +1, +2.

        let offset = (index - activeIndex + features.length) % features.length;

        if (offset === 0) {
            // Front card
            return { zIndex: 30, scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' };
        } else if (offset === 1) {
            // Second card
            return { zIndex: 20, scale: 0.95, y: -25, opacity: 0.7, filter: 'blur(0px)' };
        } else if (offset === 2) {
            // Third card
            return { zIndex: 10, scale: 0.9, y: -50, opacity: 0.4, filter: 'blur(1px)' };
        } else {
            // Others hidden/cycling
            return { zIndex: 0, scale: 0.85, y: -75, opacity: 0, filter: 'blur(10px)' };
        }
    };

    return (
        <section className="py-24 bg-white relative overflow-hidden h-[800px] flex items-center" id="features">
            {/* Dynamic Background matching active card */}
            <div className="absolute inset-0 duration-1000 transition-colors ease-in-out bg-gray-50 flex items-center justify-center overflow-hidden">
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.15, scale: 1.2 }}
                    transition={{ duration: 1.5 }}
                    className={`absolute w-[1000px] h-[1000px] rounded-full blur-3xl bg-gradient-to-br ${features[activeIndex].gradient}`}
                />
            </div>

            <div className="container mx-auto px-6 relative z-10 w-full">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left: Text Context */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
                        >
                            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FD6730] to-orange-500">Dominate</span>
                        </motion.h2>
                        <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Connecta packs the entire freelance universe into one automated platform. Watch how we supercharge your workflow.
                        </p>

                        {/* Progress Indicators */}
                        <div className="flex gap-3 justify-center lg:justify-start">
                            {features.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`h-2 rounded-full transition-all duration-500 ${activeIndex === idx ? 'w-10 bg-[#FD6730]' : 'w-2 bg-gray-200 hover:bg-gray-300'}`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Stacked Cards Animation */}
                    <div className="w-full lg:w-1/2 h-[450px] relative flex items-center justify-center perspective-[1000px]">
                        <AnimatePresence mode='popLayout'>
                            {features.map((feature, index) => {
                                const style = getCardStyle(index);
                                // Only render relevant cards to DOM to keep it clean, or render all with opacity control
                                const isVisible = (index - activeIndex + features.length) % features.length < 4;

                                if (!isVisible) return null;

                                return (
                                    <motion.div
                                        key={feature.id}
                                        initial={false} // Don't animate initial render
                                        animate={style}
                                        layout
                                        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                                        className={`absolute w-full max-w-md p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col items-center text-center`}
                                        style={{ transformOrigin: "bottom center" }}
                                    >
                                        <div className={`w-20 h-20 rounded-2xl ${feature.gradient} bg-gradient-to-br flex items-center justify-center shadow-lg transform -translate-y-12 mb-[-30px]`}>
                                            <feature.icon className="w-10 h-10 text-white" />
                                        </div>

                                        <div className="mt-8">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                            <p className="text-gray-500 leading-relaxed mb-6">
                                                {feature.desc}
                                            </p>
                                        </div>

                                        <div className="w-full pt-6 border-t border-gray-50 mt-auto">
                                            <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                Next Up <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Features;
