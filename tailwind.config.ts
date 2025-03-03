import type { Config } from "tailwindcss"

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		screens: {
  			'2xl': '1400px'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			salYellow: 'hsl(var(--sal-yellow))',
  			salPink: 'hsl(var(--sal-pink))',
  			userIcon: 'hsl(var(--user-icon))',
  			customPurple: '#5C3B58',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
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
  			}
  		},
  		borderColor: {
  			bg: 'rgba(0, 0, 0, 0.5)'
  		},
  		borderWidth: {
  			'1.5': '1.5px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			slg: '-5px 5px 0 0 #000000',
  			smd: '-3px 3px 0 0 #000000',
  			ssm: '-2px 2px 0 0 #000000'
  		},
  		padding: {
  			'10': '2.5rem',
  			'12': '3rem',
  			'14': '3.5rem',
  			'16': '4rem',
  			'18': '4.5rem',
  			'20': '5rem'
  		},
  		margin: {
  			'10': '2.5rem',
  			'12': '3rem',
  			'14': '3.5rem',
  			'16': '4rem',
  			'18': '4.5rem',
  			'20': '5rem'
  		},
  		width: {
  			'100dvh': '100dvh',
  			'100dvw': '100dvw',
  			'2px': '2px',
  			'3px': '3px',
  			'4px': '4px',
  			'5px': '5px'
  		},
  		keyframes: {
  			'background-shine': {
  				from: {
  					backgroundPosition: '0 0'
  				},
  				to: {
  					backgroundPosition: '-200% 0'
  				}
  			},
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			'logo-cloud': {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - 4rem))'
  				}
  			},
  			orbit: {
  				'0%': {
  					transform: 'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)'
  				}
  			},
  			gradient: {
  				to: {
  					backgroundPosition: 'var(--bg-size) 0'
  				}
  			},
  			shimmer: {
  				'0%, 90%, 100%': {
  					'background-position': 'calc(-100% - var(--shimmer-width)) 0'
  				},
  				'30%, 60%': {
  					'background-position': 'calc(100% + var(--shimmer-width)) 0'
  				}
  			},
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
  			buttonheartbeat: {
  				'0%': {
  					'box-shadow': '0 0 0 0 theme("colors.blue.500")',
  					transform: 'scale(1)'
  				},
  				'50%': {
  					'box-shadow': '0 0 0 7px theme("colors.blue.500/0")',
  					transform: 'scale(1.05)'
  				},
  				'100%': {
  					'box-shadow': '0 0 0 0 theme("colors.blue.500/0")',
  					transform: 'scale(1)'
  				}
  			},
  			'caret-blink': {
  				'0%,70%,100%': {
  					opacity: '1'
  				},
  				'20%,50%': {
  					opacity: '0'
  				}
  			}
  		},
  		animation: {
  			'logo-cloud': 'logo-cloud 30s linear infinite',
  			orbit: 'orbit calc(var(--duration)*1s) linear infinite',
  			gradient: 'gradient 8s linear infinite',
  			shimmer: 'shimmer 8s infinite',
  			buttonheartbeat: 'buttonheartbeat 2s infinite ease-in-out',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
  			'background-shine': 'background-shine 2s linear infinite',
  			'caret-blink': 'caret-blink 1.25s ease-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config
