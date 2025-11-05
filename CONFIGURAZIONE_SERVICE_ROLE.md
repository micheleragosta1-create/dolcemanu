# Configurazione Service Role Key per Eliminazione Prodotti

## Problema Risolto

Quando eliminavi un prodotto dalla dashboard admin, il prodotto rimaneva visibile sia nella dashboard che nella pagina shop. 

### Causa del Problema

L'API DELETE utilizzava la chiave `ANON` di Supabase che rispetta le policy RLS (Row Level Security). La policy del database permetteva solo ai super_admin di eliminare prodotti, ma il backend non aveva i privilegi necessari.

### Soluzione Implementata

1. **Modificata l'API DELETE** (`app/api/products/[id]/route.ts`)
   - Ora usa la **Service Role Key** quando disponibile
   - La Service Role Key bypassa tutte le policy RLS
   - Mantiene compatibilità con la chiave ANON se la Service Role non è configurata

2. **Migliorata la gestione errori** (`components/admin/AdminProducts.tsx`)
   - Logging dettagliato per debug
   - Messaggi di errore più chiari
   - Reload automatico della lista prodotti dopo l'eliminazione

3. **Auto-refresh dei prodotti** (`hooks/useSupabase.ts`)
   - I prodotti vengono ricaricati quando torni alla pagina shop
   - Usa l'evento `visibilitychange` del browser

## Come Configurare la Service Role Key

### 1. Trova la Service Role Key su Supabase

1. Vai al tuo progetto Supabase
2. Clicca su **Settings** (ingranaggio) nella sidebar
3. Vai in **API**
4. Scorri fino a **Project API keys**
5. Copia la **service_role** key (NON la anon key)

⚠️ **ATTENZIONE**: La Service Role Key è una chiave **sensibile** che bypassa tutte le security rules. Non condividerla mai e non committarla su git!

### 2. Aggiungi al File .env.local

Crea o modifica il file `.env.local` nella root del progetto:

```bash
# Le tue chiavi esistenti
NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AGGIUNGI QUESTA RIGA con la tua Service Role Key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1b3Byb2dldHRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY...
```

### 3. Riavvia il Server di Sviluppo

Dopo aver aggiunto la chiave, **riavvia** il server:

```bash
# Ferma il server (Ctrl+C)
# Poi riavvialo
npm run dev
```

### 4. Verifica che Funzioni

1. Vai alla dashboard admin (`/admin`)
2. Prova a eliminare un prodotto
3. Controlla la console del browser per i log:
   - `🗑️ Eliminazione prodotto: [id]`
   - `✅ Prodotto eliminato con successo`
4. Vai alla pagina shop (`/shop`)
5. Il prodotto eliminato NON dovrebbe più essere visibile

## Risoluzione Problemi

### Errore: "new row violates row-level security policy"

**Causa**: La Service Role Key non è configurata o non è valida

**Soluzione**:
1. Verifica di aver copiato la chiave completa
2. Controlla che non ci siano spazi all'inizio o alla fine
3. Assicurati di aver riavviato il server dopo averla aggiunta
4. Controlla che la variabile si chiami esattamente `SUPABASE_SERVICE_ROLE_KEY`

### Il prodotto viene eliminato ma riappare

**Causa**: Cache del browser o problema di sincronizzazione

**Soluzione**:
1. Ricarica la pagina con Ctrl+F5 (hard refresh)
2. Apri la console del browser e verifica i log
3. Controlla su Supabase Dashboard > Table Editor se il prodotto è stato effettivamente eliminato dal database

### Il prodotto non viene eliminato dalla dashboard

**Causa**: Potresti non avere i permessi di super_admin

**Soluzione**:
1. Verifica il tuo ruolo nella tabella `user_roles` su Supabase
2. Esegui questa query SQL su Supabase per impostarti come super_admin:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'tua-email@example.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin';
```

## File Modificati

- ✅ `app/api/products/[id]/route.ts` - API DELETE con Service Role Key
- ✅ `components/admin/AdminProducts.tsx` - Gestione errori migliorata
- ✅ `hooks/useSupabase.ts` - Auto-refresh prodotti
- ✅ `.env.local.example` - Template configurazione

## Sicurezza

La Service Role Key ha **privilegi completi** sul database:
- ✅ Usa solo nel backend (API routes)
- ✅ Mai esporre al frontend
- ✅ Mai committare su git (già in `.gitignore`)
- ✅ Ruota la chiave se compromessa

## Prossimi Passi

Una volta configurata la Service Role Key, l'eliminazione dei prodotti funzionerà correttamente e i cambiamenti si rifletteranno immediatamente sia nella dashboard che nella pagina shop.

