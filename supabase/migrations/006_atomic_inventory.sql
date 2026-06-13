-- =============================================
-- Migración 006: Función atómica para ajustar inventario
-- Evita race conditions al actualizar stock concurrentemente.
-- =============================================

create or replace function adjust_inventory_quantity(
  p_material_id uuid,
  p_delta       numeric
)
returns table (material_id uuid, quantity_available numeric, updated_at timestamptz)
language sql
as $$
  update inventory
  set
    quantity_available = greatest(0, quantity_available + p_delta),
    updated_at         = now()
  where inventory.material_id = p_material_id
  returning
    inventory.material_id,
    inventory.quantity_available,
    inventory.updated_at;
$$;
