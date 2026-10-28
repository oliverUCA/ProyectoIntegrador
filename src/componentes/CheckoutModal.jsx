import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Truck, Store, QrCode, CreditCard, Banknote, CheckCircle2, Loader2 } from 'lucide-react';
import { useCarrito } from '../hooks/useCarrito';
import { useAlmacen } from '../hooks/useAlmacen';
import { prepareCheckoutOrder, completePaidCheckout } from '../services/checkoutService';
import { getErrorMessage } from '../services/dolibarrClient';
import { invalidarCacheCatalogo } from '../services/catalogoService';

const METODOS = [
    { id: 'qr', label: 'QR', icon: QrCode },
    { id: 'card', label: 'Tarjeta', icon: CreditCard },
    { id: 'cash', label: 'Efectivo', icon: Banknote },
];

const ENTREGAS = [
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'pickup', label: 'Recojo', icon: Store },
];

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200';

function Opciones({ name, opciones, valor, onChange }) {
    return (
        <div className={`grid gap-2 ${opciones.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} role="radiogroup" aria-label={name}>
            {opciones.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    id={`${name}-${id}`}
                    type="button"
                    role="radio"
                    aria-checked={valor === id}
                    onClick={() => onChange(id)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${valor === id
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 text-gray-600 hover:border-orange-300'}`}
                >
                    <Icon size={20} aria-hidden="true" />
                    {label}
                </button>
            ))}
        </div>
    );
}

export default function CheckoutModal({ open, onClose, onPagoConfirmado }) {
    const { productos, subtotal, vaciarCarrito } = useCarrito();
    const { selectedWarehouse } = useAlmacen();
    const checkoutRef = useRef(null);

    const [paso, setPaso] = useState('form'); // form | pago | exito
    const [form, setForm] = useState({ fullName: '', phone: '', deliveryType: 'delivery', address: '', paymentMethod: 'qr' });
    const [errores, setErrores] = useState({});
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [pedido, setPedido] = useState(null);

    if (!open) return null;

    const set = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor?.target ? valor.target.value : valor }));

    const cerrar = () => {
        if (cargando) return;
        if (paso === 'exito') {
            setPaso('form');
            setPedido(null);
            checkoutRef.current = null;
        }
        setError('');
        onClose();
    };

    const validar = () => {
        const e = {};
        if (form.fullName.trim().split(/\s+/).length < 2) e.fullName = 'Ingresa tu nombre y apellido.';
        if (!/^[67]\d{7}$/.test(form.phone.trim())) e.phone = 'Celular inválido (8 dígitos, empieza con 6 o 7).';
        if (form.deliveryType === 'delivery' && form.address.trim().length < 5) e.address = 'Ingresa tu dirección en Cochabamba.';
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const confirmarPedido = async (ev) => {
        ev.preventDefault();
        if (!validar()) return;
        setError('');
        setCargando(true);
        // Referencia estable: reintentos no duplican el pedido en Dolibarr
        checkoutRef.current ||= `WEB-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        try {
            const result = await prepareCheckoutOrder({
                checkoutRef: checkoutRef.current,
                customer: { fullName: form.fullName, phone: form.phone },
                deliveryType: form.deliveryType,
                address: form.address,
                paymentMethod: form.paymentMethod,
                warehouseId: selectedWarehouse?.id,
                cartItems: productos,
            });
            setPedido(result);
            setPaso('pago');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setCargando(false);
        }
    };

    const confirmarPago = async () => {
        setError('');
        setCargando(true);
        try {
            // Valida el pedido y cierra el envío -> Dolibarr descuenta el stock
            await completePaidCheckout({ orderId: pedido.id, warehouseId: selectedWarehouse?.id });
            vaciarCarrito();
            setPaso('exito');
            // Avisa al catálogo para que recargue las existencias
            invalidarCacheCatalogo();
            window.dispatchEvent(new Event('dolibarr-stock-changed'));
            onPagoConfirmado?.();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setCargando(false);
        }
    };

    const total = pedido?.total || subtotal;
    const qrData = pedido?.onlinePaymentUrl || `PAGO|${pedido?.refExt}|Bs ${total.toFixed(2)}`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;
    const metodo = METODOS.find((m) => m.id === form.paymentMethod);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={cerrar}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkout-title"
                className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" onClick={cerrar} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700" aria-label="Cerrar">
                    <X size={20} />
                </button>

                {paso === 'form' && (
                    <form onSubmit={confirmarPedido} noValidate className="space-y-4">
                        <h2 id="checkout-title" className="text-xl font-bold text-gray-900">Datos del pedido</h2>

                        <div>
                            <label htmlFor="co-nombre" className="mb-1 block text-sm font-medium text-gray-700">Nombre completo</label>
                            <input id="co-nombre" className={inputCls} value={form.fullName} onChange={set('fullName')} autoComplete="name" />
                            {errores.fullName && <p className="mt-1 text-xs text-red-600">{errores.fullName}</p>}
                        </div>

                        <div>
                            <label htmlFor="co-celular" className="mb-1 block text-sm font-medium text-gray-700">Celular</label>
                            <input id="co-celular" type="tel" inputMode="numeric" maxLength={8} className={inputCls} value={form.phone} onChange={set('phone')} placeholder="7XXXXXXX" />
                            {errores.phone && <p className="mt-1 text-xs text-red-600">{errores.phone}</p>}
                        </div>

                        <div>
                            <span className="mb-1 block text-sm font-medium text-gray-700">Tipo de entrega</span>
                            <Opciones name="entrega" opciones={ENTREGAS} valor={form.deliveryType} onChange={set('deliveryType')} />
                        </div>

                        {form.deliveryType === 'delivery' && (
                            <div>
                                <label htmlFor="co-direccion" className="mb-1 block text-sm font-medium text-gray-700">Dirección en Cochabamba</label>
                                <input id="co-direccion" className={inputCls} value={form.address} onChange={set('address')} placeholder="Av. / Calle, número, zona" />
                                {errores.address && <p className="mt-1 text-xs text-red-600">{errores.address}</p>}
                            </div>
                        )}

                        <div>
                            <span className="mb-1 block text-sm font-medium text-gray-700">Método de pago</span>
                            <Opciones name="pago" opciones={METODOS} valor={form.paymentMethod} onChange={set('paymentMethod')} />
                        </div>

                        <div className="flex justify-between border-t pt-3 font-semibold">
                            <span>Total</span>
                            <span className="text-orange-600">Bs. {subtotal.toFixed(2)}</span>
                        </div>

                        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

                        <div className="flex flex-col gap-2">
                            <button id="btn-confirmar-pedido" type="submit" disabled={cargando} className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60">
                                {cargando && <Loader2 size={18} className="animate-spin" />}
                                Confirmar pedido
                            </button>
                            <button id="btn-seguir-comprando" type="button" onClick={cerrar} disabled={cargando} className="rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50">
                                Seguir comprando
                            </button>
                        </div>
                    </form>
                )}

                {paso === 'pago' && pedido && (
                    <div className="space-y-4 text-center">
                        <h2 id="checkout-title" className="text-xl font-bold text-gray-900">Pago con {metodo.label}</h2>
                        <p className="text-sm text-gray-500">Pedido {pedido.refExt}</p>
                        <p className="text-3xl font-bold text-orange-600">Bs. {total.toFixed(2)}</p>

                        {form.paymentMethod === 'qr' && (
                            <img src={qrSrc} alt="Código QR de pago" className="mx-auto h-56 w-56 rounded-lg border p-2" />
                        )}
                        {form.paymentMethod === 'card' && (
                            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Pasa la tarjeta en el POS {form.deliveryType === 'delivery' ? 'del repartidor' : 'de caja'} y confirma cuando sea aprobada.</p>
                        )}
                        {form.paymentMethod === 'cash' && (
                            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Recibe el efectivo y confirma el pago.</p>
                        )}

                        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

                        <button id="btn-confirmar-pago" type="button" onClick={confirmarPago} disabled={cargando} className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60">
                            {cargando && <Loader2 size={18} className="animate-spin" />}
                            Confirmar pago
                        </button>
                    </div>
                )}

                {paso === 'exito' && (
                    <div className="space-y-4 py-4 text-center">
                        <CheckCircle2 size={56} className="mx-auto text-green-600" />
                        <h2 id="checkout-title" className="text-xl font-bold text-gray-900">¡Venta realizada!</h2>
                        <p className="text-sm text-gray-500">El stock fue descontado en Dolibarr. Pedido {pedido?.refExt}.</p>
                        <button type="button" onClick={cerrar} className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600">Cerrar</button>
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
}
