import axios from 'axios';

export const mainAPI = axios.create({ baseURL: process.env.REACT_APP_MAIN_API });
