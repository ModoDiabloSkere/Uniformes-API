-- Permitir cantidades negativas para ajustes de inventario.
-- entrada/salida siguen requiriendo cantidad > 0.
-- ajuste puede ser positivo (suma) o negativo (resta).

alter table inventory_entries drop constraint if exists inventory_entries_quantity_check;

alter table inventory_entries add constraint inventory_entries_quantity_check
  check (
    (type in ('entrada', 'salida') and quantity > 0) or
    (type = 'ajuste' and quantity <> 0)
  );
