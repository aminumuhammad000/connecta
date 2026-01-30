import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const Testimonials = () => {
    const testimonials = [
        {
            name: "Sarah Jenkins",
            role: "UX Designer",
            image: "https://i.pravatar.cc/150?u=sarah",
            quote: "I found a high-paying client within 2 days of joining. The AI matching is actually scary good—it knew exactly what roles fit my portfolio.",
            rating: 5
        },
        {
            name: "Team Alpha",
            role: "Full-Stack Squad",
            image: "https://i.pravatar.cc/150?u=team",
            quote: "Connecta Collabo changed how we work. We formed a team of 3 (Dev, Designer, PM) and landed a contract we never could have won individually.",
            rating: 5
        },
        {
            name: "David Okon",
            role: "Startup Founder",
            image: "https://i.pravatar.cc/150?u=david",
            quote: "Hiring used to be a headache. On Connecta, I posted a job and had 5 verified, high-quality proposals in an hour. Absolute game changer.",
            rating: 5
        }
    ];

    return (
        <section className="py-24 bg-orange-50/50 relative overflow-hidden" id="testimonials">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block p-3 rounded-full bg-orange-100 text-[#FD6730] mb-4"
                    >
                        <Quote className="w-6 h-6 fill-current" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold text-gray-900 mb-4"
                    >
                        Success <span className="text-[#FD6730]">Stories</span>
                    </motion.h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Don't just take our word for it. Here's what the Connecta community has to say.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            whileHover={{ y: -10 }}
                            className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col"
                        >
                            <div className="flex items-center gap-1 text-yellow-400 mb-6">
                                {[...Array(t.rating)].map((_, r) => (
                                    <Star key={r} className="w-5 h-5 fill-current" />
                                ))}
                            </div>

                            <p className="text-gray-600 text-lg leading-relaxed mb-8 flex-1">
                                "{t.quote}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto">
                                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full border-2 border-orange-100" />
                                <div>
                                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                                    <p className="text-sm text-[#FD6730] font-medium">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
