# 🔧 Fix Completo - Sistema Ruoli Utenti

## 🎯 Problema Identificato

Il sistema restituiva "Ruolo aggiornato con successo" ma:
1. ❌ L'interfaccia non si aggiornava
2. ❌ L'utente non aveva realmente i permessi dopo il login

## 🔍 Cause

1. **Funzione SQL difettosa**: `update_user_role()` restituiva sempre TRUE senza verificare l'esito
2. **Policy RLS errate**: Le policy RLS bloccavano INSERT/UPDATE sulla tabella `user_roles`
3. **Policy con FOR ALL**: Usava `FOR ALL USING` invece di policy separate per INSERT/UPDATE/DELETE

## ✅ Soluzione - Script da Eseguire su Supabase

### Passo 1: Apri Supabase SQL Editor

1. Vai su https://app.supabase.com
2. Seleziona il tuo progetto
3. Clicca su **SQL Editor**

### Passo 2: Esegui Questi Script in Ordine

#### Script 1: Fix Funzione get_all_users (già fatto, ma ricontrolla)

```sql
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  
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
```

#### Script 2: Fix Funzione admin_count_users (già fatto, ma ricontrolla)

```sql
CREATE OR REPLACE FUNCTION admin_count_users()
RETURNS INTEGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;
  
  SELECT COUNT(*) INTO user_count FROM auth.users;
  RETURN user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Script 3: Fix Funzione update_user_role (NUOVO - IMPORTANTE!)

```sql
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
  
  -- Log per debug
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
```

#### Script 4: Fix Policy RLS per user_roles (NUOVO - CRITICO!)

```sql
-- Drop tutte le policy esistenti
DROP POLICY IF EXISTS "User roles are viewable by admins" ON user_roles;
DROP POLICY IF EXISTS "User roles are manageable by super_admins" ON user_roles;
DROP POLICY IF EXISTS "User roles insertable by super_admins" ON user_roles;
DROP POLICY IF EXISTS "User roles updatable by super_admins" ON user_roles;
DROP POLICY IF EXISTS "User roles deletable by super_admins" ON user_roles;

-- SELECT: admin e super_admin possono vedere
CREATE POLICY "User roles are viewable by admins" ON user_roles
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- INSERT: solo super_admin
CREATE POLICY "User roles insertable by super_admins" ON user_roles
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'super_admin'
  );

-- UPDATE: solo super_admin
CREATE POLICY "User roles updatable by super_admins" ON user_roles
  FOR UPDATE 
  USING (get_user_role(auth.uid()) = 'super_admin')
  WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- DELETE: solo super_admin
CREATE POLICY "User roles deletable by super_admins" ON user_roles
  FOR DELETE USING (
    get_user_role(auth.uid()) = 'super_admin'
  );
```

### Passo 3: Verifica che gli Script Siano Eseguiti

```sql
-- Verifica le funzioni
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('get_all_users', 'admin_count_users', 'update_user_role')
ORDER BY routine_name;

-- Verifica le policy
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- Dovresti vedere:
-- - 4 policy per user_roles (SELECT, INSERT, UPDATE, DELETE)
-- - 3 funzioni (get_all_users, admin_count_users, update_user_role)
```

### Passo 4: Test Manuale

Testa la funzione update_user_role direttamente:

```sql
-- Sostituisci con un user_id reale da testare
SELECT update_user_role('57988ed8-df06-41cd-88b0-e29a8278271e'::uuid, 'admin');

-- Verifica che il ruolo sia cambiato
SELECT * FROM user_roles WHERE user_id = '57988ed8-df06-41cd-88b0-e29a8278271e';

-- Verifica con get_user_role
SELECT get_user_role('57988ed8-df06-41cd-88b0-e29a8278271e'::uuid);
```

## 🚀 Dopo aver Eseguito gli Script SQL

### Deploy del Codice Aggiornato

Il codice TypeScript è già stato committato. Assicurati che Vercel abbia fatto il deploy.

### Test Completo

1. **Ricarica la dashboard admin** (CTRL + Shift + R per hard refresh)
2. **Apri la Console** (F12)
3. Vai alla sezione **Utenti**
4. **Cambia il ruolo** di un utente
5. **Controlla i log** nella console

### Log Attesi

```
Cambio ruolo per utente: <uuid> nuovo ruolo: admin
Ruolo aggiornato nel DB, risultato: true
Aggiornando utente nello stato: <uuid> da user a admin
Ricaricamento lista utenti...
Utenti recuperati da get_all_users(): X utenti
```

### Test Login

1. Fai logout
2. Fai login con l'utente a cui hai cambiato il ruolo
3. L'utente dovrebbe vedere il pannello admin

## 🔍 Debug Se Non Funziona

### Test 1: Verifica il Tuo Ruolo

```sql
-- Sostituisci con il TUO user_id
SELECT get_user_role(auth.uid());
-- Dovrebbe restituire: 'super_admin'
```

Se non restituisce 'super_admin', aggiungi manualmente:

```sql
-- Sostituisci con la TUA email
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE email = 'michele.ragosta1@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

### Test 2: Verifica RLS

```sql
-- Disabilita temporaneamente RLS per testare
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Prova a cambiare un ruolo dalla dashboard

-- Riabilita RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
```

### Test 3: Controlla gli Errori

Nella console di Supabase (SQL Editor), guarda il tab **Logs** per vedere se ci sono errori quando provi a cambiare un ruolo.

## 📋 Checklist Finale

- [ ] ✅ Script 1 eseguito (get_all_users)
- [ ] ✅ Script 2 eseguito (admin_count_users)
- [ ] ✅ Script 3 eseguito (update_user_role)
- [ ] ✅ Script 4 eseguito (policy RLS)
- [ ] ✅ Verifiche eseguite (funzioni e policy esistono)
- [ ] ✅ Test manuale UPDATE funziona nel SQL Editor
- [ ] ✅ Dashboard mostra tutti gli utenti
- [ ] ✅ Cambio ruolo aggiorna l'interfaccia
- [ ] ✅ Login con nuovo ruolo funziona

## 🎯 Risultato Atteso

Dopo aver completato tutti i passi:

1. ✅ La dashboard mostra tutti gli utenti registrati
2. ✅ Puoi cambiare il ruolo degli utenti
3. ✅ L'interfaccia si aggiorna immediatamente
4. ✅ Gli utenti hanno realmente i permessi quando fanno login
5. ✅ I log mostrano tutto il processo correttamente

## 🆘 Se Ancora Non Funziona

Fammi vedere:
1. I log completi dalla console del browser
2. Il risultato di queste query:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_roles';
   SELECT * FROM user_roles;
   SELECT id, email FROM auth.users;
   ```

