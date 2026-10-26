import dolibarrClient, { DOLIBARR_BASE_URL } from './dolibarrClient';

const PAGE_SIZE = 100;
const CACHE_DURATION_MS = 30000;
const productCache = new Map();
const dolibarrRoot = DOLIBARR_BASE_URL.replace(/\/api\/index\.php\/?$/i, '');

const listFrom = (data) => (Array.isArray(data) ? data : data?.data ?? []);
const numberFrom = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getProducts = async (categoryId, signal) => {
  if (categoryId) {
    const { data: categoryObjects } = await dolibarrClient.get(`/categories/${categoryId}/objects`, {
      params: { type: 'product', limit: 1000, page: 0 },
      signal,
    });
    const categoryProductIds = new Set(listFrom(categoryObjects)
      .map((product) => String(product.id ?? product.rowid)));
    const productsWithStock = await getCachedProducts('', signal);
    return productsWithStock.filter((product) => categoryProductIds.has(String(product.id ?? product.rowid)));
  }

  const products = [];
  for (let page = 0; page < 100; page += 1) {
    const { data } = await dolibarrClient.get('/products', {
      params: { includestockdata: 1, limit: PAGE_SIZE, page, sortfield: 't.rowid', sortorder: 'ASC' },
      signal,
    });
    const rows = listFrom(data);
    products.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  return products;
};

const getCachedProducts = async (categoryId, signal) => {
  const cacheKey = `${localStorage.getItem('dolibarr_api_key') || localStorage.getItem('jwt-token') || ''}:${categoryId || 'all'}`;
  const cached = productCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.products;

  const products = await getProducts(categoryId, signal);
  if (!signal?.aborted) {
    productCache.set(cacheKey, { products, expiresAt: Date.now() + CACHE_DURATION_MS });
  }
  return products;
};

const toCatalogProduct = (product, warehouseId = '') => {
  const price = numberFrom(product.price);
  const taxRate = numberFrom(product.tva_tx);
  const priceBs = product.price_ttc != null
    ? numberFrom(product.price_ttc, price)
    : String(product.price_base_type || 'HT').toUpperCase() === 'TTC'
      ? price
      : price * (1 + taxRate / 100);
  const warehouseStock = warehouseId
    ? product.stock_warehouse?.[warehouseId]?.real
    : product.stock_reel;
  const stock = warehouseStock == null ? null : numberFrom(warehouseStock, null);
  const image = product.photo || product.image || product.image_url || product.photos?.[0];
  const imagePath = typeof image === 'string'
    ? image
    : image?.url || image?.path || image?.file || image?.filename || '';

  return {
    id: String(product.id ?? product.rowid),
    reference: product.ref || '',
    name: product.label || product.ref || 'Producto sin nombre',
    description: product.description || '',
    priceBs,
    stock,
    warehouseId,
    imagePath,
    available: stock == null ? null : stock > 0,
  };
};

export const getProductoCatalogoById = async (id, { signal, warehouseId = '' } = {}) => {
  if (!/^\d+$/.test(id)) return null;

  try {
    const { data } = await dolibarrClient.get(`/products/${id}`, {
      params: { includestockdata: 1 },
      signal,
    });
    if (String(data.type ?? '0') !== '0' || String(data.status ?? '1') !== '1') return null;
    return toCatalogProduct(data, warehouseId);
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const getImagenProducto = async (imagePath, { signal } = {}) => {
  if (!imagePath) return '';
  let imageUrl = imagePath;
  if (!/^(https?:|data:|blob:)/i.test(imagePath)) {
    imageUrl = imagePath.startsWith('/')
      ? `${dolibarrRoot}${imagePath}`
      : `${dolibarrRoot}/viewimage.php?modulepart=product&file=${encodeURIComponent(imagePath)}`;
  }
  const { data } = await dolibarrClient.get(imageUrl, { responseType: 'blob', signal });
  return URL.createObjectURL(data);
};

export const getProductosCatalogo = async ({
  categoryId = '',
  search = '',
  page = 0,
  limit = 12,
  warehouseId = '',
  signal,
} = {}) => {
  if (categoryId && !/^\d+$/.test(categoryId)) throw new Error('La categoría indicada no es válida.');

  const allProducts = await getCachedProducts(categoryId, signal);
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredProducts = allProducts
    .filter((product) => String(product.type ?? '0') === '0' && String(product.status ?? '1') === '1')
    .map((product) => toCatalogProduct(product, warehouseId))
    .filter((product) => !warehouseId || product.stock > 0)
    .filter((product) => !normalizedSearch || `${product.name} ${product.reference} ${product.description}`.toLocaleLowerCase().includes(normalizedSearch));
  const start = page * limit;

  return {
    products: filteredProducts.slice(start, start + limit),
    total: filteredProducts.length,
    page,
    limit,
  };
};