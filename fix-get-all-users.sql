-- Script per correggere la funzione get_all_users()
-- Problema: La funzione attuale usa JOIN invece di LEFT JOIN,
-- quindi mostra solo gli utenti presenti nella tabella user_roles
-- Soluzione: Usare LEFT JOIN per mostrare tutti gli utenti da auth.users

-- Ricrea la funzione get_all_users() con LEFT JOIN
-- IMPORTANTE: Il campo viene chiamato 'user_id' per mantenere compatibilità
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Verifica che l'utente sia admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  
  -- Usa LEFT JOIN per mostrare tutti gli utenti, anche senza ruolo in user_roles
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::TEXT,
    COALESCE(ur.role, 'user')::VARCHAR as role,
    u.created_at
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corregge anche la funzione admin_count_users() per contare da auth.users
CREATE OR REPLACE FUNCTION admin_count_users()
RETURNS INTEGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;
  
  -- Conta tutti gli utenti da auth.users invece che solo da user_roles
  SELECT COUNT(*) INTO user_count FROM auth.users;
  RETURN user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica: Mostra il numero di utenti in auth.users vs user_roles
-- Esegui questa query per verificare quanti utenti mancano nella tabella user_roles:
-- SELECT COUNT(*) as utenti_auth FROM auth.users;
-- SELECT COUNT(*) as utenti_roles FROM user_roles;

