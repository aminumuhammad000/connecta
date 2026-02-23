import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Upload, Briefcase, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import cvOptimizationImg from '../../../assets/cv_optimization_3d.png'; // Assuming image path

const CvOptimization = () => {
    const benefits = [
        "Tailored for specific jobs",
        "Clear, professional wording",
        "Easy to understand by employers",
        "Built for local and remote opportunities",
        "No confusing formats"
    ];

    const steps = [
        {
            id: 1,
            title: "Upload details",
            desc: "Upload or enter your current CV details",
            icon: Upload,
            color: "bg-blue-50 text-blue-600"
        },
        {
            id: 2,
            title: "Choose Job",
            desc: "Choose the type of job you want",
            icon: Briefcase,
            color: "bg-orange-50 text-[#FD6730]"
        },
        {
            id: 3,
            title: "Get Job-Ready",
            desc: "Get a clearer, job-ready CV instantly",
            icon: FileText,
            color: "bg-green-50 text-green-600"
        }
    ];

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-6">

                {/* Hero / Main Content */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">

                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:w-1/2"
                    >
                        <div className="inline-block px-4 py-2 bg-orange-50 rounded-full text-[#FD6730] font-bold text-sm mb-6 uppercase tracking-wider">
                            Second Priority Feature
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Turn Your CV Into a <br />
                            <span className="text-[#FD6730]">Job-Winning Profile</span>
                        </h2>

                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Your skills matter — but how they’re presented matters more.
                            Connecta helps you upgrade your CV to match real jobs employers are posting.
                        </p>

                        <div className="space-y-4 mb-10">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                                    <span className="text-gray-700 font-medium text-lg">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <a href="https://app.myconnecta.ng" className="inline-flex items-center justify-center px-8 py-4 bg-[#FD6730] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#e05625] hover:-translate-y-1 transition-all group">
                            Build My CV Now
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>

                    {/* Right: Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        whileInView={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:w-1/2 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/50 to-blue-50/50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
                        <img
                            src={cvOptimizationImg}
                            alt="CV Optimization"
                            className="w-full relative z-10 drop-shadow-2xl rounded-2xl hover:scale-[1.02] transition-transform duration-500"
                        />
                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow z-20">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                                <p className="font-bold text-gray-900">Optimization Complete</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* How It Works Steps */}
                <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">SIMPLE HOW IT WORKS (3 STEPS)</h3>
                        <p className="text-gray-500">Get started in minutes, not hours.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: step.id * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                            >
                                <div className={`w-14 h-14 ${step.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <step.icon size={28} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    {step.desc}
                                </p>
                                <div className="absolute top-4 right-4 text-6xl font-black text-gray-100 -z-10 group-hover:text-gray-50 transition-colors">
                                    0{step.id}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CvOptimization;
