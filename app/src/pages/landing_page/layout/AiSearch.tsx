import React, { useState } from 'react';
import { Sparkles, ArrowRight, MessageSquare, Mic, Loader2, Briefcase, Clock, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, APP_DOMAIN } from '../../../utils/constants';

const AiSearch = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/search?q=${encodeURIComponent(query)}&limit=4&isExternal=false`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="ai-search">

      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-orange-100/40 via-purple-50/40 to-blue-100/40 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FD6730] to-[#FF8F6B] rounded-full text-white font-bold text-sm shadow-lg shadow-orange-500/20 mb-8 max-w-fit mx-auto"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            AI-Powered Headhunter
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            Don't search. <br />Just <span className="text-[#FD6730]">tell us what you need.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto"
          >
            Describe your dream project or ideal candidate in plain English. Our AI understands context, skills, and vibe.
          </motion.p>

          {/* Enhanced Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl mx-auto group z-50"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-300 to-purple-300 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-2 flex flex-col md:flex-row items-center gap-2 border border-gray-100">

              <div className="flex-1 w-full relative">
                <MessageSquare className="absolute top-4 left-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 font-medium py-4 pl-12 pr-4 h-[60px]"
                  placeholder="e.g. I need a python dev for a trading bot..."
                />
              </div>

              <button className="hidden md:flex items-center justify-center w-12 h-12 rounded-full text-gray-400 hover:text-[#FD6730] hover:bg-orange-50 transition-colors">
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-[#FD6730] hover:bg-[#e05625] text-white rounded-[1.5rem] font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Find Match"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>

            {/* Suggested Searches */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="text-sm font-bold text-gray-400">Try asking:</span>
              {["Full Stack Dev", "Logo Design", "SEO Expert"].map((tag, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(tag); handleSearch(); }}
                  className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:border-[#FD6730] hover:text-[#FD6730] transition-colors shadow-sm"
                >
                  "{tag}"
                </button>
              ))}
            </div>
          </motion.div>

          {/* Search Results Area */}
          <AnimatePresence>
            {results !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-12 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6 px-4">
                  <h3 className="text-xl font-bold text-gray-900 text-left">
                    We found <span className="text-[#FD6730]">{results.length}</span> potential matches
                  </h3>
                  <button onClick={() => setResults(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {results.map((job, i) => (
                      <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100 hover:shadow-2xl hover:border-[#FD6730]/30 transition-all cursor-pointer group relative"
                        onClick={() => window.location.href = `${APP_DOMAIN}/job/${job._id}`}
                      >
                        <div className="absolute top-4 right-4 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md group-hover:bg-[#FD6730] group-hover:text-white transition-colors">
                          {job.budget ? `₦${job.budget.toLocaleString()}` : "Confidential"}
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 mb-2 pr-12 line-clamp-1 group-hover:text-[#FD6730] transition-colors">{job.title}</h4>
                        <div
                          className="text-gray-500 text-sm line-clamp-2 mb-4 h-10 [&>p]:inline [&>p]:m-0"
                          dangerouslySetInnerHTML={{ __html: job.description }}
                        />

                        <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeAgo(job.createdAt || job.posted)}</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.paymentType || 'Fixed'}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.locationType || 'Remote'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500">
                    No exact matches found. Try broadening your terms or <a href={`${APP_DOMAIN}/post-job`} className="text-[#FD6730] font-bold hover:underline">post a job</a> to let them come to you.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
};

export default AiSearch;
