# Guida Configurazione Supabase Storage per Immagini Prodotti

Questa guida spiega come configurare Supabase Storage per gestire l'upload delle immagini dei prodotti con ottimizzazione SEO.

## 📋 Prerequisiti

- Progetto Supabase configurato
- Accesso alla dashboard di Supabase
- Ruolo admin configurato nel database

## 🚀 Passaggi di Setup

### 1. Crea il Bucket Storage

1. Accedi alla [Dashboard Supabase](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **Storage** nel menu laterale
4. Clicca su **"Create a new bucket"**
5. Configura il bucket con i seguenti parametri:
   - **Nome**: `product-images`
   - **Public**: ✅ (Selezionato - le immagini devono essere pubblicamente accessibili)
   - **File size limit**: `5242880` (5MB in bytes)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/gif`
     - `image/webp`

### 2. Configura le Policy di Accesso

Esegui lo script SQL fornito in `supabase-storage-setup.sql`:

1. Vai su **SQL Editor** nella dashboard Supabase
2. Copia e incolla il contenuto di `supabase-storage-setup.sql`
3. Esegui lo script

Le policy configurate permettono:
- ✅ **Lettura pubblica**: Chiunque può visualizzare le immagini
- ✅ **Upload admin**: Solo gli admin possono caricare nuove immagini
- ✅ **Modifica admin**: Solo gli admin possono modificare immagini esistenti
- ✅ **Eliminazione admin**: Solo gli admin possono eliminare immagini

### 3. Verifica la Configurazione

Puoi verificare che tutto sia configurato correttamente in due modi:

#### Metodo 1: Dashboard Supabase
1. Vai su **Storage** > **Policies**
2. Seleziona il bucket `product-images`
3. Verifica che ci siano 4 policy attive

#### Metodo 2: SQL Query
Esegui questa query nell'editor SQL:
```sql
SELECT policyname, tablename, roles 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%product%';
```

Dovresti vedere 4 policy elencate.

## 🎨 Funzionalità di Ottimizzazione SEO

Il sistema di upload implementato include:

### 1. Nome File SEO-Friendly
- Converte il nome del prodotto in formato URL-friendly
- Rimuove caratteri speciali e accenti
- Aggiunge timestamp per unicità
- Esempio: `praline-costiera-box-da-6-1234567890.jpg`

### 2. Ottimizzazione Immagine
- **Ridimensionamento automatico**: max 1200x1200px
- **Compressione**: qualità 85% per bilanciare dimensione e qualità
- **Formato**: conversione automatica a JPEG ottimizzato
- **Cache**: header cache-control impostato a 1 ora

### 3. Validazione File
- Formati supportati: JPG, PNG, GIF, WEBP
- Dimensione massima: 5MB
- Validazione tipo MIME lato client

## 📦 Come Usare il Sistema

### Nel Pannello Admin

1. Vai su **Admin** > **Prodotti**
2. Clicca su **"Nuovo Prodotto"** o modifica un prodotto esistente
3. Nella sezione **"Immagine Prodotto"**:
   - Clicca sull'area di upload
   - Seleziona un'immagine dal tuo computer
   - Visualizza l'anteprima
   - (Opzionale) Cambia l'immagine cliccando su "Cambia immagine"
   - (Opzionale) Rimuovi l'immagine cliccando sulla X rossa
4. Compila gli altri campi del prodotto
5. Clicca su **"Crea Prodotto"** o **"Aggiorna Prodotto"**

Il sistema:
- Ottimizza automaticamente l'immagine
- Genera un nome file SEO-friendly
- Carica l'immagine su Supabase Storage
- Salva l'URL pubblico nel database

### Stato Upload

Durante l'upload vedrai:
- 📤 **Messaggio "Caricamento e ottimizzazione immagine..."**
- 🔄 **Spinner animato**
- ⏸️ **Pulsante submit disabilitato**

## 🔧 Risoluzione Problemi

### Errore: "Bucket non trovato"
- Verifica che il bucket `product-images` sia stato creato
- Controlla che il nome sia esattamente `product-images` (tutto minuscolo, con trattino)

### Errore: "Permessi insufficienti"
- Verifica di essere loggato come admin
- Controlla che le policy SQL siano state eseguite correttamente
- Verifica la tabella `user_roles` contenga il tuo ruolo admin

### Errore: "File troppo grande"
- Riduci la dimensione dell'immagine prima dell'upload
- Il limite è 5MB per file
- Usa strumenti online per comprimere l'immagine se necessario

### Immagine non si visualizza
- Verifica che il bucket sia impostato come **Public**
- Controlla la policy "Public Access for Product Images"
- Prova ad accedere direttamente all'URL dell'immagine nel browser

## 📊 Best Practices

### Dimensioni Immagini Consigliate
- **Risoluzione minima**: 800x800px
- **Risoluzione ottimale**: 1200x1200px
- **Formato consigliato**: JPEG o PNG
- **Aspect ratio**: 1:1 (quadrato) per uniformità nel catalogo

### Nomenclatura
- Usa nomi descrittivi per i prodotti
- Il sistema genera automaticamente nomi SEO-friendly
- Esempio: "Praline Costiera Box da 6" → `praline-costiera-box-da-6-timestamp.jpg`

### Performance
- Le immagini vengono automaticamente ottimizzate
- Compressione al 85% mantiene alta qualità visiva
- Cache HTTP impostata a 1 ora per velocizzare il caricamento

## 🔒 Sicurezza

- ✅ Solo admin autenticati possono caricare/modificare/eliminare immagini
- ✅ Validazione tipo MIME per prevenire upload di file pericolosi
- ✅ Limite dimensione file per prevenire abusi
- ✅ Immagini pubbliche solo per visualizzazione prodotti

## 📚 Risorse Aggiuntive

- [Documentazione Supabase Storage](https://supabase.com/docs/guides/storage)
- [Policy Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Best Practices SEO Immagini](https://developers.google.com/search/docs/advanced/guidelines/google-images)

---

Per supporto tecnico, consulta la documentazione o apri un issue nel repository del progetto.

