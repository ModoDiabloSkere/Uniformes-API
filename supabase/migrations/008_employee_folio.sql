-- Folio interno de la empresa para cada empleado
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS folio text;
