-- =====================================================
-- AGGIUNGI SUPPORTO PER IMMAGINI MULTIPLE AI PRODOTTI
-- =====================================================
-- Questo script aggiunge il campo per gestire multiple immagini per ogni prodotto
-- La prima immagine nell'array sarà quella principale mostrata nello shop

-- 1. Aggiungi la colonna per immagini multiple
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.images IS 
'Array di URL immagini prodotto. La prima è l''immagine principale. Esempio: ["url1", "url2", "url3"]';

-- 2. Migra i dati esistenti: se un prodotto ha già image_url, copialo come prima immagine
UPDATE products
SET images = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL 
  AND image_url != ''
  AND (images IS NULL OR images = '[]'::jsonb);

-- 3. Crea un indice GIN per query veloci sulle immagini
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);

-- 4. Crea una funzione helper per ottenere l'immagine principale
CREATE OR REPLACE FUNCTION get_main_product_image(product_images JSONB, fallback_url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Se ci sono immagini nell'array, restituisci la prima
  IF product_images IS NOT NULL AND jsonb_array_length(product_images) > 0 THEN
    RETURN product_images->>0;
  END IF;
  -- Altrimenti usa il fallback (image_url)
  RETURN fallback_url;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_main_product_image IS 
'Restituisce l''immagine principale del prodotto (prima nell''array o fallback)';

-- 5. Verifica le colonne
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('image_url', 'images')
ORDER BY ordinal_position;

-- ✅ Struttura aggiornata:
-- - products.image_url: Singola immagine (mantenuto per retrocompatibilità)
-- - products.images: Array di URL immagini (JSONB) - la prima è quella principale
-- - Funzione helper get_main_product_image() per ottenere sempre l'immagine principale




