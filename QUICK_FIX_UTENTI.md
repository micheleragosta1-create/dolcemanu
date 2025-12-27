# 🔧 Quick Fix - Visualizzazione Utenti Dashboard

## Il Problema
La dashboard mostra solo il tuo account admin, ma ci sono altri utenti registrati che non appaiono.

## La Soluzione (3 minuti)

### 1️⃣ Apri Supabase Dashboard
- Vai su: https://app.supabase.com
- Seleziona il tuo progetto
- Clicca su **SQL Editor** nel menu laterale

### 2️⃣ Copia e Incolla questo SQL

```sql
-- Correzione funzione get_all_users()
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
  
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    COALESCE(ur.role, 'user')::VARCHAR as role,
    u.created_at
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Correzione funzione admin_count_users()
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

### 3️⃣ Esegui lo Script
- Clicca sul pulsante **Run** (o premi `Ctrl+Enter`)
- Dovresti vedere "Success. No rows returned"

### 4️⃣ Verifica il Risultato
Torna alla tua dashboard admin e ricarica la pagina. Ora dovresti vedere tutti gli utenti registrati!

## Test Veloce (Opzionale)

Per verificare quanti utenti ci sono realmente, esegui questa query:

```sql
-- Quanti utenti sono registrati?
SELECT COUNT(*) as utenti_totali FROM auth.users;

-- Test della funzione corretta
SELECT * FROM get_all_users();
```

## ✅ Fine!

I problemi sono risolti:
- ✅ La dashboard mostra tutti gli utenti (non solo admin)
- ✅ Il cambio ruolo aggiorna correttamente lo stato dell'interfaccia
- ✅ Il conteggio degli utenti è accurato

### Test Finale

Dopo aver applicato la correzione SQL e ricaricato la pagina:

1. Vai alla sezione **Utenti** nella dashboard admin
2. Dovresti vedere tutti gli account registrati
3. Prova a cambiare il ruolo di un utente
4. Il ruolo dovrebbe aggiornarsi immediatamente nella lista

---

📖 Per maggiori dettagli tecnici, consulta: `FIX_VISUALIZZAZIONE_UTENTI.md`

