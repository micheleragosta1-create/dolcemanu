-- Script per resettare la password dell'admin
-- Sostituisci 'TUO_USER_ID' con l'ID che conosci

-- OPZIONE 1: Se hai l'ID utente dalla tabella auth.users
-- Esegui questo nel SQL Editor di Supabase:

-- 1. Prima verifica l'utente esistente
SELECT id, email, raw_user_meta_data, created_at 
FROM auth.users 
WHERE id = 'TUO_USER_ID';

-- 2. Aggiorna l'email se necessario (usa l'email: michele.ragota1@gmail.com)
UPDATE auth.users 
SET email = 'michele.ragota1@gmail.com',
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"super_admin"'
    )
WHERE id = 'TUO_USER_ID';

-- 3. Assicurati che il ruolo sia impostato nella tabella user_roles
INSERT INTO user_roles (user_id, role)
VALUES ('TUO_USER_ID', 'super_admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin';

-- 4. Per resettare la password, devi usare il pannello di Supabase:
--    Authentication → Users → [Seleziona utente] → Reset Password
--    Oppure usa la funzione admin.createUser con il flag password_reset


-- OPZIONE 2: Se vuoi creare un nuovo utente (non puoi farlo solo con SQL)
-- Devi usare la Supabase Dashboard:
-- 1. Vai su Authentication → Users
-- 2. Clicca "Add User"
-- 3. Email: michele.ragota1@gmail.com
-- 4. Password: 1234
-- 5. Auto Confirm: YES
-- 6. Poi esegui questo SQL per assegnare il ruolo:

-- Sostituisci 'NUOVO_USER_ID' con l'ID del nuovo utente creato
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('NUOVO_USER_ID', 'super_admin');


-- OPZIONE 3: Query per trovare tutti gli utenti esistenti
SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC
LIMIT 10;

