import { ChevronDown, Loader2, Warehouse } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAlmacen } from '../hooks/useAlmacen';

export default function SelectBox() {
  const { warehouses, selectedId, selectedWarehouse, loading, error, selectWarehouse, reloadWarehouses } = useAlmacen();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (event) => {
    selectWarehouse(event.target.value);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('buscar');
    nextParams.delete('page');
    nextParams.delete('coincidenciasCategorias');
    setSearchParams(nextParams);
  };

  return (
    <div className="flex min-w-0 items-center gap-2" title={error || undefined}>
      <Warehouse className="size-4 shrink-0 text-hiper-orange" aria-hidden="true" />
      <label className="sr-only" htmlFor="warehouse-select">Almacén</label>
      <div className="relative min-w-0">
        <select
          id="warehouse-select"
          aria-label="Seleccionar almacén"
          value={selectedId}
          onChange={handleChange}
          disabled={loading || warehouses.length === 0}
          className="h-10 w-full min-w-28 max-w-40 appearance-none truncate rounded-md border border-border bg-background py-2 pl-3 pr-8 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-hiper-orange disabled:opacity-60 sm:max-w-52"
        >
          {!selectedId && <option value="">Almacén</option>}
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.reference ? `${warehouse.reference} · ${warehouse.label}` : warehouse.label}
            </option>
          ))}
        </select>
        {loading
          ? <Loader2 className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
          : <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />}
      </div>
      {error && <button type="button" onClick={reloadWarehouses} className="sr-only">Reintentar carga de almacenes</button>}
      {selectedWarehouse && <span className="sr-only" aria-live="polite">Almacén seleccionado: {selectedWarehouse.label}</span>}
    </div>
  );
}