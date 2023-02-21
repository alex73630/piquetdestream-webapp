/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	safelist: [
		{
			pattern: /bg-(red|yellow|green|gray)/
		}
	],
	theme: {
		extend: {}
	},
	plugins: []
}
