import React, { useState } from 'react';
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../utils/constants';
import SuccessPopup from '../../components/common/SuccessPopup';

// Import Asset
import contactHero from '../../assets/contact_hero_cartoon.png';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {

            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setShowPopup(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                alert(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col font-['Inter'] overflow-x-hidden">
            <Nav />

            {/* Hero Section - Split Layout */}
            <section className="pt-32 pb-12 bg-orange-50 relative overflow-hidden">
                <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-[#FD6730] font-bold tracking-widest uppercase mb-4 block">Support Center</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            We're here to <span className="text-[#FD6730]">help</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Have a question about Connecta? Need help with your profile or a job?
                            Our team is ready to assist you.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="p-2 bg-orange-100 rounded-lg text-[#FD6730]">
                                    <Icon icon="mdi:email-outline" width="24" height="24" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Email Us</p>
                                    <a href="mailto:hello@myconnecta.ng" className="text-gray-900 font-bold hover:text-[#FD6730] transition-colors">hello@myconnecta.ng</a>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Icon icon="mdi:twitter" width="24" height="24" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Tweet Us</p>
                                    <a href="https://x.com/Connectainc" target="_blank" rel="noreferrer" className="text-gray-900 font-bold hover:text-blue-600 transition-colors">@Connectainc</a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute inset-0 bg-[#FD6730]/10 rounded-full blur-3xl transform scale-90"></div>
                        <img
                            src={contactHero}
                            alt="Customer Support"
                            fetchPriority="high"
                            className="relative z-10 w-full max-w-lg mx-auto hover:scale-[1.02] transition-transform duration-500"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="flex-grow container mx-auto px-6 py-20 max-w-6xl">
                <div className="grid md:grid-cols-12 gap-12">

                    {/* Left Column: Form */}
                    <motion.div
                        className="md:col-span-8"
                        {...fadeIn}
                    >
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FD6730] focus:ring-4 focus:ring-orange-50 outline-none transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FD6730] focus:ring-4 focus:ring-orange-50 outline-none transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FD6730] focus:ring-4 focus:ring-orange-50 outline-none transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us more about your inquiry..."
                                        rows={6}
                                        className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FD6730] focus:ring-4 focus:ring-orange-50 outline-none transition-all resize-none font-medium"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full md:w-auto min-w-[200px] px-8 py-4 bg-[#FD6730] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#e05625] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <><span>Sending...</span></>
                                    ) : (
                                        <><span>Send Message</span> <Icon icon="mdi:send" width="18" /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Right Column: Info & Socials */}
                    <div className="md:col-span-4 space-y-8">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Icon icon="mdi:map-marker" className="text-[#FD6730]" /> Visit Us
                            </h3>
                            <p className="text-gray-300 leading-relaxed mb-8">
                                We love meeting our community! If you're in the area, feel free to drop by.
                            </p>
                            <div className="space-y-4">
                                <p className="font-bold text-lg">Connecta HQ</p>
                                <p className="text-gray-400">Kano, Nigeria</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Connect With Us</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <a href="https://x.com/Connectainc" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all group">
                                    <Icon icon="mdi:twitter" width="28" className="text-gray-400 group-hover:text-white mb-2 transition-colors" />
                                    <span className="text-xs font-bold">Twitter</span>
                                </a>
                                <a href="https://www.facebook.com/profile.php?id=61583324766005" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group">
                                    <Icon icon="mdi:facebook" width="28" className="text-gray-400 group-hover:text-white mb-2 transition-colors" />
                                    <span className="text-xs font-bold">Facebook</span>
                                </a>
                                <a href="https://www.instagram.com/connecta_inc" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-pink-600 hover:text-white transition-all group">
                                    <Icon icon="mdi:instagram" width="28" className="text-gray-400 group-hover:text-white mb-2 transition-colors" />
                                    <span className="text-xs font-bold">Instagram</span>
                                </a>
                                <a href="https://www.tiktok.com/@connectainc" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all group">
                                    <Icon icon="ic:baseline-tiktok" width="28" className="text-gray-400 group-hover:text-white mb-2 transition-colors" />
                                    <span className="text-xs font-bold">TikTok</span>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />

            <SuccessPopup
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
                title="Message Sent!"
                message="Thank you for reaching out. We have received your message and will get back to you shortly."
            />
        </div>
    );
};

export default Contact;
