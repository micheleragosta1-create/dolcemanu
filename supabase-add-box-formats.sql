-- Aggiunge il campo box_formats alla tabella products
-- Questo campo conterrà i formati disponibili e i loro prezzi

-- Aggiungi la colonna box_formats come JSONB
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS box_formats JSONB DEFAULT NULL;

-- Esempio struttura box_formats:
-- {
--   "6": 18.90,
--   "9": 26.90,
--   "12": 34.90
-- }

-- Commenti sulla colonna
COMMENT ON COLUMN products.box_formats IS 
'Formati box disponibili con i rispettivi prezzi. 
Struttura: {"6": prezzo, "9": prezzo, "12": prezzo}. 
Se NULL o vuoto, il prodotto usa solo il prezzo base.';

-- Esempio di aggiornamento per un prodotto esistente
-- UPDATE products 
-- SET box_formats = '{"6": 18.90, "9": 26.90, "12": 34.90}'::jsonb
-- WHERE name LIKE '%Praline%';

-- Verifica che la colonna sia stata aggiunta
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'box_formats';

