import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Globe } from 'lucide-react';

const AboutUs = () => {
    const stats = [
        { label: "Freelancers", value: "10K+", icon: Users },
        { label: "Countries", value: "120+", icon: Globe },
        { label: "Projects", value: "50K+", icon: Target },
        { label: "Satisfaction", value: "99%", icon: Heart },
    ];

    return (
        <section className="py-24 bg-gray-50 relative overflow-hidden" id="about">
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-extrabold text-gray-900 mb-6"
                    >
                        Empowering the <span className="text-[#FD6730]">Future of Work</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-500 leading-relaxed"
                    >
                        Connecta isn't just a platform; it's a movement. We believe that talent is distributed equally, but opportunity is not. We're here to bridge that gap with AI-driven matching, secure payments, and a workspace designed for collaboration.
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center"
                        >
                            <div className="w-12 h-12 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-4">
                                <stat.icon className="w-6 h-6 text-[#FD6730]" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                        <p className="text-gray-500 leading-relaxed mb-6">
                            To create the world's most trusted and efficient freelance ecosystem where anyone, anywhere can build a thriving career based on their skills, not their location.
                        </p>
                        <ul className="space-y-3">
                            {["Fair & Transparent Fees", "AI-Powered Opportunities", "Community-First Approach"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-[#FD6730]"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#FD6730] p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
                    >
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                        <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                        <p className="leading-relaxed opacity-90 mb-6">
                            A world where work is flexible, collaborative, and borderless. Whether you're a startup looking for agility or a freelancer seeking freedom, Connecta is your launchpad.
                        </p>
                        <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                            <div>
                                <p className="font-bold text-lg">Chinedu & The Team</p>
                                <p className="text-sm opacity-75">Founders of Connecta</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
