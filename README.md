# Tienda con React, Vite y Dolibarr

El catálogo consulta directamente la API REST de Dolibarr desde el navegador. No requiere un backend local.

1. Copia `.env.example` como `.env.local` y ajusta `VITE_DOLIBARR_URL` si la instancia usa otra dirección.
2. Inicia la aplicación con `npm run dev`.
3. Abre `/dolibarr/productos`, configura la API key o inicia sesión para obtener un token.
4. Regresa al catálogo; las categorías del sidebar y los productos se consultan directamente en Dolibarr.

Las llamadas desde el navegador incluyen la clave en la cabecera `DOLAPIKEY`, así que queda accesible para quien use el navegador. La instancia Dolibarr también debe permitir solicitudes CORS desde el origen de la aplicación. Para un catálogo público en producción, una clave administrativa no debe exponerse en el cliente.

El catálogo muestra artículos activos, precio TTC en Bs cuando Dolibarr lo devuelve y disponibilidad según `stock_reel`.

El almacén se elige desde el selector del Header y queda guardado en el navegador. El catálogo muestra solo artículos con stock en el almacén elegido; el detalle usa el mismo almacén y muestra stock no informado si Dolibarr no devuelve sus existencias.

## Comandos

- `npm run dev`: frontend de Vite.
- `npm run build`: compilación de producción del frontend.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
