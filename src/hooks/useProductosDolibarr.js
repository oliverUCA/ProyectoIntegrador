import { useCallback, useEffect, useState } from 'react';
import ProductosDolibarrService from '../services/productosDolibarrService';
import { getErrorMessage } from '../services/dolibarrClient';

/**
 * Hook que encapsula el estado y las operaciones CRUD de productos en Dolibarr.
 */
export const useProductosDolibarr = ({ limit = 10, enabled = true } = {}) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Resultado de la última petición, asociado a la "clave" de consulta que lo produjo
  const [result, setResult] = useState({ key: null, data: [], error: '' });

  const recargar = useCallback(() => setReloadKey((k) => k + 1), []);
  const queryKey = `${page}|${limit}|${search}|${reloadKey}`;

  // READ (listado)
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    ProductosDolibarrService.getProductos({ page, limit, search, signal: controller.signal })
      .then((data) => setResult({ key: queryKey, data, error: '' }))
      .catch((err) => {
        if (!controller.signal.aborted) {
          setResult({ key: queryKey, data: [], error: getErrorMessage(err) });
        }
      });
    return () => controller.abort();
  }, [page, limit, search, enabled, queryKey]);

  const loading = enabled && result.key !== queryKey;
  const productos = result.data;
  const error = result.error;

  const ejecutar = async (fn) => {
    setIsSubmitting(true);
    try {
      const res = await fn();
      recargar();
      return { ok: true, data: res };
    } catch (err) {
      return { ok: false, error: getErrorMessage(err) };
    } finally {
      setIsSubmitting(false);
    }
  };

  // CREATE
  const crearProducto = (form) => ejecutar(() => ProductosDolibarrService.createProducto(form));
  // UPDATE
  const actualizarProducto = (id, form) =>
    ejecutar(() => ProductosDolibarrService.updateProducto(id, form));
  // DELETE
  const eliminarProducto = (id) => ejecutar(() => ProductosDolibarrService.deleteProducto(id));

  const buscar = (texto) => {
    setPage(0);
    setSearch(texto);
  };

  return {
    productos,
    page,
    setPage,
    search,
    buscar,
    loading,
    isSubmitting,
    error,
    recargar,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    hasNextPage: !loading && productos.length === limit,
  };
};

export default useProductosDolibarr;
