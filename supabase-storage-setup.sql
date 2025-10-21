-- Configurazione Supabase Storage per immagini prodotti
-- Questo script crea il bucket e le policy necessarie per gestire le immagini dei prodotti

-- NOTA: Il bucket deve essere creato manualmente tramite l'interfaccia Supabase o tramite codice
-- Questa configurazione gestisce le policy di accesso

-- 1. Crea il bucket "product-images" (se non esiste già)
-- Vai su: Supabase Dashboard > Storage > Create new bucket
-- Nome: product-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp

-- 2. Policy per permettere a tutti di leggere le immagini (pubbliche)
CREATE POLICY "Public Access for Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 3. Policy per permettere agli admin di caricare immagini
CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- 4. Policy per permettere agli admin di aggiornare immagini
CREATE POLICY "Admin can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- 5. Policy per permettere agli admin di eliminare immagini
CREATE POLICY "Admin can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- Verifica che le policy siano state create correttamente
SELECT policyname, tablename, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%product%';

