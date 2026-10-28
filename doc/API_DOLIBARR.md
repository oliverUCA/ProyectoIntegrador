# Diagnóstico de la API de Dolibarr

Fecha de verificación: **26 de octubre de 2026**, zona America/La_Paz.

## 1. Resultado ejecutivo

La instancia responde por HTTPS y reporta **Dolibarr 24.0.2**. Se comprobaron lecturas de productos, categorías, almacenes, movimientos, clientes, pedidos, expediciones y facturas. La moneda configurada es **BOB**.

El hallazgo principal para la compra es la configuración **`STOCK_CALCULATE_ON_SHIPMENT_CLOSE = 1`**: apunta a descontar existencias al cerrar una expedición. Las opciones de descuento al validar pedido y factura devolvieron `0`. Por tanto, crear un pedido no basta para demostrar la disminución de stock.

**No se modificaron productos, inventario, configuración ni documentos comerciales.** No se ejecutaron POST, PUT, PATCH o DELETE; tampoco se inició sesión por POST. Los permisos de escritura y el circuito completo de compra siguen sin probarse.

## 2. Alcance y método

- Base utilizada: `https://hipermaxi.with11.dolicloud.com/api/index.php`.
- Autenticación de las consultas: cabecera `DOLAPIKEY`, con la credencial ya presente en `src/api/axiosClient.js`. No se reproduce su valor.
- No se accedió al almacenamiento del navegador; las sesiones que puedan estar guardadas allí no se verificaron.
- Solo se encontró `.env.example` entre `.env`, `.env.local` y `.env.example`; los nombres documentados son `VITE_DOLIBARR_URL` y `VITE_DOLIBARR_API_KEY`.
- Se consultaron muestras pequeñas de productos y documentos; no se obtuvo el total del catálogo ni se auditó todo el inventario.
- Se conservaron aquí únicamente datos técnicos y ejemplos de artículos. Se omiten datos personales de usuarios/clientes y valores de credenciales.
- Las lecturas se hicieron desde un cliente HTTP, no desde la interfaz React: no prueban CORS, comportamiento visual ni compatibilidad del flujo de login.
- Las cifras son una instantánea, no una reserva ni garantía de existencias futuras.

## 3. Consultas realizadas y resultados

Todas las rutas son relativas a la base anterior y se utilizaron con **GET**.

| Consulta | HTTP | Resultado observado |
| --- | --- | --- |
| `/status` | 200 | `dolibarr_version: 24.0.2`, `access_locked: 0` |
| `/products?limit=3&page=0&includestockdata=1` | 200 | Tres productos con precios y stock por almacén |
| `/products/906?includestockdata=1` | 200 | Detalle del artículo `pasta`, stock real 65 |
| `/categories?type=product&sortfield=t.label&sortorder=ASC&limit=3&page=0` | 200 | Tres categorías; contrato actual del servicio compatible con la muestra |
| `/categories?type=product&sortfield=t.label&sortorder=ASC&limit=100&page=0` | 200 | 16 categorías de producto |
| `/categories/4/objects?type=product&limit=2&page=0` | 200 | 95 artículos; el límite solicitado no restringió el resultado a dos |
| `/warehouses?limit=10&page=0` | 200 | Cuatro almacenes, todos con `status: 1` |
| `/stockmovements?limit=3&page=0` | 200 | Tres movimientos existentes |
| `/users/info` | 200 | Usuario de la credencial con `admin: 1` |
| `/setup/modules` | 200 | 36 módulos habilitados |
| `/orders?limit=1&page=0` | 200 | Un pedido existente; valores comerciales/personales omitidos |
| `/thirdparties?limit=1&page=0` | 200 | Un tercero existente; datos personales omitidos |
| `/shipments?limit=1&page=0` | 200 | Una expedición existente |
| `/invoices?limit=1&page=0` | 200 | Una factura existente |

La presencia de resultados no acredita permisos de creación o validación. Tampoco se comprobó que los documentos consultados estén relacionados entre sí.

## 4. Productos y precios

| ID | Referencia | Artículo | Base del precio | Precio HT | Precio TTC | Tasa devuelta | Stock real | Stock teórico |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 44 | 0099 | Yuca | TTC | 31.00 | 31.00 | 0 % | 47 | 34 |
| 906 | 0121251 | pasta | HT | 50.00 | 56.50 | 13 % | 65 | 65 |
| 55 | 111_222 | Morcilla | HT | 27.00 | 27.00 | 0 % | 87 | 87 |

Los tres artículos devolvieron `type: "0"` y `status: "1"`. Los importes se interpretan junto con la moneda configurada BOB, no a partir de un símbolo incluido en cada producto.

Implicaciones para la aplicación:

- Hay precios con base HT y TTC y tasas diferentes. No sumar un 13 % fijo a todos los artículos ni volver a añadirlo a un precio TTC.
- Normalizar cadenas numéricas y redondear con una regla acordada; revalidar los importes en servidor antes de comprar.
- `stock_reel` y `stock_theorique` difieren para Yuca. No intercambiarlos ni deducir sin más que el teórico es una reserva efectiva. Falta acordar cómo considerar pedidos comprometidos.
- La disponibilidad de la tienda debe considerar el almacén seleccionado; un stock global positivo no demuestra disponibilidad en todos los almacenes.
- El detalle de `pasta` devolvió `tobatch: null` y `fk_unit: null`; esto no permite concluir que todo el catálogo esté libre de lotes o unidades especiales.

### Ejemplo reducido de stock por almacén

Respuesta observada para el producto 906:

```json
{
  "id": "906",
  "label": "pasta",
  "stock_reel": 65,
  "stock_theorique": 65,
  "stock_warehouse": {
    "1": { "real": "65", "id": "1222" }
  }
}
```

La clave `"1"` identifica el almacén; el `id` interno `1222` no debe confundirse con el ID del almacén. En la muestra de los tres artículos solo aparecieron existencias en el almacén 1; no se afirma que los demás almacenes estén vacíos.

## 5. Categorías

La consulta completa de la primera página devolvió 16 categorías, por debajo del límite 100:

| ID | Nombre | Padre |
| --- | --- | --- |
| 1 | Productos de punto de venta (POS) | 0 |
| 4 | Abarrotes | 1 |
| 2 | Bebidas | 1 |
| 5 | Carnes | 1 |
| 11 | Cereales | 1 |
| 6 | Embutidos | 1 |
| 8 | Enlatados | 1 |
| 3 | Frutas y Verduras | 1 |
| 10 | Higiene y Cuidado Personal | 1 |
| 15 | Lacteos | 1 |
| 9 | Limpieza | 1 |
| 12 | Mascotas | 1 |
| 16 | Materiales | 1 |
| 14 | Ropas | 1 |
| 7 | Snacks | 1 |
| 13 | Utiles Escolares | 1 |

Todas devolvieron `type: "0"` y `visible: 0`. Antes de publicar categorías hay que definir la política de exposición: no asumir que `visible` equivale al criterio de publicación de esta tienda ni ignorarlo sin revisarlo.

La ruta de objetos de Abarrotes devolvió 95 artículos pese a enviar `limit=2`. No reutilizar automáticamente la lógica de paginación de `/products` para esa ruta. El filtro comercial definitivo y su paginación deberán comprobarse al implementar el catálogo por categoría.

## 6. Almacenes

| ID | Referencia | Estado devuelto |
| --- | --- | --- |
| 1 | ALM-CENTRAL | `status: 1`, `statut: 1` |
| 5 | ALM-SEC | `status: 1`, `statut: 1` |
| 6 | ALM-FRI | `status: 1`, `statut: 1` |
| 7 | ALM-NOA | `status: 1`, `statut: 1` |

**Propuesta pendiente de elección:** usar el almacén 1 para la demostración, porque contiene stock de los artículos muestreados. Esta auditoría no lo seleccionó ni modificó la configuración del proyecto. La aplicación debe configurarlo explícitamente y no elegir silenciosamente el primer almacén devuelto.

## 7. Configuración de moneda y movimiento de stock

Se consultó individualmente `/setup/conf/{NOMBRE}`; no se descargó toda la configuración.

| Nombre | HTTP | Valor observado |
| --- | --- | --- |
| `MAIN_MONNAIE` | 200 | `BOB` |
| `STOCK_CALCULATE_ON_VALIDATE_ORDER` | 200 | `0` |
| `STOCK_CALCULATE_ON_SHIPMENT_CLOSE` | 200 | `1` |
| `STOCK_CALCULATE_ON_BILL` | 200 | `0` |
| `STOCK_CALCULATE_ON_SHIPMENT` | 400 | Constante desconocida o no definida según la respuesta |
| `STOCK_ALLOW_NEGATIVE_TRANSFER` | 400 | Constante desconocida o no definida según la respuesta |

Un HTTP 400 de constante desconocida no significa HTTP 403 ni permite asegurar una política de stock negativo. Esa política sigue pendiente.

**Interpretación sustentada por código oficial 24.0.2:** el cierre de la expedición invoca el movimiento de stock cuando `STOCK_CALCULATE_ON_SHIPMENT_CLOSE` está activo. Es una conclusión de configuración y código, no una venta ejecutada en la instancia. Ver [implementación de expediciones](https://github.com/Dolibarr/dolibarr/blob/24.0.2/htdocs/expedition/class/expedition.class.php).

El circuito recomendado para investigar es:

```text
Pago simulado aprobado
  → cliente + pedido con líneas
  → validación del pedido, si el contrato lo requiere
  → expedición vinculada con cantidades y almacén
  → validación y cierre de expedición
  → lectura del movimiento generado y del stock resultante
  → confirmación final de la compra
```

Todavía faltan los payloads, rutas de transición y sus permisos efectivos. No se propone añadir un movimiento manual a este circuito: podría descontar dos veces al cerrar la expedición.

Existe además una API de movimientos directos en el [código oficial de stock 24.0.2](https://github.com/Dolibarr/dolibarr/blob/24.0.2/htdocs/product/stock/class/api_stockmovements.class.php). Su escritura requiere el derecho `stock.creer`. Solo se comprobó aquí la lectura; no se ensayó su creación ni se eligió como solución comercial.

## 8. Módulos y permisos comprobados

Entre los 36 módulos reportados como habilitados están `api`, `product`, `categorie`, `stock`, `stocktransfer`, `productbatch`, `societe`, `commande`, `expedition`, `facture`, `fournisseur`, `reception`, `takepos` y `banque`. Esto acredita disponibilidad de módulos, no que sus procesos estén completamente configurados para la tienda.

`/users/info` reportó **administrador**. Su campo `rights` no presentó una matriz completa de permisos comerciales; no debe usarse para inferir una lista exhaustiva de derechos concedidos o denegados.

| Capacidad | Estado |
| --- | --- |
| Leer versión, productos, categorías, almacenes y movimientos | Comprobada mediante GET 200 |
| Leer clientes, pedidos, expediciones y facturas | Comprobada mediante GET 200 |
| Leer módulos y las constantes existentes consultadas | Comprobada con esta credencial administrativa |
| Crear cliente/pedido, validar pedido, crear/validar/cerrar expedición | No probado; no se hicieron escrituras |
| Crear movimientos o reponer stock | No probado |
| Acceder con una cuenta de privilegios mínimos | Pendiente: no se dispone de una cuenta restringida verificada |
| Acceso anónimo al ERP o CORS desde React | No probado; la tienda pública debería consultar su backend |

Los requisitos de permisos y la lectura individual de constantes pueden contrastarse con el [servicio Setup de la versión 24.0.2](https://github.com/Dolibarr/dolibarr/blob/24.0.2/htdocs/api/class/api_setup.class.php).

## 9. Revisión de la integración actual del proyecto

- `src/services/dolibarrClient.js`: centraliza Axios y usa `DOLAPIKEY`; toma la clave de `dolibarr_api_key` o de una variable Vite. No es una forma de ocultar una credencial al navegador.
- `src/api/axiosClient.js`: segundo cliente con URL y clave fija en código; agrega además `Authorization: Bearer` desde `jwt-token`. Las lecturas de esta auditoría funcionaron con `DOLAPIKEY`, sin Bearer. El contrato del login no se probó.
- `AuthContext.jsx`: conserva el token bajo `jwt-token`, pero esa etiqueta no demuestra que sea un JWT. Logout no limpia la otra clave `dolibarr_api_key`.
- `Categorias.jsx`: reutiliza sesión o API key y presenta estados de carga/error. El listado usa un contrato confirmado; su representación en navegador y actualización de sesión no se probaron en esta tarea.
- El interceptor de `dolibarrClient` prioriza su propia clave almacenada sobre una cabecera pasada por el servicio. Conviene unificar credenciales antes de admitir cambios de usuario.
- `productosDolibarrService.js`: ya implementa CRUD de productos; solo se verificaron lecturas equivalentes, no sus escrituras ni filtros de búsqueda.
- El catálogo comercial todavía utiliza datos de ejemplo y el carrito no completa el circuito comercial.
- No se identifica backend de tienda, selección de almacén, proceso de checkout persistente ni integración de expediciones.
- Las rutas de administración actuales requieren separación y autorización efectiva en servidor.

## 10. Qué falta para implementar compras con descuento de stock

1. **Elegir el almacén de pruebas** y confirmar que los datos pueden modificarse en una etapa posterior. La intención docente del proyecto no prueba por sí sola el aislamiento de la instancia remota.
2. **Añadir el backend** y unificar autenticación/configuración; la cuenta administrativa existente no debe ser la credencial entregada a visitantes de la tienda.
3. **Documentar contratos de escritura sin ejecutarlos aún:** cliente, pedido y líneas, validación, expedición, almacén por línea, validación/cierre y consulta de movimientos relacionados. Revisar el explorador de la instancia y los permisos necesarios.
4. **Definir precio final y disponibilidad:** TTC/HT, redondeo, unidades, lotes y posible stock comprometido. Rechazar cantidades no disponibles y evitar sobreventa entre solicitudes concurrentes.
5. **Implementar cliente invitado:** normalizar celular, resolver coincidencias múltiples y no revelar información personal a quien conozca un número.
6. **Registrar intentos de compra y pago simulado** en servidor con una clave única y referencias de objetos ya creados; no generar pagos bancarios reales.
7. **Coordinar pedido y expedición:** con la configuración observada, probar después el cierre que genera la salida de stock. No modificar constantes para simplificar la clase sin evaluar el efecto global.
8. **Recuperar fallos parciales:** si el cierre ya descontó pero se perdió la respuesta, consultar estado y referencias antes de repetirlo. No suponer una transacción única entre llamadas HTTP.
9. **Demostrar el circuito con escrituras de prueba en una tarea posterior:** stock inicial conocido, compra aprobada, stock final correcto y un único movimiento esperado por línea según el circuito; pago rechazado sin descuento; reintento sin duplicados.
10. **Preparar la grabación:** artículos identificados, existencias conocidas y procedimiento de reposición documentado. Restaurar datos también modifica inventario y no se realizó en esta revisión.

**Siguiente paso recomendado:** backend de lectura y catálogo real, manteniendo esta configuración intacta. Antes de programar la finalización de compra, verificar los contratos de expediciones de esta instalación. No es necesario implementar cobro real ni facturación fiscal para la demostración docente.
