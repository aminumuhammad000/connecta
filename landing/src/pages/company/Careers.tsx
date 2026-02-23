
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { motion } from 'framer-motion';
import { Briefcase, Globe, Heart, ArrowRight, MapPin, Clock } from 'lucide-react';
import teamHero from '../../assets/about_hero_cartoon.png';

const Careers = () => {
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
                        <span className="text-[#FD6730] font-bold tracking-widest uppercase mb-4 block">Join Our Team</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Build the future of <span className="text-[#FD6730]">work</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            We're on a mission to revolutionize freelance work in Africa and beyond. Join us in building a platform that empowers real talent.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="#openings" className="bg-[#FD6730] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                                View Openings <ArrowRight size={20} />
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
                            src={teamHero}
                            alt="Connecta Team"
                            className="relative z-10 w-full rounded-2xl hover:scale-[1.02] transition-transform duration-500"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Connecta?</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            We are a remote-first, passion-driven team focused on impact and growth.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Globe,
                                title: "Remote First",
                                desc: "Work from anywhere. We care about output, not hours or location."
                            },
                            {
                                icon: Briefcase,
                                title: "Growth & Impact",
                                desc: "Work on challenges that matter and grow your career with a fast-paced startup."
                            },
                            {
                                icon: Heart,
                                title: "Wellness",
                                desc: "Specific benefits for health, learning, and comfortable home office setups."
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                {...fadeIn}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-[#FD6730] mb-6">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section id="openings" className="py-24 bg-gray-50">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">Open Positions</h2>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl border border-gray-200 p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-6">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Openings Right Now</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            We're not actively hiring at the moment, but we're always looking for great talent. Check back soon!
                        </p>
                        <a href="mailto:careers@myconnecta.ng" className="inline-flex items-center gap-2 text-[#FD6730] font-bold hover:text-orange-700 transition-colors">
                            Send us your resume <ArrowRight size={18} />
                        </a>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Careers;
