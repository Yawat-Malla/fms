import { fontFamily } from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import scrollbar from 'tailwind-scrollbar';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', 'class'],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
                    ...fontFamily.sans
                ]
  		},
  		colors: {
  			dark: {
  				'100': '#E2E8F0',
  				'200': '#CBD5E1',
  				'300': '#94A3B8',
  				'400': '#64748B',
  				'500': '#475569',
  				'600': '#334155',
  				'700': '#1E293B',
  				'800': '#0F172A',
  				'900': '#020617'
  			},
  			primary: {
  				'50': '#eef2ff',
  				'100': '#e0e7ff',
  				'200': '#c7d2fe',
  				'300': '#a5b4fc',
  				'400': '#818cf8',
  				'500': '#6366f1',
  				'600': '#4f46e5',
  				'700': '#4338ca',
  				'800': '#3730a3',
  				'900': '#312e81',
  				'950': '#1e1b4b',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
  			'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
  			'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
  			ios: '0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
  		},
  		keyframes: {
  			'toast-enter': {
  				'0%': {
  					transform: 'translateY(16px) scale(0.9)',
  					opacity: 0
  				},
  				'100%': {
  					transform: 'translateY(0px) scale(1)',
  					opacity: 1
  				}
  			},
  			'bubble-out': {
  				'0%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.05)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			},
  			'slide-in': {
  				'0%': {
  					transform: 'translateX(100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: 0
  				},
  				'100%': {
  					opacity: 1
  				}
  			}
  		},
  		animation: {
  			'toast-enter': 'toast-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'bubble-out': 'bubble-out 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'slide-in': 'slide-in 0.3s ease-out',
  			'fade-in': 'fade-in 0.3s ease-out'
  		},
  		transitionTimingFunction: {
  			'ios-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    forms,
    scrollbar({ nocompatible: true }),
    plugin(function({ addVariant }) {
      addVariant('hocus', ['&:hover', '&:focus']);
    }),
      require("tailwindcss-animate")
],
};

export default config; 