import axios from 'axios';
import qs from 'qs';

const marketstackAPI = axios.create({
	baseURL: 'http://api.marketstack.com/v1/',
	paramsSerializer: params => qs.stringify(params, { arrayFormat: 'comma' }),
});

marketstackAPI.interceptors.request.use(config => {
	const params = {
		access_key: process.env.REACT_APP_MARKETSTACK_API_KEY,
		...config.params,
	};
	return { ...config, params };
});

export { marketstackAPI };
