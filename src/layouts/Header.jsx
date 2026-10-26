
import { NavLink } from 'react-router-dom';

import {
  User,
  ShoppingCart,
  Search,
} from 'lucide-react';

import logo from '../assets/HiperLogo.png';

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
} from '../components/ui/drawer';

import CarroCompra from '../componentes/CarroCompra';
import { useCarrito } from '../hooks/useCarrito';
import Categorias from '../componentes/Categorias';
import SelectBox from '../componentes/SelectBox';


export function Header() {
  const { cantidadTotal } = useCarrito();

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

          <div className="relative w-full max-w-2xl">

            <input
              type="text"
              placeholder="¿Qué producto estás buscando?"
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
              type="button"
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

          </div>

        </div>


        {/* ===================================================
            ICONOS
        ==================================================== */}

        <div className="flex items-center gap-5">


          {/* =================================================
              USUARIO
          ================================================== */}

          <button
            type="button"
            className="
              flex
              flex-col
              items-center
              text-gray-700
              transition
              hover:text-orange-500
            "
          >

            <User
              size={25}
              strokeWidth={1.8}
            />

            <span className="mt-1 hidden text-xs sm:block">
              Mi cuenta
            </span>

          </button>


          {/* =================================================
              CARRITO
          ================================================== */}

          <Drawer>

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

              <CarroCompra />

            </DrawerContent>

          </Drawer>

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
