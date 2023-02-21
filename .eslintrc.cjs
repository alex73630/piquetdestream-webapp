/** @type {import("eslint").Linter.Config} */
module.exports = {
	overrides: [
		{
			extends: [
				"plugin:@typescript-eslint/recommended-requiring-type-checking",
				"plugin:prettier/recommended",
				"prettier"
			],
			files: ["*.ts", "*.tsx"],
			parserOptions: {
				project: "tsconfig.json"
			},
			rules: {
				"prettier/prettier": ["error", {}, { usePrettierrc: true }] // Includes .prettierrc.js rules
			}
		}
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "./tsconfig.json"
	},
	plugins: ["@typescript-eslint", "prettier"],
	extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended", "prettier"],
	rules: {
		"prettier/prettier": ["error", {}, { usePrettierrc: true }], // Includes .prettierrc.js rules
		"@typescript-eslint/consistent-type-imports": [
			"warn",
			{
				prefer: "type-imports",
				fixStyle: "inline-type-imports"
			}
		],
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{ args: "after-used", ignoreRestSiblings: true, argsIgnorePattern: "^_" }
		],
		"no-unused-vars": ["warn", { args: "after-used", ignoreRestSiblings: true, argsIgnorePattern: "^_" }]
	}
}
