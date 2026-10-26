import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ImageOff, Loader2, Package, ShoppingCart } from 'lucide-react';
import { getApiKey } from '../services/dolibarrClient';
import { getImagenProducto, getProductoCatalogoById } from '../services/catalogoService';
import { useCarrito } from '../hooks/useCarrito';
import { useAlmacen } from '../hooks/useAlmacen';

const money = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { agregarProducto, productos: productosCarrito } = useCarrito();
  const { selectedId: warehouseId } = useAlmacen();
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ key: null, product: null, error: '' });
  const [imageResult, setImageResult] = useState({ key: null, url: '' });
  const [agregado, setAgregado] = useState(false);
  const apiKey = getApiKey();
  const validId = /^\d+$/.test(id || '');
  const queryKey = `${Boolean(apiKey)}:${warehouseId}:${id}:${revision}`;
  const loading = Boolean(apiKey) && validId && result.key !== queryKey;
  const product = result.key === queryKey ? result.product : null;
  const cantidadEnCarrito = product ? productosCarrito.find((item) => item.id === product.id)?.cantidad || 0 : 0;
  const limiteAlcanzado = product?.stock != null && cantidadEnCarrito >= product.stock;
  const error = result.key === queryKey ? result.error : '';
  const imageUrl = imageResult.key === `${queryKey}:${product?.imagePath}` ? imageResult.url : '';
  const returnTo = location.state?.from || '/productos';

  useEffect(() => {
    const handleKeyChange = () => setRevision((value) => value + 1);
    window.addEventListener('dolibarr-key-changed', handleKeyChange);
    window.addEventListener('storage', handleKeyChange);
    return () => {
      window.removeEventListener('dolibarr-key-changed', handleKeyChange);
      window.removeEventListener('storage', handleKeyChange);
    };
  }, []);

  useEffect(() => {
    if (!apiKey || !validId) return undefined;
    const controller = new AbortController();
    getProductoCatalogoById(id, { signal: controller.signal, warehouseId })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key: queryKey, product: data, error: '' });
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setResult({ key: queryKey, product: null, error: requestError.response?.data?.error || requestError.message });
        }
      });
    return () => controller.abort();
  }, [apiKey, warehouseId, id, queryKey, revision, validId]);

  useEffect(() => {
    if (!product?.imagePath) return undefined;
    const controller = new AbortController();
    let objectUrl = '';
    const imageKey = `${queryKey}:${product.imagePath}`;
    getImagenProducto(product.imagePath, { signal: controller.signal })
      .then((url) => {
        objectUrl = url;
        if (!controller.signal.aborted) setImageResult({ key: imageKey, url });
        else URL.revokeObjectURL(url);
      })
      .catch(() => {
        if (!controller.signal.aborted) setImageResult({ key: imageKey, url: '' });
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [product, queryKey]);

  const volver = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(returnTo);
  };

  if (!apiKey) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">Conecta Dolibarr</h1>
        <p className="mt-2 text-muted-foreground">Necesitas configurar la conexión para consultar este producto.</p>
        <Link to="/dolibarr/productos" className="mt-5 inline-flex min-h-10 items-center rounded-md bg-hiper-navy px-4 text-white hover:bg-hiper-navy-dark">Configurar conexión</Link>
      </section>
    );
  }

  if (loading) {
    return <div role="status" className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground"><Loader2 className="size-5 animate-spin" />Cargando producto…</div>;
  }

  if (error) {
    return (
      <section role="alert" className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">No se pudo cargar el producto</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={() => setRevision((value) => value + 1)} className="inline-flex min-h-10 items-center rounded-md bg-hiper-navy px-4 text-white hover:bg-hiper-navy-dark">Reintentar</button>
          <button type="button" onClick={volver} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-4 text-sm hover:bg-accent">
            <ArrowLeft className="size-4" aria-hidden="true" /> Volver al catálogo
          </button>
        </div>
      </section>
    );
  }

  if (!validId || !product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
        <p className="mt-2 text-muted-foreground">{error || `No existe un producto activo con el ID ${id}.`}</p>
        <button type="button" onClick={volver} className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-4 text-sm hover:bg-accent">
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver al catálogo
        </button>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <button type="button" onClick={volver} className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Volver al catálogo
      </button>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="max-h-112 w-full object-contain" onError={() => setImageResult({ key: `${queryKey}:${product.imagePath}`, url: '' })} />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground" aria-label="Imagen no disponible">
              {product.imagePath ? <ImageOff className="size-10" aria-hidden="true" /> : <Package className="size-10" aria-hidden="true" />}
              <span className="text-sm">Imagen no disponible</span>
            </div>
          )}
        </div>
        <div className="py-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-hiper-orange">Producto</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{product.name}</h1>
          {product.reference && <p className="mt-2 text-sm text-muted-foreground">Referencia: {product.reference}</p>}
          <p className="mt-5 whitespace-pre-line text-sm leading-6 text-muted-foreground">{product.description || 'Este producto no tiene descripción.'}</p>
          <div className="mt-7 border-t border-border pt-5">
            <p className="text-sm text-muted-foreground">Precio</p>
            <p className="mt-1 text-2xl font-bold text-hiper-navy">Bs {money.format(product.priceBs)}</p>
          </div>
          <div className="mt-5 rounded-md bg-muted/70 p-4">
            <p className="text-sm font-semibold">Disponibilidad</p>
            <p className={`mt-1 text-sm ${product.available ? 'text-emerald-700' : product.available === false ? 'text-destructive' : 'text-muted-foreground'}`}>
              {product.available ? `Disponible${product.stock != null ? ` · ${product.stock} unidades` : ''}` : product.available === false ? 'Agotado' : 'Stock no informado'}
            </p>
            {product.warehouseId && <p className="mt-1 text-xs text-muted-foreground">Almacén configurado: {product.warehouseId}</p>}
          </div>
          <button
            type="button"
            onClick={() => setAgregado(agregarProducto({ ...product, imageUrl }))}
            disabled={product.available === false || limiteAlcanzado}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-hiper-orange px-4 text-sm font-semibold text-white hover:bg-hiper-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {agregado ? <Check className="size-4" aria-hidden="true" /> : <ShoppingCart className="size-4" aria-hidden="true" />}
            {limiteAlcanzado ? 'Límite de stock alcanzado' : agregado ? 'Agregado al carrito' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductDetail;