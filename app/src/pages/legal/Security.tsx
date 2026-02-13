
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, Briefcase, MessageCircle, Flag, Lock, TrendingUp, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import securityHero from '../../assets/features_payment_cartoon.png'; // Reusing Shield asset for Trust & Safety

const Security = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
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
                        <div className="flex items-center gap-2 text-[#FD6730] font-bold tracking-widest uppercase mb-4">
                            <ShieldCheck size={20} />
                            <span>Trust & Safety</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Building a <span className="text-[#FD6730]">Trusted</span> Platform
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            At Connecta, trust is not an afterthought — it is the foundation of everything we are building. We understand that digital work only thrives when people feel safe, respected, and confident.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-[#FD6730]/10 rounded-full blur-3xl transform scale-90"></div>
                        <img
                            src={securityHero}
                            alt="Trust & Safety"
                            className="relative z-10 w-full rounded-2xl hover:scale-[1.02] transition-transform duration-500"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Content Sections */}
            <div className="container mx-auto px-6 py-20 max-w-5xl">

                {/* Intro Quote */}
                <motion.div {...fadeIn} className="text-center mb-20 max-w-3xl mx-auto">
                    <p className="text-2xl font-medium text-gray-900 leading-relaxed">
                        "We are taking a trust-first approach, especially during our early growth stage."
                    </p>
                </motion.div>

                <div className="grid gap-12">

                    {/* Commitment */}
                    <motion.section {...fadeIn} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-orange-100 rounded-xl text-[#FD6730]">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Trust</h2>
                                <p className="text-gray-600 mb-6">
                                    Connecta is designed to support genuine digital work and discourage abuse, fraud, and misuse. Our commitment is simple:
                                </p>
                                <ul className="space-y-3">
                                    {["Protect honest users", "Encourage transparency", "Act quickly when trust is broken"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 font-medium text-gray-700">
                                            <CheckCircle size={20} className="text-[#FD6730]" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.section>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* User Verification */}
                        <motion.section {...fadeIn} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-6">
                                <UserCheck className="text-blue-500" size={28} />
                                <h2 className="text-xl font-bold text-gray-900">User Verification</h2>
                            </div>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex gap-3"><span className="text-blue-500">•</span> Users are encouraged to provide accurate and complete profiles</li>
                                <li className="flex gap-3"><span className="text-blue-500">•</span> Suspicious or misleading accounts may be reviewed or restricted</li>
                                <li className="flex gap-3"><span className="text-blue-500">•</span> We continuously improve our verification processes as the platform grows</li>
                                <li className="flex gap-3"><span className="text-blue-500">•</span> Verification is an evolving process, and we are committed to strengthening it over time.</li>
                            </ul>
                        </motion.section>

                        {/* Job & Talent Integrity */}
                        <motion.section {...fadeIn} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-6">
                                <Briefcase className="text-purple-500" size={28} />
                                <h2 className="text-xl font-bold text-gray-900">Job & Talent Integrity</h2>
                            </div>
                            <p className="text-gray-900 font-medium mb-3">We actively discourage:</p>
                            <ul className="space-y-3 text-gray-600 mb-6">
                                <li className="flex gap-3"><span className="text-purple-500">•</span> Fake job postings</li>
                                <li className="flex gap-3"><span className="text-purple-500">•</span> Scam offers</li>
                                <li className="flex gap-3"><span className="text-purple-500">•</span> Misrepresentation of skills or services</li>
                            </ul>
                            <div className="bg-purple-50 p-4 rounded-lg text-sm text-purple-800">
                                Users found engaging in dishonest or harmful behavior may face warnings, restrictions, or removal.
                            </div>
                        </motion.section>
                    </div>

                    {/* Communication & Conduct */}
                    <motion.section {...fadeIn} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-green-100 rounded-xl text-green-600">
                                <MessageCircle size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Communication & Conduct</h2>
                                <p className="text-gray-600 mb-4">Connecta expects all users to:</p>
                                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                                    {["Communicate respectfully", "Be clear about expectations", "Avoid harassment/threats"].map((item, i) => (
                                        <div key={i} className="bg-gray-50 p-4 rounded-lg text-center font-medium text-gray-700 text-sm">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-gray-600 italic">
                                    We aim to create a professional environment where work can happen with mutual respect.
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Reporting & Support */}
                        <motion.section {...fadeIn} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-6">
                                <Flag className="text-red-500" size={28} />
                                <h2 className="text-xl font-bold text-gray-900">Reporting & Support</h2>
                            </div>
                            <p className="text-gray-600 mb-4">If you encounter suspicious activity, inappropriate behavior, or potential fraud:</p>
                            <p className="font-bold text-gray-900 mb-4">
                                You can report it through the platform or contact our support team directly.
                            </p>
                            <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800 flex gap-3">
                                <AlertTriangle className="flex-shrink-0" size={18} />
                                Every report is reviewed carefully. While not all issues can be resolved instantly, we take every concern seriously.
                            </div>
                        </motion.section>

                        {/* Payments & Agreements */}
                        <motion.section {...fadeIn} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-6">
                                <Lock className="text-indigo-500" size={28} />
                                <h2 className="text-xl font-bold text-gray-900">Payments & Agreements</h2>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Connecta encourages clear agreements between freelancers and businesses before work begins.
                            </p>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex gap-3"><span className="text-indigo-500">•</span> Clarify terms before starting work</li>
                                <li className="flex gap-3"><span className="text-indigo-500">•</span> Avoid off-platform arrangements that feel unsafe</li>
                                <li className="flex gap-3"><span className="text-indigo-500">•</span> Report payment-related concerns promptly</li>
                            </ul>
                        </motion.section>
                    </div>

                    {/* Continuous Improvement */}
                    <motion.section {...fadeIn} className="bg-gray-900 rounded-2xl p-10 text-white text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#FD6730]">
                            <TrendingUp size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Continuous Improvement</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                            Trust and safety are ongoing efforts. As Connecta grows, we will introduce stronger verification tools, improve moderation systems, and update policies based on real user feedback.
                        </p>
                        <p className="font-bold text-lg text-[#FD6730]">
                            Our goal is to build a platform that improves steadily — not one that makes empty promises.
                        </p>
                    </motion.section>

                    {/* Accountability */}
                    <motion.section {...fadeIn} className="text-center py-10">
                        <div className="inline-block p-4 bg-orange-50 rounded-full mb-6 text-[#FD6730]">
                            <Users size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Accountability</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                            Connecta is actively managed by a dedicated team that remains close to daily operations. We believe accountability starts with being present, responsive, and open to feedback. If something isn’t working, we want to hear about it.
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                            Connecta — Real Talent. Real Work.
                        </p>
                    </motion.section>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Security;
