
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { motion } from 'framer-motion';
import { BrainCircuit, ShieldCheck, Users, ArrowRight, CheckCircle } from 'lucide-react';

// Import Assets
import featuresHero from '../../assets/features_hero_cartoon.png';
import featuresAi from '../../assets/features_ai_matching_cartoon.png';
import featuresPayment from '../../assets/features_payment_cartoon.png';
import featuresCollab from '../../assets/features_collab_cartoon.png';

const Features = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.6 }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col font-['Inter'] overflow-x-hidden">
            <Nav />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-orange-50 overflow-hidden">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-[#FD6730] font-bold tracking-widest uppercase mb-4 block">Platform Features</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Everything you need to <span className="text-[#FD6730]">succeed</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            Connecta brings together powerful tools to help you find work, hire talent, and manage projects—all in one place.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="https://app.myconnecta.ng" target="_blank" rel="noopener noreferrer" className="bg-[#FD6730] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                Get Started <ArrowRight size={20} />
                            </a>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-[#FD6730]/10 rounded-full blur-3xl transform scale-90"></div>
                        <img
                            src={featuresHero}
                            alt="Connecta Features"
                            fetchPriority="high"
                            className="relative z-10 w-full rounded-2xl hover:scale-[1.02] transition-transform duration-500"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Feature 1: AI Matching */}
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
                                src={featuresAi}
                                alt="AI Matching"
                                loading="lazy"
                                className="rounded-3xl shadow-2xl hover:rotate-1 transition-transform duration-500"
                            />
                        </motion.div>
                        <motion.div
                            className="order-1 md:order-2"
                            {...fadeIn}
                        >
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-[#FD6730] mb-6">
                                <BrainCircuit size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Smart AI Matching</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Stop searching endlessly. Our smart AI analyzes your skills and project requirements to instantly connect you with the perfect opportunities.
                            </p>
                            <ul className="space-y-3">
                                {["Personalized Job Feeds", "Skill-based Recommendations", "Instant Matches"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium text-gray-700">
                                        <CheckCircle size={20} className="text-[#FD6730]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Secure Payments */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            className="space-y-6"
                            {...fadeIn}
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Secure Escrow Payments</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Work with peace of mind. Funds are held securely in escrow until milestones are met, ensuring freelancers get paid and clients get quality work.
                            </p>
                            <ul className="space-y-3">
                                {["Milestone-based Releases", "Payment Protection", "Multiple Currency Support"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium text-gray-700">
                                        <CheckCircle size={20} className="text-green-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src={featuresPayment}
                                alt="Secure Payments"
                                loading="lazy"
                                className="rounded-3xl shadow-2xl hover:-rotate-1 transition-transform duration-500"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature 3: Collaboration */}
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
                                src={featuresCollab}
                                alt="Real-time Collaboration"
                                loading="lazy"
                                className="rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                            />
                        </motion.div>
                        <motion.div
                            className="order-1 md:order-2"
                            {...fadeIn}
                        >
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                <Users size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Seamless Collaboration</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                More than just a job board. Connecta provides built-in tools for chat, file sharing, and project tracking to help teams work together effortlessly.
                            </p>
                            <ul className="space-y-3">
                                {["Integrated Chat", "File Sharing", "Project Status Tracking"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium text-gray-700">
                                        <CheckCircle size={20} className="text-blue-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#FD6730] text-white">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl font-bold mb-6">Ready to experience these features?</h2>
                        <p className="text-xl text-white/90 mb-10">
                            Join Connecta today and start working the way you want.
                        </p>
                        <a href="https://app.myconnecta.ng" target="_blank" rel="noopener noreferrer" className="bg-white text-[#FD6730] px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-gray-100 hover:scale-105 transition-all inline-block">
                            Create Free Account
                        </a>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Features;
