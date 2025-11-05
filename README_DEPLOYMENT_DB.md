# 🗄️ Deployment Database Produzione - Dolce Manu

## 📚 Panoramica File

Questo pacchetto contiene tutto il necessario per deployare lo schema del database in produzione.

### File Principali

1. **`supabase-schema-complete-production.sql`** ⭐
   - Script SQL completo production-ready
   - Include: tabelle, indici, funzioni, trigger, policy RLS
   - Esegui questo per creare il database da zero
   - ~800 righe di SQL ben documentato

2. **`DEPLOYMENT_PRODUZIONE_GUIDA.md`** 📖
   - Guida passo-passo completa (12 step)
   - Copre: setup progetto, configurazione, sicurezza, testing
   - Leggi PRIMA di fare il deployment

3. **`SQL_QUERIES_UTILI_PRODUZIONE.md`** 🔍
   - Raccolta di query SQL pronte all'uso
   - Gestione quotidiana database
   - Statistiche, monitoring, manutenzione

4. **`QUICK_FIX_ELIMINAZIONE.md`** ⚡
   - Fix veloce per il problema soft delete
   - Solo 3 passaggi per attivare soft delete
   
5. **`FIX_SOFT_DELETE.md`** 🔧
   - Guida completa al soft delete
   - Teoria, implementazione, troubleshooting

## 🚀 Quick Start - 3 Passi

### 1️⃣ Crea Progetto Supabase
- Vai su https://app.supabase.com
- New Project → Nome, Password, Region
- Attendi provisioning (2-3 min)

### 2️⃣ Esegui Schema SQL
- SQL Editor → New Query
- Copia `supabase-schema-complete-production.sql`
- Incolla ed esegui (Run)
- Verifica messaggio di successo ✅

### 3️⃣ Configura Ambiente
```bash
# .env.production o .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Settings > API
```

**Fatto!** Il database è pronto. 🎉

## 📋 Checklist Deployment Completo

Segui questa checklist per un deployment completo:

### Pre-Deployment
- [ ] Letto `DEPLOYMENT_PRODUZIONE_GUIDA.md` completamente
- [ ] Testato schema su database di staging/test
- [ ] Backup del database di sviluppo (se esiste)
- [ ] Creato progetto Supabase produzione

### Database Setup
- [ ] Eseguito `supabase-schema-complete-production.sql`
- [ ] Verificato creazione tabelle (6 tabelle)
- [ ] Verificato funzioni create (5+ funzioni)
- [ ] Verificato policy RLS (15+ policy)

### Configurazione
- [ ] Creato account super admin
- [ ] Impostato ruolo super_admin con SQL
- [ ] Configurato variabili ambiente (.env.production)
- [ ] Configurato Service Role Key

### Storage
- [ ] Creato bucket `product-images`
- [ ] Configurato policy upload (admin only)
- [ ] Configurato policy read (public)
- [ ] Testato upload immagine

### Sicurezza
- [ ] Configurato CORS (solo domini production)
- [ ] Abilitato rate limiting (se Supabase Pro)
- [ ] Configurato backup automatici (se Supabase Pro)
- [ ] Email SMTP personalizzato (raccomandato)

### Testing
- [ ] Test registrazione utente
- [ ] Test login e logout
- [ ] Test visualizzazione prodotti
- [ ] Test checkout completo
- [ ] Test area admin (CRUD prodotti)
- [ ] Test gestione ordini
- [ ] Test soft delete prodotti
- [ ] Test sicurezza (RLS)

### Deploy Applicazione
- [ ] Variabili ambiente configurate su Vercel/Netlify
- [ ] Deploy production eseguito
- [ ] Verificato funzionamento in produzione
- [ ] DNS configurato (se dominio custom)
- [ ] SSL/HTTPS attivo

### Post-Launch
- [ ] Monitoring attivo (Supabase Dashboard)
- [ ] Error tracking configurato (Sentry, etc)
- [ ] Analytics configurato (Google Analytics, etc)
- [ ] Performance monitoring attivo

## 📖 Guide Dettagliate

### Per Setup Iniziale
➡️ Leggi: **`DEPLOYMENT_PRODUZIONE_GUIDA.md`**

Copre:
- Creazione progetto Supabase
- Esecuzione schema SQL
- Configurazione completa
- Testing
- Go-live
- Monitoring

### Per Gestione Quotidiana
➡️ Usa: **`SQL_QUERIES_UTILI_PRODUZIONE.md`**

Include query per:
- Statistiche vendite
- Top prodotti
- Gestione utenti admin
- Aggiornamento stock
- Manutenzione database
- Export dati

### Per Risolvere Problemi
➡️ Consulta: **`FIX_SOFT_DELETE.md`** o **`QUICK_FIX_ELIMINAZIONE.md`**

## 🏗️ Struttura Database

### Tabelle Principali

**`products`** - Catalogo prodotti
- Soft delete (`deleted_at`)
- Badge (new, bestseller, discount)
- Filtri avanzati (tipo cioccolato, collezione)
- Formati box personalizzati

**`orders`** - Ordini clienti
- Stati: pending, processing, shipped, delivered, cancelled
- Dati spedizione completi
- Tracking Stripe

**`order_items`** - Dettaglio ordini
- Snapshot prodotto al momento ordine
- Quantità e prezzo storicizzati

**`user_roles`** - Sistema ruoli
- Ruoli: user, admin, super_admin
- Controllo accessi granulare

**`profiles`** - Anagrafica utenti
- Dati personali
- Indirizzi di spedizione

**`reviews`** - Recensioni prodotti (opzionale)
- Rating 1-5 stelle
- Moderazione admin

### Funzioni Chiave

- `soft_delete_product()` - Elimina prodotto (soft)
- `restore_product()` - Ripristina prodotto
- `get_user_role()` - Ottiene ruolo utente
- `is_admin()` - Verifica se admin
- `decrease_stock()` - Decrementa stock in modo sicuro

### Security (RLS)

✅ Tutti vedono prodotti attivi
✅ Solo admin modificano prodotti
✅ Solo super_admin eliminano prodotti
✅ Utenti vedono solo propri ordini
✅ Admin vedono tutti gli ordini
✅ Utenti gestiscono solo proprio profilo

## 🔄 Aggiornamenti Schema

Se devi aggiornare lo schema in futuro:

### 1. Crea Migration File
```sql
-- migrations/001_add_new_feature.sql
ALTER TABLE products ADD COLUMN new_field VARCHAR(100);
CREATE INDEX idx_products_new_field ON products(new_field);
```

### 2. Testa su Staging
```bash
# Esegui migration su database di test
# Verifica che funzioni
```

### 3. Applica su Production
```bash
# Backup PRIMA di applicare
# Esegui migration
# Verifica risultati
```

### 4. Aggiorna Documentazione
- Aggiorna questo README
- Aggiorna schema-complete-production.sql
- Annota nel changelog

## 🆘 Troubleshooting

### "Column deleted_at does not exist"
**Problema**: Schema non eseguito completamente
**Soluzione**: Ri-esegui `supabase-schema-complete-production.sql`

### "Permission denied for table products"
**Problema**: RLS policy non configurate
**Soluzione**: Verifica STEP 7-12 dello script SQL

### "Foreign key constraint violates"
**Problema**: Soft delete non funziona
**Soluzione**: Segui `QUICK_FIX_ELIMINAZIONE.md`

### Prodotti non visibili nello shop
**Problema**: Filtro deleted_at non applicato
**Soluzione**: Verifica query: `WHERE deleted_at IS NULL`

### Non riesco ad accedere a /admin
**Problema**: Ruolo non impostato
**Soluzione**: 
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'tua-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

## 📞 Supporto

### Documentazione
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/

### Community
- Supabase Discord: https://discord.supabase.com
- Stack Overflow: Tag [supabase]

### File di Supporto
- `DEPLOYMENT_PRODUZIONE_GUIDA.md` - Guida step-by-step
- `SQL_QUERIES_UTILI_PRODUZIONE.md` - Query pronte all'uso
- `FIX_SOFT_DELETE.md` - Troubleshooting eliminazioni

## 📊 Statistiche Schema

```
Tabelle:       6
Funzioni:      8+
Trigger:       5
Indici:        15+
Policy RLS:    15+
Viste:         2
```

## ✅ Verifica Installazione

Dopo aver eseguito lo script, verifica:

```sql
-- Conta tabelle
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Deve essere: 6

-- Verifica soft delete
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'deleted_at';
-- Deve restituire: deleted_at

-- Verifica funzioni
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name IN ('soft_delete_product', 'restore_product');
-- Deve restituire almeno 2 funzioni
```

## 🎯 Best Practices

### Backup
- ✅ Backup automatici giornalieri (Supabase Pro)
- ✅ Export manuale settimanale dati critici
- ✅ Test recovery mensile

### Performance
- ✅ VACUUM ANALYZE periodico
- ✅ Monitoring query lente
- ✅ Revisione indici trimestralmente

### Sicurezza
- ✅ Ruota Service Role Key se compromessa
- ✅ Audit log accessi admin
- ✅ Review policy RLS semestralmente
- ✅ Keep Supabase aggiornato

### Manutenzione
- ✅ Pulizia prodotti soft-deleted > 90gg
- ✅ Archiviazione ordini vecchi (> 2 anni)
- ✅ Ottimizzazione query lente
- ✅ Update statistiche tabelle

## 🚀 Prossimi Passi

Dopo deployment completato:

1. **Inserisci Prodotti**
   - Via dashboard admin o
   - Import SQL da sviluppo

2. **Testa Completamente**
   - Tutti i flussi utente
   - Area admin completa
   - Edge cases

3. **Configura Monitoring**
   - Error tracking
   - Performance monitoring
   - Business metrics

4. **Go Live!**
   - Annuncia lancio
   - Monitora prime 48h
   - Raccogli feedback

## 📝 Changelog

### v2.0 - Soft Delete (Corrente)
- ✅ Implementato soft delete prodotti
- ✅ Funzioni restore_product()
- ✅ Filtri deleted_at su tutte query
- ✅ Documentazione completa

### v1.0 - Schema Iniziale
- ✅ Tabelle base
- ✅ Policy RLS
- ✅ Sistema ruoli
- ✅ Funzioni utility

---

## 🎉 Ready to Deploy!

Hai tutto il necessario per deployare il database in produzione.

**Inizia qui**: `DEPLOYMENT_PRODUZIONE_GUIDA.md`

**Buon deployment! 🚀**

