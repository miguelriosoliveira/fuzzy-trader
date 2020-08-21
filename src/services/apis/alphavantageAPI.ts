import axios from 'axios';

const alphavantageAPI = axios.create({
	baseURL: 'https://www.alphavantage.co/query',
});

alphavantageAPI.interceptors.request.use(config => {
	const params = {
		apikey: process.env.REACT_APP_ALPHAVANTAGE_API_KEY,
		...config.params,
	};
	return { ...config, params };
});

export { alphavantageAPI };
