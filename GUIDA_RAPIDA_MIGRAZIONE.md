# ⚡ Guida Rapida - Risolvi Errore "deleted_at does not exist"

## 🚨 Il Tuo Errore

```
ERROR: 42703: column "deleted_at" does not exist
```

**Significato**: Hai già un database con le tabelle create dal vecchio schema (senza soft delete), e stai cercando di eseguire lo script completo che si aspetta che `deleted_at` esista o che le tabelle non esistano ancora.

## 🎯 Quale Script Devi Usare?

### ✅ OPZIONE 1: Migrazione (Consigliato per TUTTI) 

**Usa se:**
- Hai già dati nel database (prodotti, ordini, utenti)
- Vuoi mantenere tutti i dati esistenti
- Sei su database di sviluppo O produzione

**File da eseguire:**
```sql
supabase-migration-add-deleted-at.sql
```

**Cosa fa:**
- ✅ Aggiunge colonna `deleted_at` senza perdere dati
- ✅ Crea indici e funzioni
- ✅ Non tocca i dati esistenti
- ✅ Sicuro al 100%

**Come usarlo:**
1. Vai su Supabase Dashboard
2. SQL Editor > New Query
3. Copia e incolla **`supabase-migration-add-deleted-at.sql`**
4. Click **Run** ▶️
5. Vedi messaggio "✅ MIGRAZIONE COMPLETATA CON SUCCESSO!"

---

### ⚠️ OPZIONE 2: Reset Completo (Solo Dev/Test)

**Usa SOLO se:**
- ❌ NON hai dati importanti
- ❌ Sei su database di sviluppo/test
- ❌ Vuoi ricominciare da zero
- ❌ Hai fatto backup (se necessario)

**File da eseguire (in ordine):**
```sql
1. supabase-reset-and-recreate.sql    (elimina tutto)
2. supabase-schema-complete-production.sql  (ricrea da zero)
```

**Cosa fa:**
- ⚠️ ELIMINA TUTTI i dati (prodotti, ordini, utenti)
- ⚠️ ELIMINA TUTTE le tabelle
- ⚠️ Ricrea tutto da zero

**Come usarlo:**
1. **BACKUP** prima se necessario
2. SQL Editor > New Query
3. Esegui: `supabase-reset-and-recreate.sql`
4. New Query (o pulisci l'editor)
5. Esegui: `supabase-schema-complete-production.sql`
6. Ricrea il tuo super admin

---

## 🚀 Procedura Consigliata (Opzione 1)

### Step 1: Esegui Migrazione

```bash
# Su Supabase SQL Editor
1. Apri: supabase-migration-add-deleted-at.sql
2. Copia tutto il contenuto
3. Incolla nel SQL Editor
4. Click Run ▶️
```

### Step 2: Verifica Successo

Dovresti vedere questo output:
```
✅ MIGRAZIONE COMPLETATA CON SUCCESSO!

Verifica:
  - Colonna deleted_at: ✅ Presente
  - Indice deleted_at: ✅ Presente
  - Funzioni soft delete: 2 su 2

📝 Prossimi passi:
  1. Riavvia il server: npm run dev
  2. Prova a eliminare un prodotto dalla dashboard
  3. Verifica che funzioni correttamente
```

### Step 3: Test con Query

Esegui queste query per verificare:

```sql
-- Verifica che la colonna esista
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'deleted_at';

-- Deve restituire:
-- column_name | data_type
-- deleted_at  | timestamp with time zone

-- Vedi tutti i prodotti attivi
SELECT id, name, deleted_at 
FROM products 
WHERE deleted_at IS NULL;

-- Test funzione soft delete (non eseguire se non vuoi eliminare)
-- SELECT soft_delete_product('uuid-di-un-prodotto-test');
```

### Step 4: Riavvia il Server

```bash
# Ferma il server con Ctrl+C
# Poi riavvialo
npm run dev
```

### Step 5: Testa nell'App

1. Vai su `/admin` > Prodotti
2. Prova a eliminare un prodotto
3. Verifica che:
   - ✅ Non ci siano errori
   - ✅ Il prodotto scompaia dalla lista
   - ✅ Il prodotto non sia più visibile nello shop

---

## 🐛 Troubleshooting

### "ERROR: column products does not exist"

**Problema**: Le tabelle non sono state create

**Soluzione**: 
1. Prima esegui lo schema base (se database vuoto):
   ```sql
   supabase-schema-complete-production.sql
   ```
2. Poi esegui la migrazione:
   ```sql
   supabase-migration-add-deleted-at.sql
   ```

---

### "ERROR: relation products already exists"

**Problema**: Stai cercando di eseguire lo schema completo su database che ha già le tabelle

**Soluzione**: 
Usa la migrazione invece:
```sql
supabase-migration-add-deleted-at.sql
```

---

### "Migrazione completata ma ancora errore deleted_at"

**Problema**: Cache del codice o server non riavviato

**Soluzione**:
1. Riavvia il server: `npm run dev`
2. Hard refresh browser: `Ctrl+F5`
3. Verifica nel SQL Editor:
   ```sql
   SELECT * FROM products LIMIT 1;
   ```
   Dovresti vedere la colonna `deleted_at`

---

### Ancora errori dopo la migrazione?

**Verifica che la migrazione sia riuscita**:

```sql
-- Query di diagnostica completa
SELECT 
  'Colonna deleted_at' as verifica,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'deleted_at'
    ) THEN '✅ Presente' 
    ELSE '❌ Mancante - Riesegui migrazione'
  END as stato
UNION ALL
SELECT 
  'Indice idx_products_deleted_at',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'products' 
      AND indexname = 'idx_products_deleted_at'
    ) THEN '✅ Presente' 
    ELSE '❌ Mancante - Riesegui migrazione'
  END
UNION ALL
SELECT 
  'Funzione soft_delete_product',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'soft_delete_product'
    ) THEN '✅ Presente' 
    ELSE '❌ Mancante - Riesegui migrazione'
  END
UNION ALL
SELECT 
  'Funzione restore_product',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'restore_product'
    ) THEN '✅ Presente' 
    ELSE '❌ Mancante - Riesegui migrazione'
  END;
```

Se vedi ❌ da qualche parte, ri-esegui la migrazione.

---

## 📝 Riepilogo Veloce

### Database Esistente con Dati
```bash
✅ USA: supabase-migration-add-deleted-at.sql
❌ NON usare: supabase-reset-and-recreate.sql
❌ NON usare: supabase-schema-complete-production.sql
```

### Database Nuovo/Vuoto
```bash
✅ USA: supabase-schema-complete-production.sql
❌ NON usare gli altri script
```

### Database Dev/Test da Resettare
```bash
✅ USA (in ordine):
   1. supabase-reset-and-recreate.sql
   2. supabase-schema-complete-production.sql
```

---

## ✅ Checklist Post-Migrazione

Dopo aver eseguito la migrazione:

- [ ] Visto messaggio "✅ MIGRAZIONE COMPLETATA CON SUCCESSO!"
- [ ] Verificato colonna `deleted_at` con query SQL
- [ ] Riavviato il server (`npm run dev`)
- [ ] Testato eliminazione prodotto da dashboard
- [ ] Verificato che prodotto scompaia dallo shop
- [ ] Nessun errore nella console

---

## 🎉 Fatto!

Se hai seguito questi passi, il soft delete ora funziona correttamente sul tuo database!

**Prossimi passi:**
- Testa tutte le funzionalità dell'app
- Se va tutto bene, sei pronto per la produzione
- Usa `DEPLOYMENT_PRODUZIONE_GUIDA.md` per il deployment completo

---

## 🆘 Serve Aiuto?

Se hai ancora problemi:

1. **Verifica lo stato** con la query di diagnostica sopra
2. **Condividi l'output completo** dell'errore
3. **Specifica** quale script hai eseguito
4. **Indica** se hai dati importanti nel database

La migrazione è progettata per essere sicura e non perdere dati. Se qualcosa va storto, possiamo sempre ripristinare!

