import dolibarrClient from './dolibarrClient';

const listFrom = (data) => (Array.isArray(data) ? data : data?.data ?? []);
const asId = (data) => {
  const value = data?.id ?? data?.success?.id ?? data;
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new Error('Dolibarr no devolvió un identificador válido.');
  return id;
};

const getByExternalReference = async (resource, refExt, signal) => {
  try {
    const { data } = await dolibarrClient.get(`/${resource}/ref_ext/${encodeURIComponent(refExt)}`, { signal });
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

const getFreshProducts = async (cartItems, warehouseId, signal) => Promise.all(cartItems.map(async (item) => {
  const { data } = await dolibarrClient.get(`/products/${encodeURIComponent(item.id)}`, {
    params: { includestockdata: 1 },
    signal,
  });
  if (String(data.type ?? '0') !== '0' || String(data.status ?? data.tosell ?? '1') !== '1') {
    throw new Error(`${item.nombre} ya no está disponible para la venta.`);
  }

  const stock = Number(data.stock_warehouse?.[warehouseId]?.real);
  if (!Number.isFinite(stock)) throw new Error(`Dolibarr no informó el stock de ${item.nombre} en el almacén seleccionado.`);
  if (item.cantidad > stock) throw new Error(`Stock insuficiente para ${item.nombre}. Disponible: ${stock}.`);

  return { item, product: data };
}));

export const prepareCheckoutOrder = async ({
  checkoutRef,
  customer,
  deliveryType,
  address,
  paymentMethod,
  warehouseId,
  cartItems,
  signal,
}) => {
  if (!warehouseId) throw new Error('Selecciona un almacén antes de confirmar el pedido.');
  if (!cartItems.length) throw new Error('El carrito está vacío.');

  const products = await getFreshProducts(cartItems, warehouseId, signal);
  const customerRef = `${checkoutRef}-CLIENT`;
  let thirdparty = await getByExternalReference('thirdparties', customerRef, signal);

  if (!thirdparty) {
    const { data } = await dolibarrClient.post('/thirdparties', {
      name: customer.fullName.trim(),
      client: 1,
      code_client: 'auto',
      ref_ext: customerRef,
      phone: customer.phone.trim(),
      phone_mobile: customer.phone.trim(),
      address: deliveryType === 'delivery' ? address.trim() : 'Recojo en tienda',
      town: 'Cochabamba',
      country_code: 'BO',
    }, { signal });
    thirdparty = { id: asId(data) };
  }

  const thirdpartyId = asId(thirdparty);
  let order = await getByExternalReference('orders', checkoutRef, signal);
  let orderId;
  if (order) {
    orderId = asId(order);
  } else {
    const paymentNames = { qr: 'QR', card: 'Tarjeta', cash: 'Efectivo' };
    const deliveryLabel = deliveryType === 'delivery' ? `Delivery: ${address.trim()}, Cochabamba` : 'Recojo en tienda';
    const note = `Pedido web ${checkoutRef}\nEntrega: ${deliveryLabel}\nPago declarado: ${paymentNames[paymentMethod] || paymentMethod}`;
    const { data } = await dolibarrClient.post('/orders', {
      socid: thirdpartyId,
      date: Math.floor(Date.now() / 1000),
      type: 0,
      ref_ext: checkoutRef,
      note_private: note,
    }, { signal });
    orderId = asId(data);
  }

  const { data: existingLinesData } = await dolibarrClient.get(`/orders/${orderId}/lines`, { signal });
  const existingLines = listFrom(existingLinesData);
  for (const [index, { item, product }] of products.entries()) {
    const existing = existingLines.find((line) => String(line.fk_product) === String(item.id));
    if (existing) {
      if (Number(existing.qty) !== Number(item.cantidad)) {
        throw new Error('Ya existe un pedido parcial con cantidades distintas. No se duplicó ni modificó; solicita revisión en Dolibarr.');
      }
      continue;
    }

    const priceBaseType = String(product.price_base_type || 'HT').toUpperCase();
    const subprice = Number(priceBaseType === 'TTC' ? product.price_ttc : product.price);
    const { data: lineId } = await dolibarrClient.post(`/orders/${orderId}/lines`, {
      desc: product.label || item.nombre,
      fk_product: Number(item.id),
      qty: Number(item.cantidad),
      subprice,
      price_base_type: priceBaseType,
      tva_tx: Number(product.tva_tx || 0),
      product_type: 0,
      remise_percent: 0,
      info_bits: 0,
      rang: index + 1,
    }, { signal });
    if (!lineId) throw new Error(`No se pudo agregar ${item.nombre} al pedido.`);
  }

  const { data: savedOrder } = await dolibarrClient.get(`/orders/${orderId}`, { signal });
  return {
    id: orderId,
    refExt: checkoutRef,
    onlinePaymentUrl: savedOrder.online_payment_url || '',
    total: Number(savedOrder.total_ttc ?? savedOrder.total ?? 0),
  };
};

const getOrderShipments = async (orderId, signal) => {
  try {
    const { data } = await dolibarrClient.get(`/orders/${orderId}/shipment`, { signal });
    return listFrom(data);
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const completePaidCheckout = async ({ orderId, warehouseId, signal }) => {
  if (!warehouseId) throw new Error('No hay un almacén seleccionado para descontar el stock.');

  const { data: order } = await dolibarrClient.get(`/orders/${orderId}`, { signal });
  const orderStatus = Number(order.status ?? order.statut ?? 0);
  if (orderStatus < 1) {
    await dolibarrClient.post(`/orders/${orderId}/validate`, {
      idwarehouse: Number(warehouseId),
      notrigger: 0,
    }, { signal });
  }

  const shipments = await getOrderShipments(orderId, signal);
  let shipment = shipments[0] || null;
  let shipmentId = shipment ? asId(shipment) : 0;
  if (!shipmentId) {
    const { data } = await dolibarrClient.post(`/orders/${orderId}/shipment/${warehouseId}`, {}, { signal });
    shipmentId = asId(data);
  }

  if (!shipment) {
    const { data } = await dolibarrClient.get(`/shipments/${shipmentId}`, { signal });
    shipment = data;
  }
  let shipmentStatus = Number(shipment.status ?? shipment.statut ?? 0);
  if (shipmentStatus < 1) {
    const { data } = await dolibarrClient.post(`/shipments/${shipmentId}/validate`, { notrigger: 0 }, { signal });
    shipment = data;
    shipmentStatus = Number(shipment.status ?? shipment.statut ?? 1);
  }
  if (shipmentStatus < 2) {
    await dolibarrClient.post(`/shipments/${shipmentId}/close`, { notrigger: 0 }, { signal });
  }

  return { orderId, shipmentId };
};