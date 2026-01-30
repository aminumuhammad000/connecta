
import Nav from '../landing_page/layout/Nav';
import Footer from '../landing_page/layout/Footer';
import { Icon } from '@iconify/react';

const Careers = () => {
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col font-['Inter']">
            <Nav />
            {/* Hero Section */}
            <div className="bg-orange-600 text-white py-20 px-4 pt-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Join the Connecta Team</h1>
                    <p className="text-xl md:text-2xl text-orange-100 max-w-2xl mx-auto">
                        We're on a mission to revolutionize freelance work in Africa and beyond. Build the future of work with us.
                    </p>
                </div>
            </div>

            <div className="flex-grow px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full -mt-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 mb-12">

                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Connecta?</h2>
                        <p className="text-gray-500">We are a remote-first, passion-driven team.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:earth" width="24" height="24" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Remote First</h3>
                            <p className="text-sm text-gray-600">Work from anywhere. We care about output, not hours or location.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:leaf" width="24" height="24" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Growth & Impact</h3>
                            <p className="text-sm text-gray-600">Work on challenges that matter and grow your career with a fast-paced startup.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:heart-pulse" width="24" height="24" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Wellness</h3>
                            <p className="text-sm text-gray-600">Specific benefits for health, learning, and home office setups.</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Open Positions</h2>

                    <div className="space-y-4">
                        {/* Placeholder for no jobs */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                            <Icon icon="mdi:briefcase-search-outline" className="mx-auto text-gray-400 mb-4" width="48" height="48" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Openings Right Now</h3>
                            <p className="text-gray-500 mb-6">We're not actively hiring at the moment, but we're always looking for great talent. Check back soon!</p>
                            <a href="mailto:careers@myconnecta.ng" className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700">
                                Send us your resume <Icon icon="mdi:arrow-right" className="ml-1" />
                            </a>
                        </div>

                        {/* Example Job Post (Commented out) */}
                        {/* 
            <div className="group border border-gray-200 hover:border-orange-500 transition-colors rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600">Senior Frontend Engineer</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Icon icon="mdi:code-tags" /> Engineering</span>
                        <span className="flex items-center gap-1"><Icon icon="mdi:map-marker" /> Remote (Africa)</span>
                    </div>
                </div>
                <button className="mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium group-hover:bg-orange-50 group-hover:text-orange-700 transition-colors">Apply Now</button>
            </div> 
            */}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Careers;
