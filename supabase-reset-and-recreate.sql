-- ============================================================================
-- RESET COMPLETO DATABASE - USA CON CAUTELA!
-- ============================================================================
-- ⚠️  ATTENZIONE: Questo script ELIMINA TUTTI I DATI!
-- 
-- USA SOLO SE:
-- - Sei su database di sviluppo/test
-- - Vuoi ricominciare da zero
-- - Hai fatto backup dei dati importanti
--
-- NON USARE su database di produzione con dati reali!
--
-- ISTRUZIONI:
-- 1. Fai BACKUP dei dati se necessario
-- 2. Vai su Supabase Dashboard > SQL Editor
-- 3. Esegui questo script
-- 4. Poi esegui supabase-schema-complete-production.sql
-- ============================================================================

DO $$ 
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '⚠️  INIZIO RESET DATABASE - Eliminazione dati in corso...';
  
  -- Disabilita temporaneamente i trigger
  SET session_replication_role = replica;
  
  -- Elimina tutte le policy RLS
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || quote_ident(r.tablename) || '_policy" ON ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
  
  -- Elimina tutte le viste
  FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public') LOOP
    EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.table_name) || ' CASCADE';
  END LOOP;
  
  -- Elimina tutte le funzioni personalizzate
  FOR r IN (
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION'
    AND routine_name NOT LIKE 'pg_%'
  ) LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.routine_name) || ' CASCADE';
  END LOOP;
  
  -- Elimina tutte le tabelle (CASCADE elimina anche foreign keys)
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
  
  -- Riabilita i trigger
  SET session_replication_role = DEFAULT;
  
  RAISE NOTICE '✅ Reset completato!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prossimi passi:';
  RAISE NOTICE '1. Esegui: supabase-schema-complete-production.sql';
  RAISE NOTICE '2. Configura il tuo super admin';
  RAISE NOTICE '3. Inserisci i dati';
END $$;

-- ============================================================================
-- VERIFICA PULIZIA
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count 
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname NOT LIKE 'pg_%';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STATO DATABASE DOPO PULIZIA:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tabelle rimaste: %', table_count;
  RAISE NOTICE 'Funzioni rimaste: %', function_count;
  RAISE NOTICE '';
  
  IF table_count > 0 OR function_count > 0 THEN
    RAISE NOTICE '⚠️  Ci sono ancora oggetti nel database';
    RAISE NOTICE 'Potrebbero essere tabelle di sistema o estensioni';
    RAISE NOTICE 'Puoi procedere con lo schema completo';
  ELSE
    RAISE NOTICE '✅ Database completamente pulito';
    RAISE NOTICE '✅ Pronto per nuovo schema';
  END IF;
  RAISE NOTICE '';
END $$;

