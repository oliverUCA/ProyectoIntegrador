import dolibarrClient, { getApiKey } from './dolibarrClient';

const productCategoryCache = new Map();
const CACHE_DURATION_MS = 30000;
const listFrom = (data) => (Array.isArray(data) ? data : data?.data ?? []);

export const getCategorias = async ({ signal } = {}) => {
  const { data } = await dolibarrClient.get('/categories', {
    params: { type: 'product', sortfield: 't.label', sortorder: 'ASC', limit: 100, page: 0 },
    signal,
  });
  if (!Array.isArray(data)) throw new Error('Dolibarr no devolvió una lista de categorías válida.');
  return data.map((category) => ({
    id: String(category.id ?? category.rowid),
    label: category.label || category.ref || 'Categoría sin nombre',
  }));
};

export const getCategoriasProducto = async (productId, { signal } = {}) => {
  const cacheKey = `${getApiKey()}:${productId}`;
  const cached = productCategoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.categories;

  const { data } = await dolibarrClient.get(`/products/${productId}/categories`, { signal });
  const categories = listFrom(data).map((category) => ({
    id: String(category.id ?? category.rowid),
    label: category.label || category.ref || 'Categoría',
  }));
  if (!signal?.aborted) {
    productCategoryCache.set(cacheKey, { categories, expiresAt: Date.now() + CACHE_DURATION_MS });
  }
  return categories;
};
