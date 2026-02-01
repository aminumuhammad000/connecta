
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import termsHero from '../../assets/about_trust_cartoon.png'; // Using the Handshake/Trust asset

const TermsOfService = () => {
    return (
        <div className="bg-white min-h-screen flex flex-col font-['Inter'] overflow-x-hidden">
            <Nav />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gray-50 overflow-hidden">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 text-[#FD6730] font-bold tracking-widest uppercase mb-4">
                            <FileText size={20} />
                            <span>Legal</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Terms of <span className="text-[#FD6730]">Service</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                            Please read these terms carefully. They govern your use of the Connecta platform and our relationship with you.
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
                            src={termsHero}
                            alt="Terms & Agreements"
                            className="relative z-10 w-full rounded-2xl hover:scale-[1.02] transition-transform duration-500"
                        />
                    </motion.div>
                </div>
            </section>

            <div className="flex-grow py-16 px-4 sm:px-6 lg:px-8 container mx-auto">
                <div className="grid md:grid-cols-12 gap-12">
                    {/* Sidebar Navigation */}
                    <div className="hidden md:block md:col-span-3">
                        <div className="sticky top-32 space-y-4">
                            <h3 className="font-bold text-gray-900 mb-4">Contents</h3>
                            {["Acceptance", "Description", "Accounts", "Conduct", "Fees", "Intellectual Property", "Termination", "Contact"].map((item, i) => (
                                <a key={i} href={`#section-${i + 1}`} className="block text-gray-500 hover:text-[#FD6730] transition-colors">{i + 1}. {item}</a>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-9 bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-sm">
                        <div className="prose prose-lg prose-orange max-w-none text-gray-600">
                            <p className="mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400 text-sm font-medium text-gray-800">
                                Last updated: January 2026
                            </p>

                            <section id="section-1" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <span className="text-[#FD6730]">1.</span> Acceptance of Terms
                                </h2>
                                <p>
                                    By accessing and using Connecta ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                                </p>
                            </section>

                            <section id="section-2" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <span className="text-[#FD6730]">2.</span> Description of Service
                                </h2>
                                <p>
                                    Connecta is a freelance marketplace connecting clients with independent professionals. We provide a platform for finding, hiring, managing, and paying for freelance work.
                                </p>
                            </section>

                            <section id="section-3" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <span className="text-[#FD6730]">3.</span> User Accounts
                                </h2>
                                <p>
                                    To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
                                </p>
                            </section>

                            <section id="section-4" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <span className="text-[#FD6730]">4.</span> User Conduct
                                </h2>
                                <p className="mb-4">
                                    You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, impairs, or renders the Service less efficient.
                                </p>
                                <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-start gap-4">
                                    <AlertCircle className="text-red-500 mt-1 flex-shrink-0" />
                                    <p className="text-red-700 text-sm mb-0">
                                        Violation of user conduct rules may result in immediate account suspension or termination.
                                    </p>
                                </div>
                            </section>

                            <section id="section-5" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <span className="text-[#FD6730]">5.</span> Payments and Fees
                                </h2>
                                <p>
                                    Connecta charges fees for certain services, such as facilitating payments between Clients and Freelancers. All fees are clearly disclosed at the time of transaction.
                                </p>
                            </section>

                            <section id="section-6" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <span className="text-[#FD6730]">6.</span> Intellectual Property
                                </h2>
                                <p>
                                    The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary rights.
                                </p>
                            </section>

                            <section id="section-7" className="mb-12 scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <span className="text-[#FD6730]">7.</span> Termination
                                </h2>
                                <p>
                                    We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                </p>
                            </section>

                            <section id="section-8" className="scroll-mt-32">
                                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                                    <span className="text-[#FD6730]">8.</span> Contact Information
                                </h2>
                                <p className="mb-4">
                                    If you have any questions about these Terms, please contact us.
                                </p>
                                <a href="mailto:legal@myconnecta.ng" className="inline-flex items-center gap-2 text-[#FD6730] font-bold hover:text-orange-700">
                                    <Mail size={18} /> legal@myconnecta.ng
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

export default TermsOfService;
