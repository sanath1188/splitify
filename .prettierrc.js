/**
 * Prettier configuration
 * https://prettier.io/docs/en/configuration.html
 * https://github.com/kriasoft/nodejs-api-starter
 * Copyright © 2016-present Kriasoft | MIT License
 */
module.exports = {
	printWidth: 120,
	tabWidth: 2,
	useTabs: false,
	semi: true,
	singleQuote: false,
	quoteProps: "as-needed",
	trailingComma: "all",
	bracketSpacing: true,
	arrowParens: "always",
	requirePragma: false,
	proseWrap: "never",
	endOfLine: "lf",
	parser: "typescript",
	overrides: [
		{
			files: "*.css",
			options: {
				parser: "css",
			},
		},
	],
	plugins: ["prettier-plugin-tailwindcss"],
	tailwindConfig: "./tailwind.config.ts",
};
