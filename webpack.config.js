const lodash = require('lodash');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

function srcPaths(src) {
	return path.join(__dirname, src);
}

const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = process.env.NODE_ENV === 'development';

// #region Common settings
const commonConfig = {
	devtool: isEnvDevelopment ? 'source-map' : false,
	mode: isEnvProduction ? 'production' : 'development',
	output: { path: srcPaths('dist') },
	node: { __dirname: false, __filename: false },
	resolve: {
		alias: {
			_: srcPaths('src'),
			_main: srcPaths('src/main'),
			_models: srcPaths('src/models'),
			_public: srcPaths('public'),
			_renderer: srcPaths('src/renderer'),
			_utils: srcPaths('src/utils'),
		},
		extensions: ['.js', '.json', '.ts', '.tsx'],
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				loader: 'ts-loader',
			},
			{
				test: /\.(scss|css)$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(jpg|png|svg|ico|icns)$/,
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]',
				},
			},
		],
	},
	node: {
		__dirname: false,
	},
};
// #endregion

const electronConfig = lodash.cloneDeep(commonConfig);
electronConfig.entry = './src/electron/electron.ts';
electronConfig.target = 'electron-main';
electronConfig.output.filename = 'electron.bundle.js';
electronConfig.plugins = [
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

					jsonContent.main = './electron.bundle.js';
					jsonContent.scripts = { start: 'electron ./electron.bundle.js' };
					jsonContent.postinstall = 'electron-builder install-app-deps';

					return JSON.stringify(jsonContent, undefined, 2);
				},
			},
		],
	}),
];

const rendererConfig = lodash.cloneDeep(commonConfig);
rendererConfig.entry = './src/renderer/renderer.tsx';
rendererConfig.target = 'electron-renderer';
rendererConfig.output.filename = 'renderer.bundle.js';
rendererConfig.plugins = [
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, './public/index.html'),
	}),
];

module.exports = [electronConfig, rendererConfig];
