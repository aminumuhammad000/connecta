
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Star, Clock, MessageSquare, ShieldCheck, TrendingUp, Users } from 'lucide-react';

// Import Assets
import howHero from '../../assets/how_hero.png';
import howFreelancer from '../../assets/how_freelancer.png';
import howBusiness from '../../assets/how_business.png';
import howPhilosophy from '../../assets/how_philosophy.png';

const HowItWorks = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.6 }
    };

    const freelancerSteps = [
        {
            title: "Create Your Profile",
            description: "Sign up and set up a clear profile that highlights your skills, experience, availability, and work preferences. A complete and honest profile helps businesses trust you faster.",
            icon: Users
        },
        {
            title: "Discover Real Opportunities",
            description: "Browse available jobs and opportunities posted by businesses and individuals looking for digital talent. No fake listings. No unnecessary noise.",
            icon: Star
        },
        {
            title: "Apply & Communicate Clearly",
            description: "Apply for roles that match your skills and communicate directly with clients to clarify expectations, agree on scope, and confirm terms before work begins.",
            icon: MessageSquare
        },
        {
            title: "Deliver Quality Work",
            description: "Once terms are agreed, focus on delivering your best work professionally and on time. Strong delivery builds reputation and long-term opportunities.",
            icon: Clock
        },
        {
            title: "Grow Your Credibility",
            description: "As you complete work and receive feedback, your profile credibility improves — helping you attract better opportunities over time.",
            icon: TrendingUp
        }
    ];

    const businessSteps = [
        {
            title: "Sign Up & Post a Job",
            description: "Create an account and post details about the project scope, required skills, and timeline. Clear job descriptions attract the right talent.",
            icon: ArrowRight
        },
        {
            title: "Review Talent Profiles",
            description: "Browse freelancer profiles, review skills and experience, and choose professionals that fit your needs. Take your time — quality matters.",
            icon: Users
        },
        {
            title: "Communicate & Agree",
            description: "Discuss expectations, deliverables, and timelines clearly before starting work. Strong agreements lead to better outcomes.",
            icon: MessageSquare
        },
        {
            title: "Work With Confidence",
            description: "Collaborate with freelancers in a structured environment designed to encourage professionalism and accountability.",
            icon: ShieldCheck
        },
        {
            title: "Build Long-Term Relationships",
            description: "Many businesses use Connecta not just for one-off jobs, but to find reliable talent they can work with repeatedly.",
            icon: Star
        }
    ];

    return (
        <div className="bg-white min-h-screen flex flex-col font-['Inter'] overflow-x-hidden">
            <Nav />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-orange-50 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                            How <span className="text-[#FD6730]">Connecta</span> Works
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            Connecta is designed to make finding real digital work and trusted talent simple, transparent, and reliable.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="https://app.myconnecta.ng" target="_blank" rel="noopener noreferrer" className="bg-[#FD6730] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-colors inline-block text-center">
                                I'm a Freelancer
                            </a>
                            <a href="https://app.myconnecta.ng" target="_blank" rel="noopener noreferrer" className="bg-white text-[#FD6730] border-2 border-[#FD6730] px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition-colors inline-block text-center">
                                I'm a Business
                            </a>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* Circle Background */}
                        <div className="absolute inset-0 bg-[#FD6730]/10 rounded-full blur-3xl transform scale-90"></div>
                        <img
                            src={howHero}
                            alt="Connecta Ecosystem"
                            fetchPriority="high"
                            className="relative z-10 w-full rounded-2xl shadow-none" /* shadow-none for cleaner look with 3D */
                        />
                    </motion.div>
                </div>
            </section>

            {/* For Freelancers */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <span className="text-[#FD6730] font-bold tracking-widest uppercase text-sm mb-2 block">For Talent</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Freelancer Journey</h2>
                        <div className="w-16 h-1 bg-[#FD6730] mx-auto rounded-full mt-4"></div>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <img
                                src={howFreelancer}
                                alt="Freelancer Working"
                                loading="lazy"
                                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl hover:rotate-1 transition-transform duration-500"
                            />
                        </motion.div>

                        <div className="space-y-8 order-1 lg:order-2">
                            {freelancerSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#FD6730] font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* For Businesses */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <motion.div {...fadeIn} className="text-center mb-16">
                        <span className="text-[#FD6730] font-bold tracking-widest uppercase text-sm mb-2 block">For Clients</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Business Journey</h2>
                        <div className="w-16 h-1 bg-[#FD6730] mx-auto rounded-full mt-4"></div>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            {businessSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <img
                                src={howBusiness}
                                alt="Business Hiring"
                                loading="lazy"
                                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl hover:-rotate-1 transition-transform duration-500"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="bg-[#FD6730] rounded-3xl p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
                        {/* Circle Backgrounds */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                            <motion.div {...fadeIn}>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Philosophy</h2>
                                <p className="text-xl text-white/90 font-medium mb-6">
                                    Trust grows when expectations are clear and people are accountable.
                                </p>
                                <p className="text-lg text-white/80 leading-relaxed mb-6">
                                    Instead of chasing volume, we prioritize quality and trust. We focus on real users, genuine work, and sustainable growth.
                                </p>
                                <ul className="space-y-3">
                                    {["Real Users", "Genuine Work", "Gradual Growth"].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 font-semibold">
                                            <div className="bg-white/20 p-1 rounded-full"><CheckCircle size={16} /></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="flex justify-center"
                            >
                                <img
                                    src={howPhilosophy}
                                    alt="Growth Philosophy"
                                    loading="lazy"
                                    className="rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500 max-w-xs md:max-w-sm"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Early Access & Help */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <motion.div
                            {...fadeIn}
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Star className="text-[#FD6730]" /> Early Access Note
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Connecta is currently in early access. This means some features are still improving, and we are onboarding users gradually.
                            </p>
                            <p className="text-gray-600 font-medium">
                                Feedback directly shapes the platform. We appreciate your patience as we build responsibly.
                            </p>
                        </motion.div>

                        <motion.div
                            {...fadeIn}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="text-blue-500" /> Need Help?
                            </h3>
                            <p className="text-gray-600 mb-4">
                                If you have questions or run into issues, our team is available to listen and help.
                            </p>
                            <p className="text-gray-600 font-medium">
                                We believe good platforms stay close to their users.
                            </p>
                        </motion.div>
                    </div>

                    <div className="text-center mt-16">
                        <p className="text-2xl font-bold text-gray-900">Connecta — Real Talent. Real Work.</p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HowItWorks;
