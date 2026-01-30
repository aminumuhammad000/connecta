
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Globe, Rocket, Lightbulb, Shield } from 'lucide-react';

const About = () => {
    const stats = [
        { label: "Freelancers", value: "10K+", icon: Users },
        { label: "Countries", value: "120+", icon: Globe },
        { label: "Projects", value: "50K+", icon: Target },
        { label: "Satisfaction", value: "99%", icon: Heart },
    ];

    const values = [
        {
            icon: Shield,
            title: "Trust & Transparency",
            description: "We believe in building relationships based on honesty. No hidden fees, no ambiguous terms."
        },
        {
            icon: Rocket,
            title: "Innovation",
            description: "We are constantly pushing boundaries to make work easier, faster, and more rewarding."
        },
        {
            icon: Users,
            title: "Community First",
            description: "Our platform is built by the community, for the community. Your success is our success."
        }
    ];

    return (
        <div className="bg-white min-h-screen flex flex-col font-['Inter']">
            <Nav />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-orange-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-100/50 skew-x-12 transform origin-top-right"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[#FD6730] font-bold tracking-wider uppercase text-sm mb-4 block"
                        >
                            Our Story
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
                        >
                            We are <span className="text-[#FD6730]">redefining</span> how the world works together.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
                        >
                            Connecta is more than a platform. It's a bridge connecting global ambition with diverse talent, powered by technology and trust.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white -mt-8 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="text-center"
                            >
                                <div className="w-12 h-12 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-4">
                                    <stat.icon className="w-6 h-6 text-[#FD6730]" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Talent is equally distributed, but opportunity is not. We exist to dismantle the barriers that keep great talent from connecting with great opportunities.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                By leveraging AI matching and secure payment infrastructure, we are building a seamless ecosystem where merit is the currency and location is irrelevant.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Team collaboration"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">These are the principles that guide every decision we make.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {values.map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            <Footer />
        </div>
    );
};

export default About;
