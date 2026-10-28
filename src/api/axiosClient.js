import axios from 'axios';
import { DOLIBARR_BASE_URL } from '../services/dolibarrClient';

const axiosClient = axios.create({
    baseURL: DOLIBARR_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// interceptor de peticiones HTTP  , para evaluar dinamicamente cada peticion

axiosClient.interceptors.request.use(
    (config) => {
        //extraccion dinamica del to token y almacenado en local
        const token = localStorage.getItem('jwt-token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Retorno explicito de la promesa rechazada para manejar errores de peticion
        return Promise.reject(error);
    }
);


export default axiosClient;