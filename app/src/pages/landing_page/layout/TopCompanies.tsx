import React from 'react';
import { Building2, ArrowUpRight } from 'lucide-react';

const TopCompanies = () => {
    // Mock logos (placeholders with text for now to keep it clean)
    const companies = ["TechFlow", "Circle", "FoxHub", "Niva", "Treva", "Opus"];

    return (
        <section className="py-20 bg-white border-b border-gray-100">
            <div className="container mx-auto px-6 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center justify-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Trusted by Industry Leaders
                </p>

                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70 hover:opacity-100 transition-opacity duration-300">
                    {companies.map((company, i) => (
                        <div key={i} className="flex items-center gap-2 group cursor-pointer">
                            <span className="text-2xl md:text-3xl font-black text-gray-300 group-hover:text-[#FD6730] transition-colors">{company}</span>
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
