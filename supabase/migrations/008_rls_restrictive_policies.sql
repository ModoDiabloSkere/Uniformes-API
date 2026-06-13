-- Eliminar políticas permisivas que dan acceso total a usuarios autenticados.
-- El backend usa service_role (bypassa RLS) y retiene acceso completo.
-- Solo landing_contacts mantiene INSERT para anon (formulario público).
-- app_users mantiene SELECT propio para el usuario.

drop policy if exists "Authenticated can read activity_log"         on activity_log;
drop policy if exists "Service role full access"                    on app_users;
drop policy if exists "Authenticated access contacts"               on client_contacts;
drop policy if exists "Authenticated users can delete clients"      on clients;
drop policy if exists "Authenticated users can insert clients"      on clients;
drop policy if exists "Authenticated users can read clients"        on clients;
drop policy if exists "Authenticated users can update clients"      on clients;
drop policy if exists "Authenticated access employees"              on employees;
drop policy if exists "Authenticated access inventory"              on inventory;
drop policy if exists "Authenticated access inventory_entries"      on inventory_entries;
drop policy if exists "Solo autenticados pueden leer"               on landing_contacts;
drop policy if exists "Authenticated access materials"              on materials;
drop policy if exists "Authenticated access measurements"           on measurements;
drop policy if exists "Authenticated access order_items"            on order_items;
drop policy if exists "Authenticated access orders"                 on orders;
drop policy if exists "Authenticated access production_pieces"      on production_pieces;
drop policy if exists "Authenticated access po_items"               on purchase_order_items;
drop policy if exists "Authenticated access purchase_orders"        on purchase_orders;
drop policy if exists "Authenticated access suppliers"              on suppliers;
drop policy if exists "Authenticated access recipes"                on uniform_recipes;
