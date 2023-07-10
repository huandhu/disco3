import axios from 'axios/dist/axios.min.js';

const instance = axios.create({
    baseURL: 'https://a1.easemob.com/1117220426096226/dico',
    timeout: 3000
});

instance.interceptors.request.use((config) => {
    let token = localStorage.getItem('discoToken');
    config.headers = {
        'Content-Type': 'application/json',
    }
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config;
});
instance.interceptors.response.use((res) => {
    if (res.status !== 200) {
        return Promise.reject(res.data);
    }
    return res.data;
});

export default instance;
