import axios from 'axios';

const api = axios.create({
    baseURL: 'http://api.halboldi.uz', // Or '/api' for proxy
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
