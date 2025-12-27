-- Fix per la funzione update_user_role
-- Problema: La funzione restituisce sempre TRUE anche se l'update fallisce

-- Ricrea la funzione con controllo dell'esito
CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Solo super_admin può modificare i ruoli
  IF get_user_role(auth.uid()) != 'super_admin' THEN
    RAISE EXCEPTION 'Access denied. Super admin only.';
  END IF;
  
  -- Non puoi modificare il tuo stesso ruolo
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own role';
  END IF;
  
  -- Verifica che il nuovo ruolo sia valido
  IF new_role NOT IN ('user', 'admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role: must be user, admin, or super_admin';
  END IF;
  
  -- Esegui l'INSERT/UPDATE
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = new_role, updated_at = NOW();
  
  -- Verifica quante righe sono state modificate
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  -- Log per debug (opzionale - puoi commentare dopo il test)
  RAISE NOTICE 'Update user role: user_id=%, new_role=%, rows_affected=%', 
    target_user_id, new_role, rows_affected;
  
  -- Restituisci TRUE solo se almeno una riga è stata modificata
  IF rows_affected > 0 THEN
    RETURN TRUE;
  ELSE
    RAISE EXCEPTION 'Failed to update user role: no rows affected';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test immediato: verifica che la funzione sia stata aggiornata
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'update_user_role' 
LIMIT 1;

