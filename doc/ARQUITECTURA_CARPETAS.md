# Arquitectura de carpetas para el proyecto de enseñanza

## Enfoque

Se propone organizar el proyecto por responsabilidades: pantallas, componentes, estado compartido y comunicación con la API. Así se puede seguir el recorrido de una acción desde el clic del usuario hasta Dolibarr sin introducir demasiadas capas.

Se mantiene React con JavaScript y JSX. Esta es una estructura objetivo: los archivos nuevos se crean conforme avance cada clase. Este documento no mueve ni renombra archivos existentes.

## Estructura propuesta

```text
comercioElectronico/
├── doc/
│   ├── PLAN_DESARROLLO.md
│   ├── ARQUITECTURA_CARPETAS.md
│   └── API_DOLIBARR.md             # Contratos comprobados y ejemplos sin secretos
├── public/                        # Archivos públicos servidos sin importar desde JS
├── src/                           # Frontend React
│   ├── assets/                    # Imágenes y recursos importados por componentes
│   ├── components/
│   │   ├── ui/                    # Button, Input, Dialog... existentes
│   │   ├── shared/
│   │   │   ├── Loading.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── productos/
│   │   │   ├── ProductoCard.jsx
│   │   │   ├── ProductoLista.jsx
│   │   │   ├── ProductoFiltros.jsx
│   │   │   └── ProductoFormModal.jsx
│   │   ├── carrito/
│   │   │   ├── CarroCompra.jsx
│   │   │   ├── CarritoItem.jsx
│   │   │   └── CarritoResumen.jsx
│   │   └── auth/
│   │       └── LoginForm.jsx
│   ├── pages/                     # Una pantalla por ruta
│   │   ├── Inicio.jsx
│   │   ├── CatalogoProductos.jsx
│   │   ├── DetalleProducto.jsx
│   │   ├── Login.jsx
│   │   ├── Checkout.jsx
│   │   ├── ConfirmacionPedido.jsx
│   │   ├── NotFound.jsx
│   │   └── admin/
│   │       └── ProductosDolibarr.jsx
│   ├── layouts/                   # Estructura visual de las pantallas
│   │   ├── MainLayout.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx          # Relación entre URL, página y layout
│   │   └── ProtectedRoute.jsx     # Control de acceso en la interfaz
│   ├── context/
│   │   ├── AuthContext.jsx        # Sesión del usuario
│   │   └── CarritoContext.jsx     # Carrito compartido entre pantallas
│   ├── hooks/
│   │   ├── useProductos.js        # Consulta del catálogo
│   │   ├── useProductosDolibarr.js # Gestión administrativa existente
│   │   └── useCarrito.js          # Acceso al contexto del carrito
│   ├── services/
│   │   ├── apiClient.js           # Axios hacia el backend de la tienda
│   │   ├── authService.js
│   │   ├── productosService.js
│   │   └── pedidosService.js
│   ├── utils/
│   │   ├── formatoMoneda.js
│   │   └── validaciones.js        # Validaciones para ayudar al usuario
│   ├── lib/
│   │   └── utils.js               # Utilidades de los componentes UI existentes
│   ├── examples/                 # Ejercicios independientes de la tienda
│   ├── App.jsx                   # Providers y rutas
│   ├── main.jsx                  # Montaje de React
│   └── index.css                 # Tailwind y estilos globales
├── server/                       # Backend: se incorpora en una etapa posterior
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js             # Lectura y validación de configuración
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productosRoutes.js
│   │   │   └── pedidosRoutes.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productosController.js
│   │   │   └── pedidosController.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── productosService.js
│   │   │   └── pedidosService.js  # Coordina cliente, validación y creación del pedido
│   │   ├── integrations/
│   │   │   └── dolibarr/
│   │   │       ├── client.js      # Axios y autenticación hacia Dolibarr
│   │   │       ├── productosApi.js
│   │   │       ├── clientesApi.js
│   │   │       └── pedidosApi.js
│   │   ├── middleware/
│   │   │   ├── autenticar.js
│   │   │   ├── autorizar.js
│   │   │   └── manejarErrores.js
│   │   ├── repositories/
│   │   │   └── intentosPedidoRepository.js # Persistencia de intentos y referencias
│   │   ├── validators/
│   │   │   └── pedidoValidator.js
│   │   ├── app.js                # Configuración HTTP y registro de rutas
│   │   └── index.js              # Arranque del servidor
│   ├── tests/                    # Pruebas de reglas e integración del backend
│   ├── .env.example              # Nombres de variables, sin credenciales reales
│   └── package.json
├── tests/
│   └── e2e/                      # Recorrido completo de compra
├── .env.example                  # Configuración pública del frontend
├── .gitignore                    # Excluye .env, dependencias y archivos generados
├── package.json                  # Dependencias y comandos del frontend
├── vite.config.js
└── README.md                     # Cómo instalar y ejecutar el proyecto
```

No es necesario crear archivos vacíos para completar el árbol. Por ejemplo, las carpetas de pedidos y sus pruebas aparecen al desarrollar el checkout. Los nombres de los contratos de Dolibarr son propuestos y deben adaptarse a la API comprobada de la instancia.

## Cómo decidir dónde colocar el código

| Pregunta | Carpeta | Ejemplo |
| --- | --- | --- |
| ¿Representa una pantalla con URL propia? | `pages/` | Catálogo o checkout |
| ¿Es una parte visual reutilizable? | `components/` | Tarjeta de producto |
| ¿Define la estructura común de varias pantallas? | `layouts/` | Encabezado y contenido |
| ¿Varias pantallas necesitan compartir su estado? | `context/` | Carrito o sesión |
| ¿Reutiliza comportamiento de React? | `hooks/` | Cargar productos y gestionar loading/error |
| ¿Hace solicitudes HTTP desde React? | `src/services/` | Consultar catálogo en el backend |
| ¿Es una función sin interfaz ni estado de React? | `utils/` | Formatear un importe |
| ¿Recibe una solicitud HTTP del navegador? | `server/src/controllers/` | Recibir el checkout y devolver una respuesta |
| ¿Decide reglas comerciales o coordina operaciones? | `server/src/services/` | Revalidar precios y registrar el pedido |
| ¿Conoce rutas y campos específicos de Dolibarr? | `server/src/integrations/dolibarr/` | Consultar productos del ERP |
| ¿Guarda o recupera información auxiliar? | `server/src/repositories/` | Recuperar un intento de compra tras un timeout |

Los servicios del frontend y del backend comparten el nombre de la responsabilidad, pero tienen tareas distintas: el primero pide una operación; el segundo decide cómo ejecutarla de forma válida.

## Ejemplo: mostrar el catálogo

```text
AppRoutes.jsx
  → CatalogoProductos.jsx
    → useProductos.js
      → productosService.js (frontend)
        → apiClient.js
          → Backend: ruta → controlador → servicio
            → productosApi.js → client.js → Dolibarr
```

La respuesta vuelve por el mismo recorrido. El hook actualiza productos, carga o error; la página presenta el resultado mediante `ProductoCard`. El JSX de la tarjeta no necesita conocer las credenciales ni la URL de Dolibarr.

## Ejemplo: agregar un artículo al carrito

```text
ProductoCard → useCarrito → CarritoContext
                                  ├── Header: contador real
                                  ├── CarroCompra: artículos y cantidades
                                  └── Checkout: resumen de compra
```

Esta acción puede ejecutarse localmente. Al enviar el pedido, el backend vuelve a comprobar productos, importes y disponibilidad. Una validación del navegador ayuda al comprador, pero no reemplaza la validación del servidor.

## Cómo aprovechar los archivos actuales

| Archivo o carpeta actual | Destino propuesto | Acción al abordar esa etapa |
| --- | --- | --- |
| `src/componentes/` | `src/components/` | Unificar el nombre; actualizar imports en el mismo cambio |
| `src/components/ui/` | Mismo lugar | Conservar los controles existentes |
| `src/componentes/CarroCompra.jsx` | `src/components/carrito/CarroCompra.jsx` | Conservar interfaz y conectar al contexto |
| `src/componentes/dolibarr/ProductoFormModal.jsx` | `src/components/productos/ProductoFormModal.jsx` | Reutilizar formulario administrativo |
| `src/pages/ProductosDolibarr.jsx` | `src/pages/admin/ProductosDolibarr.jsx` | Separar gestión interna y catálogo público |
| `src/pages/Products.jsx` y `CatalogoProductos.jsx` | `src/pages/CatalogoProductos.jsx` | Consolidar una sola pantalla de catálogo real |
| `src/pages/ProductDetail.jsx` | `src/pages/DetalleProducto.jsx` | Sustituir datos de ejemplo por consulta real |
| `src/Moleculas/CardSkeleton.jsx` | `src/components/productos/ProductoCardSkeleton.jsx` | Agrupar junto a los componentes de producto |
| `src/shimer/pulse/` | `src/components/shared/` | Reutilizar estados vacíos y mensajes de error |
| `src/api/axiosClient.js` y clientes de `src/services/` | Cliente del frontend y cliente Dolibarr del backend | Unificar progresivamente y retirar credenciales del navegador |
| Páginas y componentes de ejercicios | `src/examples/` | Preservarlos como material docente con rutas de práctica separadas |

Mover archivos exige actualizar sus imports y comprobar la compilación. La migración se realiza por bloques pequeños para conservar una aplicación ejecutable después de cada clase.

## Orden recomendado para enseñar e implementar

1. **Componentes y layouts:** tarjeta de producto, catálogo y navegación con datos locales.
2. **Servicios y hooks:** consultar productos, presentar carga, error y resultados vacíos. La conexión directa actual puede servir para una demostración controlada con datos de prueba.
3. **Contexto y estado compartido:** conectar catálogo, carrito y contador del encabezado.
4. **Backend e integración:** introducir rutas, controladores y servicios con una consulta de productos; mover la conexión privilegiada a Dolibarr al servidor.
5. **Sesión y permisos:** unificar autenticación y proteger operaciones en servidor. `ProtectedRoute` mejora la navegación, pero no es una barrera de seguridad del backend.
6. **Checkout y pedidos:** validar datos, comprobar importes, registrar el cliente/pedido y evitar duplicados mediante persistencia de intentos.
7. **Pruebas y despliegue:** comprobar el recorrido de compra y documentar la ejecución del frontend y backend.

Para las primeras clases bastan `pages`, `components`, `layouts`, `routes`, `services` y `hooks`. Se agregan las demás carpetas al aparecer la necesidad. El árbol completo sirve como mapa del destino, no como requisito para empezar.

## Convenciones sencillas

- Componentes, páginas y contextos: `PascalCase.jsx`, por ejemplo `ProductoCard.jsx`.
- Hooks: prefijo `use`, por ejemplo `useProductos.js`.
- Servicios y funciones auxiliares: `camelCase.js`, por ejemplo `pedidosService.js`.
- Usar nombres de negocio en español y conservar los nombres técnicos establecidos (`hooks`, `services`, `components`).
- Mantener nombres e imports con las mismas mayúsculas para funcionar también en Linux.
- No duplicar en páginas las solicitudes que ya pertenecen a un servicio.
- No introducir Redux, microservicios ni una base de datos que replique Dolibarr para resolver el catálogo inicial. La persistencia auxiliar se incorpora cuando la sesión y la recuperación de pedidos la requieran.
- Guardar secretos únicamente en la configuración del servidor. El `.env.example` documenta nombres de variables; no contiene claves reales.
