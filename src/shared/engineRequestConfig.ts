import axios from 'axios';

/**
 *	Configuration for **Engine** API requests
 */
const EngineRequestConfig = axios.create({
	baseURL: 'http://localhost:8442',
});

export default EngineRequestConfig;
