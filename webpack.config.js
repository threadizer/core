const { hostname } = require("os");
const { resolve } = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const WebpackESLintPlugin = require("eslint-webpack-plugin");
const WebpackShellPlugin = require("webpack-shell-plugin-next");
const { name, version } = require("./package.json");

module.exports = ( env, options )=>{

	const IS_DEV = options.mode === "development";

	const BUILD_PATH = resolve(__dirname, "build");

	const HOST = hostname().toLowerCase();

	const server = {
		allowedHosts: "all",
		client: {
			webSocketURL: {
				hostname: HOST
			}
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

	const entries = {
		index: "./source/index.js",
		worker: "./test/worker.js"
	};

	console.log(BUILD_PATH);

	const plugins = [
		new WebpackShellPlugin({
			onBeforeBuild: {
				scripts: [`rm -rf ${ BUILD_PATH }`],
				blocking: true,
				parallel: false
			},
			onBuildExit: {
				scripts: [`touch ${ BUILD_PATH }/.${ version }`],
				blocking: true,
				parallel: false
			}
		}),
		new WebpackESLintPlugin({
			extensions: ["js"],
			exclude: ["/node_modules"]
		})
	];

	if( IS_DEV ){

		Object.assign(entries, {
			test: "./test/index.js"
		});

		plugins.push(
			new HTMLWebpackPlugin({
				publicPath: "./",
				title: name,
				filename: "index.html",
				template: resolve(__dirname, "test/index.html"),
				excludeChunks: ["index", "worker"]
			})
		);

	}

	return {
		mode: options.mode,
		entry: entries,
		output: {
			path: BUILD_PATH,
			publicPath: "./",
			filename: "[name].js",
			assetModuleFilename: "[hash][ext][query]",
			library: {
				type: "umd",
				name: name
			}
		},
		resolve: {
			extensions: [".js", ".json"],
			alias: {
				"~": resolve(__dirname, "./"),
				"@": resolve(__dirname, "./source"),
				"†": resolve(__dirname, "./test")
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
		plugins
	};
};



