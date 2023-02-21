module.exports = {
	// Run type-check on changes to TypeScript files
	"(src)/**/*.ts?(x)": () => "npm run type-check",
	// Run ESLint on changes to JavaScript/TypeScript files
	"(src)/**/*.(ts|js)?(x)": (/** @type {string[]} */ filenames) => [
		`npx prettier --write ${filenames.join(" ")}`,
		`npx eslint --fix ${filenames.join(" ")}`
	],
	// Run Prettier on changes to CSS/JSON files
	"(src)/**/*.(css|json)": (/** @type {string[]} */ filenames) => `npx prettier --write ${filenames.join(" ")}`,
}
