import axios from 'axios';

const marketstackAPI = axios.create({
	baseURL: 'http://api.marketstack.com/v1/',
	params: { access_key: process.env.REACT_APP_MARKETSTACK_API_KEY },
});

marketstackAPI.interceptors.request.use(config => {
	const params = {
		access_key: process.env.REACT_APP_MARKETSTACK_API_KEY,
		...config.params,
	};
	return { ...config, params };
});

export default marketstackAPI;
