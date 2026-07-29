import React from 'react';

export const DashboardHeaderArt: React.FC = () => (
  <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    {/* Dashboard grid lines */}
    <path d="M40 80 L360 80 M40 150 L360 150 M40 220 L360 220" stroke="#FD6730" strokeWidth="1" strokeDasharray="4 4" opacity="0.25"/>
    {/* Analytics nodes */}
    <circle cx="100" cy="180" r="28" stroke="#FD6730" strokeWidth="2" fill="rgba(253,103,48,0.06)"/>
    <circle cx="200" cy="110" r="38" stroke="#FD6730" strokeWidth="2" fill="rgba(253,103,48,0.08)"/>
    <circle cx="300" cy="170" r="22" stroke="#FD6730" strokeWidth="2" fill="rgba(253,103,48,0.06)"/>
    {/* Connecting trend graph line */}
    <path d="M60 200 L100 180 L150 195 L200 110 L250 145 L300 170 L340 130" stroke="#FD6730" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M330 130 L340 130 L340 140" stroke="#FD6730" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Floating mini cards */}
    <rect x="70" y="45" width="80" height="50" rx="8" stroke="#FD6730" strokeWidth="1.5" fill="rgba(255,255,255,0.7)"/>
    <path d="M82 62 L120 62 M82 74 L135 74" stroke="#FD6730" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="250" y="55" width="90" height="55" rx="8" stroke="#FD6730" strokeWidth="1.5" fill="rgba(255,255,255,0.7)"/>
    <circle cx="275" cy="82" r="12" stroke="#FD6730" strokeWidth="1.5"/>
    {/* Sparkles */}
    <path d="M200 40 L202 46 L208 48 L202 50 L200 56 L198 50 L192 48 L198 46 Z" stroke="#FD6730" strokeWidth="1.2" fill="rgba(253,103,48,0.3)"/>
  </svg>
);
