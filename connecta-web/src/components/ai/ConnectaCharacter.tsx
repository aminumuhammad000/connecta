import React from 'react';
import { motion } from 'framer-motion';

interface ConnectaCharacterProps {
  state: 'speaking' | 'listening' | 'processing' | 'idle';
  size?: number;
}

export const ConnectaCharacter: React.FC<ConnectaCharacterProps> = ({ state, size = 180 }) => {
  // State color themes using Connecta Brand colors
  const primaryOrange = '#FD6730';
  const glowPurple = '#8B5CF6';
  const activeGreen = '#10B981';

  const isSpeaking = state === 'speaking';
  const isThinking = state === 'processing';
  const isListening = state === 'listening';

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Dynamic Background Reactive Energy Rings */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.15, 1] : isThinking ? [1, 1.08, 1] : [1, 1.03, 1],
          opacity: isSpeaking ? [0.4, 0.8, 0.4] : isThinking ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2]
        }}
        transition={{
          repeat: Infinity,
          duration: isSpeaking ? 1.2 : isThinking ? 2 : 3,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: isSpeaking
            ? `radial-gradient(circle, ${primaryOrange}80 0%, transparent 70%)`
            : isThinking
            ? `radial-gradient(circle, ${glowPurple}80 0%, transparent 70%)`
            : `radial-gradient(circle, ${activeGreen}60 0%, transparent 70%)`,
          filter: 'blur(15px)'
        }}
      />

      {/* Main Vector SVG Character Head */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 2 }}
      >
        {/* Head Base - Cute Duolingo style squircle dome */}
        <motion.rect
          x="30"
          y="30"
          width="140"
          height="140"
          rx="52"
          fill="url(#connectaHeadGrad)"
          stroke="#FFFFFF"
          strokeWidth="4"
          animate={{
            y: isSpeaking ? [0, -6, 0] : isThinking ? [0, -4, 0] : [0, -2, 0],
            rotate: isThinking ? [-3, 3, -3] : [0, 0, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: isSpeaking ? 0.8 : isThinking ? 1.6 : 3,
            ease: 'easeInOut'
          }}
        />

        {/* Head Antennas/Ears (Cute Bot Nodes) */}
        <motion.circle
          cx="24" cy="100" r="10"
          fill={primaryOrange} stroke="#FFFFFF" strokeWidth="3"
          animate={{ scale: isSpeaking ? [1, 1.2, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
        <motion.circle
          cx="176" cy="100" r="10"
          fill={primaryOrange} stroke="#FFFFFF" strokeWidth="3"
          animate={{ scale: isSpeaking ? [1, 1.2, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />

        {/* Animated Eyes */}
        <g>
          {/* Left Eye */}
          <motion.ellipse
            cx="72" cy="90" rx="12" ry="16"
            fill="#090A0F"
            animate={{
              ry: isThinking ? [16, 4, 16] : [16, 16, 2, 16]
            }}
            transition={{
              repeat: Infinity,
              duration: isThinking ? 1.5 : 4,
              times: isThinking ? [0, 0.5, 1] : [0, 0.9, 0.95, 1]
            }}
          />
          {/* Eye Catchlight Sparkle */}
          <circle cx="76" cy="84" r="5" fill="#FFFFFF" />

          {/* Right Eye */}
          <motion.ellipse
            cx="128" cy="90" rx="12" ry="16"
            fill="#090A0F"
            animate={{
              ry: isThinking ? [16, 4, 16] : [16, 16, 2, 16]
            }}
            transition={{
              repeat: Infinity,
              duration: isThinking ? 1.5 : 4,
              times: isThinking ? [0, 0.5, 1] : [0, 0.9, 0.95, 1]
            }}
          />
          {/* Eye Catchlight Sparkle */}
          <circle cx="132" cy="84" r="5" fill="#FFFFFF" />
        </g>

        {/* Dynamic Animated Mouth (Expressive based on state) */}
        {isSpeaking ? (
          /* Animated Mouth Opening for Speaking */
          <motion.path
            d="M 75 130 Q 100 160 125 130 Z"
            fill="#090A0F"
            animate={{
              d: [
                "M 75 130 Q 100 160 125 130 Z",
                "M 80 132 Q 100 145 120 132 Z",
                "M 75 130 Q 100 160 125 130 Z"
              ]
            }}
            transition={{ repeat: Infinity, duration: 0.3 }}
          />
        ) : isThinking ? (
          /* Thinking Mouth (Thoughtful Curved Line) */
          <motion.path
            d="M 85 132 Q 100 125 115 132"
            stroke="#090A0F"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          /* Happy Friendly Smile (Listening / Idle) */
          <path
            d="M 75 125 Q 100 148 125 125"
            stroke="#090A0F"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Cheeks Blush Marks */}
        <ellipse cx="60" cy="112" rx="10" ry="6" fill="rgba(253,103,48,0.3)" />
        <ellipse cx="140" cy="142" rx="10" ry="6" fill="rgba(253,103,48,0.3)" />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="connectaHeadGrad" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFF2ED" />
            <stop offset="100%" stopColor="#FFE0D3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
