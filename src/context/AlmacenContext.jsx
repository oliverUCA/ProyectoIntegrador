import { useEffect, useReducer, useState } from 'react';
import { AlmacenContext } from './almacenStore';
import { getApiKey } from '../services/dolibarrClient';
import { getAlmacenes } from '../services/almacenesService';

const STORAGE_KEY = 'dolibarr_warehouse_id';

const readSelectedId = () =>
  localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_DOLIBARR_WAREHOUSE_ID || '';

export function AlmacenProvider({ children }) {
  const [selectedId, setSelectedId] = useState(readSelectedId);
  const [revision, recargar] = useReducer((value) => value + 1, 0);
  const [result, setResult] = useState({ key: null, warehouses: [], error: '' });
  const apiKey = getApiKey();
  const queryKey = `${Boolean(apiKey)}:${revision}`;
  const loading = Boolean(apiKey) && result.key !== queryKey;
  const warehouses = result.key === queryKey ? result.warehouses : [];
  const error = result.key === queryKey ? result.error : '';
  const selectedWarehouse = warehouses.find((warehouse) => warehouse.id === selectedId) || null;

  useEffect(() => {
    const handleKeyChange = () => recargar();
    window.addEventListener('dolibarr-key-changed', handleKeyChange);
    window.addEventListener('storage', handleKeyChange);
    return () => {
      window.removeEventListener('dolibarr-key-changed', handleKeyChange);
      window.removeEventListener('storage', handleKeyChange);
    };
  }, []);

  useEffect(() => {
    if (!apiKey) return undefined;
    const controller = new AbortController();
    getAlmacenes({ signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult({ key: queryKey, warehouses: data, error: '' });
        setSelectedId((currentId) => data.some((warehouse) => warehouse.id === currentId)
          ? currentId
          : data[0]?.id || '');
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setResult({ key: queryKey, warehouses: [], error: requestError.response?.data?.error || requestError.message });
        }
      });
    return () => controller.abort();
  }, [apiKey, queryKey]);

  useEffect(() => {
    if (selectedId) localStorage.setItem(STORAGE_KEY, selectedId);
    else localStorage.removeItem(STORAGE_KEY);
  }, [selectedId]);

  const value = {
    warehouses,
    selectedId,
    selectedWarehouse,
    loading,
    error,
    selectWarehouse: setSelectedId,
    reloadWarehouses: recargar,
  };

  return <AlmacenContext.Provider value={value}>{children}</AlmacenContext.Provider>;
}