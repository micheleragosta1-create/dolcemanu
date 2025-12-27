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

## ✅ Cosa Fare Ora

### 1️⃣ Applica lo Script SQL
Esegui lo script SQL aggiornato nel SQL Editor di Supabase (vedi sopra)

### 2️⃣ Deploy del Codice
```bash
git add .
git commit -m "Fix: Visualizzazione e aggiornamento ruoli utenti"
git push
```

### 3️⃣ Test con Debug
Dopo il deploy:

1. Apri la dashboard admin
2. **Apri la Console del browser** (F12 → Console)
3. Vai alla sezione Utenti
4. Prova a cambiare il ruolo di un utente
5. **Osserva i log nella console** per vedere cosa succede

## 🚨 Se il Problema Persiste

Ho aggiunto **logging dettagliato** per identificare il problema:

- Consulta `DEBUG_CAMBIO_RUOLO.md` per una guida completa al debug
- I log nella console del browser ti mostreranno esattamente dove si blocca
- Posso aiutarti a interpretare i log se necessario

## ✅ Risultati Attesi

Dopo aver applicato tutte le correzioni:
- ✅ La dashboard mostra tutti gli utenti (non solo admin)
- ✅ Il cambio ruolo aggiorna il database
- ✅ L'interfaccia si aggiorna dopo 500ms
- ✅ Il conteggio degli utenti è accurato

---

📖 **Guide disponibili**:
- `FIX_VISUALIZZAZIONE_UTENTI.md` - Documentazione tecnica completa
- `DEBUG_CAMBIO_RUOLO.md` - Guida al debug con log dettagliati

