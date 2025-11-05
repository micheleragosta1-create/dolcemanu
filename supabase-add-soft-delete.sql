-- Aggiungi soft delete ai prodotti
-- Questo permette di "eliminare" prodotti senza perdere lo storico degli ordini

-- 1. Aggiungi la colonna deleted_at (se non esiste già)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Crea un indice per query più veloci
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

-- 3. Crea una vista per prodotti attivi (opzionale, per query più pulite)
CREATE OR REPLACE VIEW active_products AS
SELECT * FROM products 
WHERE deleted_at IS NULL;

-- 4. Funzione helper per soft delete
CREATE OR REPLACE FUNCTION soft_delete_product(product_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products 
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = product_uuid 
    AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Funzione helper per restore (ripristino)
CREATE OR REPLACE FUNCTION restore_product(product_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products 
  SET deleted_at = NULL,
      updated_at = NOW()
  WHERE id = product_uuid 
    AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Commento per documentazione
COMMENT ON COLUMN products.deleted_at IS 'Timestamp di eliminazione soft. NULL = prodotto attivo, NOT NULL = prodotto eliminato';
COMMENT ON FUNCTION soft_delete_product IS 'Elimina (soft) un prodotto nascondendolo ma mantenendo i dati per lo storico ordini';
COMMENT ON FUNCTION restore_product IS 'Ripristina un prodotto eliminato (soft delete)';

-- Query di verifica (esegui queste per testare)
-- SELECT * FROM products WHERE deleted_at IS NOT NULL; -- Prodotti eliminati
-- SELECT * FROM active_products; -- Prodotti attivi

