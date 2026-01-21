import React, { useState, useEffect } from 'react';
import { Rocket, Zap, TrendingUp, Globe, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CallToAction = () => {
    const [index, setIndex] = useState(0);

    const states = [
        { word: "Transform", icon: Rocket, color: "text-yellow-300" },
        { word: "Scale", icon: TrendingUp, color: "text-green-300" },
        { word: "Launch", icon: Zap, color: "text-blue-300" },
        { word: "Globalize", icon: Globe, color: "text-purple-300" }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % states.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const CurrentIcon = states[index].icon;

    return (
        <section className="py-32 bg-gradient-to-br from-[#FD6730] to-[#FF8F6B] relative overflow-hidden" id="cta-main">
            {/* Background Stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full opacity-30 animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 4 + 2}px`,
                            height: `${Math.random() * 4 + 2}px`,
                            animationDelay: `${Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* Background Planets */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900 opacity-10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10 w-full text-center flex flex-col items-center justify-center">

                {/* Animated Icon Circle */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: 180, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="mb-8 p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full shadow-2xl shadow-orange-900/20 relative z-20"
                    >
                        <CurrentIcon className={`w-20 h-20 ${states[index].color} fill-current drop-shadow-lg`} />
                    </motion.div>
                </AnimatePresence>

                <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 relative z-20 leading-tight tracking-tight">
                    Ready to <br className="md:hidden" />
                    <span className="inline-block min-w-[300px]">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={index}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -40, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "backOut" }}
                                className={`block ${states[index].color}`}
                            >
                                {states[index].word}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                    <br className="md:hidden" /> Your Business?
                </h2>

                <p className="text-orange-50 text-xl md:text-2xl max-w-3xl mx-auto mb-12 relative z-20 leading-relaxed font-medium">
                    Join the universe of 50,000+ top-tier freelancers and visionary clients.
                    Your next big project starts with a single click.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-20">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-12 py-6 bg-white text-[#FD6730] text-xl font-extrabold rounded-3xl shadow-xl shadow-orange-900/20 flex items-center gap-3 transition-colors hover:bg-orange-50"
                        onClick={() => window.location.href = '/signup'}
                    >
                        <Rocket className="w-6 h-6 fill-current" />
                        Launch Project
                    </motion.button>
                </div>

            </div>
        </section>
    );
};

export default CallToAction;
