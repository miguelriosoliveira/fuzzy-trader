import axios from 'axios';

export const coinAPI = axios.create({ baseURL: 'https://rest.coinapi.io/v1' });
