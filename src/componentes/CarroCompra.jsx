import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    Package,
} from 'lucide-react';
import { useCarrito } from '../hooks/useCarrito';

export default function CarroCompra() {
    const { productos, cantidadTotal, subtotal, aumentarCantidad, disminuirCantidad, eliminarProducto } = useCarrito();

    // =========================================================
    // CARRITO VACÍO
    // =========================================================

    if (productos.length === 0) {
        return (
            <div className="flex h-full flex-col">

                {/* Header */}

                <div className="border-b px-6 py-5">
                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            <ShoppingBag size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Mi carrito
                            </h2>

                            <p className="text-sm text-gray-500">
                                0 productos
                            </p>
                        </div>

                    </div>
                </div>

                {/* Carrito vacío */}

                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">

                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <ShoppingBag size={36} />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800">
                        Tu carrito está vacío
                    </h3>

                    <p className="mt-2 max-w-xs text-sm text-gray-500">
                        Agrega productos a tu carrito para comenzar
                        tu compra.
                    </p>

                </div>

            </div>
        );
    }

    // =========================================================
    // RENDER PRINCIPAL
    // =========================================================

    return (
        <div className="flex h-full flex-col">

            {/* =====================================================
          HEADER
      ====================================================== */}

            <div className="border-b px-6 py-5">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <ShoppingBag size={21} />
                    </div>

                    <div>

                        <h2 className="text-lg font-bold text-gray-900">
                            Mi carrito
                        </h2>

                        <p className="text-sm text-gray-500">
                            {cantidadTotal}{' '}
                            {cantidadTotal === 1
                                ? 'producto'
                                : 'productos'}
                        </p>

                    </div>

                </div>

            </div>

            {/* =====================================================
          LISTA DE PRODUCTOS
      ====================================================== */}

            <div className="flex-1 overflow-y-auto px-6 py-5">

                <div className="space-y-5">

                    {productos.map((producto) => (

                        <div
                            key={producto.id}
                            className="flex gap-3 border-b pb-5"
                        >

                            {/* =================================================
                  IMAGEN
              ================================================== */}

                            {producto.imagen ? (
                                <img
                                    src={producto.imagen}
                                    alt={producto.nombre}
                                    className="h-20 w-20 flex-shrink-0 rounded-lg border object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border bg-gray-50 text-gray-400" aria-label="Imagen no disponible">
                                    <Package size={24} aria-hidden="true" />
                                </div>
                            )}

                            {/* =================================================
                  INFORMACIÓN
              ================================================== */}

                            <div className="flex min-w-0 flex-1 flex-col">

                                {/* Nombre + eliminar */}

                                <div className="flex justify-between gap-2">

                                    <h3 className="text-sm font-medium leading-5 text-gray-900">
                                        {producto.nombre}
                                    </h3>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            eliminarProducto(producto.id)
                                        }
                                        className="
                      flex-shrink-0
                      text-gray-400
                      transition
                      hover:text-red-500
                    "
                                        aria-label={`Eliminar ${producto.nombre}`}
                                    >
                                        <Trash2 size={17} />
                                    </button>

                                </div>

                                {/* Precio unitario */}

                                <p className="mt-1 text-sm font-semibold text-orange-600">
                                    Bs. {producto.precio.toFixed(2)}
                                </p>

                                {/* Cantidad + total */}

                                <div className="mt-3 flex items-center justify-between">

                                    {/* Selector cantidad */}

                                    <div className="flex items-center rounded-lg border border-gray-300">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                disminuirCantidad(producto.id)
                                            }
                                            disabled={producto.cantidad <= 1}
                                            className="
                        p-1.5
                        text-gray-600
                        transition
                        hover:bg-gray-100
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                      "
                                            aria-label="Disminuir cantidad"
                                        >
                                            <Minus size={15} />
                                        </button>

                                        <span className="min-w-8 text-center text-sm font-medium">
                                            {producto.cantidad}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                aumentarCantidad(producto.id)
                                            }
                                            disabled={producto.stock != null && producto.cantidad >= producto.stock}
                                            className="
                        p-1.5
                        text-gray-600
                        transition
                        hover:bg-gray-100
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                      "
                                            aria-label="Aumentar cantidad"
                                        >
                                            <Plus size={15} />
                                        </button>

                                    </div>

                                    {/* Total producto */}

                                    <span className="font-semibold text-gray-900">
                                        Bs.{' '}
                                        {(
                                            producto.precio *
                                            producto.cantidad
                                        ).toFixed(2)}
                                    </span>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            {/* =====================================================
          RESUMEN DEL PEDIDO
      ====================================================== */}

            <div className="border-t bg-gray-50 px-6 py-5">

                <div className="space-y-3">

                    {/* Subtotal */}

                    <div className="flex justify-between text-sm text-gray-600">

                        <span>
                            Subtotal
                        </span>

                        <span>
                            Bs. {subtotal.toFixed(2)}
                        </span>

                    </div>

                    {/* Envío */}

                    <div className="flex justify-between text-sm text-gray-600">

                        <span>
                            Envío
                        </span>

                        <span className="font-medium text-green-600">
                            Gratis
                        </span>

                    </div>

                    {/* Total */}

                    <div className="border-t pt-3">

                        <div className="flex items-center justify-between">

                            <span className="text-lg font-bold text-gray-900">
                                Total
                            </span>

                            <span className="text-xl font-bold text-orange-600">
                                Bs. {subtotal.toFixed(2)}
                            </span>

                        </div>

                    </div>

                    {/* =================================================
              BOTÓN PROCEDER AL PAGO
          ================================================== */}

                    <button
                        type="button"
                        className="
              mt-3
              w-full
              rounded-lg
              bg-orange-500
              px-4
              py-3
              font-semibold
              text-white
              transition
              hover:bg-orange-600
              active:scale-[0.99]
            "
                    >
                        Proceder al pago
                    </button>

                </div>

            </div>

        </div>
    );
}
