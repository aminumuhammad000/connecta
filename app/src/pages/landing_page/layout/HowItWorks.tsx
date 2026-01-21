import React from 'react';
import { UserPlus, Sparkles, Handshake, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
    const steps = [
        {
            id: 1,
            title: "Create Profile",
            desc: "Sign up in seconds. Add your skills, portfolio, and set your rates. No hidden fees.",
            icon: UserPlus,
            color: "bg-blue-50 text-blue-500",
            arrowColor: "text-blue-200"
        },
        {
            id: 2,
            title: "AI Match",
            desc: "Our shiny AI scans the universe to find the perfect gigs or talent for you instantly.",
            icon: Sparkles,
            color: "bg-[#FD6730] text-white", // Brand highlight
            arrowColor: "text-orange-200"
        },
        {
            id: 3,
            title: "Connect & Build",
            desc: "Collaborate in real-time workspaces. Get paid securely via Escrow. Launch.",
            icon: Handshake,
            color: "bg-green-50 text-green-500",
            arrowColor: "text-transparent" // Last one has no arrow
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden" id="how-it-works">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest mb-4"
                    >
                        Simple Process
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-gray-900"
                    >
                        How <span className="text-[#FD6730]">Connecta</span> Works
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-blue-100 via-orange-100 to-green-100 pointer-events-none -z-10 dashed-line"></div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center group"
                        >
                            {/* Icon Circle */}
                            <div className="relative mb-8">
                                <div className={`w-24 h-24 rounded-full ${step.color.includes('bg-[#FD6730]') ? 'bg-[#FD6730] shadow-lg shadow-orange-500/30' : 'bg-white border-2 border-gray-100 shadow-xl'} flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                                    <step.icon className={`w-10 h-10 ${step.color.includes('text-white') ? 'text-white' : step.color.split(' ')[1]}`} />

                                    {/* Circular Number Badge */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center font-bold text-gray-900 shadow-sm text-sm">
                                        {step.id}
                                    </div>
                                </div>

                                {/* Background Blob */}
                                <div className={`absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${step.color.replace('text-', 'bg-').split(' ')[0]}`}></div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>

                            {/* Mobile Arrow */}
                            {index < steps.length - 1 && (
                                <div className="md:hidden mt-8 text-gray-200">
                                    <ArrowRight className="w-6 h-6 rotate-90" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
