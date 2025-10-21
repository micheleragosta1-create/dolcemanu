-- =====================================================
-- AGGIUNGI COLLEZIONI E FILTRI AI PRODOTTI
-- =====================================================
-- Questo script aggiunge i campi per collezioni e tipo di cioccolato
-- per migliorare la categorizzazione e i filtri nello shop

-- 1. Aggiungi la colonna collezione
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS collection VARCHAR(100) DEFAULT NULL;

COMMENT ON COLUMN products.collection IS 
'Nome della collezione a cui appartiene il prodotto (es. "Costiera Amalfitana", "Tradizione Napoletana", etc.)';

-- 2. Aggiungi la colonna tipo di cioccolato
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS chocolate_type VARCHAR(50) DEFAULT NULL;

COMMENT ON COLUMN products.chocolate_type IS 
'Tipo di cioccolato: fondente, latte, bianco, ruby, misto. Usato per filtrare i prodotti nello shop.';

-- 3. Crea un indice per velocizzare le query sui filtri
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_chocolate_type ON products(chocolate_type);

-- 4. Verifica le colonne
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('collection', 'chocolate_type')
ORDER BY ordinal_position;

-- ✅ Struttura aggiornata:
-- - products.collection: Nome collezione (opzionale)
-- - products.chocolate_type: Tipo cioccolato (opzionale)
-- - Indici per query veloci

