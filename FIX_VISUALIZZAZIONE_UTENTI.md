# Fix Visualizzazione Utenti Dashboard

## Problema Identificato

La dashboard admin mostra solo l'account admin e non tutti gli utenti registrati.

### Causa del Problema

Sono state identificate **due funzioni SQL** con problemi:

1. **`get_all_users()`**: Usa un `JOIN` (inner join) invece di un `LEFT JOIN` tra le tabelle `auth.users` e `user_roles`
2. **`admin_count_users()`**: Conta solo gli utenti nella tabella `user_roles` invece che tutti gli utenti in `auth.users`

Questo significa che vengono visualizzati **solo** gli utenti che hanno un record esplicito nella tabella `user_roles` (come il tuo admin), mentre gli utenti normali che si registrano attraverso il sito non vengono automaticamente aggiunti a questa tabella.

### Dove si trova il codice

**Funzione `get_all_users()`**:
- **Database**: Funzione SQL nel database Supabase
- **File locale corrotto**: `supabase-schema-complete-production.sql` (righe 280-303)
- **File locale corretto**: `supabase-roles.sql` (righe 138-161)
- **Chiamata in TypeScript**: `lib/supabase.ts` (riga 376-379)

**Funzione `admin_count_users()`**:
- **Database**: Funzione SQL nel database Supabase
- **File locale corrotto**: `supabase-schema-complete-production.sql` (righe 306-319)
- **Chiamata in TypeScript**: `lib/supabase.ts` (riga 382-389)

## Soluzione

### Passo 1: Applicare la correzione SQL al database

1. **Accedi al Dashboard di Supabase**:
   - Vai su https://app.supabase.com
   - Seleziona il tuo progetto
   - Vai su **SQL Editor**

2. **Esegui lo script di correzione**:
   - Copia il contenuto del file `fix-get-all-users.sql`
   - Incollalo nell'editor SQL
   - Clicca su **Run**

### Passo 2: Verifica la correzione

Dopo aver eseguito lo script, esegui questa query per verificare:

```sql
-- Verifica quanti utenti ci sono in auth.users
SELECT COUNT(*) as utenti_totali FROM auth.users;

-- Verifica quanti utenti hanno un record in user_roles
SELECT COUNT(*) as utenti_con_ruolo FROM user_roles;

-- Testa la funzione corretta
SELECT * FROM get_all_users();
```

La funzione `get_all_users()` ora dovrebbe restituire **tutti** gli utenti registrati, anche quelli che non hanno un record in `user_roles` (verranno mostrati con ruolo 'user').

### Passo 3: Testa la dashboard

1. **Ricarica la pagina della dashboard admin**
2. Vai alla sezione **Utenti**
3. Ora dovresti vedere tutti gli account registrati

## Dettagli Tecnici

### Correzione 1: get_all_users()

**Versione Corretta (con LEFT JOIN)**:
```sql
SELECT 
  u.id,
  u.email::TEXT,
  COALESCE(ur.role, 'user')::VARCHAR as role,
  u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
```

✅ Mostra **tutti** gli utenti da `auth.users`
✅ Assegna ruolo 'user' di default se non presente in `user_roles`

**Versione Corrotta (con JOIN)**:
```sql
SELECT 
  ur.user_id,
  au.email::VARCHAR,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC;
```

❌ Mostra **solo** gli utenti presenti in `user_roles`
❌ Gli utenti normali non vengono visualizzati

### Correzione 2: admin_count_users()

**Versione Corretta**:
```sql
SELECT COUNT(*) INTO user_count FROM auth.users;
```

✅ Conta **tutti** gli utenti registrati

**Versione Corrotta**:
```sql
SELECT COUNT(*) INTO user_count FROM user_roles;
```

❌ Conta **solo** gli utenti in `user_roles`
❌ Il conteggio è impreciso

## File Modificati

1. ✅ **fix-get-all-users.sql** - Script di correzione da eseguire
2. ✅ **supabase-schema-complete-production.sql** - Corretto per futuri deployment
3. ✅ **hooks/useAdmin.ts** - Corretto aggiornamento stato dopo cambio ruolo

## Verifica Aggiuntiva (Opzionale)

Se vuoi assicurarti che tutti gli utenti esistenti abbiano un record in `user_roles`, puoi eseguire:

```sql
-- Inserisci automaticamente tutti gli utenti senza ruolo
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'user'
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL;
```

Questo creerà record in `user_roles` per tutti gli utenti che non ne hanno uno.

## Prevenzione Futura

La correzione è stata applicata anche al file `supabase-schema-complete-production.sql`, quindi se in futuro viene rieseguito lo schema completo, la funzione sarà già corretta.

## Test Rapido

Dopo aver applicato le correzioni, verifica:

1. ✅ La dashboard mostra tutti gli utenti
2. ✅ Gli utenti senza ruolo esplicito vengono mostrati come 'user'
3. ✅ Le statistiche nella dashboard sono corrette
4. ✅ Puoi modificare i ruoli degli utenti (se sei super_admin)
5. ✅ Il cambio ruolo aggiorna immediatamente la lista utenti

## Fix Aggiuntivo - Aggiornamento Stato Cambio Ruolo

### Problema
Dopo aver applicato la correzione SQL, il cambio ruolo non aggiornava lo stato dell'interfaccia.

### Causa
La funzione `changeUserRole` in `useAdmin.ts` cercava `user.user_id`, ma dopo la correzione SQL gli utenti hanno il campo `id` (da `auth.users`).

### Soluzione
✅ Aggiornato `hooks/useAdmin.ts` per gestire entrambi i campi (`id` e `user_id`)

Questo fix è già incluso nel repository, quindi una volta fatto il deploy non serve alcuna azione aggiuntiva.

