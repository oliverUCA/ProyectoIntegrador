import { useEffect, useState } from 'react';
import { RecursosContext } from './RecursosContext';
import { RecursosService } from '../services/recursosService';

/**
 * Provee el estado y las operaciones CRUD de recursos a todos sus hijos.
 * Nota: JSONPlaceholder simula las escrituras (no persisten), por eso
 * el estado local se actualiza con la respuesta de cada operación.
 */
export const RecursosProvider = ({ children }) => {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recursoAEditar, setRecursoAEditar] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  // READ (la carga inicial ya arranca con loading = true)
  useEffect(() => {
    const controller = new AbortController();
    RecursosService.getRecursos(controller.signal)
      .then((data) => {
        setRecursos(data);
        setError(null);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || 'Fallo de comunicación con el API');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  // Recarga manual (p. ej. botón "Recargar")
  const cargarRecursos = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  // CREATE
  const agregarRecurso = async (data) => {
    setIsSubmitting(true);
    try {
      const nuevo = await RecursosService.createRecurso(data);
      // JSONPlaceholder siempre devuelve id 101: generamos uno único localmente
      setRecursos((prev) => {
        const id = Math.max(0, ...prev.map((r) => r.id)) + 1;
        return [{ ...nuevo, id }, ...prev];
      });
      setError(null);
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo crear el recurso');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const modificarRecurso = async (id, data) => {
    setIsSubmitting(true);
    try {
      // Los ids > 100 solo existen localmente; JSONPlaceholder respondería 500
      const actualizado = id <= 100 ? await RecursosService.updateRecurso(id, data) : data;
      setRecursos((prev) => prev.map((r) => (r.id === id ? { ...r, ...actualizado, id } : r)));
      setRecursoAEditar(null);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el recurso');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const eliminarRecurso = async (id) => {
    setIsSubmitting(true);
    try {
      if (id <= 100) await RecursosService.deleteRecurso(id);
      setRecursos((prev) => prev.filter((r) => r.id !== id));
      if (recursoAEditar?.id === id) setRecursoAEditar(null);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el recurso');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const seleccionarRecurso = (recurso) => setRecursoAEditar(recurso);
  const cancelarEdicion = () => setRecursoAEditar(null);

  const value = {
    recursos,
    loading,
    error,
    isSubmitting,
    recursoAEditar,
    cargarRecursos,
    agregarRecurso,
    modificarRecurso,
    eliminarRecurso,
    seleccionarRecurso,
    cancelarEdicion,
  };

  return <RecursosContext.Provider value={value}>{children}</RecursosContext.Provider>;
};

export default RecursosProvider;
