
import { createContext, useContext, useEffect, useState } from 'react';
import { X } from 'lucide-react';

const DrawerContext = createContext(null);

function useDrawer() {
    const context = useContext(DrawerContext);

    if (!context) {
        throw new Error(
            'Los componentes del Drawer deben utilizarse dentro de <Drawer>'
        );
    }

    return context;
}

/**
 * Drawer principal
 */
export function Drawer({
    children,
    open,
    onOpenChange,
}) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const setOpen = (value) => {
        if (onOpenChange) {
            onOpenChange(value);
        }

        if (!isControlled) {
            setInternalOpen(value);
        }
    };

    // Evitar scroll del body cuando el drawer está abierto
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    // Cerrar con tecla ESC
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <DrawerContext.Provider
            value={{
                open: isOpen,
                setOpen,
            }}
        >
            {children}
        </DrawerContext.Provider>
    );
}


/**
 * Botón que abre el Drawer
 */
export function DrawerTrigger({
    children,
    asChild = false,
}) {
    const { setOpen } = useDrawer();

    if (asChild) {
        return (
            <div
                onClick={() => setOpen(true)}
                className="contents"
            >
                {children}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setOpen(true)}
        >
            {children}
        </button>
    );
}


/**
 * Contenido del Drawer
 */
export function DrawerContent({
    children,
    className = '',
}) {
    const { open, setOpen } = useDrawer();

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50">

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <aside
                className={`
          absolute right-0 top-0
          flex h-full
          w-full max-w-md
          flex-col
          bg-white
          shadow-2xl
          animate-in
          slide-in-from-right
          duration-300
          ${className}
        `}
                onClick={(event) => event.stopPropagation()}
            >
                {children}
            </aside>

        </div>
    );
}


/**
 * Header del Drawer
 */
export function DrawerHeader({
    children,
    className = '',
}) {
    return (
        <div
            className={`px-6 py-5 ${className}`}
        >
            {children}
        </div>
    );
}


/**
 * Título
 */
export function DrawerTitle({
    children,
    className = '',
}) {
    return (
        <h2
            className={`text-lg font-semibold text-gray-900 ${className}`}
        >
            {children}
        </h2>
    );
}


/**
 * Descripción
 */
export function DrawerDescription({
    children,
    className = '',
}) {
    return (
        <p
            className={`mt-1 text-sm text-gray-500 ${className}`}
        >
            {children}
        </p>
    );
}


/**
 * Footer
 */
export function DrawerFooter({
    children,
    className = '',
}) {
    return (
        <div
            className={`mt-auto px-6 py-5 ${className}`}
        >
            {children}
        </div>
    );
}


/**
 * Botón para cerrar
 */
export function DrawerClose({
    children,
    asChild = false,
}) {
    const { setOpen } = useDrawer();

    if (asChild) {
        return (
            <div
                onClick={() => setOpen(false)}
                className="contents"
            >
                {children}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setOpen(false)}
        >
            {children}
        </button>
    );
}


/**
 * Botón X predeterminado
 */
export function DrawerCloseButton() {
    const { setOpen } = useDrawer();

    return (
        <button
            type="button"
            onClick={() => setOpen(false)}
            className="
        absolute right-4 top-4
        rounded-full
        p-2
        text-gray-500
        transition
        hover:bg-gray-100
        hover:text-gray-900
      "
            aria-label="Cerrar"
        >
            <X size={20} />
        </button>
    );
}
