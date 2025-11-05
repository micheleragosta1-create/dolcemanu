-- ============================================================================
-- MIGRAZIONE: Aggiungi Soft Delete al Database Esistente
-- ============================================================================
-- Questo script aggiunge la funzionalità soft delete al database esistente
-- senza perdere i dati attuali.
--
-- ISTRUZIONI:
-- 1. Vai su Supabase Dashboard > SQL Editor
-- 2. Crea una nuova query
-- 3. Copia e incolla questo script
-- 4. Esegui (Run)
--
-- SICURO: Non elimina dati esistenti
-- ============================================================================

-- ============================================================================
-- STEP 1: Aggiungi colonna deleted_at a products (se non esiste)
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE products 
        ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        
        RAISE NOTICE '✅ Colonna deleted_at aggiunta a products';
    ELSE
        RAISE NOTICE '⏭️  Colonna deleted_at già esistente in products';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Crea indice per deleted_at (se non esiste)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

DO $$ 
BEGIN
    RAISE NOTICE '✅ Indice idx_products_deleted_at verificato';
END $$;

-- ============================================================================
-- STEP 3: Aggiungi funzione soft_delete_product (se non esiste)
-- ============================================================================

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

COMMENT ON FUNCTION soft_delete_product IS 'Elimina (soft) un prodotto nascondendolo ma mantenendo i dati per lo storico ordini';

DO $$ 
BEGIN
    RAISE NOTICE '✅ Funzione soft_delete_product creata';
END $$;

-- ============================================================================
-- STEP 4: Aggiungi funzione restore_product (se non esiste)
-- ============================================================================

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

COMMENT ON FUNCTION restore_product IS 'Ripristina un prodotto eliminato (soft delete)';

DO $$ 
BEGIN
    RAISE NOTICE '✅ Funzione restore_product creata';
END $$;

-- ============================================================================
-- STEP 5: Crea vista active_products (se non esiste)
-- ============================================================================

CREATE OR REPLACE VIEW active_products AS
SELECT * FROM products 
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_products IS 'Vista che mostra solo i prodotti attivi (non eliminati)';

DO $$ 
BEGIN
    RAISE NOTICE '✅ Vista active_products creata';
END $$;

-- ============================================================================
-- STEP 6: Aggiungi commento documentazione
-- ============================================================================

COMMENT ON COLUMN products.deleted_at IS 'Timestamp di eliminazione soft. NULL = prodotto attivo, NOT NULL = prodotto eliminato';

DO $$ 
BEGIN
    RAISE NOTICE '✅ Documentazione aggiunta';
END $$;

-- ============================================================================
-- STEP 7: Verifica finale
-- ============================================================================

DO $$
DECLARE
  has_column BOOLEAN;
  has_index BOOLEAN;
  function_count INTEGER;
BEGIN
  -- Verifica colonna
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'deleted_at'
  ) INTO has_column;
  
  -- Verifica indice
  SELECT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'products' 
    AND indexname = 'idx_products_deleted_at'
  ) INTO has_index;
  
  -- Conta funzioni
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname IN ('soft_delete_product', 'restore_product');
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MIGRAZIONE COMPLETATA CON SUCCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Verifica:';
  RAISE NOTICE '  - Colonna deleted_at: %', CASE WHEN has_column THEN '✅ Presente' ELSE '❌ Mancante' END;
  RAISE NOTICE '  - Indice deleted_at: %', CASE WHEN has_index THEN '✅ Presente' ELSE '❌ Mancante' END;
  RAISE NOTICE '  - Funzioni soft delete: % su 2', function_count;
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prossimi passi:';
  RAISE NOTICE '  1. Riavvia il server: npm run dev';
  RAISE NOTICE '  2. Prova a eliminare un prodotto dalla dashboard';
  RAISE NOTICE '  3. Verifica che funzioni correttamente';
  RAISE NOTICE '';
  
  IF NOT has_column OR NOT has_index OR function_count < 2 THEN
    RAISE EXCEPTION 'Migrazione non completata correttamente. Controlla i log sopra.';
  END IF;
END $$;

-- ============================================================================
-- FINE MIGRAZIONE
-- ============================================================================

-- Query di test (opzionale - puoi eseguirle separatamente per verificare)
-- SELECT * FROM products WHERE deleted_at IS NULL; -- Prodotti attivi
-- SELECT * FROM active_products; -- Usando la vista
-- SELECT soft_delete_product('uuid-prodotto'); -- Test soft delete
-- SELECT restore_product('uuid-prodotto'); -- Test restore

