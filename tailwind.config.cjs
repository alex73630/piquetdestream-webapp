/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	safelist: [
		{
			pattern: /bg-(red|yellow|green|gray)/
		},
		{
			pattern: /col-start-[0-6]/
		}
	],
	theme: {
		extend: {}
	},
	plugins: [require("@headlessui/tailwindcss"), require("@tailwindcss/forms")]
}
