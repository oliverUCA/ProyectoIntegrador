import { NavLink } from 'react-router-dom';
import { ArrowRight, Boxes, CodeXml, House, ListChecks, LogIn, Mail, PanelLeft, ShoppingBag, SlidersHorizontal, TextCursorInput } from 'lucide-react';

// Enlaces agrupados por sección
const secciones = [
  {
    titulo: 'Tienda',
    enlaces: [
      { to: '/', label: 'Inicio', icono: House },
      { to: '/productos', label: 'Productos', icono: ShoppingBag },
      { to: '/contacto', label: 'Contacto', icono: Mail },
      { to: '/dolibarr/productos', label: 'Productos Dolibarr', icono: Boxes },
    ],
  },
  {
    titulo: 'Ejercicios',
    enlaces: [
      { to: '/uncontrolinput', label: 'Input no controlado', icono: TextCursorInput },
      { to: '/controlledInput', label: 'Input controlado', icono: SlidersHorizontal },
      { to: '/formulario', label: 'Formulario', icono: ListChecks },
    ],
  },
  {
    titulo: 'Cuenta',
    enlaces: [{ to: '/login', label: 'Iniciar sesión', icono: LogIn }],
  },
];

// Estilo dinámico para resaltar el enlace activo
const getLinkClassName = ({ isActive }) =>
  `group flex min-h-12 items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hiper-orange md:justify-start ${
    isActive
      ? 'bg-hiper-navy text-white shadow-sm'
      : 'text-muted-foreground hover:bg-hiper-orange-light hover:text-hiper-navy dark:hover:bg-white/10 dark:hover:text-white'
  }`;

export function Sidebar() {
  return (
    <aside className="flex w-20 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-6 md:w-64 md:px-5">
      <div className="mb-8 flex items-center justify-center gap-3 md:justify-start md:px-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-hiper-orange text-white shadow-sm">
          <PanelLeft className="size-5" aria-hidden="true" />
        </span>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-sidebar-foreground">Mi espacio</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Panel de navegación</p>
        </div>
      </div>

      <nav aria-label="Menú lateral" className="space-y-7">
        {secciones.map((seccion) => (
          <div key={seccion.titulo}>
            <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:px-3 md:text-left md:text-xs">
              {seccion.titulo}
            </p>
            <ul className="space-y-2">
              {seccion.enlaces.map(({ to, label, icono: Icono }) => (
                <li key={to}>
                  <NavLink to={to} title={label} className={getLinkClassName}>
                    {({ isActive }) => (
                      <>
                        <Icono className="size-5 shrink-0" aria-hidden="true" />
                        <span className="sr-only md:not-sr-only md:flex-1">{label}</span>
                        {isActive && <ArrowRight className="hidden size-4 shrink-0 text-white/70 md:block" aria-hidden="true" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto hidden pt-10 md:block">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <CodeXml className="mb-3 size-5 text-hiper-orange" aria-hidden="true" />
          <p className="text-xs font-semibold text-sidebar-foreground">Aprende practicando</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Explora los ejercicios y desarrolla tus habilidades.</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
