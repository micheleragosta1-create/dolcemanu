# Scripts

Questa cartella contiene script di utilità per il progetto Onde di Cacao.

## 🔧 Script Disponibili

### `create-super-admin.js`

Crea un utente Super Admin per test in locale.

**Credenziali:**
- Email: `michele.ragota1@gmail.com`
- Password: `1234`
- Ruolo: `super_admin`

**Come usare:**

```bash
# Metodo 1: Usando npm
npm run create:admin

# Metodo 2: Direttamente con node
node scripts/create-super-admin.js
```

**Prerequisiti:**

1. Variabili d'ambiente configurate nel file `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key (opzionale ma consigliato)
   ```

2. Database Supabase configurato con le tabelle:
   - `auth.users` (automatico)
   - `user_roles` (esegui `supabase-roles.sql`)

**Cosa fa lo script:**

1. ✅ Verifica se l'utente esiste già
2. ✅ Crea l'utente se non esiste
3. ✅ Assegna il ruolo `super_admin` nella tabella `user_roles`
4. ✅ Verifica che tutto sia stato configurato correttamente

**Note:**

- Se usi solo `ANON_KEY`, potrebbe essere necessario confermare l'email manualmente
- Con `SERVICE_ROLE_KEY`, l'utente viene creato già confermato
- Lo script è idempotente: puoi eseguirlo più volte senza problemi

### `seed-review.js`

Popola il database con recensioni di esempio.

```bash
node scripts/seed-review.js
```

---

## 📝 Altri Script nel Root

Nel root del progetto troverai anche:

- `test-supabase-connection.js` - Testa la connessione a Supabase
- `test-orders-e2e.js` - Test end-to-end degli ordini
- `test-complete.js` - Test completo del sistema

Esegui con: `node <nome-script>.js`

