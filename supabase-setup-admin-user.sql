-- ============================================================================
-- SETUP: Imposta Utente come Super Admin
-- ============================================================================
-- Questo script imposta il tuo account come super_admin nel database
-- di produzione, permettendoti di caricare immagini e gestire prodotti.
--
-- PROBLEMA: "new row violates row-level security policy"
-- CAUSA: Il tuo utente non ha il ruolo admin configurato in user_roles
--
-- ISTRUZIONI:
-- 1. PRIMA registrati sul sito di produzione (se non l'hai già fatto)
-- 2. Vai su Supabase Dashboard > SQL Editor
-- 3. MODIFICA la query sotto con la TUA email
-- 4. Esegui (Run)
-- ============================================================================

-- ============================================================================
-- STEP 1: Verifica che la tabella user_roles esista
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_roles'
    ) THEN
        RAISE EXCEPTION 'Tabella user_roles non esiste! Esegui prima lo schema completo.';
    END IF;
    
    RAISE NOTICE '✅ Tabella user_roles trovata';
END $$;

-- ============================================================================
-- STEP 2: Mostra tutti gli utenti registrati
-- ============================================================================

DO $$ 
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  RAISE NOTICE '';
  RAISE NOTICE '👥 Utenti registrati: %', user_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Lista utenti:';
END $$;

-- Mostra tutti gli utenti con la loro email
SELECT 
  id,
  email,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confermata'
    ELSE '⏳ Non confermata'
  END as stato_email
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 3: Imposta il tuo utente come SUPER_ADMIN
-- ============================================================================

-- ⚠️ IMPORTANTE: Sostituisci 'tua-email@example.com' con la TUA email!
-- Questa è l'email con cui ti sei registrato sul sito di produzione

INSERT INTO user_roles (user_id, role)
SELECT 
  id, 
  'super_admin' as role
FROM auth.users
WHERE email = 'tua-email@example.com'  -- <-- ⚠️ CAMBIA QUI CON LA TUA EMAIL!
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'super_admin',
  updated_at = NOW();

-- ============================================================================
-- STEP 4: Verifica che sia stato impostato
-- ============================================================================

DO $$ 
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count 
  FROM user_roles 
  WHERE role IN ('admin', 'super_admin');
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CONFIGURAZIONE ADMIN COMPLETATA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Admin/Super Admin configurati: %', admin_count;
  RAISE NOTICE '';
  
  IF admin_count = 0 THEN
    RAISE WARNING 'ATTENZIONE: Nessun admin configurato!';
    RAISE WARNING 'Verifica di aver modificato la email nello STEP 3';
  END IF;
END $$;

-- Mostra tutti gli admin configurati
SELECT 
  au.email,
  ur.role,
  ur.created_at as admin_da
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role IN ('admin', 'super_admin')
ORDER BY ur.role DESC, au.email;

-- ============================================================================
-- STEP 5: Test di verifica
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prossimi passi:';
  RAISE NOTICE '1. Fai logout dal sito';
  RAISE NOTICE '2. Fai login nuovamente';
  RAISE NOTICE '3. Vai su /admin';
  RAISE NOTICE '4. Prova a caricare una immagine';
  RAISE NOTICE '5. Dovrebbe funzionare! ✅';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- QUERY UTILI (Opzionali - esegui separatamente se serve)
-- ============================================================================

-- Vedi il tuo ruolo attuale
-- SELECT ur.role, au.email
-- FROM user_roles ur
-- JOIN auth.users au ON ur.user_id = au.id
-- WHERE au.email = 'tua-email@example.com';

-- Aggiungi un altro admin
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'altro-admin@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Rimuovi privilegi admin (torna user)
-- UPDATE user_roles 
-- SET role = 'user', updated_at = NOW()
-- WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'email@example.com');

