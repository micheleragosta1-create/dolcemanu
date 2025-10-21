-- Fix per le policy di Supabase Storage
-- Risolve l'errore "violates row-level security policy"
-- 
-- ISTRUZIONI:
-- 1. Vai su Supabase Dashboard > SQL Editor
-- 2. Copia e incolla tutto questo file
-- 3. Clicca "Run" per eseguire
--
-- Questo script rimuove le policy restrittive e crea policy più permissive
-- che permettono a tutti gli utenti autenticati di gestire le immagini dei prodotti

-- ============================================
-- STEP 1: Rimuovi policy esistenti
-- ============================================

DROP POLICY IF EXISTS "Public Access for Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;

-- Rimuovi anche eventuali altre policy sul bucket
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- ============================================
-- STEP 2: Crea nuove policy funzionanti
-- ============================================

-- Policy 1: Lettura pubblica
-- Chiunque può VEDERE le immagini (necessario per il sito pubblico)
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy 2: Upload per utenti autenticati
-- Tutti gli utenti loggati possono CARICARE immagini
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Policy 3: Update per utenti autenticati
-- Tutti gli utenti loggati possono MODIFICARE immagini
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Policy 4: Delete per utenti autenticati
-- Tutti gli utenti loggati possono ELIMINARE immagini
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ============================================
-- STEP 3: Verifica che le policy siano attive
-- ============================================

SELECT 
  policyname,
  cmd AS operation,
  roles AS "applies_to"
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%product%'
ORDER BY policyname;

-- ============================================
-- OPZIONALE: Verifica il tuo ruolo utente
-- ============================================

-- Esegui questa query per vedere se sei admin
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.id = auth.uid();

-- Se la query sopra non ti mostra come 'admin', 
-- decommenta e esegui la query sotto per aggiungerti:

/*
INSERT INTO user_roles (user_id, role, created_at, updated_at)
VALUES (
  auth.uid(), 
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin', updated_at = NOW();
*/

-- ============================================
-- VERIFICA FINALE
-- ============================================

-- Controlla che il bucket esista e sia pubblico
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE name = 'product-images';

-- Dovresti vedere:
-- - id: un UUID
-- - name: product-images
-- - public: true (IMPORTANTE!)
-- - created_at: data di creazione

-- Se public = false, esegui:
/*
UPDATE storage.buckets 
SET public = true 
WHERE name = 'product-images';
*/

