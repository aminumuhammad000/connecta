import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "What makes Connecta different from other platforms?",
            answer: "Connecta is the first AI-powered platform that combines individual freelancing with 'Collabo'—our dedicated workspace for freelance teams. We also use AI to auto-match you with jobs across the web, not just on our site."
        },
        {
            question: "Is it free to join?",
            answer: "Yes! Signing up and browsing jobs is completely free. We only charge a small service fee when you successfully get paid for a project. No hidden subscription fees for basic accounts."
        },
        {
            question: "How does the payment system work?",
            answer: "We use a secure Escrow system powered by Paystack and Stripe. Clients deposit funds before work begins, and money is released to the freelancer only when milestones are approved. This protects both parties."
        },
        {
            question: "Can I be both a Client and a Freelancer?",
            answer: "Absolutely. You can switch between 'Client' and 'Freelancer' modes instantly with a single account. Use your earnings to hire others or withdraw them directly to your bank."
        },
        {
            question: "What is 'Connecta Collabo'?",
            answer: "Collabo is our unique team-based feature. It allows you to form squads with other freelancers (e.g., a Developer + Designer) to bid on larger, more complex projects that you couldn't handle alone."
        },
        {
            question: "How does the AI Job Scouting work?",
            answer: "Our AI bot scans thousands of job boards and company career pages 24/7. It filters them based on your specific skills and notifies you instantly, so you never miss an opportunity."
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden" id="faq">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold text-sm mb-6 rounded-full border border-blue-100"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Got Questions?
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
                    >
                        Frequently Asked <span className="text-[#FD6730]">Questions</span>
                    </motion.h2>
                    <p className="text-xl text-gray-500">
                        Everything you need to know about navigating the Connecta universe.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`border transition-all duration-300 rounded-2xl ${activeIndex === index ? 'border-[#FD6730] bg-orange-50/30' : 'border-gray-200 bg-white hover:border-orange-200'}`}
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className={`text-lg font-bold ${activeIndex === index ? 'text-[#FD6730]' : 'text-gray-900'}`}>
                                    {faq.question}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeIndex === index ? 'bg-[#FD6730] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {activeIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </div>
                            </button>
                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-dashed border-orange-200/50 mt-2">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
