import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus, Search, Pencil, Trash2, RefreshCw, ChevronLeft, ChevronRight,
  Package, Wrench, AlertTriangle, Loader2, Barcode, Boxes,
} from 'lucide-react';
import useProductosDolibarr from '../hooks/useProductosDolibarr';
import ProductoFormModal from '../componentes/dolibarr/ProductoFormModal';
import ProductosDolibarrService from '../services/productosDolibarrService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const LIMIT = 10;
const money = (v) =>
  Number(v || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- Modal de confirmación de borrado ---------- */
const ConfirmDeleteModal = ({ producto, onCancel, onConfirm, isSubmitting }) => {
  if (!producto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isSubmitting && onCancel()} />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="text-lg! font-bold text-slate-800">¿Eliminar producto?</h3>
        <p className="mt-1 text-sm text-slate-500">
          <b className="text-slate-700">{producto.ref}</b> — {producto.label}<br />Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex gap-2">
          <button id="btn-cancelar-eliminar" onClick={onCancel} disabled={isSubmitting}
            className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button id="btn-confirmar-eliminar" onClick={onConfirm} disabled={isSubmitting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 hover:bg-rose-700 disabled:opacity-60">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ on, children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
    on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-emerald-500' : 'bg-slate-400'}`} />{children}
  </span>
);

/* ---------- Página principal ---------- */
export const ProductosDolibarr = () => {
  const { token } = useAuth();
  const tieneToken = Boolean(token);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [texto, setTexto] = useState('');

  const {
    productos, page, setPage, buscar, loading, isSubmitting, error, recargar,
    crearProducto, actualizarProducto, eliminarProducto, hasNextPage,
  } = useProductosDolibarr({ limit: LIMIT, enabled: tieneToken });

  // Búsqueda con debounce
  useEffect(() => {
    const t = setTimeout(() => buscar(texto), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  const abrirNuevo = () => { setEditando(null); setFormOpen(true); };
  const abrirEditar = async (p) => {
    // Se obtiene el detalle completo (GET /products/{id})
    try {
      const detalle = await ProductosDolibarrService.getProductoById(p.id);
      setEditando(detalle);
    } catch {
      setEditando(p);
    }
    setFormOpen(true);
  };

  const handleSubmit = async (form) => {
    const res = editando ? await actualizarProducto(editando.id, form) : await crearProducto(form);
    if (res.ok) {
      toast.success(editando ? 'Producto actualizado' : `Producto creado (ID ${res.data})`);
      setFormOpen(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async () => {
    const res = await eliminarProducto(aEliminar.id);
    if (res.ok) { toast.success('Producto eliminado'); setAEliminar(null); }
    else toast.error(res.error);
  };

  if (!tieneToken) {
    return (
      <section className="mx-auto max-w-xl rounded-lg border border-border bg-card p-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">Inicia sesión para consultar productos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esta sección utiliza el token de tu sesión de usuario.</p>
        <Link to="/login" className="mt-5 inline-flex min-h-10 items-center rounded-md bg-hiper-navy px-4 text-sm font-medium text-white hover:bg-hiper-navy-dark">Ir a iniciar sesión</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '14px', fontSize: '14px' } }} />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-2">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full " />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className={`h-2 w-2 rounded-full ${!error ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {error ? 'Error de conexión' : 'Sesión conectada a Dolibarr'}
            </span>
            <h1 className="mt-3 text-3xl! font-extrabold tracking-tight md:text-4xl!">Gestión de Productos</h1>
            <p className="mt-1 text-sm">CRUD conectado a la API REST de Dolibarr</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button id="btn-nuevo-producto" onClick={abrirNuevo}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
              <Plus className="h-4 w-4" /> Nuevo producto
            </button>
          </div>
        </div>

       
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="buscar-producto" value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por referencia o etiqueta..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15" />
        </div>
        <button id="btn-recargar" onClick={recargar} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Recargar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">No se pudo cargar la lista</p>
            <p className="text-rose-600/80">{error}</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3 text-right">Precio</th>
                <th className="px-5 py-3 text-right">Stock</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-slate-100" /></td>
                  ))}
                </tr>
              ))}

              {!loading && productos.map((p) => {
                const servicio = String(p.type) === '1';
                return (
                  <tr key={p.id} className="group transition hover:bg-indigo-50/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          servicio ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          {servicio ? <Wrench className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{p.label}</p>
                          <p className="text-xs text-slate-400">{p.ref} · #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {p.barcode ? <span className="inline-flex items-center gap-1 font-mono text-xs"><Barcode className="h-3.5 w-3.5" />{p.barcode}</span> : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-semibold text-slate-800">{money(p.price)}</p>
                      <p className="text-xs text-slate-400">TTC {money(p.price_ttc)}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-600">
                      {servicio ? '—' : Number(p.stock_reel || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge on={String(p.status) === '1'}>Venta</Badge>
                        <Badge on={String(p.status_buy) === '1'}>Compra</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                        <button id={`btn-editar-${p.id}`} onClick={() => abrirEditar(p)} title="Editar"
                          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-100">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button id={`btn-eliminar-${p.id}`} onClick={() => setAEliminar(p)} title="Eliminar"
                          className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && !error && productos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Boxes className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-2 font-semibold text-slate-600">
                      No hay productos
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <span>Página <b className="text-slate-700">{page + 1}</b></span>
          <div className="flex gap-2">
            <button id="btn-pagina-anterior" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button id="btn-pagina-siguiente" onClick={() => setPage((p) => p + 1)} disabled={!hasNextPage || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:opacity-40">
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {formOpen && (
        <ProductoFormModal key={editando?.id ?? 'nuevo'} producto={editando} isSubmitting={isSubmitting}
          onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      )}
      <ConfirmDeleteModal producto={aEliminar} isSubmitting={isSubmitting}
        onCancel={() => setAEliminar(null)} onConfirm={handleDelete} />
    </section>
  );
};

export default ProductosDolibarr;
