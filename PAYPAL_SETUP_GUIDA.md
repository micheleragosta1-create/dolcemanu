# 💳 Guida Completa PayPal - Dolce Manu

## ✅ Cosa è stato implementato

### 1. **API PayPal Capture**
📁 File: `app/api/paypal-capture/route.ts`

**Funzionalità:**
- Verifica il pagamento con i server PayPal
- Salva l'ordine nel database Supabase
- Gestisce gli order_items
- Diminuisce lo stock dei prodotti
- Prepara l'invio email di conferma

### 2. **Checkout Page Aggiornata**
📁 File: `app/checkout/page.tsx`

**Modifiche:**
- Callback `onApprove` ora salva l'ordine dopo il pagamento
- Invia i dati dell'ordine all'API `/api/paypal-capture`
- Mostra messaggio di conferma con numero ordine
- Reindirizza a homepage con parametro `orderId`

---

## 🧪 FASE 1: Test con Sandbox (ADESSO)

### 1.1 Verifica variabili d'ambiente

Nel file `.env.local` dovresti avere:

```bash
# PayPal Sandbox (Test)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
```

### 1.2 Crea account test PayPal

1. Vai su https://developer.paypal.com/dashboard/
2. Nel menu laterale, clicca su **"Testing Tools" → "Sandbox Accounts"**
3. PayPal crea automaticamente 2 account:
   - **Business Account** (venditore - tu)
   - **Personal Account** (compratore - cliente test)
4. Clicca su "..." accanto al Personal Account e seleziona **"View/Edit Account"**
5. Copia l'email e la password

### 1.3 Testa il pagamento

1. Vai su `http://localhost:3000` (il server è già avviato)
2. Aggiungi prodotti al carrello
3. Vai al checkout
4. Compila l'indirizzo di spedizione
5. Clicca sul pulsante **PayPal** (dorato)
6. Nella finestra popup PayPal:
   - **Accedi con l'account Personal/Buyer test**
   - Conferma il pagamento
7. Verifica che:
   - L'ordine viene salvato nel database
   - Lo stock viene diminuito
   - Vieni reindirizzato alla homepage
   - Appare il messaggio di conferma

### 1.4 Controlla il database

Vai su Supabase → Table Editor → `orders`:
- Dovresti vedere il nuovo ordine
- `payment_method: 'paypal'`
- `payment_id: '[PayPal Order ID]'`
- `status: 'processing'`

### 1.5 Debug

Se qualcosa non funziona:
1. Apri la **Console del browser** (F12) per vedere eventuali errori
2. Controlla i **log del server** nella finestra dove hai lanciato `npm run dev`
3. Verifica che le credenziali sandbox siano corrette

---

## 🚀 FASE 2: Passaggio a Produzione (LIVE)

### 2.1 Ottieni credenziali LIVE da PayPal

1. Vai su https://developer.paypal.com/dashboard/
2. Clicca su **"Apps & Credentials"**
3. **IMPORTANTE:** Seleziona la tab **"Live"** (non "Sandbox")
4. Clicca su **"Create App"**
5. Compila:
   - **App Name:** `Dolce Manu Shop`
   - **App Type:** Merchant
6. Clicca **"Create App"**
7. Copia le credenziali:
   - **Client ID**
   - **Secret** (clicca "Show" per vederlo)

### 2.2 Aggiorna `.env.local` (o `.env.production`)

**Per produzione, crea un file `.env.production.local`:**

```bash
# PayPal LIVE (Produzione)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret

# Altre configurazioni
NEXT_PUBLIC_APP_URL=https://tuosito.com
```

### 2.3 Requisiti PayPal per la produzione

Prima di andare live, assicurati di avere:

✅ **Account PayPal Business verificato**
- Documenti fiscali caricati
- Email verificata
- Conto bancario collegato

✅ **Privacy Policy e Termini & Condizioni**
- Devono essere visibili sul sito
- PayPal potrebbe richiedere questi link

✅ **SSL Certificate (HTTPS)**
- Il sito deve essere su HTTPS (obbligatorio)

✅ **Test completi in Sandbox**
- Tutti i flussi di pagamento testati
- Email di conferma verificate

### 2.4 Deploy in produzione

```bash
# Build del progetto
npm run build

# Deploy su Vercel (esempio)
vercel --prod

# Oppure su altro hosting
```

### 2.5 Configura variabili d'ambiente su hosting

Se usi **Vercel**:
1. Vai su **Project Settings → Environment Variables**
2. Aggiungi:
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (Production)
   - `PAYPAL_CLIENT_SECRET` (Production)
3. Riavvia il deploy

Se usi **altro hosting**, segui la loro documentazione per le variabili d'ambiente.

---

## 🔧 Configurazioni Opzionali (Consigliate)

### Webhook PayPal (per sicurezza extra)

1. Vai su PayPal Developer Dashboard → **Webhooks**
2. Clicca **"Add Webhook"**
3. URL: `https://tuosito.com/api/paypal-webhook`
4. Eventi da ascoltare:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
5. Salva il **Webhook ID**

**Nota:** Dovrai creare l'endpoint `/api/paypal-webhook/route.ts` per gestire questi eventi (posso aiutarti se necessario).

---

## 🧪 Differenze Sandbox vs Live

| Caratteristica | Sandbox | Live |
|----------------|---------|------|
| **URL API** | `https://api-m.sandbox.paypal.com` | `https://api-m.paypal.com` |
| **Account** | Test (fake) | Reali |
| **Denaro** | Virtuale | Reale |
| **Credenziali** | Diverse | Diverse |
| **Testing** | ✅ Sicuro | ⚠️ Transazioni reali |

**Nota:** L'API che ho creato (`/api/paypal-capture/route.ts`) usa automaticamente l'URL corretto in base alle credenziali.

---

## 📊 Monitoraggio

### In Sandbox
- Vedi transazioni su: https://developer.paypal.com/dashboard/

### In Live
- Vedi transazioni su: https://www.paypal.com/activity

---

## ⚠️ Avvertenze di Sicurezza

1. **Non committare mai `.env.local`** su Git
2. **Non condividere mai `PAYPAL_CLIENT_SECRET`**
3. Usa variabili d'ambiente separate per dev/prod
4. Testa SEMPRE in sandbox prima di andare live
5. Verifica sempre che i pagamenti siano COMPLETED prima di consegnare prodotti

---

## 🆘 Troubleshooting

### Errore: "PayPal non configurato"
➡️ Controlla che le variabili d'ambiente siano impostate correttamente

### Errore: "Ordine PayPal non trovato"
➡️ Le credenziali sandbox/live non corrispondono all'ambiente

### Errore: "Pagamento non completato"
➡️ L'ordine PayPal non è stato catturato correttamente

### Il bottone PayPal non appare
➡️ Verifica che `NEXT_PUBLIC_PAYPAL_CLIENT_ID` sia impostato
➡️ Controlla la console del browser per errori

### L'ordine non viene salvato nel database
➡️ Verifica le credenziali Supabase
➡️ Controlla i log del server per errori

---

## 📝 Checklist Completa

### Sandbox (Test)
- [ ] Credenziali sandbox inserite in `.env.local`
- [ ] Account test PayPal creati
- [ ] Server di sviluppo avviato (`npm run dev`)
- [ ] Test pagamento completato con successo
- [ ] Ordine salvato nel database verificato
- [ ] Stock diminuito correttamente

### Live (Produzione)
- [ ] Account PayPal Business verificato
- [ ] Documenti fiscali caricati
- [ ] Credenziali LIVE ottenute
- [ ] Privacy Policy e T&C pubblicati sul sito
- [ ] SSL/HTTPS attivo
- [ ] Test completi in sandbox superati
- [ ] Credenziali LIVE configurate su hosting
- [ ] Deploy in produzione effettuato
- [ ] Test pagamento reale completato
- [ ] Monitoraggio attivo

---

## 🎯 Prossimi Passi Consigliati

1. **Email di conferma automatiche**
   - Integrare servizio email (SendGrid/Resend)
   - Inviare PDF proforma allegato

2. **Webhook PayPal**
   - Per gestire rimborsi e dispute
   - Maggiore sicurezza e tracciabilità

3. **Dashboard admin**
   - Per visualizzare ordini PayPal
   - Gestione rimborsi

4. **Analytics**
   - Tracciare conversioni PayPal vs Stripe
   - Monitorare tasso di abbandono

---

## 💡 Note Finali

PayPal è ora completamente integrato nel tuo shop! 🎉

- **In Sandbox**: Testa quanto vuoi, è tutto sicuro
- **In Live**: Ogni transazione è reale e comporta commissioni PayPal

**Commissioni PayPal standard (Italia):**
- 3,4% + 0,35€ per transazione domestica
- Variabili per transazioni internazionali

Hai bisogno di ulteriore aiuto? Fammi sapere! 😊

