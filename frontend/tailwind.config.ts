import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // KittyPaws Aesthetic - Deep Luxurious Base
        paws: {
          dark: '#0a0a1a',      // Base dark (deep navy/black)
          mauve: '#6D3A6D',      // Primary (deep purple)
          rose: '#B85C8A',       // Secondary (warm purple-pink)
          electric: '#3B82F6',   // Accent blue
          violet: '#7C3AED',     // Neon violet
          pink: '#FF69B4',       // Neon pink
          // Team Neon Accent Colors
          lq: '#00FF00',         // Lahore Qalandars - Neon Green
          kk: '#0000FF',         // Karachi Kings - Royal Blue
          iu: '#FF0000',         // Islamabad United - Hot Red
          pz: '#FFFF00',         // Peshawar Zalmi - Electric Yellow
          qg: '#800080',         // Quetta Gladiators - Deep Purple
          ms: '#008080',         // Multan Sultans - Teal Blue
          hk: '#800000',         // Hyderabad Kingsmen - Deep Maroon
          rp: '#00FFFF',         // Rawalpindi Pindiz - Neon Cyan
        },
        // WireFluid Colors
        wire: {
          dark: '#1a1a2e',       // Dark slate
          darker: '#0f0f1e',     // Darker slate
          text: {
            secondary: '#9ca3af', // Secondary text color
          },
        },
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(109, 58, 109, 0.1) 0%, rgba(184, 92, 138, 0.1) 100%)',
        'network-lines': `
          repeating-linear-gradient(0deg, 
            rgba(109, 58, 109, 0.2) 0px, 
            transparent 2px, 
            transparent 4px, 
            rgba(184, 92, 138, 0.1) 6px)`,
      },
      animation: {
        'pulse-ripple': 'pulseRipple 600ms ease-out forwards',
        'liquid-pulse': 'liquidPulse 3s ease-in-out infinite',
        'breath-glow': 'breathGlow 2s ease-in-out infinite',
        'typewriter': 'typewriter 6s steps(40, end) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'marquee': 'marquee 20s linear infinite',
        'marquee-reverse': 'marqueeReverse 20s linear infinite',
        'crown-spin': 'crownSpin 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'scroll-reveal': 'scrollReveal 1s ease-out',
      },
      keyframes: {
        pulseRipple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        liquidPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(109, 58, 109, 0.2), inset 0 0 20px rgba(184, 92, 138, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(184, 92, 138, 0.6), inset 0 0 30px rgba(109, 58, 109, 0.3)' 
          },
        },
        breathGlow: {
          '0%, 100%': { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' },
          '50%': { boxShadow: '0 12px 48px rgba(109, 58, 109, 0.3)' },
        },
        typewriter: {
          'to': { left: '100%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        crownSpin: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(360deg) scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scrollReveal: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glass-lg': '0 12px 48px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 12px 48px rgba(109, 58, 109, 0.15)',
        'mauve-glow': '0 0 30px rgba(109, 58, 109, 0.4)',
        'rose-glow': '0 0 30px rgba(184, 92, 138, 0.4)',
        'neon-lq': '0 0 20px rgba(0, 255, 0, 0.25)',
        'neon-kk': '0 0 20px rgba(0, 0, 255, 0.25)',
        'neon-iu': '0 0 20px rgba(255, 0, 0, 0.25)',
        'neon-pz': '0 0 20px rgba(255, 255, 0, 0.25)',
        'neon-qg': '0 0 20px rgba(128, 0, 128, 0.25)',
        'neon-ms': '0 0 20px rgba(0, 128, 128, 0.25)',
        'neon-hk': '0 0 20px rgba(128, 0, 0, 0.25)',
        'neon-rp': '0 0 20px rgba(0, 255, 255, 0.25)',
      },
      borderRadius: {
        'glass': '12px',
        'glass-sm': '8px',
        'glass-lg': '16px',
      },
    },
  },
  plugins: [],
};

export default config;
