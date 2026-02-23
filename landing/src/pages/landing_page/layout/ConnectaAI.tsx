import React from 'react';
import { Sparkles, Zap, Target, MessageSquare } from 'lucide-react';

const ConnectaAI = () => {
    return (
        <section className="py-24 bg-gray-50 text-gray-900 relative overflow-hidden">

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-16">

                    {/* Left Visual: AI Interface Mockup */}
                    <div className="w-full lg:w-1/2">
                        <div className="relative border border-gray-200 rounded-2xl bg-white p-6 shadow-2xl shadow-gray-200/50">
                            {/* Chat Interface Mockup */}
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FD6730] to-[#FF8F6B] flex items-center justify-center text-white shadow-md shadow-orange-200">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Connecta AI</div>
                                    <div className="text-xs text-green-500 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        Online
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] text-sm text-gray-600 shadow-sm border border-gray-100">
                                    <p>How can I help you find talent today?</p>
                                </div>
                                <div className="bg-[#FD6730] text-white p-4 rounded-2xl rounded-tr-none self-end ml-auto max-w-[85%] text-sm shadow-md shadow-orange-200">
                                    <p>Find me a React Native developer with Fintech experience.</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%] text-sm text-gray-600 shadow-sm border border-gray-100">
                                    <p>I found 3 top-rated experts matching your criteria. Filtering by 'Fintech'...</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl w-full flex items-center px-4 py-3 text-gray-400 text-sm border border-gray-100">
                                <MessageSquare className="w-4 h-4 mr-3" />
                                Ask Connecta AI...
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 font-medium text-xs mb-6 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 fill-current" />
                            <span>Powered by Gemini</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            Smart Matching with <br />
                            <span className="text-[#FD6730]">Connecta AI</span>
                        </h2>
                        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                            Stop searching endlessly. Our advanced AI analyzes your project requirements and instantly matches you with the perfect talent fit, saving you hours of hiring time.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all">
                                <div className="p-3 bg-orange-50 rounded-lg text-[#FD6730]">
                                    <Zap className="w-6 h-6 fill-current" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 text-lg">Instant</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">Matching</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all">
                                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 text-lg">98%</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">Accuracy</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ConnectaAI;
