import axios from 'axios';

export const blockchainAPI = axios.create({ baseURL: 'https://blockchain.info/' });
