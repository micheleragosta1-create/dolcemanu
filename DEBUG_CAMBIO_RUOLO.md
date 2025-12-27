# 🔍 Debug Cambio Ruolo Utenti

## Problema
Il cambio ruolo mostra il messaggio di successo ma l'interfaccia non si aggiorna.

## Correzioni Applicate

### 1. Logging Dettagliato
Ho aggiunto console.log in tutti i punti critici:
- `hooks/useAdmin.ts` - funzione `changeUserRole`
- `hooks/useAdmin.ts` - funzione `fetchAllUsers`
- `components/admin/AdminUsers.tsx` - funzione `handleRoleChange`

### 2. Delay nel Refresh
Aggiunto un ritardo di 500ms prima di ricaricare gli utenti per evitare race conditions.

### 3. SQL Corretto
La funzione SQL ora usa esplicitamente `u.id as user_id` per evitare ambiguità.

## 🧪 Test di Debug

### Passo 1: Riapplica lo Script SQL
Prima di tutto, assicurati che lo script SQL sia aggiornato nel database:

1. Vai su Supabase Dashboard → SQL Editor
2. Copia e incolla il contenuto aggiornato di `fix-get-all-users.sql`
3. Esegui lo script

### Passo 2: Deploy del Codice Aggiornato
```bash
# Committa le modifiche
git add .
git commit -m "Debug: Aggiunto logging e fix per cambio ruolo"
git push
```

### Passo 3: Testa con la Console del Browser
1. Apri la dashboard admin
2. Apri la **Console del Browser** (F12 → Console)
3. Vai alla sezione Utenti
4. Prova a cambiare il ruolo di un utente
5. **Osserva i log nella console**

### 📋 Cosa Cercare nei Log

Dovresti vedere una sequenza come questa:

```
handleRoleChange: userId= <uuid> newRole= admin
Cambio ruolo per utente: <uuid> nuovo ruolo: admin
Ruolo aggiornato nel DB, risultato: true
Aggiornando utente nello stato: <uuid> da user a admin
Risultato changeUserRole: { data: true, error: null }
Ruolo aggiornato con successo! (alert)
(dopo 500ms)
Ricaricamento lista utenti...
Utenti recuperati da get_all_users(): <N> utenti
Esempio primo utente: { user_id: "...", email: "...", role: "...", ... }
```

## 🚨 Possibili Problemi e Soluzioni

### Problema A: "Errore updateUserRole" nella console
**Causa**: La funzione SQL `update_user_role` fallisce  
**Verifica**:
```sql
-- Testa manualmente nel SQL Editor di Supabase
SELECT update_user_role('<user_id_qui>', 'admin');
```

**Soluzione**: Controlla i permessi e la funzione SQL `update_user_role`

### Problema B: L'utente recuperato ha ancora il ruolo vecchio
**Causa**: L'aggiornamento nel database non funziona  
**Verifica**:
```sql
-- Controlla direttamente nella tabella user_roles
SELECT * FROM user_roles WHERE user_id = '<user_id_qui>';
```

**Soluzione**: Il problema è nella funzione `update_user_role`, potrebbe essere necessario verificare:
- Se l'utente ha davvero permessi di super_admin
- Se la funzione `get_user_role(auth.uid())` restituisce il ruolo corretto

### Problema C: "Aggiornando utente nello stato" non appare
**Causa**: L'ID utente non corrisponde  
**Verifica**: Guarda i log e confronta l'userId usato per l'aggiornamento con l'ID nell'array users

**Soluzione**: Potrebbe essere un problema di formato UUID o di campo id vs user_id

### Problema D: fetchAllUsers restituisce dati vecchi
**Causa**: Cache o problema di sincronizzazione DB  
**Soluzione**: Aumenta il delay a 1000ms invece di 500ms

## 🔧 Test Manuale SQL

Esegui questi test nel SQL Editor di Supabase:

### Test 1: Verifica get_all_users()
```sql
-- Dovrebbe mostrare tutti gli utenti
SELECT * FROM get_all_users();
```

### Test 2: Verifica il tuo ruolo
```sql
-- Sostituisci con il tuo user_id
SELECT get_user_role('<tuo_user_id>');
```

### Test 3: Prova manualmente update_user_role
```sql
-- Sostituisci con un user_id di test
SELECT update_user_role('<user_id_di_test>', 'admin');

-- Verifica che sia cambiato
SELECT * FROM user_roles WHERE user_id = '<user_id_di_test>';
```

### Test 4: Verifica che l'utente sia in user_roles
```sql
-- Se un utente non ha un record in user_roles, crealo
INSERT INTO user_roles (user_id, role)
SELECT id, 'user' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles);
```

## 📊 Risultati Attesi

Dopo aver applicato tutte le correzioni:

1. ✅ I log mostrano chiaramente ogni passo del processo
2. ✅ L'aggiornamento dello stato locale funziona
3. ✅ Il database si aggiorna correttamente
4. ✅ Il refresh dopo 500ms mostra i dati aggiornati
5. ✅ L'interfaccia mostra il nuovo ruolo

## 📝 Prossimi Passi

1. **Esegui il test** seguendo i passi sopra
2. **Copia i log dalla console** del browser
3. **Mandami i log** se il problema persiste
4. Posso aiutarti a identificare esattamente dove si blocca il flusso

## 🎯 Quick Fix Alternativo

Se dopo tutti i test il problema persiste, possiamo provare un approccio diverso:

**Opzione 1**: Rimuovere completamente `fetchAllUsers()` e fare affidamento solo sull'aggiornamento locale
**Opzione 2**: Aggiungere un refresh manuale con un pulsante "Ricarica Lista"
**Opzione 3**: Utilizzare un meccanismo di polling per verificare quando il database è aggiornato

