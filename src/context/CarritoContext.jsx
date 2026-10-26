import { useEffect, useState } from 'react';
import { CarritoContext } from './carritoStore';

const STORAGE_KEY = 'carrito-dolibarr';

const readCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) =>
      item && item.id != null && item.nombre && Number(item.precio) >= 0 && Number(item.cantidad) > 0
    ).map((item) => ({
      ...item,
      id: String(item.id),
      precio: Number(item.precio),
      cantidad: Math.floor(Number(item.cantidad)),
      stock: item.stock == null ? null : Number(item.stock),
    }));
  } catch {
    return [];
  }
};

export function CarritoProvider({ children }) {
  const [productos, setProductos] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    const sincronizar = (event) => {
      if (event.key === STORAGE_KEY) setProductos(readCart());
    };
    window.addEventListener('storage', sincronizar);
    return () => window.removeEventListener('storage', sincronizar);
  }, []);

  const agregarProducto = (producto) => {
    const id = String(producto.id);
    const actual = productos.find((item) => item.id === id);
    const stock = producto.stock == null ? actual?.stock ?? null : Number(producto.stock);
    if (producto.available === false || (stock != null && (actual?.cantidad || 0) >= stock)) return false;

    const nombre = producto.name || producto.nombre || 'Producto';
    const precio = Number(producto.priceBs ?? producto.precio ?? 0);
    setProductos((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) => item.id === id
          ? { ...item, nombre, precio, stock, cantidad: item.cantidad + 1 }
          : item);
      }
      const imagen = producto.imageUrl?.startsWith('blob:') ? '' : producto.imageUrl || '';
      return [...current, { id, nombre, precio, cantidad: 1, stock, imagen }];
    });
    return true;
  };

  const aumentarCantidad = (id) => {
    const producto = productos.find((item) => item.id === String(id));
    if (!producto || (producto.stock != null && producto.cantidad >= producto.stock)) return false;
    setProductos((current) => current.map((item) => item.id === String(id)
      ? { ...item, cantidad: item.cantidad + 1 }
      : item));
    return true;
  };

  const disminuirCantidad = (id) => {
    const key = String(id);
    const producto = productos.find((item) => item.id === key);
    if (!producto || producto.cantidad <= 1) return;
    setProductos((current) => current.map((item) => item.id === key
      ? { ...item, cantidad: item.cantidad - 1 }
      : item));
  };

  const eliminarProducto = (id) => {
    setProductos((current) => current.filter((item) => item.id !== String(id)));
  };

  const cantidadTotal = productos.reduce((total, item) => total + item.cantidad, 0);
  const subtotal = productos.reduce((total, item) => total + item.precio * item.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ productos, cantidadTotal, subtotal, agregarProducto, aumentarCantidad, disminuirCantidad, eliminarProducto }}>
      {children}
    </CarritoContext.Provider>
  );
}