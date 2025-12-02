-- =====================================================
-- CONFIGURAZIONE BOX PERSONALIZZATA
-- =====================================================
-- Questo script aggiunge il supporto per "Configura la tua box"
-- dove i clienti possono scegliere praline singole per creare box da 8 o 16

-- 1. Aggiungi campo per identificare praline disponibili per box personalizzata
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_box_praline BOOLEAN DEFAULT false;

COMMENT ON COLUMN products.is_box_praline IS 
'Se true, questo prodotto è una pralina singola disponibile per la composizione di box personalizzate';

-- 2. Aggiungi prezzo per singola pralina (usato nel configuratore box)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS single_price DECIMAL(10, 2) DEFAULT NULL;

COMMENT ON COLUMN products.single_price IS 
'Prezzo della singola pralina quando venduta nel configuratore box';

-- 3. Crea tabella per configurazione box personalizzate
CREATE TABLE IF NOT EXISTS box_configurations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  size INTEGER NOT NULL CHECK (size IN (8, 16)),
  base_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Inserisci configurazioni di default per box da 8 e 16
INSERT INTO box_configurations (size, base_price, description, image_url) 
VALUES 
  (8, 24.90, 'Box da 8 praline personalizzata', '/images/box-8-praline.jpg'),
  (16, 44.90, 'Box da 16 praline personalizzata', '/images/box-16-praline.jpg')
ON CONFLICT DO NOTHING;

-- 5. Crea indici per query veloci
CREATE INDEX IF NOT EXISTS idx_products_is_box_praline ON products(is_box_praline) WHERE is_box_praline = true;

-- 6. Abilita RLS per box_configurations
ALTER TABLE box_configurations ENABLE ROW LEVEL SECURITY;

-- Policy: tutti possono leggere le configurazioni attive
CREATE POLICY "Lettura pubblica box_configurations" ON box_configurations
  FOR SELECT USING (is_active = true);

-- Policy: solo admin può modificare
CREATE POLICY "Admin può gestire box_configurations" ON box_configurations
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email IN ('michele.ragosta1@gmail.com', 'admin@ondedicacao.com')
    )
  );

-- 7. Verifica le modifiche
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('is_box_praline', 'single_price')
ORDER BY ordinal_position;

-- ✅ Struttura aggiornata:
-- - products.is_box_praline: Identifica praline per box personalizzata
-- - products.single_price: Prezzo singola pralina
-- - box_configurations: Configurazioni box (8/16 praline con prezzi)


