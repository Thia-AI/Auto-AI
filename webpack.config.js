const lodash = require('lodash');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

function srcPaths(...srcs) {
	return path.join(__dirname, ...srcs);
}

const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = process.env.NODE_ENV === 'development';

// #region Common settings
const commonConfig = {
	// Uncomment 'eval-source-map' and comment out 'eval-cheap-module-source-map' when you need better source maps.
	// devtool of 'eval' has the best performance.
	// devtool: isEnvDevelopment ? 'eval-source-map' : false,
	devtool: isEnvDevelopment ? 'eval-cheap-module-source-map' : false,
	mode: isEnvProduction ? 'production' : 'development',
	output: {
		path: srcPaths('dist'),
		pathinfo: false,
	},
	node: { __dirname: false, __filename: false },
	resolve: {
		alias: {
			_: srcPaths('src'),
			_main: srcPaths(path.join('src', 'main')),
			_models: srcPaths(path.join('src', 'models')),
			_public: srcPaths('public'),
			_renderer: srcPaths(path.join('src', 'renderer')),
			_utils: srcPaths(path.join('src', 'utils')),
			_fonts: srcPaths(path.join('src', 'utils', 'fonts')),
			_state: srcPaths(path.join('src', 'renderer', 'state')),
			_view_helpers: srcPaths(path.join('src', 'renderer', 'view', 'helpers')),
			_engine_requests: srcPaths(path.join('src', 'renderer', 'engine-requests')),
			'react-dom$': 'react-dom/profiling',
		},
		extensions: ['.js', '.json', '.ts', '.tsx'],
		// modules: [srcPaths('node_modules')],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loader: 'swc-loader',
			},
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				loader: 'swc-loader',
				options: {
					jsc: {
						parser: {
							syntax: 'typescript',
							tsx: true,
						},
					},
				},
			},
			{
				test: /\.(scss|css)$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(png|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'images/[hash][ext][query]',
				},
			},
			{
				test: /\.svg$/i,
				issuer: /\.[jt]sx?$/,
				use: ['@svgr/webpack'],
			},
			{
				test: /\.(ico|icns|woff(2)?|ttf|otf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				type: 'asset/resource',
				generator: {
					filename: 'fonts/[hash][ext][query]',
				},
			},
		],
	},
	node: {
		__dirname: false,
	},
	experiments: {
		topLevelAwait: true,
	},
	plugins: [new ForkTsCheckerWebpackPlugin(), new webpack.WatchIgnorePlugin({ paths: [srcPaths('src', 'py')] })],
};
// #endregion

const mainConfig = lodash.cloneDeep(commonConfig);

mainConfig.entry = srcPaths('src', 'main', 'main.ts');
mainConfig.target = 'electron-main';
mainConfig.output.filename = 'main.bundle.js';
mainConfig.plugins.push(
	new CopyPlugin({
		patterns: [
			{
				from: 'package.json',
				to: 'package.json',
				transform: (content, _path) => {
					// eslint-disable-line no-unused-vars
					const jsonContent = JSON.parse(content);

					delete jsonContent.devDependencies;
					delete jsonContent.scripts;
					delete jsonContent.build;

					jsonContent.main = './main.bundle.js';
					jsonContent.scripts = { start: 'electron ./main.bundle.js' };
					jsonContent.postinstall = 'npm install --force';

					return JSON.stringify(jsonContent, undefined, 2);
				},
			},
			{
				from: 'package-lock.json',
				to: 'package-lock.json',
			},
		],
	}),
);
// For socket-io re-rendering
mainConfig.externals = {
	bufferutil: 'bufferutil',
	'utf-8-validate': 'utf-8-validate',
};

const rendererConfig = lodash.cloneDeep(commonConfig);

rendererConfig.entry = srcPaths('src', 'renderer', 'view', 'Renderer.tsx');
rendererConfig.target = 'electron-renderer';
rendererConfig.output.filename = 'renderer.bundle.js';
// Needed for authentication persistence. See https://github.com/firebase/firebase-js-sdk/issues/6066
rendererConfig.resolve.alias['@firebase/auth'] = path.resolve(
	__dirname,
	'node_modules/@firebase/auth/dist/esm2017/index.js',
);
rendererConfig.plugins.push(
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, './public/index.html'),
	}),
);

const hiddenRendererConfig = lodash.cloneDeep(commonConfig);

hiddenRendererConfig.entry = srcPaths('src', 'worker', 'worker.ts');
hiddenRendererConfig.target = 'electron-renderer';
hiddenRendererConfig.output.filename = 'worker.bundle.js';
hiddenRendererConfig.plugins.push(
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, 'public', 'worker.html'),
		filename: 'worker.html',
	}),
);

const appServerLoginConfig = lodash.cloneDeep(commonConfig);

appServerLoginConfig.entry = srcPaths('src', 'login-renderer', 'LoginRenderer.tsx');
appServerLoginConfig.target = 'web';
appServerLoginConfig.output.path = srcPaths('dist', 'server');
appServerLoginConfig.output.filename = 'login-renderer.bundle.js';
appServerLoginConfig.plugins.push(
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, 'public', 'server', 'login.html'),
		filename: 'login.html',
	}),
);

module.exports = [mainConfig, rendererConfig, hiddenRendererConfig, appServerLoginConfig];
