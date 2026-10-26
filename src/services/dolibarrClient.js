import axios from 'axios';

// Cliente HTTP centralizado para la API REST de Dolibarr.
// La autenticación se hace con la cabecera DOLAPIKEY.
export const DOLIBARR_BASE_URL =
  import.meta.env.VITE_DOLIBARR_URL || 'https://hipermaxi.with11.dolicloud.com/api/index.php';

const STORAGE_KEY = 'dolibarr_api_key';

export const getApiKey = () =>
  localStorage.getItem(STORAGE_KEY) || localStorage.getItem('jwt-token') || '';

export const setApiKey = (key) => {
  if (key) localStorage.setItem(STORAGE_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('dolibarr-key-changed'));
};

const dolibarrClient = axios.create({
  baseURL: DOLIBARR_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Inyecta la API key en cada petición
dolibarrClient.interceptors.request.use((config) => {
  const key = getApiKey();
  if (key) config.headers.DOLAPIKEY = key;
  return config;
});

// Normaliza los mensajes de error que devuelve Dolibarr
export const getErrorMessage = (error) => {
  if (axios.isCancel(error)) return 'Petición cancelada';
  const data = error?.response?.data;
  return (
    data?.error?.message ||
    data?.message ||
    error?.message ||
    'Error desconocido al comunicarse con Dolibarr'
  );
};

export default dolibarrClient;
