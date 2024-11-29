import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
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
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			// fontFamily: {
			// 	sans: ["var(--font-sans)", ...fontFamily.sans],
			// },
			colors: {
				border: "hsl(var(--border))",
				ring: "var(--ring)",
				background: "var(--background)",
				outline: {
					border: "var(--outline-border)",
				},
				input: {
					DEFAULT: "hsl(var(--input))",
					border: "var(--input-border)",
				},
				foreground: {
					DEFAULT: "var(--foreground)",
					1: "var(--foreground-1)",
				},
				primary: {
					DEFAULT: "var(--primary)",
					foreground: "var(--primary-foreground)",
					hover: "var(--primary-hover)",
				},
				secondary: {
					DEFAULT: "var(--secondary)",
					foreground: "var(--secondary-foreground)",
					hover: "var(--secondary-hover)",
				},
				destructive: {
					DEFAULT: "var(--destructive)",
					foreground: "var(--destructive-foreground)",
					hover: "var(--destructive-hover)",
				},
				muted: {
					DEFAULT: "var(--muted)",
					foreground: "var(--muted-foreground)",
				},
				accent: {
					DEFAULT: "var(--accent)",
					foreground: "var(--accent-foreground)",
				},
				popover: {
					DEFAULT: "var(--popover)",
					foreground: "var(--popover-foreground)",
				},
				card: {
					DEFAULT: "var(--card)",
					border: "var(--card-border)",
					foreground: {
						DEFAULT: "var(--card-foreground)",
						1: "var(--card-foreground-1)",
					},
					background: {
						hover: "var(--card-background-hover)",
					},
				},
				button: {
					border: "var(--button-border)",
				},
				logo: {
					symbol: "var(--logo-symbol)",
					wordmark: "var(--logo-wordmark)",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
