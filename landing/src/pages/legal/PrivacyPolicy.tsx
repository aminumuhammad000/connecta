
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText, Mail } from 'lucide-react';
import privacyHero from '../../assets/features_payment_cartoon.png'; // Using the Shield/Safe asset

const PrivacyPolicy = () => {
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
                            <span>Legal</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Privacy <span className="text-[#FD6730]">Policy</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                            Your trust is our foundation. We are committed to protecting your personal data and prioritizing your privacy.
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
                            src={privacyHero}
                            alt="Privacy & Security"
                            className="relative z-10 w-full rounded-2xl hover:scale-[1.02] transition-transform duration-500"
                        />
                    </motion.div>
                </div>
            </section>

            <div className="flex-grow py-16 px-4 sm:px-6 lg:px-8 container mx-auto">
                <div className="grid md:grid-cols-12 gap-12">
                    {/* Sidebar Navigation (Optional or just empty spacing on mobile) */}
                    <div className="hidden md:block md:col-span-3">
                        <div className="sticky top-32 space-y-4">
                            <h3 className="font-bold text-gray-900 mb-4">Contents</h3>
                            {["Introduction", "Information We Collect", "How We Use Data", "Sharing Information", "Security", "Contact"].map((item, i) => (
                                <a key={i} href={`#section-${i + 1}`} className="block text-gray-500 hover:text-[#FD6730] transition-colors">{i + 1}. {item}</a>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-9 bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-sm">
                        <div className="prose prose-lg prose-orange max-w-none text-gray-600">
                            <p className="mb-8 p-4 bg-orange-50 rounded-lg border-l-4 border-[#FD6730] text-sm font-medium text-orange-800">
                                Last updated: January 2026
                            </p>

                            <section id="section-1" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FD6730] text-sm">1</div>
                                    Introduction
                                </h2>
                                <p>
                                    Connecta ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                                </p>
                            </section>

                            <section id="section-2" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FD6730] text-sm">2</div>
                                    Information We Collect
                                </h2>
                                <p className="mb-4">
                                    We collect information that you voluntarily provide to us when you register on the Service, express an interest in obtaining information about us or our products and Services, or otherwise when you contact us.
                                </p>
                                <ul className="grid sm:grid-cols-2 gap-4 list-none pl-0">
                                    {[
                                        { title: "Personal Data", desc: "Name, email, address, phone number." },
                                        { title: "Payment Data", desc: "Payment instrument number, security code." },
                                        { title: "Credentials", desc: "Passwords, hints, and security info." }
                                    ].map((item, i) => (
                                        <li key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <strong className="block text-gray-900 mb-1">{item.title}</strong>
                                            <span className="text-sm">{item.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section id="section-3" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FD6730] text-sm">3</div>
                                    How We Use Your Information
                                </h2>
                                <p>
                                    We use personal information collected via our Service for legitimate business purposes: to provide services, process payments, and improve user experience.
                                </p>
                            </section>

                            <section id="section-4" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FD6730] text-sm">4</div>
                                    Sharing Your Information
                                </h2>
                                <p>
                                    We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                                </p>
                            </section>

                            <section id="section-5" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FD6730] text-sm">5</div>
                                    Security of Your Information
                                </h2>
                                <div className="flex items-start gap-4 bg-green-50 p-6 rounded-xl border border-green-100">
                                    <Lock className="text-green-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-green-800 mb-2">We protect your data</h4>
                                        <p className="text-green-700 text-sm mb-0">
                                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section id="section-6" className="scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#FD6730] text-sm">6</div>
                                    Contact Us
                                </h2>
                                <p className="mb-4">
                                    If you have questions or comments about this policy, please contact us.
                                </p>
                                <a href="mailto:privacy@myconnecta.ng" className="inline-flex items-center gap-2 text-[#FD6730] font-bold hover:text-orange-700">
                                    <Mail size={18} /> privacy@myconnecta.ng
                                </a>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
