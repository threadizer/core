const OFF = "off";
const WARNING = "warn";
const ERROR = "error";

const ALWAYS = "always";
const NEVER = "never";

const INLINE_ELEMENTS = ["a", "abbr", "audio", "b", "bdi", "bdo", "button", "canvas", "cite", "code", "data", "del", "dfn", "em", "h1", "h2", "h3", "h4", "h5", "h6", "i", "iframe", "ins", "kbd", "label", "map", "mark", "noscript", "object", "output", "p", "picture", "q", "router-link", "ruby", "s", "samp", "small", "span", "strong", "sub", "sup", "svg", "time", "u", "var", "video"];

module.exports = {
	parser: "@babel/eslint-parser",
	parserOptions: {
		parser: "babel-eslint",
		ecmaVersion: "2020",
		sourceType: "module",
		babelOptions: {
			plugins: [
				"@babel/plugin-transform-runtime",
				"@babel/plugin-syntax-class-properties",
				"@babel/plugin-proposal-optional-chaining",
				"@babel/plugin-proposal-private-methods",
				"@babel/plugin-proposal-class-properties"
			]
		}
	},
	rules: {
		semi: [WARNING, ALWAYS],
		quotes: [ERROR, "double"],
		eqeqeq: [ERROR, "always"],
		"eol-last": [WARNING, ALWAYS],
		"no-unused-vars": WARNING,
		"semi-spacing": [ERROR, {
			before: false,
			after: true
		}],
		"space-before-function-paren": [ERROR, {
			anonymous: NEVER,
			named: NEVER,
			asyncArrow: ALWAYS
		}],
		"space-before-blocks": [ERROR, {
			functions: NEVER,
			keywords: NEVER,
			classes: ALWAYS
		}],
		"object-curly-spacing": [ERROR, ALWAYS],
		"array-bracket-spacing": [OFF, NEVER],
		"keyword-spacing": [ERROR, {
			before: true,
			after: false,
			overrides: {
				import: {
					before: false,
					after: true
				},
				export: {
					before: false,
					after: true
				},
				from: {
					before: true,
					after: true
				},
				class: {
					after: true
				},
				else: {
					before: false,
					after: true
				},
				default: {
					before: false,
					after: true
				},
				return: {
					before: false,
					after: true
				},
				var: {
					before: false,
					after: true
				},
				let: {
					before: false,
					after: true
				},
				const: {
					before: false,
					after: true
				},
				try: {
					before: false,
					after: true
				},
				finally: {
					before: false,
					after: true
				},
				case: {
					before: false,
					after: true
				}
			}
		}],
		"brace-style": [ERROR, "stroustrup"],
		"use-isnan": ERROR
	}
};
