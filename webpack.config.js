const { hostname } = require("os");
const { resolve, parse } = require("path");
const { readdirSync } = require("fs");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const WebpackESLintPlugin = require("eslint-webpack-plugin");
const WebpackShellPlugin = require("webpack-shell-plugin-next");
const { name, version } = require("./package.json");

module.exports = ( env, options )=>{

	const IS_DEV = options.mode === "development";

	const SOURCE_PATH = resolve(__dirname, "source");
	const TEST_PATH = resolve(__dirname, "test");
	const BUILD_PATH = resolve(__dirname, "build");

	const HOST = hostname().toLowerCase();

	const server = {
		allowedHosts: "all",
		client: {
			webSocketURL: {
				hostname: HOST
			},
			logging: "none"
		},
		compress: false,
		devMiddleware: {
			publicPath: "/",
			writeToDisk: true
		},
		historyApiFallback: true,
		host: HOST,
		hot: true,
		https: false,
		open: true,
		static: {
			directory: BUILD_PATH,
		}
	};

	const commonPlugins = [
		// new WebpackESLintPlugin()
	];

	const processes = new Array({
		mode: options.mode,
		entry: {
			index: "./source/index.js",
			test: "./test/test.js"
		},
		output: {
			path: BUILD_PATH,
			publicPath: "./build",
			filename: "[name].js",
			assetModuleFilename: "[hash][ext][query]",
			library: {
				type: "umd",
				name: "Threadizer"
			}
		},
		resolve: {
			extensions: [".js", ".json"],
			alias: {
				"~": __dirname,
				"@": SOURCE_PATH,
				"†": TEST_PATH
			},
			fallback: {
				path: require.resolve("path-browserify")
			}
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules|worker/,
					use: [
						"babel-loader"
					]
				}
			]
		},
		target: "web",
		devServer: IS_DEV ? server : undefined,
		devtool: IS_DEV ? "source-map" : false,
		optimization: {
			minimize: !IS_DEV
		},
		plugins: commonPlugins.concat([
			new WebpackShellPlugin({
				onBuildExit: {
					scripts: [`touch ${ BUILD_PATH }/.${ version }`],
					blocking: true,
					parallel: false
				}
			}),
			new HTMLWebpackPlugin({
				publicPath: "./",
				title: name,
				filename: "index.html",
				template: resolve(__dirname, "test/index.html"),
				chunks: ["test"]
			})
		])
	});

	if( IS_DEV ){

		const workers = readdirSync(resolve(TEST_PATH, "workers")).reduce(( previous, current ) => ({ ...previous, [`${ parse(current).name }.worker`]: resolve(TEST_PATH, "workers", current) }), {});

		const workerProcess = {
			mode: options.mode,
			entry: workers,
			output: {
				path: BUILD_PATH,
				publicPath: "./",
				filename: "[name].js",
				assetModuleFilename: "[hash][ext][query]"
			},
			resolve: {
				extensions: [".js", ".json"],
				alias: {
					"~": __dirname,
					"@": SOURCE_PATH,
					"†": TEST_PATH
				},
				fallback: {
					path: require.resolve("path-browserify")
				}
			},
			module: {
				rules: [
					{
						test: /\.js$/,
						exclude: /node_modules/,
						use: [
							"babel-loader"
						]
					}
				]
			},
			target: "webworker",
			devtool: "source-map",
			optimization: {
				minimize: false
			},
			plugins: commonPlugins
		};

		processes.push(workerProcess);

	}

	return processes;

};
