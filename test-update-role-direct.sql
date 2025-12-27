-- Test diretto per verificare il problema con update_user_role
-- Esegui questi test nel SQL Editor di Supabase

-- 1. Verifica lo stato attuale della tabella user_roles
SELECT * FROM user_roles ORDER BY created_at DESC;

-- 2. Verifica tutti gli utenti da auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- 3. Verifica il tuo ruolo (sostituisci con il tuo user_id)
-- SELECT get_user_role(auth.uid());

-- 4. Test manuale di INSERT/UPDATE nella tabella user_roles
-- Sostituisci '57988ed8-df06-41cd-88b0-e29a8278271e' con l'ID dell'utente da testare
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('57988ed8-df06-41cd-88b0-e29a8278271e', 'admin')
-- ON CONFLICT (user_id) 
-- DO UPDATE SET role = 'admin', updated_at = NOW();

-- 5. Verifica se l'update è andato a buon fine
-- SELECT * FROM user_roles WHERE user_id = '57988ed8-df06-41cd-88b0-e29a8278271e';

-- 6. Testa la funzione update_user_role
-- SELECT update_user_role('57988ed8-df06-41cd-88b0-e29a8278271e'::uuid, 'admin');

-- 7. Verifica di nuovo dopo la funzione
-- SELECT * FROM user_roles WHERE user_id = '57988ed8-df06-41cd-88b0-e29a8278271e';

-- 8. Controlla le policy RLS sulla tabella user_roles
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_roles';

