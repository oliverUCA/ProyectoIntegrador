import { useEffect, useReducer, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Folder, Loader2, RefreshCw } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { getApiKey } from '../services/dolibarrClient';
import { getCategorias } from '../services/categoriasService';

export default function Categorias({ variant = 'sidebar' }) {
  const horizontal = variant === 'horizontal';
  const [searchParams, setSearchParams] = useSearchParams();
  const [revision, recargar] = useReducer((value) => value + 1, 0);
  const [result, setResult] = useState({ key: null, categorias: [], error: '' });
  const apiKey = getApiKey();
  const selectedCategory = searchParams.get('categoria') || '';
  const queryKey = `${Boolean(apiKey)}:${revision}`;
  const loading = Boolean(apiKey) && result.key !== queryKey;
  const categorias = result.key === queryKey ? result.categorias : [];
  const error = result.key === queryKey ? result.error : '';

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

    getCategorias({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult({ key: queryKey, categorias: data, error: '' });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setResult({ key: queryKey, categorias: [], error: err.response?.data?.error || err.message });
        }
      });

    return () => controller.abort();
  }, [apiKey, queryKey]);

  const seleccionarCategoria = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (categoryId) nextParams.set('categoria', categoryId);
    else nextParams.delete('categoria');
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  return (
    <section aria-labelledby="categorias-heading" aria-busy={loading}>
      <h2 id="categorias-heading" className={horizontal ? 'sr-only' : 'mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:px-3 md:text-left md:text-xs'}>
        Categorías
      </h2>

      {!apiKey && (
        <Link to="/dolibarr/productos" className={`block px-1 py-3 text-center text-xs hover:text-hiper-orange md:px-3 md:text-left ${horizontal ? 'text-white' : 'text-muted-foreground'}`}>
          Conecta Dolibarr para ver categorías.
        </Link>
      )}

      {loading && (
        <div role="status" className={`flex items-center justify-center gap-2 px-2 py-3 text-xs md:justify-start ${horizontal ? 'text-white' : 'text-muted-foreground'}`}>
          <Loader2 className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span className="sr-only md:not-sr-only">Cargando categorías…</span>
        </div>
      )}

      {error && (
        <div role="alert" className={`rounded-xl p-2 text-xs md:p-3 ${horizontal ? 'bg-white text-destructive' : 'bg-destructive/10 text-destructive'}`}>
          <p className="wrap-break-word" title={error}>No se pudieron cargar las categorías.</p>
          <p className="mt-1 hidden wrap-break-word md:block">{error}</p>
          <button type="button" onClick={recargar} title="Reintentar carga de categorías" className="mt-2 flex min-h-9 items-center gap-1 rounded-md underline focus-visible:outline-2 focus-visible:outline-offset-2">
            <RefreshCw className="size-3 shrink-0" aria-hidden="true" />
            <span className="sr-only md:not-sr-only">Reintentar</span>
          </button>
        </div>
      )}

      {apiKey && !loading && !error && categorias.length === 0 && (
        <p role="status" className="px-1 py-3 text-center text-xs text-muted-foreground md:px-3 md:text-left">No hay categorías disponibles.</p>
      )}

      {horizontal ? (
        <Carousel opts={{ align: 'start', dragFree: true }} className="px-10">
          <CarouselContent className="-ml-2 py-2">
            {categorias.map((categoria) => (
              <CarouselItem key={categoria.id} className="pl-2">
                <button
                  type="button"
                  aria-pressed={selectedCategory === categoria.id}
                  onClick={() => seleccionarCategoria(selectedCategory === categoria.id ? '' : categoria.id)}
                  title={categoria.label}
                  className={`flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${selectedCategory === categoria.id ? 'bg-white text-orange-700' : 'text-white hover:bg-white/15'}`}
                >
                  <span>{categoria.label}</span>
                  {selectedCategory === categoria.id && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {categorias.map((categoria) => (
            <li key={categoria.id}>
              <button
                type="button"
                aria-pressed={selectedCategory === categoria.id}
                onClick={() => seleccionarCategoria(selectedCategory === categoria.id ? '' : categoria.id)}
                title={categoria.label}
                className={`flex min-h-11 w-full items-center justify-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:justify-start md:px-3 ${selectedCategory === categoria.id ? 'bg-hiper-navy text-white' : 'bg-background/60 text-sidebar-foreground hover:bg-hiper-orange-light'}`}
              >
                <Folder className="size-4 shrink-0 text-hiper-orange" aria-hidden="true" />
                <span className="sr-only wrap-break-word md:not-sr-only">{categoria.label}</span>
                {selectedCategory === categoria.id && <Check className="size-4 shrink-0" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}

    </section>
  );
}
