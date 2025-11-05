# 🚀 Guida Deployment in Produzione - Dolce Manu

## 📋 Checklist Pre-Deployment

Prima di eseguire lo script sul database di produzione, assicurati di:

- [ ] Aver creato un nuovo progetto Supabase per la produzione
- [ ] Aver fatto il backup del database di sviluppo (se esiste)
- [ ] Aver testato lo script su un database di staging/test
- [ ] Avere accesso come Owner al progetto Supabase di produzione
- [ ] Aver letto completamente questa guida

## 🗄️ Step 1: Crea il Progetto Supabase di Produzione

### 1.1 Crea Nuovo Progetto

1. Vai su https://app.supabase.com
2. Clicca su **"New Project"**
3. Compila i dati:
   - **Name**: `dolce-manu-production` (o come preferisci)
   - **Database Password**: Genera una password sicura e SALVALA
   - **Region**: Scegli la più vicina ai tuoi utenti (es. `Europe (Frankfurt)` per Italia)
   - **Pricing Plan**: Free o Pro (consigliato Pro per produzione)
4. Clicca **"Create new project"**
5. Attendi il provisioning (2-3 minuti)

### 1.2 Configura Impostazioni Progetto

1. Vai in **Settings** > **General**
2. Annota:
   - **Reference ID** (serve per API)
   - **Project URL** (es. `https://xxxxx.supabase.co`)

## 📝 Step 2: Esegui lo Script Schema Completo

### 2.1 Apri SQL Editor

1. Nel progetto Supabase vai su **SQL Editor**
2. Clicca su **+ New query**
3. Dai un nome: `Schema Initialization - Production`

### 2.2 Copia e Incolla lo Script

1. Apri il file `supabase-schema-complete-production.sql`
2. Copia **TUTTO** il contenuto (è uno script unico)
3. Incolla nel SQL Editor di Supabase

### 2.3 Personalizza il Super Admin

**IMPORTANTE**: Prima di eseguire, cerca lo **STEP 15** nello script.

Trova questa sezione:
```sql
-- STEP 15: INSERISCI SUPER ADMIN (PERSONALIZZA!)
-- INSERT INTO user_roles (user_id, role) 
-- SELECT id, 'super_admin' 
-- FROM auth.users 
-- WHERE email = 'tua-email@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

**NON modificare ancora**, lo farai dopo aver creato il tuo account.

### 2.4 Esegui lo Script

1. Clicca su **Run** (o premi `Ctrl+Enter` / `Cmd+Enter`)
2. Attendi il completamento (circa 30-60 secondi)
3. Verifica che compaia il messaggio:
   ```
   ✅ Schema installato con successo!
   Tabelle create: 6
   Funzioni create: 5+
   Policy RLS create: 15+
   ```

### 2.5 Verifica Installazione

Esegui questa query nel SQL Editor:
```sql
-- Verifica tabelle
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Dovrebbe mostrare:
-- orders
-- order_items
-- products
-- profiles
-- reviews
-- user_roles
```

## 👤 Step 3: Crea il Tuo Account Admin

### 3.1 Registrati via Applicazione

1. Apri la tua applicazione connessa al database di produzione
2. Vai sulla pagina di registrazione (`/auth`)
3. Registrati con **LA TUA EMAIL** che vuoi usare come super admin
4. Conferma l'email (controlla la casella di posta)

### 3.2 Imposta Ruolo Super Admin

Torna nel SQL Editor di Supabase ed esegui:

```sql
-- Sostituisci con la TUA email
INSERT INTO user_roles (user_id, role) 
SELECT id, 'super_admin' 
FROM auth.users 
WHERE email = 'tua-email@example.com'  -- <-- CAMBIA QUI
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin', updated_at = NOW();
```

### 3.3 Verifica il Ruolo

```sql
-- Verifica che il ruolo sia impostato
SELECT 
  au.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id;

-- Dovresti vedere la tua email con ruolo 'super_admin'
```

## 🔑 Step 4: Configura Variabili d'Ambiente

### 4.1 Ottieni le Chiavi Supabase

1. Vai in **Settings** > **API**
2. Copia e salva in modo sicuro:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`) ⚠️ MOLTO SENSIBILE

### 4.2 Crea File .env.production

Nella root del progetto, crea `.env.production`:

```bash
# Supabase Configuration - PRODUCTION
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration - PRODUCTION
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL - PRODUCTION
NEXT_PUBLIC_SITE_URL=https://tuosito.com

# Email Configuration (se usi servizi come SendGrid)
# SENDGRID_API_KEY=...
# EMAIL_FROM=noreply@tuosito.com
```

### 4.3 Configura Variabili su Vercel/Netlify

Se usi Vercel o Netlify:

**Vercel:**
1. Vai sul tuo progetto > Settings > Environment Variables
2. Aggiungi TUTTE le variabili da `.env.production`
3. Seleziona **Production** environment
4. Save

**Netlify:**
1. Site settings > Build & deploy > Environment
2. Aggiungi le variabili
3. Save

## 🎨 Step 5: Configura Storage (per immagini prodotti)

### 5.1 Crea Bucket Storage

1. Vai su **Storage** nella dashboard Supabase
2. Clicca **"New bucket"**
3. Nome: `product-images`
4. **Public bucket**: ✅ Sì (per permettere accesso pubblico alle immagini)
5. Create

### 5.2 Configura Policy Bucket

Vai su Storage > product-images > Policies

**Policy per Upload (solo admin):**
```sql
CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND get_user_role(auth.uid()) IN ('admin', 'super_admin')
);
```

**Policy per Lettura (tutti):**
```sql
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

**Policy per Delete (solo super_admin):**
```sql
CREATE POLICY "Super admin can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND get_user_role(auth.uid()) = 'super_admin'
);
```

## 📧 Step 6: Configura Email (Supabase Auth)

### 6.1 Configura SMTP Personalizzato (Opzionale ma Consigliato)

1. Vai in **Authentication** > **Settings** > **SMTP Settings**
2. Configura il tuo provider SMTP (es. SendGrid, Gmail, AWS SES)
3. Test email delivery

### 6.2 Personalizza Email Templates

1. **Authentication** > **Email Templates**
2. Personalizza:
   - Confirm signup
   - Magic Link
   - Reset password
   - Change Email Address

Usa il tuo branding e dominio aziendale.

## 🔒 Step 7: Sicurezza e Performance

### 7.1 Abilita Rate Limiting (Supabase Pro)

1. **Settings** > **API**
2. Configura rate limits appropriati:
   - Auth endpoints: 10 req/min per IP
   - REST API: 100 req/min per IP

### 7.2 Configura CORS

1. **Settings** > **API** > **CORS Settings**
2. Aggiungi solo i tuoi domini:
   ```
   https://tuosito.com
   https://www.tuosito.com
   ```

### 7.3 Abilita Backup Automatici (Supabase Pro)

1. **Settings** > **Database** > **Backups**
2. Abilita daily backups
3. Retention: 7+ giorni

### 7.4 Configura Monitoring

1. **Observability** > **Logs**
2. Monitora:
   - Database logs
   - API logs
   - Auth logs
   - Function logs

## 📊 Step 8: Inserisci Dati Iniziali (Opzionale)

### 8.1 Importa Prodotti da Sviluppo

Se hai prodotti nel database di sviluppo:

```sql
-- Esporta dal dev (SQL Editor del progetto dev)
SELECT 
  name, description, price, image_url, category, 
  stock_quantity, chocolate_type, collection, 
  is_new, is_bestseller
FROM products
WHERE deleted_at IS NULL;

-- Copia i risultati e adatta per INSERT nel database production
```

### 8.2 Inserisci Prodotti Manualmente

Usa la dashboard admin della tua applicazione o SQL Editor:

```sql
INSERT INTO products (
  name, description, price, image_url, category, 
  stock_quantity, chocolate_type, collection,
  is_new, is_bestseller
) VALUES 
  ('Nome Prodotto', 'Descrizione...', 19.90, '/images/prodotto.jpg', 'praline', 100, 'fondente', 'Costiera Amalfitana', true, false),
  -- ... altri prodotti
;
```

## 🧪 Step 9: Testing Completo

### 9.1 Test Funzionalità Base

- [ ] Registrazione nuovo utente
- [ ] Login utente
- [ ] Visualizzazione prodotti nello shop
- [ ] Aggiunta prodotti al carrello
- [ ] Checkout e pagamento (usa carte test Stripe)
- [ ] Visualizzazione ordini in area account

### 9.2 Test Area Admin

- [ ] Login con account super admin
- [ ] Visualizzazione dashboard admin
- [ ] Creazione nuovo prodotto
- [ ] Modifica prodotto esistente
- [ ] Eliminazione prodotto (soft delete)
- [ ] Gestione ordini
- [ ] Cambio stato ordini

### 9.3 Test Performance

```sql
-- Query per verificare performance
EXPLAIN ANALYZE 
SELECT * FROM products 
WHERE deleted_at IS NULL 
  AND category = 'praline'
ORDER BY created_at DESC 
LIMIT 20;

-- Il query plan dovrebbe usare gli indici
```

### 9.4 Test Sicurezza

Prova ad accedere con utente normale:
- [ ] NON può accedere a /admin
- [ ] NON può modificare prodotti via API
- [ ] NON può vedere ordini di altri utenti
- [ ] PUÒ vedere solo i propri ordini

## 🚦 Step 10: Go Live!

### 10.1 Deploy Applicazione

**Con Vercel:**
```bash
vercel --prod
```

**Con Netlify:**
```bash
netlify deploy --prod
```

### 10.2 Verifica Deploy

1. Visita il sito in produzione
2. Testa tutte le funzionalità critiche
3. Verifica che le immagini si carichino
4. Verifica che i pagamenti funzionino (con carte reali ma piccoli importi)

### 10.3 Monitora Errori

- Configura Sentry o similar per error tracking
- Monitora Supabase Dashboard > Observability
- Controlla logs applicazione

## 📈 Step 11: Ottimizzazione Post-Launch

### 11.1 Monitora Performance

```sql
-- Top 10 query lente
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 11.2 Aggiungi Indici se Necessario

Se vedi query lente:
```sql
-- Esempio: indice per ricerca testuale
CREATE INDEX idx_products_name_search ON products 
USING GIN (to_tsvector('italian', name));
```

### 11.3 Cache Strategy

Considera di usare:
- **Vercel Edge Cache** per pagine statiche
- **SWR** o **React Query** con cache lato client
- **Redis** per cache API (se necessario)

## 🔄 Step 12: Backup e Disaster Recovery

### 12.1 Schedule Backup Manuali

```bash
# Backup SQL completo (esegui periodicamente)
# In Supabase Dashboard > Database > Backups
```

### 12.2 Piano di Disaster Recovery

1. **Backup giornalieri automatici** (Supabase Pro)
2. **Backup settimanali esportati** localmente
3. **Documentazione procedure ripristino**
4. **Test recovery** trimestrale

### 12.3 Export Dati Critici

```sql
-- Export prodotti attivi
COPY (
  SELECT * FROM products WHERE deleted_at IS NULL
) TO STDOUT WITH CSV HEADER;

-- Export ordini ultimi 90 giorni
COPY (
  SELECT * FROM orders 
  WHERE created_at > NOW() - INTERVAL '90 days'
) TO STDOUT WITH CSV HEADER;
```

## ✅ Checklist Finale Pre-Go-Live

- [ ] Schema database installato e verificato
- [ ] Super admin creato e funzionante
- [ ] Variabili ambiente configurate (prod)
- [ ] Storage bucket creato e policy configurate
- [ ] Email SMTP configurato e testato
- [ ] Backup automatici abilitati
- [ ] Rate limiting configurato
- [ ] CORS configurato correttamente
- [ ] Tutti i test passati (funzionalità, admin, sicurezza)
- [ ] Deploy produzione completato
- [ ] Monitoring configurato
- [ ] DNS configurato (dominio custom)
- [ ] SSL/HTTPS attivo
- [ ] Stripe in modalità Live configurato
- [ ] Privacy Policy e Terms pubblicati
- [ ] Cookie banner configurato (se necessario GDPR)

## 📞 Supporto

### Supabase Support
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

### Risorse Utili
- Schema SQL: `supabase-schema-complete-production.sql`
- Soft Delete Guide: `FIX_SOFT_DELETE.md`
- Service Role Guide: `CONFIGURAZIONE_SERVICE_ROLE.md`

## 🎉 Congratulazioni!

Se hai completato tutti gli step, il tuo e-commerce Dolce Manu è ora in produzione! 🍫

### Prossimi Passi
1. Monitora le prime 24-48 ore intensamente
2. Raccogli feedback da utenti beta
3. Ottimizza basandoti sui dati reali
4. Pianifica nuove feature

**Buone vendite! 🚀**

