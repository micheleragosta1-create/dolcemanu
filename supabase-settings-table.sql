-- =====================================================
-- TABELLA SETTINGS PER CONFIGURAZIONI SITO
-- =====================================================
-- Questa tabella memorizza le impostazioni del sito
-- come costo spedizioni, soglia spedizione gratuita, etc.

-- 1. Crea la tabella settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Inserisci valori di default
INSERT INTO site_settings (key, value, description) VALUES
  ('shipping_cost', '5.00', 'Costo spedizione standard in EUR'),
  ('free_shipping_threshold', '50.00', 'Soglia per spedizione gratuita in EUR'),
  ('shipping_enabled', 'true', 'Abilita/disabilita spedizioni')
ON CONFLICT (key) DO NOTHING;

-- 3. Crea indice per ricerche veloci
CREATE INDEX IF NOT EXISTS idx_settings_key ON site_settings(key);

-- 4. Abilita RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 5. Policy: tutti possono leggere le impostazioni
CREATE POLICY "Chiunque può leggere le impostazioni" ON site_settings
  FOR SELECT USING (true);

-- 6. Policy: solo admin possono modificare (tramite service role)
-- Le modifiche avvengono tramite API con service role key

-- 7. Trigger per updated_at automatico
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_settings_timestamp ON site_settings;
CREATE TRIGGER trigger_update_settings_timestamp
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_timestamp();

-- ✅ Verifica
SELECT * FROM site_settings;

