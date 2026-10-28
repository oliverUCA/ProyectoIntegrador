import dolibarrClient from './dolibarrClient';

// Escapa comillas simples para usarlas dentro de sqlfilters
const escapeSql = (value) => String(value).replace(/'/g, "\\'");

const toNumber = (v, def = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

/**
 * Convierte los datos del formulario al payload que espera Dolibarr:
 * {
 *   ref, label, description,
 *   type: "0" | "1",            // 0 = producto, 1 = servicio
 *   status: "0" | "1",          // en venta
 *   status_buy: "0" | "1",      // en compra
 *   barcode, barcode_type: "1",
 *   price, price_min, price_base_type: "HT" | "TTC",
 *   tva_tx, weight, weight_units: "0"
 * }
 */
export const toDolibarrPayload = (form) => ({
  ref: form.ref?.trim(),
  label: form.label?.trim(),
  description: form.description ?? '',
  type: String(form.type ?? '0'),
  status: form.status ? '1' : '0',
  status_buy: form.status_buy ? '1' : '0',
  barcode: form.barcode?.trim() ?? '',
  barcode_type: String(form.barcode_type ?? '1'),
  price: toNumber(form.price),
  price_min: toNumber(form.price_min),
  price_base_type: form.price_base_type || 'HT',
  tva_tx: toNumber(form.tva_tx),
  weight: toNumber(form.weight),
  weight_units: String(form.weight_units ?? '0'),
});

/** Valores iniciales del formulario (producto nuevo). */
export const productoVacio = {
  ref: '',
  label: '',
  description: '',
  type: '0',
  status: true,
  status_buy: true,
  barcode: '',
  barcode_type: '1',
  price: '',
  price_min: '',
  price_base_type: 'HT',
  tva_tx: '13',
  weight: '',
  weight_units: '0',
};

/** Convierte un producto devuelto por Dolibarr al estado del formulario. */
export const fromDolibarr = (p = {}) => ({
  ref: p.ref ?? '',
  label: p.label ?? '',
  description: p.description ?? '',
  type: String(p.type ?? '0'),
  status: String(p.status) === '1',
  status_buy: String(p.status_buy) === '1',
  barcode: p.barcode ?? '',
  barcode_type: String(p.barcode_type ?? '1'),
  price: p.price != null ? toNumber(p.price).toFixed(2) : '',
  price_min: p.price_min != null ? toNumber(p.price_min).toFixed(2) : '',
  price_base_type: p.price_base_type || 'HT',
  tva_tx: p.tva_tx != null ? String(toNumber(p.tva_tx)) : '13',
  weight: p.weight != null && p.weight !== '' ? String(toNumber(p.weight)) : '',
  weight_units: String(p.weight_units ?? '0'),
});

export const ProductosDolibarrService = {
  /**
   * Lista productos con paginación y búsqueda por ref/etiqueta.
   */
  getProductos: async ({ page = 0, limit = 10, search = '', signal } = {}) => {
    const params = {
      sortfield: 't.rowid',
      sortorder: 'DESC',
      limit,
      page,
    };
    if (search.trim()) {
      const s = escapeSql(search.trim());
      params.sqlfilters = `(t.ref:like:'%${s}%') or (t.label:like:'%${s}%')`;
    }
    try {
      const { data } = await dolibarrClient.get('/products', { params, signal });
      return Array.isArray(data) ? data : data?.data ?? [];
    } catch (error) {
      // Dolibarr responde 404 cuando no hay resultados
      if (error?.response?.status === 404) return [];
      throw error;
    }
  },

  getProductoById: async (id, signal) => {
    const { data } = await dolibarrClient.get(`/products/${id}`, { signal });
    return data;
  },

  /** Crea un producto. Dolibarr devuelve el ID del nuevo registro. */
  createProducto: async (form) => {
    const { data } = await dolibarrClient.post('/products', toDolibarrPayload(form));
    return data;
  },

  updateProducto: async (id, form) => {
    const { data } = await dolibarrClient.put(`/products/${id}`, toDolibarrPayload(form));
    return data;
  },

  deleteProducto: async (id) => {
    const { data } = await dolibarrClient.delete(`/products/${id}`);
    return data;
  },

  /** Obtiene un token (API key) a partir de usuario y contraseña de Dolibarr. */
  login: async (login, password) => {
    const { data } = await dolibarrClient.post('/login', { login, password });
    return data?.success?.token;
  },
};

export default ProductosDolibarrService;
