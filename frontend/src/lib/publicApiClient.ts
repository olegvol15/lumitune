import axios from 'axios';

const publicApiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default publicApiClient;
