import React from 'react';
import { Building2, ArrowUpRight } from 'lucide-react';

const TopCompanies = () => {
    // Mock logos using Lucide icons to simulate real brands
    const companies = [
        { name: "TechFlow", icon: <Building2 className="w-6 h-6 text-indigo-500" /> },
        { name: "Circle", icon: <ArrowUpRight className="w-6 h-6 text-emerald-500" /> },
        { name: "FoxHub", icon: <Building2 className="w-6 h-6 text-orange-500" /> },
        { name: "Niva", icon: <ArrowUpRight className="w-6 h-6 text-purple-500" /> },
        { name: "Treva", icon: <Building2 className="w-6 h-6 text-blue-500" /> },
        { name: "Opus", icon: <ArrowUpRight className="w-6 h-6 text-pink-500" /> }
    ];

    return (
        <section className="py-20 bg-white border-b border-gray-100">
            <div className="container mx-auto px-6 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10 flex items-center justify-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Trusted by Industry Leaders
                </p>

                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-80 hover:opacity-100 transition-opacity duration-300">
                    {companies.map((company, i) => (
                        <div key={i} className="flex items-center gap-2 group cursor-pointer grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105">
                            {company.icon}
                            <span className="text-2xl font-black text-gray-400 group-hover:text-gray-900 transition-colors">{company.name}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-20">
                    <div className="max-w-5xl mx-auto bg-orange-50 rounded-3xl p-12 relative overflow-hidden border border-orange-100">
                        {/* Decorative Cartoon Blobs */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FD6730]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">Hiring for your Enterprise?</h3>
                                <p className="text-gray-500 text-lg">Get matched with full teams in under 48 hours.</p>
                            </div>
                            <button className="px-8 py-4 bg-white text-[#FD6730] font-bold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center gap-2 shadow-sm border border-orange-100">
                                Contact Sales
                                <ArrowUpRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TopCompanies;
