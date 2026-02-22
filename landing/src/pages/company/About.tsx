
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Users, Shield, Lightbulb, Rocket } from 'lucide-react';
import React, { useRef } from 'react';

// Import Assets - Updated to Cartoon Style
import aboutHero from '../../assets/about_hero_cartoon.png';
import aboutTrust from '../../assets/about_trust_cartoon.png';
import aboutCommunity from '../../assets/about_community_cartoon.png';
import aboutFounder from '../../assets/about_founder_cartoon.png';

const About = () => {
    const containerRef = useRef(null);

    // Values Data
    const values = [
        {
            icon: Shield,
            title: "Trust before scale",
            description: "We prioritize verification and transparency over rapid expansion."
        },
        {
            icon: Users,
            title: "People before platforms",
            description: "Technology should serve people, building real relationships and trust."
        },
        {
            icon: Lightbulb,
            title: "Clarity over complexity",
            description: "We keep things simple, ensuring clear expectations for everyone."
        },
        {
            icon: Rocket,
            title: "Continuous improvement",
            description: "We are committed to listening, learning, and getting better every day."
        }
    ];

    // Animation Variants
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.6, ease: "easeOut" }
    };

    const staggerContainer = {
        initial: {},
        whileInView: { transition: { staggerChildren: 0.1 } }
    };

    return (
        <div ref={containerRef} className="bg-white min-h-screen flex flex-col font-['Inter'] overflow-x-hidden">
            <Nav />

            {/* New Hero Section - Split Layout */}
            <section className="relative pt-40 pb-20 bg-orange-50 overflow-hidden">
                <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Side: Our Origin Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10"
                    >
                        <span className="text-[#FD6730] font-bold tracking-widest uppercase mb-4 block">Our Origin</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                            Finding real digital work and trusted talent shouldn’t be difficult.
                        </h1>
                        <div className="w-24 h-1.5 bg-[#FD6730] rounded-full mb-8"></div>

                        <div className="text-lg text-gray-700 leading-relaxed space-y-6">
                            <p>
                                Connecta was built to solve a simple but persistent problem: finding real digital work and trusted talent shouldn’t be difficult.
                            </p>
                            <p>
                                In many places, especially in emerging markets, freelancers struggle with fake job offers, delayed payments, and unreliable clients.
                                At the same time, businesses often find it hard to identify dependable digital talent they can trust to deliver quality work.
                            </p>
                            <p className="font-bold text-gray-900">
                                This gap wastes time, money, and potential on both sides.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Side: Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-[#FD6730]/10 rounded-full blur-3xl transform scale-90"></div>
                        <img
                            src={aboutHero}
                            alt="Connecta Origin"
                            fetchPriority="high"
                            className="relative z-10 w-full rounded-2xl shadow-none hover:scale-[1.02] transition-transform duration-500"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Our Approach (Trust) - Split Layout */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="order-2 md:order-1"
                        >
                            <img
                                src={aboutTrust}
                                alt="Trust and Transparency"
                                loading="lazy"
                                className="rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500 ease-out"
                            />
                        </motion.div>
                        <motion.div
                            className="order-1 md:order-2 space-y-8"
                            {...fadeIn}
                        >
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Approach</h2>
                                <h3 className="text-2xl text-[#FD6730] font-semibold mb-4">Trust before scale</h3>
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    Connecta takes a <strong>trust-first approach</strong> to digital work.
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    Instead of chasing scale from day one, we focus on verification, transparency, and gradual growth — starting from local communities and expanding outward.
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    We believe strong digital work ecosystems are built through real relationships, clear expectations, and consistent delivery.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">What Connecta Does</h3>
                                <p className="text-gray-600">
                                    Connecta is a platform that connects freelancers and businesses for genuine digital work. Freelancers can discover real opportunities that match their skills, while businesses can find talent they can rely on — all within a structured and accountable environment.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Local Roots / Community - Split Layout */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            className="space-y-8"
                            {...fadeIn}
                        >
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-6">Why We Started Locally</h2>
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    We started Connecta locally because trust is built best at the community level.
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    By learning directly from real users and real experiences, we are able to build a product that works in practical, everyday situations — not just in theory.
                                </p>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Accountability</h3>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Connecta is built and managed by a small, dedicated team committed to listening, learning, and improving continuously. We remain closely involved in day-to-day operations to ensure quality, responsiveness, and accountability.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src={aboutCommunity}
                                alt="Local Community"
                                loading="lazy"
                                className="rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500 ease-out"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values - Grid Layout */}
            <section className="py-24 bg-[#FD6730]/[0.03] relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.h2 {...fadeIn} className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</motion.h2>
                        <div className="w-16 h-1 bg-[#FD6730] mx-auto rounded-full"></div>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {values.map((item, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    initial: { opacity: 0, y: 20 },
                                    whileInView: { opacity: 1, y: 0 }
                                }}
                                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-[#FD6730] mb-6 group-hover:bg-[#FD6730] group-hover:text-white transition-colors duration-300">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Founder's Note */}
            <section className="py-24 relative overflow-hidden bg-white text-gray-900">
                <div className="absolute inset-0 z-0 opacity-10">
                    <img src={aboutFounder} alt="Background" loading="lazy" className="w-full h-full object-cover" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        {...fadeIn}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-16 h-[1px] bg-[#FD6730]"></div>
                            <span className="text-[#FD6730] font-bold tracking-widest uppercase">A Note from the Founder</span>
                        </div>

                        <div className="space-y-6 text-lg md:text-xl text-gray-700 leading-relaxed font-light">
                            <p>
                                <span className="text-gray-900 font-medium">When We started working on Connecta, it wasn’t because we wanted to build another tech product.</span>
                            </p>
                            <p>
                                It was because we kept seeing the same problem repeat itself — talented people unable to find genuine work, and businesses struggling to find people they could truly trust.
                            </p>
                            <p>
                                Too often, opportunities are lost not because of lack of skill, but because of broken trust, poor structure, or unclear expectations.
                            </p>
                            <p>
                                <span className="text-[#FD6730] font-medium text-2xl block my-4 border-l-4 border-[#FD6730] pl-6 italic">
                                    "Connecta was created to change that — calmly, deliberately, and responsibly."
                                </span>
                            </p>
                            <p>
                                We are building Connecta with a strong belief that meaningful digital work ecosystems are built from the ground up. That’s why we chose to start locally, listen closely, and grow carefully. Every decision we make is guided by real user experiences, not assumptions or hype.
                            </p>
                            <p>
                                This is still an early stage of our journey, and we don’t claim to have everything perfect. What we do promise is honesty, continuous improvement, and a commitment to building something that genuinely works for the people who use it.
                            </p>
                            <p>
                                If you’re here as a freelancer, a business owner, or a supporter, thank you for being part of this early chapter. Your feedback, patience, and trust matter deeply to us.
                            </p>
                            <p className="font-bold text-gray-900 mt-8">
                                We’re building Connecta step by step — with care.
                            </p>
                        </div>

                        <div className="mt-12 flex items-center justify-end gap-6">
                            <div className="text-right">
                                <h4 className="text-2xl font-bold text-gray-900">Hassan Dankura</h4>
                                <p className="text-[#FD6730] font-medium">Founder, Connecta</p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FD6730] to-orange-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                HD
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
