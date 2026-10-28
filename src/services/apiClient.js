import axios from 'axios';

// Cliente http centralizado para la aplicacion
// aqui vienen a parar las configuraciones com  base URL, tiempo maximo de espera, cabeceras

const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default apiClient;