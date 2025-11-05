-- ============================================================================
-- ALTERNATIVA: Policy Storage Semplificate (Solo se necessario)
-- ============================================================================
-- Se dopo aver impostato il ruolo admin ricevi ancora l'errore,
-- usa queste policy più permissive come soluzione temporanea.
--
-- ATTENZIONE: Queste policy permettono a TUTTI gli utenti autenticati
-- di caricare immagini. Usa solo temporaneamente per debugging.
--
-- ISTRUZIONI:
-- 1. Esegui prima supabase-setup-admin-user.sql
-- 2. Se ancora non funziona, esegui questo script
-- 3. Dopo aver risolto, considera di tornare alle policy restrittive
-- ============================================================================

-- ============================================================================
-- STEP 1: Rimuovi Policy Esistenti
-- ============================================================================

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Super admin can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete product images" ON storage.objects;

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy esistenti rimosse';
END $$;

-- ============================================================================
-- STEP 2: Policy PUBBLICA per Lettura (Tutti possono vedere)
-- ============================================================================

CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy lettura pubblica creata';
END $$;

-- ============================================================================
-- STEP 3: Policy SEMPLIFICATA per Upload (Tutti autenticati)
-- ============================================================================

-- VERSIONE SEMPLIFICATA: Qualsiasi utente autenticato può caricare
-- (Usa questa se la versione con controllo admin non funziona)

CREATE POLICY "Authenticated can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy upload semplificata creata (tutti autenticati)';
    RAISE NOTICE '⚠️  ATTENZIONE: Questa policy permette a tutti gli utenti autenticati di caricare';
END $$;

-- ============================================================================
-- STEP 4: Policy SEMPLIFICATA per Update (Tutti autenticati)
-- ============================================================================

CREATE POLICY "Authenticated can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy update semplificata creata';
END $$;

-- ============================================================================
-- STEP 5: Policy SEMPLIFICATA per Delete (Tutti autenticati)
-- ============================================================================

CREATE POLICY "Authenticated can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

DO $$ 
BEGIN
    RAISE NOTICE '✅ Policy delete semplificata creata';
END $$;

-- ============================================================================
-- STEP 6: Verifica Configurazione
-- ============================================================================

DO $$
DECLARE
  is_public BOOLEAN;
  policy_count INTEGER;
BEGIN
  SELECT public INTO is_public
  FROM storage.buckets
  WHERE id = 'product-images';
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%product images%';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ POLICY SEMPLIFICATE CONFIGURATE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Bucket pubblico: %', CASE WHEN is_public THEN '✅ Sì' ELSE '❌ No' END;
  RAISE NOTICE 'Policy configurate: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE:';
  RAISE NOTICE 'Queste policy permettono a TUTTI gli utenti autenticati';
  RAISE NOTICE 'di caricare/modificare/eliminare immagini.';
  RAISE NOTICE '';
  RAISE NOTICE 'Per maggiore sicurezza, dopo aver risolto il problema:';
  RAISE NOTICE '1. Esegui: supabase-fix-storage-public-access.sql';
  RAISE NOTICE '2. Assicurati che tutti gli admin abbiano il ruolo corretto';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test ora:';
  RAISE NOTICE '1. Vai su /admin';
  RAISE NOTICE '2. Prova a caricare una immagine';
  RAISE NOTICE '3. Dovrebbe funzionare!';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- QUERY DIAGNOSTICA (Opzionale)
-- ============================================================================

-- Verifica policy attive
SELECT 
  policyname,
  cmd as operazione,
  roles as ruoli_permessi
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%product%'
ORDER BY cmd, policyname;

-- ============================================================================
-- TORNARE ALLE POLICY RESTRITTIVE (Dopo aver risolto)
-- ============================================================================

-- Quando il problema è risolto e vuoi policy più sicure:
-- 1. Assicurati che tutti gli admin abbiano il ruolo in user_roles
-- 2. Esegui: supabase-fix-storage-public-access.sql
-- 3. Questo ripristinerà le policy con controllo ruoli admin

