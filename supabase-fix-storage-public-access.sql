-- ============================================================================
-- FIX: Policy Storage per Accesso Pubblico Immagini Prodotti
-- ============================================================================
-- Questo script risolve il problema delle immagini non visibili nello shop
-- in produzione, permettendo l'accesso pubblico alle immagini dei prodotti.
--
-- PROBLEMA: Le immagini sono visibili in dashboard (admin autenticato) 
--           ma non nello shop (utenti pubblici non autenticati)
--
-- SOLUZIONE: Configura policy corrette per Supabase Storage
--
-- ISTRUZIONI:
-- 1. Vai su Supabase Dashboard > SQL Editor
-- 2. Copia e incolla questo script
-- 3. Esegui (Run)
-- ============================================================================

-- ============================================================================
-- STEP 1: Verifica/Crea Bucket product-images
-- ============================================================================

-- Crea bucket se non esiste (dovrebbe già esistere)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) 
DO UPDATE SET public = true; -- Assicura che sia pubblico

DO $$ 
BEGIN
    RAISE NOTICE '✅ Bucket product-images verificato e impostato come pubblico';
END $$;

-- ============================================================================
-- STEP 2: Elimina Policy Esistenti (per evitare conflitti)
-- ============================================================================

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Super admin can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1a4ycq_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1a4ycq_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1a4ycq_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1a4ycq_3" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to product-images" ON storage.objects;

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy esistenti rimosse';
END $$;

-- ============================================================================
-- STEP 3: Crea Policy per Lettura Pubblica (TUTTI possono vedere)
-- ============================================================================

-- Tutti (anche non autenticati) possono VEDERE le immagini del bucket product-images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy lettura pubblica creata - Tutti possono vedere le immagini';
END $$;

-- ============================================================================
-- STEP 4: Crea Policy per Upload (solo ADMIN)
-- ============================================================================

-- Solo admin e super_admin autenticati possono CARICARE immagini
CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (
    -- Verifica che l'utente sia admin o super_admin
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  )
);

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy upload admin creata - Solo admin possono caricare';
END $$;

-- ============================================================================
-- STEP 5: Crea Policy per Update (solo ADMIN)
-- ============================================================================

-- Solo admin e super_admin possono AGGIORNARE immagini
CREATE POLICY "Admin can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  )
);

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy update admin creata';
END $$;

-- ============================================================================
-- STEP 6: Crea Policy per Delete (solo SUPER_ADMIN)
-- ============================================================================

-- Solo super_admin possono ELIMINARE immagini
CREATE POLICY "Super admin can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  )
);

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy delete super_admin creata';
END $$;

-- ============================================================================
-- STEP 7: Verifica Configurazione Finale
-- ============================================================================

DO $$
DECLARE
  is_public BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Verifica che il bucket sia pubblico
  SELECT public INTO is_public
  FROM storage.buckets
  WHERE id = 'product-images';
  
  -- Conta le policy create
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%product images%';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CONFIGURAZIONE STORAGE COMPLETATA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Verifica:';
  RAISE NOTICE '  - Bucket product-images: %', CASE WHEN is_public THEN '✅ PUBBLICO' ELSE '❌ PRIVATO (problema!)' END;
  RAISE NOTICE '  - Policy configurate: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '📝 Cosa è stato configurato:';
  RAISE NOTICE '  ✅ Tutti possono VEDERE le immagini (anche non autenticati)';
  RAISE NOTICE '  ✅ Solo ADMIN possono caricare/modificare immagini';
  RAISE NOTICE '  ✅ Solo SUPER_ADMIN possono eliminare immagini';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test:';
  RAISE NOTICE '  1. Apri il sito in incognito (non autenticato)';
  RAISE NOTICE '  2. Vai sullo shop';
  RAISE NOTICE '  3. Le immagini dei prodotti DEVONO essere visibili';
  RAISE NOTICE '';
  
  IF NOT is_public THEN
    RAISE WARNING 'ATTENZIONE: Il bucket non è pubblico! Esegui:';
    RAISE WARNING 'UPDATE storage.buckets SET public = true WHERE id = ''product-images'';';
  END IF;
  
  IF policy_count < 4 THEN
    RAISE WARNING 'ATTENZIONE: Mancano alcune policy (attese 4, trovate %). Riesegui lo script.', policy_count;
  END IF;
END $$;

-- ============================================================================
-- QUERY DI VERIFICA (Opzionali - esegui separatamente per debug)
-- ============================================================================

-- Verifica bucket
-- SELECT id, name, public FROM storage.buckets WHERE id = 'product-images';

-- Verifica policy
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' 
--   AND tablename = 'objects'
--   AND policyname LIKE '%product%';

-- Lista file nel bucket (richiede autenticazione admin)
-- SELECT * FROM storage.objects WHERE bucket_id = 'product-images' LIMIT 10;

