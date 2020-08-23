import axios from 'axios';

export const mainAPI = axios.create({ baseURL: 'http://localhost:3333' });
