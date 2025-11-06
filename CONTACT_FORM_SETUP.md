# 📧 Configurazione Form di Contatto - Email

## ✅ Implementazione Completata

Il form di contatto nella homepage è stato configurato per inviare email a **info@ondedicacao.com**.

### 🎯 Funzionalità Implementate:

1. ✅ **API Route** (`/api/contact`) per gestire l'invio email
2. ✅ **Integrazione Resend** per l'invio email reale
3. ✅ **Feedback visivo** con stati di loading, successo ed errore
4. ✅ **Email formattata** con tutti i dettagli del contatto
5. ✅ **Reply-to automatico** per rispondere direttamente al cliente
6. ✅ **Validazione input** lato server e client
7. ✅ **Animazioni e spinner** durante l'invio

---

## 🔧 Configurazione Richiesta

### 1. **Crea un Account Resend** (Gratuito)

1. Vai su [https://resend.com](https://resend.com)
2. Crea un account gratuito (include 3000 email/mese gratis)
3. Verifica la tua email

### 2. **Ottieni la API Key**

1. Accedi a Resend Dashboard
2. Vai su "API Keys"
3. Crea una nuova API key
4. Copia la chiave (inizia con `re_...`)

### 3. **Configura il Dominio** (Importante!)

Per inviare email da `noreply@ondedicacao.com`, devi verificare il dominio:

1. Vai su "Domains" nella dashboard Resend
2. Aggiungi il dominio `ondedicacao.com`
3. Configura i record DNS come indicato da Resend:
   - Record SPF
   - Record DKIM
   - Record DMARC (opzionale ma consigliato)

**Nota:** Durante il test, puoi usare il dominio sandbox di Resend:
- `from: 'onboarding@resend.dev'`
- Le email arriveranno comunque a info@ondedicacao.com

### 4. **Aggiungi le Variabili d'Ambiente**

Crea o aggiorna il file `.env.local` nella root del progetto:

```env
# Supabase (già configurate)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend Email (NUOVA CONFIGURAZIONE)
RESEND_API_KEY=re_your_actual_api_key_here
```

### 5. **Riavvia il Server di Sviluppo**

Dopo aver configurato le variabili d'ambiente:

```bash
npm run dev
```

---

## 📝 File Modificati

### 1. **API Route** - `app/api/contact/route.ts`
- Gestisce le richieste POST al form
- Valida i dati in input
- Invia email tramite Resend
- Restituisce successo/errore

### 2. **Componente Form** - `components/ContactSection.tsx`
- Gestisce stati (idle, loading, success, error)
- Chiama l'API `/api/contact`
- Mostra feedback visivo all'utente
- Disabilita il form durante l'invio

### 3. **Stili CSS** - `app/globals.css`
- Messaggi di successo/errore con animazioni
- Spinner per il caricamento
- Stati disabled per gli input

---

## 🎨 Comportamento del Form

### ✅ **Successo**
- Messaggio verde di conferma
- Form resetato automaticamente
- Email inviata a info@ondedicacao.com
- Messaggio sparisce dopo 5 secondi

### ❌ **Errore**
- Messaggio rosso con dettagli
- Form mantiene i dati inseriti
- Messaggio sparisce dopo 5 secondi
- Possibilità di riprovare

### ⏳ **Durante l'Invio**
- Bottone con spinner animato
- Form disabilitato
- Testo "Invio in corso..."

---

## 📧 Formato Email Ricevuta

Le email ricevute su info@ondedicacao.com includeranno:

- **Nome** del mittente
- **Email** del mittente (impostata come Reply-To)
- **Telefono** (se fornito)
- **Messaggio** completo
- Design professionale con branding Dolce Manu

---

## 🧪 Test

### Test in Locale (senza configurazione Resend)

Se l'API key non è configurata, l'API restituirà un errore:
```json
{
  "error": "Servizio email non configurato"
}
```

### Test con Resend (configurato)

1. Apri il sito in locale: `http://localhost:3000`
2. Scorri alla sezione "Contattaci"
3. Compila il form con dati di test
4. Clicca "Invia Messaggio"
5. Controlla la casella info@ondedicacao.com

### Test del Dominio Sandbox

Se non hai ancora verificato il dominio, modifica temporaneamente:

**In `app/api/contact/route.ts`, linea ~42:**
```typescript
from: 'onboarding@resend.dev', // Dominio sandbox per test
```

---

## 🔍 Debugging

### Logs Console

L'API logga informazioni utili:

```javascript
✅ Email inviata con successo: { id: '...', ... }
❌ Errore Resend: { message: '...' }
❌ RESEND_API_KEY non configurata
```

### Verifica Dashboard Resend

1. Vai su https://resend.com/emails
2. Vedi tutte le email inviate
3. Controlla stato (Delivered, Bounced, etc.)
4. Visualizza errori se presenti

---

## 🚀 Deploy in Produzione

Quando fai il deploy su Vercel/produzione:

1. Vai nelle **Environment Variables** del progetto
2. Aggiungi `RESEND_API_KEY` con il valore corretto
3. **Non committare mai** l'API key nel codice!
4. Verifica che il dominio `ondedicacao.com` sia verificato su Resend
5. Testa l'invio email in produzione

---

## 💡 Suggerimenti

### Reply-To Automatico

Le email hanno il `replyTo` impostato sull'email del cliente, quindi:
- Puoi rispondere direttamente dall'email ricevuta
- La risposta andrà automaticamente al cliente

### Spam/Filtri

Per evitare che le email finiscano in spam:
1. ✅ Verifica il dominio con Resend (SPF, DKIM)
2. ✅ Configura DMARC
3. ✅ Non usare contenuti sospetti nel messaggio
4. ✅ Mantieni basso il volume di email (sotto i limiti gratuiti)

### Limiti Resend (Piano Gratuito)

- **3000 email/mese** incluse
- **100 email/giorno** limite giornaliero
- Perfetto per un form di contatto con traffico moderato

---

## 📊 Statistiche e Monitoraggio

Resend Dashboard offre:
- Numero email inviate
- Tasso di consegna
- Email bounce/non consegnate
- Statistiche giornaliere/mensili

---

## 🛠️ Risoluzione Problemi

### "Servizio email non configurato"
**Causa:** RESEND_API_KEY non impostata  
**Soluzione:** Aggiungi la chiave in `.env.local`

### "Domain not verified"
**Causa:** Dominio non verificato su Resend  
**Soluzione:** Usa `onboarding@resend.dev` per test o verifica il dominio

### Email non arriva
**Causa:** Potrebbe essere in spam o dominio non configurato  
**Soluzione:** 
1. Controlla la cartella spam
2. Verifica la dashboard Resend per lo stato di consegna
3. Configura SPF/DKIM correttamente

### Form non invia
**Causa:** Errore JavaScript o API  
**Soluzione:**
1. Apri Developer Tools (F12)
2. Controlla la tab Console per errori
3. Verifica la tab Network per la chiamata API
4. Controlla i logs del server

---

## ✨ Riepilogo

**Email Destinatario:** info@ondedicacao.com  
**Servizio Email:** Resend (3000 email/mese gratis)  
**Configurazione:** 1 variabile d'ambiente (`RESEND_API_KEY`)  
**Tempo Setup:** ~10 minuti (con verifica dominio)

**Tutto pronto per ricevere i messaggi dai clienti!** 🎉

---

## 📞 Note Finali

- Controlla regolarmente info@ondedicacao.com per le richieste
- Rispondi tempestivamente ai clienti
- Monitora la dashboard Resend per eventuali problemi
- Considera un upgrade se superi i 3000 email/mese

Per domande sulla configurazione avanzata, consulta la [documentazione ufficiale Resend](https://resend.com/docs).

