-- ============================================================================
-- FIX FORZATO: Policy Storage per Upload Immagini
-- ============================================================================
-- Questo script FORZA la configurazione corretta eliminando TUTTO e ricreando
-- Usa questo se ricevi errori con gli altri script
-- ============================================================================

-- ============================================================================
-- STEP 1: Elimina TUTTE le policy su storage.objects
-- ============================================================================

DO $$ 
DECLARE
  pol RECORD;
BEGIN
  -- Loop su tutte le policy esistenti e eliminale
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    RAISE NOTICE 'Eliminata policy: %', pol.policyname;
  END LOOP;
  
  RAISE NOTICE '✅ Tutte le policy esistenti eliminate';
END $$;

-- ============================================================================
-- STEP 2: Assicura che il bucket sia pubblico
-- ============================================================================

-- Crea bucket se non esiste
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ 
BEGIN
  RAISE NOTICE '✅ Bucket product-images configurato come pubblico';
END $$;

-- ============================================================================
-- STEP 3: Crea policy SEMPLICE per lettura pubblica
-- ============================================================================

CREATE POLICY "allow_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

DO $$ 
BEGIN
  RAISE NOTICE '✅ Policy lettura pubblica creata';
END $$;

-- ============================================================================
-- STEP 4: Crea policy SEMPLICE per upload (autenticati)
-- ============================================================================

CREATE POLICY "allow_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

DO $$ 
BEGIN
  RAISE NOTICE '✅ Policy upload autenticati creata';
END $$;

-- ============================================================================
-- STEP 5: Crea policy SEMPLICE per update (autenticati)
-- ============================================================================

CREATE POLICY "allow_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

DO $$ 
BEGIN
  RAISE NOTICE '✅ Policy update autenticati creata';
END $$;

-- ============================================================================
-- STEP 6: Crea policy SEMPLICE per delete (autenticati)
-- ============================================================================

CREATE POLICY "allow_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

DO $$ 
BEGIN
  RAISE NOTICE '✅ Policy delete autenticati creata';
END $$;

-- ============================================================================
-- STEP 7: Verifica finale
-- ============================================================================

DO $$
DECLARE
  bucket_public BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Verifica bucket
  SELECT public INTO bucket_public
  FROM storage.buckets
  WHERE id = 'product-images';
  
  -- Conta policy
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE 'allow_%';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CONFIGURAZIONE STORAGE COMPLETATA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Bucket pubblico: %', CASE WHEN bucket_public THEN '✅ Sì' ELSE '❌ No' END;
  RAISE NOTICE 'Policy create: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '📝 Policy configurate:';
  RAISE NOTICE '  ✅ Lettura pubblica (tutti possono vedere)';
  RAISE NOTICE '  ✅ Upload per utenti autenticati';
  RAISE NOTICE '  ✅ Update per utenti autenticati';
  RAISE NOTICE '  ✅ Delete per utenti autenticati';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Ora testa:';
  RAISE NOTICE '  1. Ricarica il sito (hard refresh)';
  RAISE NOTICE '  2. Vai su /admin';
  RAISE NOTICE '  3. Prova a caricare una immagine';
  RAISE NOTICE '  4. Dovrebbe funzionare!';
  RAISE NOTICE '';
END $$;

-- Query verifica (opzionale)
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd, policyname;

