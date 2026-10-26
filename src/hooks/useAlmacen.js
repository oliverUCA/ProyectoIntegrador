import { useContext } from 'react';
import { AlmacenContext } from '../context/almacenStore';

export function useAlmacen() {
  const context = useContext(AlmacenContext);
  if (!context) throw new Error('useAlmacen debe usarse dentro de AlmacenProvider.');
  return context;
}