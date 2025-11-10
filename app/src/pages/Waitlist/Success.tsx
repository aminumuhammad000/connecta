import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8f7f5] via-[#fff5e6] to-[#ffe4cc] dark:from-[#221910] dark:via-[#2d1f16] dark:to-[#3a2a1f]">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f27f0d]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff6b35]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f27f0d]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Success content */}
      <div 
        className={`relative z-10 max-w-2xl mx-auto px-6 text-center transition-all duration-1000 transform ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Animated checkmark */}
        <div className="mb-8 flex justify-center">
          <div className={`relative transition-all duration-700 ${showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
            <div className="w-32 h-32 bg-gradient-to-br from-[#f27f0d] to-[#ff6b35] rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
              <svg 
                className="w-20 h-20 text-white"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ 
                  strokeDasharray: 50,
                  strokeDashoffset: showContent ? 0 : 50,
                  transition: 'stroke-dashoffset 0.8s ease-in-out 0.3s'
                }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            {/* Outer ring animation */}
            <div className="absolute inset-0 w-32 h-32 border-4 border-[#f27f0d]/30 rounded-full animate-ping-slow"></div>
          </div>
        </div>

        {/* Logo */}
        <div className={`mb-6 flex justify-center transition-all duration-700 delay-300 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          <img src={logo} alt="Connecta Logo" className="h-12" />
        </div>

        {/* Success message */}
        <h1 
          className={`text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-gray-900 dark:text-white transition-all duration-700 delay-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          🎉 You're On The List!
        </h1>

        <p 
          className={`text-lg sm:text-xl text-[#666666] dark:text-gray-300 mb-4 transition-all duration-700 delay-700 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          Thank you for joining the Connecta waitlist! We're thrilled to have you on board.
        </p>

        <p 
          className={`text-base sm:text-lg text-[#666666] dark:text-gray-300 mb-8 transition-all duration-700 delay-900 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          We'll send you an exclusive early access invite to your email as soon as we launch. Get ready to experience the future of freelancing!
        </p>

        {/* Call to action */}
        <div 
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-1100 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <button
            onClick={handleBackToHome}
            className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#f27f0d] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#ff6b35] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="truncate">Back to Home</span>
          </button>

          <a
            href="https://twitter.com/connecta"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 text-base font-bold leading-normal tracking-[0.015em] hover:border-[#f27f0d] hover:text-[#f27f0d] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
            </svg>
            <span className="truncate">Follow Us</span>
          </a>
        </div>

        {/* Additional info */}
        <div 
          className={`mt-12 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-700 delay-1300 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            What happens next?
          </h3>
          <div className="flex flex-col sm:flex-row gap-6 text-left">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#f27f0d] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Check Your Email</h4>
                  <p className="text-sm text-[#666666] dark:text-gray-400">
                    We've sent a confirmation to your inbox
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#f27f0d] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Stay Tuned</h4>
                  <p className="text-sm text-[#666666] dark:text-gray-400">
                    Follow us on social media for updates
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#f27f0d] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Get Early Access</h4>
                  <p className="text-sm text-[#666666] dark:text-gray-400">
                    Be among the first to use Connecta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confetti animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      </div>

      {/* Add custom animations to index.css or inline styles */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Success;
