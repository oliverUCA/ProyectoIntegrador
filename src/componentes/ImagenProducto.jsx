import { useEffect, useState } from 'react';
import { ImageOff, Package } from 'lucide-react';
import { getImagenProducto } from '../services/catalogoService';

export default function ImagenProducto({ product, className = '', imageClassName = '', iconClassName = 'size-9' }) {
  const [result, setResult] = useState({ id: null, url: '', failed: false });
  const id = String(product?.id || '');
  const imageUrl = result.id === id ? result.url : '';
  const failed = result.id === id && result.failed;

  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();
    getImagenProducto(product, { signal: controller.signal })
      .then((url) => {
        if (!controller.signal.aborted) setResult({ id, url, failed: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ id, url: '', failed: true });
      });
    return () => controller.abort();
  }, [id, product]);

  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={product.name} className={imageClassName} />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground" aria-label="Imagen no disponible">
          {failed ? <ImageOff className={iconClassName} aria-hidden="true" /> : <Package className={iconClassName} aria-hidden="true" />}
          {failed && <span className="sr-only">No se pudo cargar la imagen</span>}
        </div>
      )}
    </div>
  );
}