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
	devtool: isEnvDevelopment ? 'eval-source-map' : false,
	mode: isEnvProduction ? 'production' : 'development',
	output: { path: srcPaths('dist') },
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
		},
		extensions: ['.js', '.json', '.ts', '.tsx'],
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'swc-loader',
			},
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
				test: /\.(png|jpg|jpeg|gif|svg)$/i,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 12000,
						},
					},
				],
			},
			{
				test: /\.(ico|icns|woff(2)?|ttf|otf|eot)(\?v=\d+\.\d+\.\d+)?$/,
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

const mainConfig = lodash.cloneDeep(commonConfig);
mainConfig.entry = './src/main/main.ts';
mainConfig.target = 'electron-main';
mainConfig.output.filename = 'main.bundle.js';
mainConfig.plugins = [
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
					jsonContent.postinstall = 'npm install --legacy-peer-deps';

					return JSON.stringify(jsonContent, undefined, 2);
				},
			},
		],
	}),
];

const rendererConfig = lodash.cloneDeep(commonConfig);
rendererConfig.entry = './src/renderer/view/renderer.tsx';
rendererConfig.target = 'electron-renderer';
rendererConfig.output.filename = 'renderer.bundle.js';
rendererConfig.plugins = [
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, './public/index.html'),
	}),
];

const jobMonitorWorkerConfig = lodash.cloneDeep(commonConfig);
jobMonitorWorkerConfig.entry = './src/renderer/workers/job-monitor/worker.ts';
jobMonitorWorkerConfig.target = 'webworker';
jobMonitorWorkerConfig.output.filename = 'job-monitor-worker.bundle.js';

module.exports = [mainConfig, rendererConfig, jobMonitorWorkerConfig];
