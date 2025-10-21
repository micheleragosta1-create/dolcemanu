-- Script per aggiungere le nuove colonne alla tabella products
-- Per i nuovi filtri avanzati dello shop
-- Esegui questo nel SQL Editor di Supabase

-- Aggiungi le nuove colonne se non esistono
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS chocolate_type VARCHAR(20) CHECK (chocolate_type IN ('fondente', 'latte', 'bianco', 'ruby', 'misto'));

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS collection VARCHAR(100);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS box_format INTEGER CHECK (box_format IN (6, 9, 12));

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Crea indici per migliorare le performance dei filtri
CREATE INDEX IF NOT EXISTS idx_products_chocolate_type ON products(chocolate_type);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_box_format ON products(box_format);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_percentage) WHERE discount_percentage > 0;

-- Messaggio di conferma
SELECT 'Colonne prodotti aggiornate con successo!' as status;

