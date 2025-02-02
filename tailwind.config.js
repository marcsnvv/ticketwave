/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				black: '#111111',
				white: '#F0F0F0',
				error: '#FF5858',
				background: '#020C0F',
				primary: '#06161A',
				accent: '#0C7075',
				secondary: '#0F969C',
				secondaryAccent: '#6DA5C0',

				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			backgroundImage: {
				'gradient': `
				  linear-gradient(1deg, #05161A, #05161A),
				  radial-gradient(50% 98.88% at 100% 100%, rgba(12, 112, 117, 0.25) 0%, rgba(5, 22, 26, 0) 100%),
				  linear-gradient(270deg, rgba(0, 0, 0, 0) 50%, rgba(109, 165, 192, 0.2) 100%)
				`,
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				mono: ['var(--font-mono)']
			},
			keyframes: {
				loading: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				loading: 'loading 1s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
