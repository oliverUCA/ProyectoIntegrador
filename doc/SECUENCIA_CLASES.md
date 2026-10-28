# Secuencia de clases: supermercado con Dolibarr

## Objetivo de la demostración final

Un visitante consulta productos en Bs, agrega artículos al carrito, entrega sus datos al finalizar y simula el pago. Al aprobarlo, se registra la compra en Dolibarr y se comprueba que el stock disminuyó exactamente en las cantidades compradas. Todo se ejecuta con datos y existencias de pruebas, sin publicar en producción.

Se propone dividir el desarrollo en bloques con un resultado visible. No representan una duración fija de grabación: cada bloque puede ocupar una o varias clases. Antes de grabar una integración nueva, comprobarla para evitar que la sesión dependa de descubrir permisos o configuración en vivo.

## Orden en que puedes pedir el trabajo

### 1. Verificar la API y preparar la demostración

**Pedido sugerido:** «Revisa la integración actual con Dolibarr y verifica mediante consultas de lectura la versión, productos, categorías, almacenes, stock y permisos disponibles. Documenta los resultados en doc/API_DOLIBARR.md, sin mostrar claves ni modificar inventario. Identifica qué falta para implementar compras con descuento de stock».

**Resultado para mostrar:** conexión funcionando, categorías reales y stock de un artículo en un almacén identificado. Si alguna capacidad no puede consultarse, dejarla como pendiente explícito.

Preparar luego entre 5 y 10 artículos por unidad, con precios y cantidades conocidos. Esto permite enseñar el recorrido sin resolver todavía productos por peso o múltiples almacenes. Acordar la interpretación de los impuestos antes de calcular totales.

### 2. Introducir el backend y separar la administración

**Pedido sugerido:** «Crea un backend sencillo en Node.js para consultar productos, categorías y almacenes de Dolibarr desde el servidor. Conserva el frontend actual, mueve las credenciales al backend y separa la navegación pública de la administración. El visitante debe ver el catálogo sin iniciar sesión».

**Resultado para mostrar:** tienda como invitado y consulta de productos a través del backend. Explicar el recorrido componente → servicio del frontend → backend → Dolibarr. Implementar permisos del acceso administrativo; no exponer escrituras mediante un proxy abierto.

### 3. Catálogo real y categorías funcionales

**Pedido sugerido:** «Conecta el catálogo y el componente Categorias del sidebar al backend. Al seleccionar una categoría, muestra sus productos; agrega búsqueda, paginación, disponibilidad y precios en Bs. Retira los datos ficticios del recorrido principal y reutiliza los componentes actuales».

**Resultado para mostrar:** elegir una categoría cambia los productos visibles. Mostrar carga, lista vacía y error recuperable. Usar una imagen alternativa si el ERP no dispone de fotografía.

### 4. Detalle del producto

**Pedido sugerido:** «Conecta la página de detalle a los productos reales por ID. Muestra nombre, descripción, imagen disponible, precio en Bs y disponibilidad del almacén configurado. Maneja el producto inexistente».

**Resultado para mostrar:** abrir un artículo desde el catálogo y regresar conservando el contexto de navegación cuando sea posible.

### 5. Carrito compartido

**Pedido sugerido:** «Crea CarritoContext y useCarrito, conecta los botones de agregar desde catálogo y detalle, y reutiliza CarroCompra. Actualiza el contador del Header, permite cambiar cantidades y eliminar artículos, y conserva el carrito al recargar».

**Resultado para mostrar:** agregar el mismo artículo dos veces, modificar cantidades y comprobar el mismo estado en catálogo, encabezado y carrito. No se descuenta stock al agregar al carrito.

### 6. Checkout como invitado

**Pedido sugerido:** «Crea el checkout para invitados con nombre y celular, resumen en Bs y validaciones. Solicita estos datos recién al finalizar. Implementa en backend la búsqueda o creación controlada del cliente de prueba, normalizando el celular y sin exponer datos de otros clientes».

**Resultado para mostrar:** navegar sin cuenta y completar el formulario únicamente al comprar. No reutilizar automáticamente un cliente si hay varias coincidencias por celular; manejar ese caso de forma explícita.

### 7. Pago simulado y revisión final

**Pedido sugerido:** «Implementa un simulador de pago con resultados aprobado y rechazado, claramente identificado como prueba y sin datos de tarjetas reales. Revalida en servidor precios, cantidades y disponibilidad, registra el intento y deja preparada la continuación de la compra. Todavía no muestres compra completada ni modifiques stock».

**Resultado para mostrar:** pago rechazado conserva el carrito; pago aprobado muestra el intento pendiente de completar. Manipular un precio en el navegador no cambia el importe calculado en servidor. Esta clase prepara el flujo; no termina todavía la integración comercial.

### 8. Compra en Dolibarr y descuento de stock

**Pedido sugerido:** «Con el circuito de la API ya verificado, completa la compra de prueba después del pago simulado aprobado: vincula cliente y documento comercial, aplica el descuento en el almacén configurado y comprueba el stock resultante. Evita duplicar documentos o movimientos al reintentar y muestra la confirmación solamente al completar todo».

**Resultado para mostrar:** stock inicial de 10 unidades, compra de 2 y stock final de 8 en Dolibarr, con referencia de compra. Es un ejemplo: preparar esas cantidades en los datos de prueba antes de grabar.

Definir primero qué operación mueve existencias en esta instalación. Si la validación o expedición ya las descuenta, no añadir un ajuste manual adicional. Si hay varias llamadas, guardar el avance y reconciliar fallos parciales. Un nuevo clic no debe generar una segunda venta.

### 9. Casos de error y repetición de la clase

**Pedido sugerido:** «Agrega pruebas del flujo de compra para pago rechazado, falta de stock, cambio de precio, doble clic, timeout y fallo después de crear el documento o mover inventario. Documenta cómo preparar y restaurar los datos de prueba para repetir la grabación».

**Resultado para mostrar:** compra rechazada sin descuento, compra aprobada con un solo descuento y recuperación de un intento interrumpido. Conservar referencias de los registros creados para comprobarlos desde Dolibarr.

### 10. Ampliación opcional: reposición

**Pedido sugerido:** «Agrega una pantalla administrativa de reposición de inventario de prueba, usando el proceso de entrada o recepción verificado en Dolibarr. Permite seleccionar un almacén autorizado, un producto y una cantidad, y comprueba el aumento de stock. Restringe esta función al administrador».

**Resultado para mostrar:** aumento de existencias y posterior venta sobre ese inventario. Si se enseña compras a proveedores, separar orden de compra, recepción y entrada efectiva de stock. No añadir este bloque antes de terminar el circuito principal de venta.

## Guion breve para cada grabación

1. Mostrar el resultado esperado y el estado inicial de los datos.
2. Explicar qué archivo se modifica y qué responsabilidad cumple.
3. Implementar un bloque pequeño manteniendo el proyecto ejecutable.
4. Probar el caso correcto y un error relevante.
5. Mostrar el resultado tanto en la web como en Dolibarr cuando corresponda.

Mantener la estructura actual mientras se desarrolla cada funcionalidad. Los movimientos de carpetas se hacen en bloques pequeños, actualizando imports y comprobando el build, para que una reorganización no opaque la explicación de la compra.

## Primer pedido recomendado

Comenzar por el bloque 1. Verificar almacenes, stock y configuración antes de grabar el checkout evita enseñar un flujo que luego necesite cambiar para adaptarse a Dolibarr. El primer resultado visual importante llega con el catálogo filtrado del bloque 3; el cierre del curso es la compra y su stock antes/después del bloque 8.
