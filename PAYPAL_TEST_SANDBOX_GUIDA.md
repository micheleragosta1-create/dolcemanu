# 🧪 Guida Test PayPal Sandbox - Dolce Manu

## 📝 Come testare PayPal in Sandbox

### Problema Comune
Quando clicchi sul pulsante PayPal, vedi una schermata che chiede i dati della carta invece del login PayPal.

### Soluzione
PayPal Sandbox offre DUE modi per pagare:
1. **Con account PayPal test** ✅ (quello che vogliamo)
2. **Con carta di credito** (opzione alternativa)

---

## 🎯 PASSO 1: Crea Account Test Sandbox

### 1.1 Vai al PayPal Developer Dashboard

1. Apri: https://developer.paypal.com/dashboard/
2. Accedi con il tuo account PayPal Business
3. Nel menu laterale, clicca su **"Testing Tools" → "Sandbox Accounts"**

### 1.2 Visualizza gli Account Test

PayPal crea automaticamente 2 account di test:
- **Business Account** (venditore - il tuo negozio)
- **Personal Account** (compratore - il cliente che testa)

### 1.3 Ottieni le Credenziali dell'Account Personal

1. Trova l'account con il tipo **"Personal"**
2. Clicca sui **3 puntini (...)** a destra
3. Seleziona **"View/Edit Account"**
4. Vedrai:
   ```
   Email: sb-xxxxx@personal.example.com
   Password: xxxxxxxxx
   ```
5. **COPIA** queste credenziali! Ti serviranno per testare.

### 1.4 (Opzionale) Crea un Nuovo Account Personal

Se vuoi creare un altro account test:
1. Clicca su **"Create Account"**
2. Seleziona:
   - **Account Type:** Personal
   - **Country:** Italy
   - **Balance:** 5000 EUR (saldo virtuale)
3. Clicca **"Create"**

---

## 🛒 PASSO 2: Testa il Pagamento

### 2.1 Vai al Checkout

1. Apri il tuo sito: `http://localhost:3000`
2. Aggiungi prodotti al carrello
3. Vai al checkout
4. Compila l'indirizzo di spedizione

### 2.2 Clicca sul Pulsante PayPal

Il pulsante dorato "PayPal" aprirà una **finestra popup**

### 2.3 Nella Finestra Popup PayPal

**IMPORTANTE:** Ecco cosa fare se vedi la schermata "Paga con carta":

#### Opzione A: Cerca il link "Accedi" o "Log In"
- Guarda in alto nella finestra popup
- Dovresti vedere un link **"Log in"** o **"Accedi"**
- Clicca su quel link

#### Opzione B: Cerca "Paga con PayPal"
- Se vedi la schermata carta, cerca un pulsante/link:
  - "Pay with PayPal"
  - "Paga con PayPal"
  - "Accedi al tuo account"
- Clicca per passare al login

#### Opzione C: Cambia Tab
- Nella popup, potrebbero esserci **due tab**:
  - "Debit or Credit Card" (carta)
  - "PayPal" (login account)
- Clicca sulla tab **"PayPal"**

### 2.4 Fai Login con l'Account Test

Una volta nella schermata di login:
1. Inserisci l'**email** dell'account Personal Sandbox
   - Esempio: `sb-xxxxx@personal.example.com`
2. Inserisci la **password** che hai copiato
3. Clicca **"Log In"** o **"Accedi"**

### 2.5 Conferma il Pagamento

1. Vedrai un riepilogo dell'ordine
2. Clicca **"Complete Purchase"** o **"Completa acquisto"**
3. Verrai reindirizzato al tuo sito con conferma

---

## 🎨 Come Appare la Finestra Sandbox

### Schermata 1: Selezione Metodo Pagamento
```
┌─────────────────────────────────────┐
│  PayPal Sandbox                     │
├─────────────────────────────────────┤
│                                     │
│  [Paga con Carta]  [PayPal Login]  │ ← Clicca su "PayPal Login"
│                                     │
│  Oppure cerca:                      │
│  "Accedi" o "Log in" in alto       │
│                                     │
└─────────────────────────────────────┘
```

### Schermata 2: Login PayPal
```
┌─────────────────────────────────────┐
│  Log in to your PayPal account      │
├─────────────────────────────────────┤
│                                     │
│  Email: [sb-xxxxx@personal...]     │
│  Password: [**********]            │
│                                     │
│  [Log In]                          │
│                                     │
└─────────────────────────────────────┘
```

### Schermata 3: Conferma Pagamento
```
┌─────────────────────────────────────┐
│  Review your payment                │
├─────────────────────────────────────┤
│                                     │
│  Dolce Manu Shop                   │
│  Total: €39.00                     │
│                                     │
│  Pay with: PayPal Balance          │
│  Available: €5,000.00              │
│                                     │
│  [Complete Purchase]               │
│                                     │
└─────────────────────────────────────┘
```

---

## ✅ Cosa Verificare Dopo il Pagamento

### 1. Conferma sul Sito
- Dovresti vedere: "Grazie [Nome]! Pagamento PayPal completato. Ordine #XXX"
- Vieni reindirizzato alla homepage

### 2. Database Supabase
1. Vai su Supabase → Table Editor → `orders`
2. Dovresti vedere un nuovo ordine con:
   - `payment_method: 'paypal'`
   - `payment_id: '[PayPal Order ID]'`
   - `status: 'processing'`
   - `user_email: [tua email]`

### 3. Stock Prodotti
- Vai su Supabase → Table Editor → `products`
- Verifica che lo `stock` dei prodotti ordinati sia diminuito

### 4. Log Console (F12)
- Apri la console del browser
- Non dovresti vedere errori rossi
- Dovresti vedere log di conferma

---

## 🐛 Troubleshooting

### Problema: "Non trovo il link Login"

**Soluzione:**
- La finestra potrebbe essere troppo piccola
- Fai scroll verso l'alto nella popup
- Cerca scritte come:
  - "Already have a PayPal account? Log in"
  - "Hai già un account PayPal? Accedi"

### Problema: "Email o password errati"

**Soluzione:**
1. Torna su PayPal Developer Dashboard
2. Sandbox Accounts → View/Edit Account
3. Copia nuovamente email e password
4. Assicurati di non avere spazi extra

### Problema: "This account cannot be used"

**Soluzione:**
1. L'account test potrebbe essere scaduto
2. Crea un nuovo account Personal Sandbox
3. Usa quello nuovo per testare

### Problema: "Finestra popup bloccata"

**Soluzione:**
1. Il browser potrebbe bloccare i popup
2. Cerca l'icona "popup bloccati" nella barra indirizzi
3. Consenti popup per localhost
4. Riprova il checkout

### Problema: "Ordine non salvato nel database"

**Soluzione:**
1. Apri la Console del browser (F12)
2. Cerca errori JavaScript
3. Verifica che le credenziali Supabase siano corrette nel `.env.local`
4. Controlla i log del server (terminale dove gira `npm run dev`)

---

## 🔐 Account Test Sandbox - Esempio

Ecco come appaiono le credenziali di un account test:

```
Account Type: Personal
Email: sb-47abc@personal.example.com
Password: +12345678
Country: Italy
Balance: €5,000.00

Nome: John
Cognome: Doe
```

**NOTA:** Questi sono dati FINTI per testing. Non sono soldi reali!

---

## 💡 Consigli per Test Migliori

### 1. Crea Più Account Test
- Account con saldo alto (per testare ordini grandi)
- Account con saldo basso (per testare rifiuto pagamento)
- Account di paesi diversi (per testare multi-valuta)

### 2. Testa Diversi Scenari
- ✅ Pagamento riuscito
- ❌ Pagamento annullato (clicca "Cancel" nella popup)
- ❌ Saldo insufficiente
- ✅ Più ordini consecutivi

### 3. Usa il Dashboard PayPal Sandbox
- Visualizza transazioni: https://www.sandbox.paypal.com
- Login con l'account **Business** sandbox
- Vedi tutti i pagamenti ricevuti

---

## 🎯 Riepilogo Veloce

1. **Ottieni credenziali test**: PayPal Developer → Sandbox Accounts → Personal Account
2. **Vai al checkout**: `http://localhost:3000`
3. **Clicca PayPal**: Si apre popup
4. **Cerca "Login"**: Passa dal form carta al login
5. **Inserisci credenziali test**: Email e password dell'account Personal
6. **Conferma pagamento**: Complete Purchase
7. **Verifica database**: Supabase → orders

---

## 📱 Video Tutorial (Riferimenti Utili)

Se hai ancora dubbi, cerca su YouTube:
- "PayPal sandbox testing tutorial"
- "How to test PayPal payments in sandbox"
- "PayPal sandbox account setup"

---

## 🆘 Serve Aiuto?

Se continui ad avere problemi:
1. Fai uno screenshot della finestra popup PayPal
2. Copia eventuali errori dalla console (F12)
3. Controlla i log del server
4. Verifica che stai usando credenziali SANDBOX (non LIVE)

---

**Ultima modifica:** Novembre 2025
**Versione:** 1.0

