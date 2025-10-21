-- =====================================================
-- AGGIUNGI BADGE E FLAG PER I PRODOTTI
-- =====================================================
-- Questo script aggiunge i campi per badge visivi:
-- Novità, Bestseller, Sconti

-- 1. Aggiungi campo "Novità"
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

COMMENT ON COLUMN products.is_new IS 
'Badge "Novità" - viene impostato automaticamente su true quando si crea un nuovo prodotto';

-- 2. Aggiungi campo "Bestseller"
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;

COMMENT ON COLUMN products.is_bestseller IS 
'Badge "Bestseller" - da impostare manualmente per prodotti più venduti';

-- 3. Aggiungi campo "Sconto"
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT NULL;

COMMENT ON COLUMN products.discount_percentage IS 
'Percentuale di sconto (0-100). Se maggiore di 0, mostra il badge "In Sconto"';

-- 4. Crea indici per filtrare velocemente
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_percentage);

-- 5. Verifica le colonne
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('is_new', 'is_bestseller', 'discount_percentage')
ORDER BY ordinal_position;

-- ✅ Struttura aggiornata:
-- - products.is_new: Badge novità (auto-impostato su nuovi prodotti)
-- - products.is_bestseller: Badge bestseller (manuale)
-- - products.discount_percentage: Badge sconto con percentuale

