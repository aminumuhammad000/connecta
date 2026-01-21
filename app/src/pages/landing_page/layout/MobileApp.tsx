import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Smartphone, CheckCircle, Download } from 'lucide-react';

const MobileApp = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden" id="mobile-app">

            {/* Background Decorative Elements (Light Mode) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Floating Elements */}
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-orange-100 rounded-full opacity-60"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 10 + 4}px`,
                            height: `${Math.random() * 10 + 4}px`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{
                            duration: Math.random() * 4 + 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}

                {/* Big Gradient Orbs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-50/50 rounded-full blur-3xl -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -ml-20 -mb-20"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16 lg:gap-24">

                {/* Text Content (Left) */}
                <div className="flex-1 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-[#FD6730] font-bold text-sm mb-6 rounded-full border border-orange-100"
                    >
                        <Zap className="w-4 h-4 fill-orange-500" />
                        Available on iOS & Android
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
                    >
                        Run Your Empire <br />
                        <span className="text-[#FD6730] inline-block">From Anywhere.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 mb-10 max-w-lg mx-auto md:mx-0 font-medium leading-relaxed"
                    >
                        Connecta isn't just a website. It's a powerful mobile office that fits in your pocket. Get real-time updates and never miss a beat.
                    </motion.p>

                    {/* Features List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-4 mb-10 items-center md:items-start"
                    >
                        {["Instant Push Notifications", "Secure Mobile Wallet", "Voice & Video Calls"].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 text-lg font-bold text-gray-700">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                {feat}
                            </div>
                        ))}
                    </motion.div>

                    {/* App Store Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                    >
                        <button className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-xl hover:bg-black transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center group">
                            <span className="text-3xl group-hover:-translate-y-1 transition-transform"></span>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold text-gray-400 leading-none">Download on the</div>
                                <div className="text-sm font-bold leading-none mt-1">App Store</div>
                            </div>
                        </button>

                        <button className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-xl hover:bg-black transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center group">
                            {/* Simple Play Store Icon Shape */}
                            <svg className="w-7 h-7 group-hover:-translate-y-1 transition-transform" viewBox="0 0 24 24">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,25.88L21,17.25C21.77,16.81 21.77,15.69 21,15.25L5.78,6.47L16.81,17.5V15.12M14.77,10.92L4.35,0.5L14.77,10.92M15.42,11.58L15.42,11.58L15.42,11.58Z" fill="white" />
                                <polygon points="21,12 5,4 5,20" fill="white" />
                            </svg>
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-bold text-gray-400 leading-none">Get it on</div>
                                <div className="text-sm font-bold leading-none mt-1">Google Play</div>
                            </div>
                        </button>
                    </motion.div>
                </div>

                {/* Phone Mockup (Right) */}
                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 10 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                    className="flex-1 relative max-w-sm md:max-w-md mx-auto"
                >
                    {/* Ring Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-purple-200 rounded-full blur-[60px] scale-90 animate-pulse opacity-50"></div>

                    {/* Floating Animation Wrapper */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10"
                    >
                        {/* Actual Image */}
                        <img
                            src="/connectAPP.png"
                            alt="Connecta Mobile App Mockup"
                            className="w-full h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                        />

                        {/* Decorative floating elements */}
                        <motion.div
                            animate={{ rotate: -15, y: [0, 15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute -top-6 -right-6 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-100 p-2"
                        >
                            <div className="text-center">
                                <div className="text-xs font-bold text-gray-400 uppercase">Rating</div>
                                <div className="flex items-center justify-center gap-1 text-[#FD6730] font-black text-xl">
                                    4.9 <Star className="w-4 h-4 fill-current" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-gray-100"
                        >
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-[#FD6730]">
                                <Download className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase">Downloads</div>
                                <div className="text-2xl font-black text-gray-900">50k+</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default MobileApp;
