
import { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';

import {
  User,
  ShoppingCart,
  Search,
  LogOut,
} from 'lucide-react';

import logo from '../assets/HiperLogo.png';

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
} from '../components/ui/drawer';

import CarroCompra from '../componentes/CarroCompra';
import CheckoutModal from '../componentes/CheckoutModal';
import { useCarrito } from '../hooks/useCarrito';
import Categorias from '../componentes/Categorias';
import SelectBox from '../componentes/SelectBox';
import LoginForm from '../componentes/LoginForm';
import { useAuth } from '../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';


export function Header() {
  const { cantidadTotal } = useCarrito();
  const { token, user, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSearch = searchParams.get('buscar') || '';

  const buscarProductos = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get('buscar') || '').trim();
    const params = new URLSearchParams(searchParams);
    params.delete('categoria');
    params.delete('page');
    params.delete('coincidenciasCategorias');
    if (search) params.set('buscar', search);
    else params.delete('buscar');
    navigate({ pathname: '/productos', search: params.toString() ? `?${params}` : '' });
  };

  return (

    <header className="w-full bg-white shadow-sm">


      {/* =====================================================
          BARRA PRINCIPAL
      ====================================================== */}

      <div className="container mx-auto flex items-center gap-6 px-4 py-4">


        {/* ===================================================
            LOGO
        ==================================================== */}

        <div className="shrink-0">

          <NavLink to="/">

            <img
              src={logo}
              alt="Hipermaxi"
              className="h-14 w-auto object-contain"
            />

          </NavLink>

        </div>

        <SelectBox />


        {/* ===================================================
            BUSCADOR
        ==================================================== */}

        <div className="flex flex-1 justify-center">

          <form onSubmit={buscarProductos} className="relative w-full max-w-2xl">
            <input
              type="text"
              key={currentSearch}
              name="buscar"
              defaultValue={currentSearch}
              placeholder="¿Qué producto estás buscando?"
              aria-label="Buscar productos en el almacén seleccionado"
              className="
                w-full
                rounded-full
                border
                border-gray-300
                bg-gray-50
                py-3
                pl-5
                pr-14
                text-sm
                text-gray-700
                outline-none
                transition
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-200
              "
            />

            <button
              type="submit"
              aria-label="Buscar productos"
              className="
                absolute
                right-1
                top-1/2
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-orange-500
                text-white
                transition
                hover:bg-orange-600
              "
            >

              <Search size={20} />

            </button>

          </form>

        </div>


        {/* ===================================================
            ICONOS
        ==================================================== */}

        <div className="flex items-center gap-5">


          {/* =================================================
              USUARIO
          ================================================== */}

          <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              aria-label={token ? 'Abrir cuenta' : 'Iniciar sesión'}
              className="
              flex
              flex-col
              items-center
              text-gray-700
              transition
              hover:text-orange-500
            "
            >
              <User size={25} strokeWidth={1.8} aria-hidden="true" />
              <span className="mt-1 hidden text-xs sm:block">{token ? user?.login || 'Mi cuenta' : 'Iniciar sesión'}</span>
            </button>
            <DialogContent className="max-w-md p-6">
              {token ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Mi cuenta</DialogTitle>
                    <DialogDescription>Sesión iniciada como {user?.login || 'usuario'}.</DialogDescription>
                  </DialogHeader>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setAccountOpen(false);
                    }}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-hiper-navy px-4 text-sm font-medium text-white hover:bg-hiper-navy-dark"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <LoginForm variant="dialog" onSuccess={() => setAccountOpen(false)} />
              )}
            </DialogContent>
          </Dialog>


          {/* =================================================
              CARRITO
          ================================================== */}

          <Drawer open={carritoOpen} onOpenChange={setCarritoOpen}>

            {/* Botón que abre el Drawer */}

            <DrawerTrigger asChild>

              <button
                type="button"
                className="
                  relative
                  flex
                  flex-col
                  items-center
                  text-gray-700
                  transition
                  hover:text-orange-500
                "
              >

                <ShoppingCart
                  size={25}
                  strokeWidth={1.8}
                />


                {/* Cantidad */}

                {cantidadTotal > 0 && <span
                  className="
                    absolute
                    -right-2
                    -top-2
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-orange-500
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  {cantidadTotal > 99 ? '99+' : cantidadTotal}
                </span>}


                <span className="mt-1 hidden text-xs sm:block">
                  Carrito
                </span>

              </button>

            </DrawerTrigger>


            {/* Contenido */}

            <DrawerContent>

              <CarroCompra onPagar={() => setCheckoutOpen(true)} />

            </DrawerContent>

          </Drawer>

          <CheckoutModal
            open={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            onPagoConfirmado={() => setCarritoOpen(false)}
          />

        </div>

      </div>


      {/* =====================================================
          MENÚ NARANJA
      ====================================================== */}

      <nav aria-label="Categorías de productos" className="bg-orange-500">
        <div className="container mx-auto px-4">
          <Categorias variant="horizontal" />
        </div>
      </nav>

    </header>
  );
}


export default Header;
