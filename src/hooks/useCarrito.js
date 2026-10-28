import { useContext } from 'react';
import { CarritoContext } from '../context/carritoStore';

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider.');
  return context;
}