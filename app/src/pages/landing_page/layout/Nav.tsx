import React, { useState, useEffect } from "react";
import logo from "../../../assets/logo.png";
import { Menu, X, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
        ? "bg-white/80 backdrop-blur-md py-4 border-gray-100 shadow-sm"
        : "bg-transparent py-6 border-transparent"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">

        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <div className="relative group cursor-pointer">
            <img src={logo} alt="Connecta Logo" className="h-12 w-auto object-contain relative z-10" />
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-500 hover:text-[#FD6730] transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FD6730] transition-all group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a href="https://app.myconnecta.ng" className="text-sm font-bold text-gray-900 hover:text-[#FD6730] transition-colors">
            Log In
          </a>
          <a
            href="https://app.myconnecta.ng"
            className="px-5 py-2.5 rounded-full bg-[#FD6730] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-[#e05625] hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            Sign Up Free
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-900 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-lg font-bold text-gray-900 hover:text-[#FD6730]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-gray-100" />
              <div className="flex flex-col gap-4 pt-2">
                <a href="https://app.myconnecta.ng" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 font-bold text-gray-600">
                  <User className="w-4 h-4" /> Log In
                </a>
                <a href="https://app.myconnecta.ng" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FD6730] text-white font-bold shadow-lg shadow-orange-500/20">
                  Sign Up Free <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Nav;
