/** @type {import("prettier").Config} */
module.exports = {
	plugins: [require.resolve("prettier-plugin-tailwindcss")],
	printWidth: 120,
	useTabs: true,
	semi: false,
	singleQuote: false,
	trailingComma: "none"
}
