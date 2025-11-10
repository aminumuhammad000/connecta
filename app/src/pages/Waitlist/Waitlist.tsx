import React, { useState, useEffect, useRef } from 'react';
import logo from '../../assets/logo.png';

const Waitlist: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = 50;
    const connectionDistance = 150;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 127, 13, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = index + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x;
          const dy = particles[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = (1 - distance / connectionDistance) * 0.2;
            ctx.strokeStyle = `rgba(242, 127, 13, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // You can add form submission logic here later
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f8f7f5] dark:bg-[#221910]">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.4 }}
      />
      
      <div className="layout-container flex h-full grow flex-col relative z-10">
        {/* Header Section */}
        <header className="w-full flex justify-center sticky top-0 bg-[#f8f7f5]/80 dark:bg-[#221910]/80 backdrop-blur-sm z-50">
          <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-700 py-4">
              <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                <img src={logo} alt="Connecta Logo" style={{height:"700xp"}} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 justify-center">
          <div className="flex flex-col w-full max-w-5xl">
            {/* Hero Section */}
            <section className="w-full text-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tighter text-gray-900 dark:text-white">
                  The Future of Freelancing is Here. You're Invited.
                </h1>
                <p className="text-lg sm:text-xl font-normal text-[#666666] dark:text-gray-300 max-w-2xl">
                  Join the waitlist to get early access to Connecta, the AI-powered platform that connects top talent with exciting opportunities.
                </p>
                <a
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 mt-4 bg-[#f27f0d] text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
                  href="#waitlist-form"
                >
                  <span className="truncate">Join the Waitlist</span>
                </a>
              </div>
            </section>

            {/* Video Explainer Section */}
            <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8" id="video-explainer">
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                  What is Connecta?
                </h2>
                <div className="w-full mt-6">
                  <div
                    className="relative flex items-center justify-center bg-gray-900 bg-cover bg-center aspect-video rounded-xl shadow-lg"
                    style={{
                      backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAoG1wiizxrvbktYrGqvJl0doUiqMv7Bu5tgDQElOIzDAYGMP6oDawNm6YhiZjYfpCo3oIct1deFQu0IeS9V0MDC2qtKf03hinkYO3IZjUQlP8IYMsTT73qaCsYAtRowaG1fQiZKecld2jMZXcnpdAlwBOb_7IXNujvFIAtSU317n3lwhD8J6yxOMK-fqARAqnKDqiuJmpNJqB_yV_VuxpicpVQqG1MSsaROOxoVBkaQsb7Zeb8dYS0qI3gBLANZo9NWH0bkWU5OBOe")'
                    }}
                  >
                    <button className="flex shrink-0 items-center justify-center rounded-full w-20 h-20 bg-black/50 text-white hover:bg-black/70 transition-colors">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Waitlist Form Section */}
            <section className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8" id="waitlist-form">
              <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                  Get Your Exclusive Invite
                </h2>
                <div className="w-full mt-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <form className="flex flex-col gap-6" method='POST' action='https://formspree.io/f/mkgkwdlq'>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#333333] dark:text-gray-200" htmlFor="fullName">
                        Full Name
                      </label>
                      <input
                        className="w-full h-11 px-4 rounded-lg bg-[#f8f7f5] dark:bg-[#221910] border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#f27f0d] focus:border-[#f27f0d] transition"
                        id="fullName"
                        name="fullName"
                        placeholder="Enter your full name"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-[#333333] dark:text-gray-200" htmlFor="email">
                        Email Address
                      </label>
                      <input
                        className="w-full h-11 px-4 rounded-lg bg-[#f8f7f5] dark:bg-[#221910] border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#f27f0d] focus:border-[#f27f0d] transition"
                        id="email"
                        name="email"
                        placeholder="Enter your email address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <button
                      className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 mt-2 bg-[#f27f0d] text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
                      type="submit"
                    >
                      <span className="truncate">Get Early Access</span>
                    </button>
                  </form>
                </div>
                {submitted && (
                  <p className="text-center text-sm text-[#666666] dark:text-gray-400 mt-2">
                    Thanks for joining! We'll be in touch soon.
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>

        {/* Footer Section */}
        <footer className="w-full flex justify-center mt-16 sm:mt-24">
          <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 py-6">
              <p className="text-sm text-[#666666] dark:text-gray-400">© 2024 Connecta. All rights reserved.</p>
              <div className="flex items-center gap-4">
                {/* Facebook */}
                <a 
                  className="text-[#666666] dark:text-gray-400 hover:text-[#f27f0d] dark:hover:text-[#f27f0d] transition-colors" 
                  href="https://facebook.com/connecta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a 
                  className="text-[#666666] dark:text-gray-400 hover:text-[#f27f0d] dark:hover:text-[#f27f0d] transition-colors" 
                  href="https://instagram.com/connecta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"></path>
                  </svg>
                </a>
                
                {/* Twitter/X */}
                <a 
                  className="text-[#666666] dark:text-gray-400 hover:text-[#f27f0d] dark:hover:text-[#f27f0d] transition-colors" 
                  href="https://twitter.com/connecta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                
                {/* YouTube */}
                <a 
                  className="text-[#666666] dark:text-gray-400 hover:text-[#f27f0d] dark:hover:text-[#f27f0d] transition-colors" 
                  href="https://youtube.com/@connecta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Waitlist;
