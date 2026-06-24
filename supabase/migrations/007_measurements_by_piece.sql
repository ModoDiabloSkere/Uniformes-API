-- Tallas y notas por pieza de confección
ALTER TABLE measurements
  ADD COLUMN IF NOT EXISTS chaleco_talla numeric(6,2),
  ADD COLUMN IF NOT EXISTS chaleco_notas text,
  ADD COLUMN IF NOT EXISTS blusa_talla   numeric(6,2),
  ADD COLUMN IF NOT EXISTS blusa_notas   text,
  ADD COLUMN IF NOT EXISTS pantalon_talla numeric(6,2),
  ADD COLUMN IF NOT EXISTS pantalon_notas text;
