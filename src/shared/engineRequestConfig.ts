import axios from 'axios';

/**
 *	Configuration for **Engine** API requests
 */
const EngineRequestConfig = axios.create({
	baseURL: 'http://localhost:8442',
});

// See https://stackoverflow.com/questions/27513994/chrome-stalls-when-making-multiple-requests-to-same-resource
EngineRequestConfig.defaults.headers.common['Cache-Control'] = 'no-cache';
export default EngineRequestConfig;
