import axios, { AxiosInstance } from 'axios';

export const BACKEND_URL_DEV = 'http://127.0.0.1:3987';
export const BACKEND_URL_PROD = 'https://api.thia.tech';

const processProdConfig = () => {
	const isEnvSet = 'THIA_LOCAL_BACKEND' in process.env && Number.parseInt(process.env.THIA_LOCAL_BACKEND!, 10) === 1;
	return isEnvSet ? BACKEND_URL_DEV : BACKEND_URL_PROD;
};

export const getBackendRequestConfig = (noProcessDefined?: boolean): AxiosInstance => {
	let BackendRequestConfig: AxiosInstance;
	if (noProcessDefined) {
		BackendRequestConfig = axios.create({
			baseURL:
				process.env.NODE_ENV && process.env.NODE_ENV === 'development' ? BACKEND_URL_DEV : BACKEND_URL_PROD,
		});
	} else {
		BackendRequestConfig = axios.create({
			baseURL:
				process.env.NODE_ENV && process.env.NODE_ENV === 'development' ? BACKEND_URL_DEV : processProdConfig(),
		});
	}

	console.log(`Using Base URL: ${BackendRequestConfig.defaults.baseURL}`);
	// See https://stackoverflow.com/questions/27513994/chrome-stalls-when-making-multiple-requests-to-same-resource
	BackendRequestConfig.defaults.headers.common['Cache-Control'] = 'no-cache';
	return BackendRequestConfig;
};
