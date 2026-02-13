import React from 'react';
import { Layout, Shield, Users, Rocket, Zap, Globe } from 'lucide-react';
import { APP_DOMAIN } from '../../../utils/constants';

const CollaboOverview = () => {
    return (
        <section className="py-24 md:py-32 bg-white text-gray-900 relative overflow-hidden">

            {/* Light gradient blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-r from-orange-50 via-white to-orange-50 blur-3xl rounded-full pointer-events-none opacity-50"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 text-[#FD6730] font-bold text-xs mb-8 uppercase tracking-wider">
                            <Rocket className="w-4 h-4" />
                            <span>Core Feature</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-extrabold leading-tight mb-8 tracking-tight text-gray-900">
                            Connecta <br />
                            <span className="text-[#FD6730]">Collabo</span>
                        </h2>
                        <p className="text-gray-500 text-lg md:text-xl mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            The world's first true workspace for freelance teams. Don't just hire—<b>collaborate, build, and ship</b> together in one unified universe.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                            {[
                                { title: "Live Workspace", icon: Layout },
                                { title: "Secure Escrow", icon: Shield },
                                { title: "Team Roles", icon: Users }
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-100 shadow-lg shadow-gray-100 p-4 rounded-xl flex flex-col items-center lg:items-start hover:border-[#FD6730] hover:shadow-orange-100 transition-all group">
                                    <div className="p-3 bg-orange-50 rounded-lg mb-3 group-hover:bg-[#FD6730] transition-colors">
                                        <item.icon className="w-6 h-6 text-[#FD6730] group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm md:text-base">{item.title}</span>
                                </div>
                            ))}
                        </div>

                        <a
                            href={APP_DOMAIN}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-4 bg-[#FD6730] text-white font-bold rounded-xl text-lg shadow-lg shadow-orange-500/20 hover:bg-[#e05625] hover:shadow-orange-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mx-auto lg:mx-0"
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            Launch Workspace
                        </a>
                    </div>

                    {/* Right Visual: Clean Light Mode Mockup */}
                    <div className="w-full lg:w-1/2 relative mt-16 lg:mt-0">
                        {/* Glow Behind Mockup */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-purple-100 blur-3xl -z-10 opacity-60"></div>

                        <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            {/* Mac-style Header */}
                            <div className="bg-gray-50 p-4 flex items-center gap-2 border-b border-gray-200">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <div className="ml-4 px-3 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-400 flex-1 text-center font-mono flex items-center justify-center gap-2">
                                    <Globe className="w-3 h-3" />
                                    connecta.app/workspace
                                </div>
                            </div>

                            {/* Workspace Body */}
                            <div className="p-6 grid grid-cols-4 gap-4 h-[300px] md:h-[400px] bg-white">
                                {/* Sidebar */}
                                <div className="col-span-1 border-r border-gray-100 pr-4 hidden sm:block">
                                    <div className="h-8 w-full bg-gray-100 rounded mb-4"></div>
                                    <div className="space-y-3">
                                        <div className="h-3 w-3/4 bg-gray-50 rounded"></div>
                                        <div className="h-3 w-1/2 bg-gray-50 rounded"></div>
                                        <div className="h-3 w-5/6 bg-gray-50 rounded"></div>
                                    </div>
                                </div>

                                {/* Main Board */}
                                <div className="col-span-4 sm:col-span-3">
                                    <div className="flex justify-between mb-6">
                                        <div className="h-8 w-1/3 bg-gray-100 rounded"></div>
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl shadow-sm">
                                            <div className="h-3 w-1/3 bg-orange-200 rounded mb-3"></div>
                                            <div className="h-2 w-full bg-orange-100 rounded"></div>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl shadow-sm">
                                            <div className="h-3 w-1/3 bg-gray-200 rounded mb-3"></div>
                                            <div className="h-2 w-full bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CollaboOverview;
