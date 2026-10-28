import { useContext } from 'react';
import { RecursosContext } from '../context/RecursosContext';

/** Acceso al contexto de recursos. Debe usarse dentro de <RecursosProvider>. */
export const useRecursos = () => {
  const ctx = useContext(RecursosContext);
  if (!ctx) {
    throw new Error('useRecursos debe usarse dentro de un <RecursosProvider>');
  }
  return ctx;
};

export default useRecursos;
