
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { motion } from 'framer-motion';
import { Download, Smartphone, Apple, ArrowRight, Star, Shield, Zap } from 'lucide-react';
import downloadHero from '../../assets/download_hero_cartoon.png';
import appMockup from '../../assets/connectAPP.png';

const DownloadApp = () => {
    const apkLink = "https://expo.dev/artifacts/eas/pPCfm8hHyBmVTkekp48Y7s.apk";

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
                        <span className="text-[#FD6730] font-bold tracking-widest uppercase mb-4 block">Connecta Mobile</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Your <span className="text-[#FD6730]">Career</span> in your pocket.
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            Experience the full power of Connecta on the go. Get real-time notifications, manage your collaborations, and never miss a matching opportunity.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href={apkLink}
                                className="bg-[#FD6730] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                <Download size={22} /> Download for Android
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
                            src={downloadHero}
                            alt="People using Connecta app"
                            className="relative z-10 w-full rounded-2xl hover:scale-[1.02] transition-transform duration-500"
                        />
                    </motion.div>
                </div>
            </section>

            {/* App Showcase Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            {...fadeIn}
                            className="relative flex justify-center"
                        >
                            {/* Cartoon Phone Frame Effect */}
                            <div className="relative z-20 w-[280px] md:w-[320px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800">
                                <img
                                    src={appMockup}
                                    alt="Connecta App Screen"
                                    className="rounded-[2rem] w-full"
                                />
                            </div>
                            {/* Decorative background elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-100 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
                        </motion.div>

                        <div className="space-y-12">
                            <motion.div {...fadeIn}>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6 font-primary">Designed for the modern professional</h2>
                                <p className="text-lg text-gray-600">
                                    Whether you are a freelancer looking for your next gig or a business managing sensitive projects, our app provides the speed and trust you need.
                                </p>
                            </motion.div>

                            <div className="grid gap-8">
                                {[
                                    { icon: Zap, title: "Instant Notifications", desc: "Get alerted immediately when jobs match your skills or clients send messages." },
                                    { icon: Shield, title: "Secure Transactions", desc: "Manage your payments safely with our encrypted platform safeguards." },
                                    { icon: Star, title: "Premium Experience", desc: "Enjoy a smooth, intuitive interface tailored for the mobile user." }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        {...fadeIn}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-4"
                                    >
                                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-[#FD6730]">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                                            <p className="text-gray-600">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Store Links Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <motion.div {...fadeIn}>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Available Everywhere Soon</h2>
                        <p className="text-lg text-gray-600 mb-12">
                            We are currently in a limited release on Android. Stay tuned for our official Play Store and App Store launches.
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-6">
                        {/* Android Download (Active) */}
                        <a
                            href={apkLink}
                            className="flex items-center gap-4 bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-black transition-all transform hover:-translate-y-1 shadow-xl"
                        >
                            <Smartphone size={32} />
                            <div className="text-left">
                                <div className="text-xs opacity-70">Download for</div>
                                <div className="text-xl font-bold font-primary">Android (.apk)</div>
                            </div>
                        </a>

                        {/* Coming Soon Stores */}
                        {[
                            { icon: Smartphone, label: "Google Play", sub: "Coming Soon" },
                            { icon: Apple, label: "App Store", sub: "Coming Soon" }
                        ].map((store, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 bg-white border border-gray-200 text-gray-400 px-8 py-4 rounded-2xl cursor-not-allowed opacity-70 grayscale shadow-sm"
                            >
                                <store.icon size={32} />
                                <div className="text-left">
                                    <div className="text-xs opacity-70">{store.sub}</div>
                                    <div className="text-xl font-bold font-primary">{store.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Emotional Footer CTA */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        {...fadeIn}
                        className="bg-orange-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden"
                    >
                        {/* Decorative circle */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

                        <h2 className="text-3xl md:text-5xl font-extrabold mb-8 relative z-10 leading-tight">
                            Real Talent. Real Work. <br /> Now on the move.
                        </h2>
                        <p className="text-xl text-orange-100 mb-12 max-w-2xl mx-auto relative z-10">
                            Join thousands of Nigerians building the future of work. Download the Connecta mobile experience today.
                        </p>
                        <a
                            href={apkLink}
                            className="inline-flex items-center gap-2 bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all transform hover:scale-105 shadow-2xl shadow-black/20"
                        >
                            Get Started <ArrowRight size={20} />
                        </a>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default DownloadApp;
