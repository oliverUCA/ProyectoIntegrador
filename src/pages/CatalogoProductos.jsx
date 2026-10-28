import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Search, ShoppingCart } from 'lucide-react';
import CardSkeleton from '../Moleculas/CardSkeleton';
import ErrorMessage from '@/shimer/pulse/ErrorMessage';
import EmptyState from '@/shimer/pulse/EmptyState';
import { getProductosCatalogo } from '../services/catalogoService';
import { getCategorias, getCategoriasProducto } from '../services/categoriasService';
import { getApiKey, getErrorMessage } from '../services/dolibarrClient';
import { useCarrito } from '../hooks/useCarrito';
import { useAlmacen } from '../hooks/useAlmacen';
import ImagenProducto from '../componentes/ImagenProducto';

const PAGE_SIZE = 12;
const money = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CatalogProductos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { agregarProducto, productos: productosCarrito } = useCarrito();
  const { selectedId: warehouseId } = useAlmacen();
  const categoryId = searchParams.get('categoria') || '';
  const page = Math.max(0, Number.parseInt(searchParams.get('page') || '0', 10) || 0);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ key: null, products: [], total: 0, error: '' });
  const [categories, setCategories] = useState([]);
  const [productCategories, setProductCategories] = useState({ key: '', byProductId: {} });
  const [addedProductId, setAddedProductId] = useState('');
  const apiKey = getApiKey();
  const search = searchParams.get('buscar') || '';
  const queryKey = JSON.stringify([Boolean(apiKey), warehouseId, categoryId, search, page, revision]);
  const loading = Boolean(apiKey) && result.key !== queryKey;
  const catalog = result.key === queryKey ? result : { products: [], total: 0 };
  const error = result.key === queryKey ? result.error : '';
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const visibleProductIds = catalog.products.map((product) => product.id).join(',');
  const categoryLookupKey = search && visibleProductIds ? `${search}:${visibleProductIds}` : '';
  const foundCategoryIds = [...new Set(Object.values(productCategories.byProductId).flat().map((category) => category.id))].sort();
  const foundCategoryKey = foundCategoryIds.join(',');

  useEffect(() => {
    const handleKeyChange = () => setRevision((value) => value + 1);
    window.addEventListener('dolibarr-key-changed', handleKeyChange);
    window.addEventListener('dolibarr-stock-changed', handleKeyChange);
    window.addEventListener('storage', handleKeyChange);
    return () => {
      window.removeEventListener('dolibarr-key-changed', handleKeyChange);
      window.removeEventListener('dolibarr-stock-changed', handleKeyChange);
      window.removeEventListener('storage', handleKeyChange);
    };
  }, []);

  useEffect(() => {
    if (!apiKey) return undefined;
    const controller = new AbortController();
    getCategorias({ signal: controller.signal })
      .then(setCategories)
      .catch(() => setCategories([]));
    return () => controller.abort();
  }, [apiKey, revision]);

  useEffect(() => {
    if (!categoryLookupKey) return undefined;
    const controller = new AbortController();
    const productIds = visibleProductIds.split(',');
    Promise.all(productIds.map((id) => getCategoriasProducto(id, { signal: controller.signal }).catch(() => [])))
      .then((categoryLists) => {
        if (controller.signal.aborted) return;
        const byProductId = Object.fromEntries(productIds.map((id, index) => [id, categoryLists[index]]));
        setProductCategories({ key: categoryLookupKey, byProductId });
      });
    return () => controller.abort();
  }, [categoryLookupKey, visibleProductIds]);

  useEffect(() => {
    if (!search || productCategories.key !== categoryLookupKey) return;
    const currentIds = (searchParams.get('coincidenciasCategorias') || '').split(',').filter(Boolean).sort();
    if (currentIds.join(',') === foundCategoryKey) return;

    const nextParams = new URLSearchParams(searchParams);
    if (foundCategoryKey) nextParams.set('coincidenciasCategorias', foundCategoryKey);
    else nextParams.delete('coincidenciasCategorias');
    setSearchParams(nextParams, { replace: true });
  }, [search, categoryLookupKey, productCategories, foundCategoryKey, searchParams, setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();
    getProductosCatalogo({ categoryId, search, page, limit: PAGE_SIZE, warehouseId, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key: queryKey, ...data, error: '' });
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setResult({
            key: queryKey,
            products: [],
            total: 0,
            error: getErrorMessage(requestError),
          });
        }
      });
    return () => controller.abort();
    }, [apiKey, warehouseId, categoryId, search, page, queryKey, revision]);

  const cambiarPagina = (nextPage) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextPage > 0) nextParams.set('page', String(nextPage));
    else nextParams.delete('page');
    nextParams.delete('coincidenciasCategorias');
    setSearchParams(nextParams);
  };

  const buscarEnCatalogo = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextSearch = String(formData.get('buscar-catalogo') || '').trim();
    const nextParams = new URLSearchParams(searchParams);
    if (nextSearch) nextParams.set('buscar', nextSearch);
    else nextParams.delete('buscar');
    nextParams.delete('categoria');
    nextParams.delete('page');
    nextParams.delete('coincidenciasCategorias');
    setSearchParams(nextParams);
  };

  const handleRetry = () => setRevision((value) => value + 1);

  return (
    <section className="mx-auto max-w-7xl px-2 py-5 md:px-5" aria-busy={loading}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-hiper-orange">Tienda</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{selectedCategory?.label || 'Catálogo de productos'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{catalog.total} productos disponibles{warehouseId ? ` en el almacén seleccionado` : ' en el catálogo'}</p>
        </div>
        <form onSubmit={buscarEnCatalogo} className="relative block w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            key={search}
            type="search"
            name="buscar-catalogo"
            defaultValue={search}
            aria-label="Buscar productos en todas las categorías del almacén seleccionado"
            placeholder="Buscar por nombre o referencia"
            className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-hiper-orange"
          />
        </form>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}
      {!apiKey && (
        <div role="status" className="rounded-lg border border-border bg-card p-5 text-sm">
          <p>Conecta Dolibarr para consultar productos reales.</p>
          <Link to="/dolibarr/productos" className="mt-3 inline-flex min-h-10 items-center rounded-md bg-hiper-navy px-4 text-white hover:bg-hiper-navy-dark">Configurar conexión</Link>
        </div>
      )}
      {!loading && error && (
        <ErrorMessage errorDetail={error} onRetry={handleRetry} />
      )}
      {apiKey && !loading && !error && catalog.products.length === 0 && (
        <EmptyState message={search ? 'No hay productos que coincidan con la búsqueda.' : 'No hay productos disponibles en esta categoría.'} onAction={handleRetry} />
      )}
      {!loading && !error && catalog.products.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.products.map((product) => {
              const cantidadEnCarrito = productosCarrito.find((item) => item.id === product.id)?.cantidad || 0;
              const limiteAlcanzado = product.stock != null && cantidadEnCarrito >= product.stock;
              return (
                <article key={product.id} className="flex min-h-64 flex-col rounded-lg border border-border bg-card p-4 shadow-sm">
                <Link to={`/producto/${product.id}`} state={{ from: `${location.pathname}${location.search}` }} aria-label={`Ver detalle de ${product.name}`} className="mb-4 block rounded-md bg-muted hover:text-hiper-navy focus-visible:outline-2 focus-visible:outline-offset-2">
                  <ImagenProducto product={product} className="h-28" imageClassName="h-full w-full object-contain" />
                </Link>
                <div className="flex-1">
                  <h2 className="mt-1 text-base font-semibold text-card-foreground"><Link to={`/producto/${product.id}`} state={{ from: `${location.pathname}${location.search}` }} className="hover:underline">{product.name}</Link></h2>
                  {product.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>}
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t border-border pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Precio</p>
                    <p className="text-lg font-bold text-hiper-navy">Bs {money.format(product.priceBs)}</p>
                  </div>
                  <span className={`text-xs font-medium ${product.available ? 'text-emerald-700' : product.available === false ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {product.available ? `Disponible${product.stock != null ? ` · ${product.stock} uds.` : ''}` : product.available === false ? 'Agotado' : 'Stock no informado'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (agregarProducto(product)) setAddedProductId(product.id);
                  }}
                  disabled={product.available === false || limiteAlcanzado}
                  className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-hiper-orange px-3 text-sm font-semibold text-white hover:bg-hiper-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addedProductId === product.id ? <Check className="size-4" aria-hidden="true" /> : <ShoppingCart className="size-4" aria-hidden="true" />}
                  {limiteAlcanzado ? 'Límite alcanzado' : addedProductId === product.id ? 'Agregado' : 'Agregar al carrito'}
                </button>
                </article>
              );
            })}
          </div>
          <nav aria-label="Paginación del catálogo" className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button type="button" disabled={page === 0 || loading} onClick={() => cambiarPagina(page - 1)} className="inline-flex min-h-10 items-center gap-1 rounded-md border border-border px-3 text-sm hover:bg-accent disabled:opacity-40">
              <ChevronLeft className="size-4" aria-hidden="true" /> Anterior
            </button>
            <span className="text-sm text-muted-foreground" aria-live="polite">Página {page + 1} de {Math.max(1, Math.ceil(catalog.total / PAGE_SIZE))}</span>
            <button type="button" disabled={(page + 1) * PAGE_SIZE >= catalog.total || loading} onClick={() => cambiarPagina(page + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-md border border-border px-3 text-sm hover:bg-accent disabled:opacity-40">
              Siguiente <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </nav>
        </>
      )}
    </section>
  )
}


export default CatalogProductos;