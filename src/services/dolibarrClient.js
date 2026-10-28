import axios from 'axios';

// Cliente HTTP centralizado para la API REST de Dolibarr.
// La autenticación se hace con la cabecera DOLAPIKEY.
// Configuración por variables de entorno (.env.local en desarrollo,
// Project Settings → Environment Variables en Vercel).
/**
 * Vercel variables can accidentally contain a Markdown link when a URL is
 * copied from a chat or document. Axios then treats the whole value as a
 * relative path, producing requests such as /[https:/...](https:/...)/login.
 */
export const normalizeDolibarrBaseUrl = (rawValue) => {
  let value = String(rawValue || '').trim();
  const markdownUrl = value.match(/\]\((https?:\/{1,2}[^)]+)\)/i);
  const plainUrl = value.match(/https?:\/{1,2}[^\s\])]+/i);

  value = markdownUrl?.[1] || plainUrl?.[0] || value;
  value = value.replace(/^(https?):\/(?!\/)/i, '$1://');
  return value.replace(/\/+$/, '');
};

const configuredBaseUrl = normalizeDolibarrBaseUrl(
  import.meta.env.VITE_DOLIBARR_API_URL || import.meta.env.VITE_DOLIBARR_URL,
);

// vercel.json proxies this path to Dolibarr when no public URL is configured.
export const DOLIBARR_BASE_URL = configuredBaseUrl || (import.meta.env.PROD ? '/dolibarr-api' : '');

const ENV_API_KEY = import.meta.env.VITE_DOLIBARR_API_KEY || '';

if (!DOLIBARR_BASE_URL) {
  console.error('Falta la variable de entorno VITE_DOLIBARR_API_URL.');
}

const STORAGE_KEY = 'dolibarr_api_key';

export const getApiKey = () =>
  localStorage.getItem('jwt-token') ||
  localStorage.getItem(STORAGE_KEY) ||
  ENV_API_KEY ||
  '';

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
  const apiError = data?.error;
  return (
    (typeof apiError === 'string' ? apiError : apiError?.message) ||
    data?.message ||
    error?.message ||
    'Error desconocido al comunicarse con Dolibarr'
  );
};

export default dolibarrClient;
