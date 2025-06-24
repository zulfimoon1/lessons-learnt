
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#03b5aa',
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: '#ff8522',
					foreground: '#ffffff'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Brand Colors - Override All Traditional Colors
				'brand-dark': '#023436',
				'brand-teal': '#03b5aa', 
				'brand-orange': '#ff8522',
				// Override blue to use brand teal
				blue: {
					50: '#f0fffe',
					100: '#ccfffe',
					200: '#9efffe',
					300: '#5efffd',
					400: '#18f4f8',
					500: '#03b5aa',
					600: '#03b5aa',
					700: '#023436',
					800: '#023436',
					900: '#023436',
					950: '#023436',
				},
				// Override emerald to use brand teal
				emerald: {
					50: '#f0fffe',
					100: '#ccfffe',
					200: '#9efffe',
					300: '#5efffd',
					400: '#18f4f8',
					500: '#03b5aa',
					600: '#03b5aa',
					700: '#023436',
					800: '#023436',
					900: '#023436',
					950: '#023436',
				},
				// Override purple to use brand orange
				purple: {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#ff8522',
					600: '#ff8522',
					700: '#e07420',
					800: '#c2410c',
					900: '#9a3412',
					950: '#431407',
				},
				// Override violet to use brand orange
				violet: {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#ff8522',
					600: '#ff8522',
					700: '#e07420',
					800: '#c2410c',
					900: '#9a3412',
					950: '#431407',
				},
				// Override indigo to use brand orange
				indigo: {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#ff8522',
					600: '#ff8522',
					700: '#e07420',
					800: '#c2410c',
					900: '#9a3412',
					950: '#431407',
				},
				// Override pink to use brand orange
				pink: {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#ff8522',
					600: '#ff8522',
					700: '#e07420',
					800: '#c2410c',
					900: '#9a3412',
					950: '#431407',
				},
				// Override orange to maintain consistency
				orange: {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#ff8522',
					600: '#ff8522',
					700: '#e07420',
					800: '#c2410c',
					900: '#9a3412',
					950: '#431407',
				},
				// Override slate for dark elements
				slate: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#023436',
					900: '#023436',
					950: '#023436',
				},
				// Override gray for dark elements
				gray: {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#6b7280',
					600: '#4b5563',
					700: '#374151',
					800: '#023436',
					900: '#023436',
					950: '#023436',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'brand-gradient': {
					'0%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					},
					'100%': {
						backgroundPosition: '0% 50%'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'brand-gradient': 'brand-gradient 3s ease infinite'
			},
			backgroundImage: {
				'brand-gradient': 'linear-gradient(135deg, #ff8522 0%, #03b5aa 50%, #023436 100%)',
				'brand-gradient-soft': 'linear-gradient(135deg, rgba(255,133,34,0.1) 0%, rgba(3,181,170,0.1) 100%)',
				'hero-gradient': 'linear-gradient(135deg, #023436 0%, #03b5aa 50%, #ff8522 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
