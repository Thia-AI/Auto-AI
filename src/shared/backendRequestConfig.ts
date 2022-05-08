import axios from 'axios';

/**
 *	Configuration for **Engine** API requests
 */
const BackendRequestConfig = axios.create({
	baseURL: 'http://127.0.0.1:3987',
});

// See https://stackoverflow.com/questions/27513994/chrome-stalls-when-making-multiple-requests-to-same-resource
BackendRequestConfig.defaults.headers.common['Cache-Control'] = 'no-cache';

export default BackendRequestConfig;
