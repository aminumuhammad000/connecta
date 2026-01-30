import React, { useState } from 'react';
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import SuccessPopup from '../../components/common/SuccessPopup';

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
            // Use the API URL from environment/constants or fallback to production
            // Use the API URL from environment/constants or fallback to localhost for dev
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // alert('Thank you for contacting us! We will get back to you shortly.');
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

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col font-['Inter']">
            <Nav />

            {/* Hero Section */}
            <div className="bg-white pt-32 pb-12 px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
                >
                    Get in <span className="text-[#FD6730]">Touch</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-500 max-w-2xl mx-auto"
                >
                    Have a question, feedback, or need support? We're here to help!
                </motion.p>
            </div>

            <div className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Contact Info Sidebar */}
                    <div className="md:col-span-1 space-y-6">

                        {/* Contact Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Icon icon="mdi:information-outline" className="text-[#FD6730]" /> Contact Info
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-50 rounded-lg text-[#FD6730]">
                                        <Icon icon="mdi:email-outline" width="20" height="20" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">General Inquiries</p>
                                        <a href="mailto:hello@myconnecta.ng" className="text-gray-600 hover:text-[#FD6730]">hello@myconnecta.ng</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-50 rounded-lg text-[#FD6730]">
                                        <Icon icon="mdi:face-agent" width="20" height="20" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Support</p>
                                        <a href="mailto:support@myconnecta.ng" className="text-gray-600 hover:text-[#FD6730]">support@myconnecta.ng</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-50 rounded-lg text-[#FD6730]">
                                        <Icon icon="mdi:map-marker-outline" width="20" height="20" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Office</p>
                                        <p className="text-gray-600">Kano, Nigeria</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Follow Us</h3>
                            <div className="flex gap-4">
                                <a href="https://x.com/Connectainc" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-600 hover:bg-black hover:text-white transition-all">
                                    <Icon icon="mdi:twitter" width="20" height="20" />
                                </a>
                                <a href="https://www.facebook.com/profile.php?id=61583324766005" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-600 hover:bg-blue-600 hover:text-white transition-all">
                                    <Icon icon="mdi:facebook" width="20" height="20" />
                                </a>
                                <a href="https://www.instagram.com/connecta_inc" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-600 hover:bg-pink-600 hover:text-white transition-all">
                                    <Icon icon="mdi:instagram" width="20" height="20" />
                                </a>
                                <a href="https://www.tiktok.com/@connectainc" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-600 hover:bg-black hover:text-white transition-all">
                                    <Icon icon="ic:baseline-tiktok" width="20" height="20" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FD6730] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FD6730] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FD6730] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us more about your inquiry..."
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FD6730] focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full md:w-auto px-8 py-3 bg-[#FD6730] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#e05625] hover:-translate-y-0.5 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
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
