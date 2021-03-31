import axios from 'axios';

const instance = axios.create({
	baseURL: 'http://localhost:8442',
});

export default instance;
