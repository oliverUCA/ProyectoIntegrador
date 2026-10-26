# Plan de desarrollo: tienda de artículos integrada con Dolibarr

Fecha: 25 de octubre de 2026. Estado: alcance docente actualizado con decisiones del usuario.

## 1. Objetivo

Convertir el proyecto actual en una tienda web donde una persona pueda consultar artículos reales, agregarlos al carrito y enviar un pedido que quede registrado en Dolibarr. El personal autorizado podrá consultar y atender esos pedidos, utilizando Dolibarr como sistema central de productos y operaciones comerciales.

La primera versión será una **tienda pública de supermercado para pruebas: compra como invitado, precios en bolivianos (Bs), pago simulado y descuento de stock en Dolibarr al completar la compra**. No se publicará en producción. La simulación corresponde al pago; los registros comerciales y movimientos de inventario se comprobarán en una instancia de pruebas. No se solicitarán datos reales de tarjetas.

Este documento parte de una revisión del código local. No se realizaron llamadas a la instancia de Dolibarr ni se comprobó su versión, módulos habilitados, permisos o comportamiento real. Las capacidades de integración pendientes deberán validarse en un entorno de pruebas antes de implementarlas.

## 2. Punto de partida comprobado en el código

| Área | Implementación existente | Trabajo pendiente |
| --- | --- | --- |
| Base de la aplicación | React, Vite, Tailwind, React Router, Axios y componentes de interfaz | Consolidar estructura y separar tienda de administración |
| Autenticación | `AuthContext.jsx`, formulario de login y persistencia local del token | Unificar sesión, verificar permisos y proteger operaciones |
| Conexión con Dolibarr | `dolibarrClient.js` con cabecera `DOLAPIKEY`, timeout y mensajes de error | Validar configuración y definir integración segura para una tienda pública |
| Administración de productos | Servicio, hook, página y modal para listar, buscar, paginar, crear, editar y eliminar | Comprobar operaciones contra una instancia de pruebas y restringir acceso |
| Catálogo comercial | `CatalogoProductos.jsx` consume Fake Store API; `Products.jsx` usa un arreglo de ejemplo | Utilizar un catálogo único procedente de Dolibarr |
| Detalle del artículo | `ProductDetail.jsx` usa datos locales y una compra simulada | Consultar el artículo real y permitir agregarlo al carrito |
| Carrito | `CarroCompra.jsx` permite cambiar cantidades y quitar artículos de ejemplo | Estado compartido, persistencia y conexión con catálogo y checkout |
| Navegación | Layout, encabezado, sidebar y rutas existentes | Menús por perfil y adaptación completa a móviles |
| Clientes, pedidos y pagos | No se identificó un flujo comercial conectado en los archivos revisados | Diseñar e implementar el circuito de compra |

### Hallazgos que afectan el alcance

- Hay dos mecanismos de sesión: uno guarda `jwt-token` y otro `dolibarr_api_key`. El cierre de sesión actual no elimina ambas claves.
- `axiosClient.js` contiene una API key escrita directamente y agrega `Authorization: Bearer`, mientras el otro cliente usa `DOLAPIKEY`. Debe revisarse y unificarse; el nombre local `jwt-token` no demuestra que el token recibido sea un JWT.
- Las rutas actuales no muestran una protección por perfil para la gestión de productos. Ocultar botones no sustituye la autorización en servidor.
- Las variables `VITE_*` quedan disponibles en el frontend: no deben utilizarse para ocultar una credencial privilegiada de una tienda pública.
- El contador del carrito del encabezado está fijo y el botón de proceder al pago todavía no completa una compra.
- `AppRoutes.jsx` importa `../pages/products`, aunque el archivo se llama `Products.jsx`; debe corregirse para evitar problemas en sistemas sensibles a mayúsculas.
- El valor tributario inicial del formulario es un dato del prototipo, no una regla comercial validada. Moneda, impuestos y redondeo deben acordarse antes del checkout.

## 3. Alcance propuesto para el MVP

### Perfiles

| Perfil | Acciones |
| --- | --- |
| Visitante / comprador | Ver catálogo y detalle, buscar, administrar carrito y enviar pedido con sus datos |
| Operador | Acceder con autorización, consultar pedidos y atenderlos desde Dolibarr |
| Administrador | Gestionar productos y configuración según permisos definidos |

Se confirma la compra como invitado: los datos del comprador se solicitan recién en el checkout. El login existente se tratará como base para acceso interno, sujeto a validación. Las cuentas de compradores son una funcionalidad distinta y no se deben equiparar automáticamente con usuarios internos de Dolibarr.

### Funciones incluidas

1. Catálogo de artículos habilitados para la tienda, con precio, imagen disponible o alternativa y disponibilidad según la política acordada.
2. Búsqueda, paginación y detalle del artículo. Filtro por categoría si los datos y permisos de la instancia lo permiten.
3. Carrito compartido: agregar, cambiar cantidades, eliminar, vaciar y recuperar tras recargar la página.
4. Checkout con nombre, contacto y datos mínimos de entrega o retiro, según la modalidad elegida.
5. Validación de productos, precios, cantidades y disponibilidad en servidor antes de registrar el pedido.
6. Identificación o creación controlada del cliente en Dolibarr y vinculación con el pedido.
7. Registro del pedido con sus líneas y referencia; confirmación solamente cuando la operación haya sido comprobada.
8. Simulación de pago aprobado o rechazado, con identificación explícita como prueba. La aprobación habilita completar el proceso comercial verificado en Dolibarr.
9. Acceso restringido a las herramientas administrativas existentes.
10. Estados de carga, errores recuperables, formularios accesibles y funcionamiento en móvil.
11. Descuento de stock al completar la compra, exactamente una vez, en el almacén de pruebas configurado. El evento y las operaciones concretas se determinarán tras verificar la API y configuración de Dolibarr.
12. Formato monetario BOB/Bs consistente; celular normalizado como criterio de búsqueda del cliente, sin usarlo como prueba de identidad ni acceso a datos privados.

### Fuera del MVP

- Cobro por tarjeta, QR integrado, conciliación automática y devoluciones de dinero.
- Emisión fiscal automática e integraciones con organismos tributarios.
- Cálculo de rutas, tarifas de transportistas y seguimiento de entregas.
- Multitienda, múltiples monedas y elección automática entre almacenes.
- Cupones, promociones complejas, fidelización y precios personalizados.
- Cuentas de compradores, recuperación de contraseña e historial autoservicio.
- Aplicación móvil nativa, funcionamiento sin conexión y sincronización masiva.
- Paneles analíticos avanzados y notificaciones automáticas por correo o mensajería.

## 4. Flujo comercial esperado

```text
Catálogo público → Detalle → Carrito → Datos del comprador → Revisión
    → Validación en servidor → Pago simulado
    → Registro comercial en Dolibarr + descuento de stock verificado
    → Confirmación con referencia y nuevo stock
```

Un pedido registrado no significa por sí solo que esté pagado, facturado o entregado. Se mostrará «pago simulado aprobado», sin registrar un cobro real ni prometer emisión fiscal. El mecanismo para descontar stock se decidirá tras verificar la configuración: no se supone que crear un pedido descuente existencias. Si el circuito elegido ya mueve stock automáticamente, no se añadirá un segundo movimiento manual.

La confirmación final requiere comprobar el registro comercial y el movimiento de stock. Si el pago simulado es rechazado, no se completa la venta ni se descuentan unidades. Si una operación posterior falla, el intento queda pendiente de reconciliación; el reintento no debe repetir un descuento ya realizado.

Si cambia un precio o no hay disponibilidad, se informa al comprador y se solicita revisar el carrito antes de confirmar. Si se pierde la respuesta después de enviar un pedido, el sistema debe reconciliar el intento antes de permitir repetirlo para evitar duplicados.

## 5. Arquitectura propuesta

Para una tienda pública se recomienda incorporar un backend intermediario. El proyecto actual contiene el frontend; ese backend es trabajo adicional incluido en esta propuesta de MVP.

```text
Navegador: React + Tailwind
          ↓
Backend de la tienda: sesión, permisos, validaciones e intentos de compra
          ↓
API de Dolibarr: productos, clientes y pedidos
```

- **Frontend:** presentación, navegación, formularios y estado del carrito. Los importes guardados en el navegador son orientativos.
- **Backend:** credenciales en servidor, lista explícita de operaciones permitidas, autorización, cálculo fiable de totales y control de reintentos. No será un proxy abierto de Dolibarr.
- **Dolibarr:** fuente principal de productos, precios comerciales, clientes y pedidos, con reglas y módulos previamente verificados.
- **Persistencia auxiliar:** almacenar sesiones e intentos de checkout cuando sea necesario para recuperar operaciones y evitar duplicados. No replicar todo el ERP.

Para mantener afinidad con el proyecto se propone evaluar Node.js para el backend. La elección final del framework y almacenamiento depende del hosting disponible. En un prototipo exclusivamente interno podría mantenerse una conexión directa, pero eso representa un alcance diferente al de una tienda pública.

### Contratos por verificar en la instancia

| Recurso | Qué debe verificarse | Resultado esperado |
| --- | --- | --- |
| Acceso | Mecanismo de autenticación, permisos y revocación | Sesión y cuenta técnica con privilegios mínimos |
| Productos | Campos, filtros, paginación y artículos publicables | Modelo normalizado para catálogo y detalle |
| Imágenes y categorías | Disponibilidad y forma autorizada de lectura | Estrategia de imágenes y filtros, con alternativas |
| Stock | Almacenes, disponibilidad y momento de descuento | Política explícita para vender o rechazar cantidades |
| Clientes | Campos requeridos y criterio de coincidencia | Evitar asociaciones incorrectas y duplicados |
| Pedidos | Creación, líneas, estados y recuperación de errores | Pedido trazable y sin duplicación por reintento |
| Totales | Moneda, precios con/sin impuesto y redondeo | Misma interpretación en tienda y ERP |

Las rutas y payloads de clientes, pedidos, imágenes y stock se documentarán después de consultar el explorador de API o documentación correspondiente a la instalación. No se presuponen endpoints ni transacciones atómicas entre varias llamadas.

## 6. Etapas, entregables y criterios de aceptación

Las estimaciones son orientativas para una persona desarrolladora con dedicación completa. No son fechas comprometidas; dependen de acceso a pruebas, calidad de datos y decisiones del negocio.

| Etapa | Trabajo y entregable | Criterio de aceptación | Esfuerzo |
| --- | --- | --- | --- |
| 0. Definición y prueba técnica | Acordar flujo, revisar módulos y permisos, probar contratos de catálogo y pedido con datos de prueba | Existe evidencia de que se puede consultar productos y registrar un pedido de prueba con el proceso acordado | 2–3 días |
| 1. Base de integración y acceso | Crear backend, configuración por entorno, sesión interna, autorización y cliente unificado | Las credenciales privilegiadas no llegan al navegador y un comprador no puede ejecutar operaciones administrativas | 4–6 días |
| 2. Catálogo real | Conectar inicio, listado y detalle a Dolibarr; normalizar precios e imágenes; retirar datos ficticios del recorrido de compra | Se navegan artículos reales con carga, vacío, error y producto inexistente correctamente tratados | 3–5 días |
| 3. Carrito funcional | Contexto o store compartido, persistencia local, contador real y cantidades válidas | Agregar desde catálogo o detalle actualiza el mismo carrito y sobrevive a la recarga | 2–3 días |
| 4. Checkout, pago simulado y stock | Datos del comprador, cliente, líneas, totales, simulación de pago, registro comercial, movimiento de stock y recuperación | Aprobación completa la compra y descuenta una vez; rechazo no descuenta; doble clic o reintento no duplica registros ni movimientos | Por reestimar tras verificar el circuito de stock |
| 5. Operación y experiencia | Ajustar gestión existente, navegación por perfil, móvil y flujo de atención manual | El operador puede localizar y atender el pedido; el comprador completa el recorrido desde móvil | 2–4 días |
| 6. Validación y grabación | Pruebas críticas, registros de errores, datos reproducibles y guía para ejecutar localmente | Se demuestra el recorrido completo en pruebas, incluido el stock antes y después, sin despliegue a producción | 3–5 días |

La estimación anterior de 21–34 días correspondía al registro de pedidos con atención manual. Debe revisarse tras comprobar el circuito de stock y recuperación. El orden de clases se detalla en [SECUENCIA_CLASES.md](./SECUENCIA_CLASES.md); una clase puede cubrir varios bloques de trabajo o requerir más de una sesión. Pagos reales y facturación permanecen fuera del alcance.

Dependencias: la etapa 0 define los contratos; la etapa 1 sostiene la integración; catálogo y carrito preceden al checkout; la demostración final requiere completar el flujo y las pruebas. Al finalizar cada etapa se revisa el alcance restante.

## 7. Organización sugerida del trabajo

La propuesta detallada para enseñanza, con árbol de carpetas, responsabilidades, ejemplos y migración desde los archivos actuales, está en [ARQUITECTURA_CARPETAS.md](./ARQUITECTURA_CARPETAS.md).

Conservar los servicios y componentes que ya aportan valor, evitando una reescritura completa. Separar el acceso comercial del administrativo y sacar los ejercicios del recorrido principal.

```text
doc/                       Plan, contratos de integración y guía operativa
src/
  pages/                   Catálogo, detalle, checkout, confirmación y administración
  componentes/             Componentes comerciales reutilizables
  components/ui/           Controles visuales existentes
  context/                 Sesión y carrito compartidos
  hooks/                   Consulta de datos y estados de interfaz
  services/                Acceso al backend de la tienda
  layouts/                 Navegación pública y administración
server/                    Propuesta: backend, integración Dolibarr y validaciones
```

La carpeta `server/` es una propuesta, no una implementación existente. Mantener por ahora JavaScript/JSX evita añadir una migración a TypeScript al alcance comercial.

## 8. Pruebas y definición de terminado

- Pruebas de reglas críticas: cantidades, totales, redondeo y cálculo de precios en servidor.
- Pruebas de integración con una instancia de pruebas: permisos, cliente y pedido con líneas reales.
- Pruebas del recorrido completo: catálogo → carrito → pedido → referencia visible en Dolibarr.
- Casos de fallo: sesión inválida, falta de permisos, API caída, producto retirado, stock insuficiente, precio cambiado, timeout y doble envío.
- Aislamiento: un visitante no puede crear o eliminar productos ni consultar pedidos de otros compradores.
- Recuperación: identificar un pedido creado aunque se pierda la respuesta; no mostrar éxito ante una creación parcial.
- Comprobación de interfaz en móvil y escritorio, teclado, errores y estados vacíos.
- Build de producción y revisión de lint. Registrar por separado problemas previos del repositorio.

El MVP docente estará terminado cuando un invitado pueda comprar artículos reales de prueba, aprobar un pago simulado y comprobar en Dolibarr el registro comercial y la disminución correcta de stock. El rechazo del pago no debe disminuir existencias; repetir una solicitud no debe duplicar compras ni movimientos. Deben funcionar las restricciones de acceso, la recuperación ante fallos y la ejecución local documentada. No se requiere publicación.

## 9. Riesgos concretos y respuesta prevista

| Riesgo | Respuesta |
| --- | --- |
| Credenciales presentes en el código y almacenamiento del navegador | Revisar la clave existente, rotarla si es real, retirar secretos del frontend y usar credenciales de servidor con permisos mínimos |
| Diferencias entre versión, módulos o permisos de Dolibarr | Verificación técnica antes de comprometer las funciones dependientes |
| Catálogo sin imágenes, categorías o precios consistentes | Preparar datos y definir alternativas antes de diseñar filtros definitivos |
| Desajuste entre disponibilidad mostrada y stock real | Revalidar al enviar y definir si existe reserva; no prometer stock reservado sin soporte comprobado |
| Cliente o pedido creado parcialmente | Registrar el intento y sus identificadores para reconciliar y continuar sin recrear objetos |
| Duplicación por timeout o doble clic | Clave de intento única y control persistente en backend, además del bloqueo del botón |
| Impuestos o entrega sin reglas acordadas | Resolverlos antes del checkout; no derivarlos de valores de ejemplo |
| Aumento de alcance por pagos, facturación o logística | Tratarlos como entregables posteriores con aceptación y esfuerzo propios |

## 10. Decisiones del negocio y pendientes técnicos

| Tema | Decisión confirmada | Pendiente |
| --- | --- | --- |
| Acceso | Tienda pública, sin login para navegar | Separar permisos de administración |
| Comprador | Invitado; datos solamente al comprar | Campos mínimos del checkout |
| Pago | Se simula durante la compra | Definir escenarios aprobado/rechazado y guardar su resultado |
| Moneda | Bolivianos, código BOB, presentación Bs | Precio con/sin impuestos y reglas de redondeo |
| Inventario | La compra terminada debe restar stock; almacenes administrados en Dolibarr | Comprobar evento de descuento y evitar movimientos duplicados |
| Almacenes | Se consultarán mediante la API | Seleccionar explícitamente un almacén de pruebas; no elegir silenciosamente el primero |
| Catálogo | Supermercado y artículos en general | Disponibilidad de imágenes/categorías; empezar con artículos por unidad, y acordar después venta por peso |
| Cliente | Buscar por número de celular | Normalización, campos del ERP y resolución de coincidencias múltiples; no devolver información personal solamente por conocer un celular |
| Finalización | Compra directa, pago simulado y disminución de existencias | Estados y documentos comerciales concretos según la instancia |
| Entorno | Curso, pruebas y clases grabadas; sin producción | Verificar versión, módulos, permisos y datos de demostración |

**Entrega o retiro físico sigue pendiente:** la respuesta sobre retiro de stock define inventario, no entrega al comprador. Para las primeras demostraciones se propone omitir logística y costos de envío, sin dar por acordada una modalidad.

**Reposición desde la web:** se registra como ampliación docente después de completar la venta. Una orden de compra a proveedor no se tratará automáticamente como entrada de stock: se verificará el proceso de recepción o movimiento que corresponda en la instancia. La primera versión puede reponer existencias desde Dolibarr para preparar cada grabación.

## 11. Ampliaciones posteriores

| Ampliación | Alcance adicional |
| --- | --- |
| Cuentas de compradores | Registro, verificación, recuperación, direcciones e historial con acceso por propietario |
| Pagos electrónicos | Selección de proveedor, confirmación en servidor, webhooks, conciliación, reintentos y reembolsos |
| Facturación | Reglas comerciales y fiscales verificadas, emisión, documentos y tratamiento de anulaciones |
| Logística | Tarifas, zonas, asignación de entregas, estados y notificaciones |
| Crecimiento comercial | Promociones, favoritos, analítica y optimización del catálogo |

El siguiente entregable recomendado es verificar la API con lecturas y preparar un pequeño catálogo de supermercado de prueba. El orden de solicitudes para avanzar durante las clases está en [SECUENCIA_CLASES.md](./SECUENCIA_CLASES.md).
