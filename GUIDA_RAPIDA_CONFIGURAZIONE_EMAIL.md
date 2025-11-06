# 📧 Guida Rapida - Configurazione Email Form di Contatto

## ✅ Cosa è stato fatto

Il form di contatto nella homepage è ora completamente funzionale e pronto per inviare email a **info@ondedicacao.com**.

---

## 🚀 Come Attivarlo (3 Semplici Passi)

### **Passo 1: Crea Account Resend** (2 minuti)

1. Vai su **https://resend.com**
2. Clicca su "Sign Up" e crea un account (è gratuito, 3000 email/mese incluse)
3. Verifica la tua email

### **Passo 2: Ottieni la Chiave API** (1 minuto)

1. Nella dashboard Resend, vai su **"API Keys"**
2. Clicca **"Create API Key"**
3. Dai un nome (es. "Dolce Manu Contact Form")
4. **Copia la chiave** (inizia con `re_...`)

### **Passo 3: Configura la Variabile d'Ambiente** (1 minuto)

Crea o modifica il file `.env.local` nella root del progetto e aggiungi:

```env
RESEND_API_KEY=re_la_tua_chiave_qui
```

**Esempio:**
```env
RESEND_API_KEY=re_123abc456def789ghi
```

### **Passo 4: Riavvia il Server**

```bash
npm run dev
```

---

## ✨ È Tutto Pronto!

Ora quando qualcuno compila il form di contatto:
- ✅ Riceverai un'email su **info@ondedicacao.com**
- ✅ L'email conterrà nome, email, telefono e messaggio del cliente
- ✅ Potrai rispondere direttamente dall'email (Reply-To automatico)

---

## ⚠️ Nota Importante: Modalità Sviluppo vs Produzione

### 🔧 In Sviluppo (locale)
- **Email inviate a:** `michele.ragosta1@gmail.com` (per test)
- **Email da:** `Dolce Manu <onboarding@resend.dev>` (sandbox Resend)
- **Limitazione:** Resend permette di testare solo con il tuo indirizzo verificato

### 🚀 In Produzione (deploy)
- **Email inviate a:** `info@ondedicacao.com` (destinazione finale)
- **Email da:** `Sito Web Dolce Manu <noreply@ondedicacao.com>`
- **Richiede:** Verifica del dominio `ondedicacao.com` su Resend

### Come Verificare il Dominio (per produzione)

Per evitare problemi di spam in produzione:

1. Vai su **"Domains"** nella dashboard Resend
2. Clicca **"Add Domain"**
3. Inserisci `ondedicacao.com`
4. Configura i record DNS indicati (SPF, DKIM)

**Questo step puoi farlo dopo, per ora le email funzioneranno in modalità test!**

---

## 🧪 Test Veloce

1. Apri il sito: `http://localhost:3000`
2. Scorri fino alla sezione **"Contattaci"**
3. Compila il form con i tuoi dati
4. Clicca **"Invia Messaggio"**
5. Dovresti vedere un messaggio verde di successo
6. Controlla la casella **michele.ragosta1@gmail.com** per l'email di test

⚠️ **Nota:** In modalità sviluppo, le email vanno a `michele.ragosta1@gmail.com` (limitazione del dominio sandbox di Resend). In produzione andranno automaticamente a `info@ondedicacao.com`.

---

## 📁 File Creati/Modificati

- ✅ `app/api/contact/route.ts` - API per l'invio email
- ✅ `components/ContactSection.tsx` - Form con feedback visivo
- ✅ `app/globals.css` - Stili per messaggi e spinner
- ✅ `package.json` - Aggiunta dipendenza Resend
- 📖 `CONTACT_FORM_SETUP.md` - Guida dettagliata completa

---

## 🆘 Problemi?

### "Servizio email non configurato"
➡️ Hai dimenticato di aggiungere `RESEND_API_KEY` in `.env.local`

### Email non arriva
➡️ Controlla lo spam o verifica nella [dashboard Resend](https://resend.com/emails) lo stato dell'invio

### Form non funziona
➡️ Apri la console del browser (F12) e controlla gli errori

---

## 💰 Costi

**Piano Gratuito Resend:**
- 3.000 email al mese (gratis)
- 100 email al giorno
- Più che sufficiente per un form di contatto

---

## 📚 Documentazione Completa

Per tutti i dettagli tecnici, consulta: **`CONTACT_FORM_SETUP.md`**

---

**Hai bisogno di aiuto?** Fammi sapere! 🚀

