-- Tabla para cotizaciones manuales guardadas a nombre de un cliente
CREATE TABLE IF NOT EXISTS quotations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      uuid REFERENCES clients(id) ON DELETE SET NULL,
  temporada_label text,
  fecha          date,
  items          jsonb NOT NULL DEFAULT '[]',
  total          numeric NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quotations_client_id_idx ON quotations(client_id);
CREATE INDEX IF NOT EXISTS quotations_created_at_idx ON quotations(created_at DESC);
