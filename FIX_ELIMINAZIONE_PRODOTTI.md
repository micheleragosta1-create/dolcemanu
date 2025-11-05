# 🔧 Fix Eliminazione Prodotti - Guida Rapida

## ✅ Cosa è Stato Corretto

Il problema dell'eliminazione prodotti è stato risolto con tre modifiche:

1. **API DELETE migliorata** - Ora usa la Service Role Key per bypassare le policy RLS
2. **Auto-refresh prodotti** - La pagina shop ricarica automaticamente i prodotti quando torni alla tab
3. **Gestione errori migliorata** - Logging dettagliato e messaggi chiari

## 🚀 Come Completare la Configurazione

### Passaggio 1: Ottieni la Service Role Key

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Clicca su **Settings** (⚙️) nella sidebar sinistra
4. Vai in **API**
5. Scorri fino a **Project API keys**
6. Trova la riga **service_role** e clicca su "Copy" o "Reveal"

**⚠️ IMPORTANTE**: Questa chiave è SENSIBILE! Non condividerla mai e non committarla su git.

### Passaggio 2: Configura il File .env.local

Crea o modifica il file `.env.local` nella **root del progetto** (stessa cartella di `package.json`):

```bash
# Se il file non esiste, crealo
# Aggiungi o modifica queste righe:

NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AGGIUNGI QUESTA RIGA (con la tua Service Role Key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

### Passaggio 3: Verifica la Configurazione (Opzionale)

Esegui questo script per verificare che tutto sia configurato correttamente:

```bash
node scripts/verify-service-role.js
```

Lo script ti dirà:
- ✅ Se tutte le chiavi sono configurate correttamente
- ⚠️ Se manca qualche configurazione
- 🧪 Testerà la connessione a Supabase

### Passaggio 4: Riavvia il Server

**IMPORTANTE**: Dopo aver modificato `.env.local`, devi riavviare il server!

```bash
# Ferma il server con Ctrl+C
# Poi riavvialo
npm run dev
```

### Passaggio 5: Testa l'Eliminazione

1. Vai su `http://localhost:3000/admin`
2. Vai nella sezione **Prodotti**
3. Clicca su **Elimina** (🗑️) su un prodotto di test
4. Conferma l'eliminazione
5. Dovresti vedere:
   - ✅ Alert: "Prodotto eliminato con successo!"
   - Il prodotto scompare dalla lista nella dashboard
6. Vai su `http://localhost:3000/shop`
7. Il prodotto eliminato NON dovrebbe essere visibile

## 🐛 Risoluzione Problemi

### Problema: "new row violates row-level security policy"

**Soluzione**: La Service Role Key non è configurata o non è corretta
- Verifica di aver copiato la chiave completa
- Controlla che non ci siano spazi extra
- Riavvia il server dopo averla aggiunta

### Problema: Il prodotto viene eliminato ma riappare

**Soluzione**: Problema di cache
- Premi Ctrl+F5 per hard refresh
- Verifica su Supabase Dashboard > Table Editor se è stato eliminato
- Controlla i log nella console del browser (F12)

### Problema: "Only super admins can delete products"

**Soluzione**: Non hai il ruolo super_admin
1. Vai su Supabase Dashboard
2. Vai in **SQL Editor**
3. Esegui questa query (sostituisci con la tua email):

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'tua-email@example.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin';
```

4. Ricarica la pagina admin

## 📝 Cosa Controllare nei Log

Quando elimini un prodotto, dovresti vedere questi log nella console del browser (F12):

```
🗑️ Eliminazione prodotto: [id-del-prodotto]
✅ Prodotto eliminato con successo
🔄 Caricamento prodotti...
✅ Caricati X prodotti
```

Se vedi errori, copia il messaggio completo per il debug.

## 📚 File Modificati

Questi file sono stati modificati per risolvere il problema:

- ✅ `app/api/products/[id]/route.ts` - API DELETE con Service Role Key
- ✅ `components/admin/AdminProducts.tsx` - Gestione errori e reload
- ✅ `hooks/useSupabase.ts` - Auto-refresh prodotti
- ✅ `CONFIGURAZIONE_SERVICE_ROLE.md` - Guida dettagliata
- ✅ `scripts/verify-service-role.js` - Script di verifica

## 🔒 Nota sulla Sicurezza

La Service Role Key:
- ✅ È usata SOLO nel backend (API routes)
- ✅ NON è mai esposta al browser
- ✅ Bypassa tutte le policy RLS
- ✅ È già in `.gitignore` (non verrà committata)
- ⚠️ Se compromessa, ruotala immediatamente su Supabase Dashboard

## ✅ Checklist Completa

- [ ] Ho ottenuto la Service Role Key da Supabase
- [ ] Ho aggiunto SUPABASE_SERVICE_ROLE_KEY al file .env.local
- [ ] Ho verificato che non ci siano spazi extra nella chiave
- [ ] Ho riavviato il server (npm run dev)
- [ ] Ho testato l'eliminazione di un prodotto
- [ ] Il prodotto è scomparso dalla dashboard
- [ ] Il prodotto è scomparso dalla pagina shop
- [ ] Non vedo errori nella console

Se hai completato tutti i passaggi, l'eliminazione dei prodotti dovrebbe funzionare perfettamente! 🎉

## 🆘 Serve Aiuto?

Se hai ancora problemi:
1. Esegui `node scripts/verify-service-role.js` e condividi l'output
2. Controlla la console del browser (F12) quando provi a eliminare
3. Controlla i log del server nel terminale
4. Verifica su Supabase Dashboard > Table Editor se il prodotto è stato eliminato

