# 📧 Configurazione Email - info@ondedicacao.com

## ✅ Aggiornamenti Completati

Ho sostituito l'indirizzo email in tutti i file pubblici del progetto:

### 1. **Footer del Sito** ✅
- **File:** `components/Footer.tsx`
- **Cambiato:** `info@cioccolatinimichele.it` → `info@ondedicacao.com`
- **Visibile in:** Tutte le pagine del sito (footer)

### 2. **PDF Riepilogo Ordini** ✅
- **File:** `lib/pdf-service.ts`
- **Cambiato:** `info@dolcemanu.it` → `info@ondedicacao.com`
- **Visibile in:** PDF generati per gli ordini clienti

### 3. **Sezione Contatti** ✅
- **File:** `components/ContactSection.tsx`
- **Cambiato:** `info@emanuelanapolitano.it` → `info@ondedicacao.com`
- **Visibile in:** Pagina homepage, sezione contatti

### 4. **README** ✅
- **File:** `README.md`
- **Cambiato:** `info@cioccolatinimichele.it` → `info@ondedicacao.com`
- **Visibile in:** Documentazione del progetto

---

## 📝 Configurazione Variabili d'Ambiente (Opzionale)

Se vuoi configurare l'invio automatico di email per conferme ordini e notifiche, dovrai creare/aggiornare il file `.env.local` con:

```env
# Email Settings (per invio automatico email ordini)
RESEND_API_KEY=re_xxxxxxxxxxxx
SENDER_EMAIL=ordini@ondedicacao.com
ADMIN_EMAIL=info@ondedicacao.com

# Oppure se usi SendGrid:
# SENDGRID_API_KEY=SG.xxxxxxxxxxxx
# SENDER_EMAIL=ordini@ondedicacao.com
# ADMIN_EMAIL=info@ondedicacao.com
```

### Dettagli:
- **SENDER_EMAIL**: Email che invierà le conferme ordine ai clienti
- **ADMIN_EMAIL**: Email che riceverà le notifiche di nuovi ordini

---

## 🔍 Email Attualmente Visibili nel Sito

### 📧 **info@ondedicacao.com**
Appare in:
1. Footer (tutte le pagine)
2. Sezione Contatti (homepage)
3. PDF riepilogo ordini
4. Documentazione

### 📤 Come Viene Utilizzata:
- **Contatto pubblico** per clienti
- **Supporto e assistenza**
- **Email aziendale ufficiale**

---

## 🎯 Prossimi Passi (Opzionali)

### 1. **Configura l'Email Aziendale**
Se non l'hai già fatto:
- Verifica che `info@ondedicacao.com` sia configurato sul tuo provider
- Configura l'inoltro se necessario
- Testa l'invio/ricezione

### 2. **Configura Invio Email Automatiche** (Opzionale)
Per inviare conferme ordine automatiche:
1. Crea account su [Resend](https://resend.com) o [SendGrid](https://sendgrid.com)
2. Ottieni API key
3. Configura variabili d'ambiente (vedi sopra)
4. Consulta `EMAIL_SETUP_GUIDE.md` per la guida completa

### 3. **Testa il Modulo Contatti**
Il modulo contatti in `ContactSection.tsx` attualmente:
- Mostra un alert quando si invia
- Non invia email realmente

Per abilitare l'invio reale:
- Implementa un'API route `/api/contact`
- Oppure usa un servizio come [Formspree](https://formspree.io) o [EmailJS](https://www.emailjs.com/)

---

## ✨ Riepilogo

**Email principale aggiornata:** `info@ondedicacao.com`

**File modificati:** 4
- ✅ `components/Footer.tsx`
- ✅ `lib/pdf-service.ts`
- ✅ `components/ContactSection.tsx`
- ✅ `README.md`

**Visibilità:** 
- Footer di tutte le pagine ✅
- Sezione contatti homepage ✅
- PDF riepilogo ordini ✅

**Tutto pronto!** 🎉

---

## 📞 Note

L'email è ora correttamente configurata in tutto il sito. Assicurati che:
1. L'indirizzo `info@ondedicacao.com` sia attivo e monitorato
2. Rispondi tempestivamente alle richieste dei clienti
3. (Opzionale) Configura l'invio automatico email ordini

Per domande sulla configurazione email avanzata, consulta `EMAIL_SETUP_GUIDE.md`.

