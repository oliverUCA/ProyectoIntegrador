import dolibarrClient from './dolibarrClient';

export const getAlmacenes = async ({ signal } = {}) => {
  const { data } = await dolibarrClient.get('/warehouses', {
    params: { limit: 100, page: 0, sortfield: 't.rowid', sortorder: 'ASC' },
    signal,
  });
  if (!Array.isArray(data)) throw new Error('Dolibarr no devolvió una lista de almacenes válida.');

  return data
    .filter((warehouse) => warehouse.status == null || String(warehouse.status) === '1')
    .map((warehouse) => ({
      id: String(warehouse.id ?? warehouse.rowid),
      label: warehouse.label || warehouse.ref || `Almacén ${warehouse.id ?? warehouse.rowid}`,
      reference: warehouse.ref || '',
    }));
};