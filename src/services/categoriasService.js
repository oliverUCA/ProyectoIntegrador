import dolibarrClient from './dolibarrClient';

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
