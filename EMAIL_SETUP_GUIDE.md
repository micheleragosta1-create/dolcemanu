# Guida Configurazione Servizio Email con PDF Proforma

## Panoramica
Il sistema è già predisposto per inviare email ai clienti e all'admin con il PDF proforma allegato. Attualmente le email sono in modalità "mock" (solo log in console), ma il codice è pronto per essere integrato con un servizio email reale.

## Funzionalità Implementate

✅ **Generazione PDF Proforma**
- PDF professionale con logo e branding Dolce Manu
- Include tutti i dettagli dell'ordine (prodotti, prezzi, indirizzo)
- Design responsive e ottimizzato per la stampa

✅ **Invio Email Automatico**
- Email di conferma al cliente con PDF allegato
- Email di notifica all'admin con PDF allegato
- Invio automatico al completamento del pagamento Stripe

✅ **Download PDF dall'Area Admin**
- Pulsante "Scarica PDF" nella pagina dettaglio ordine
- Generazione PDF on-demand per ogni ordine
- Nomenclatura file: `proforma_ORD123456.pdf`

## Integrazione Servizio Email Reale

### Opzione 1: Resend (Consigliato - Moderno e Semplice)

#### 1. Installazione
```bash
npm install resend
```

#### 2. Configurazione ENV
Aggiungi al file `.env.local`:
```env
RESEND_API_KEY=re_123456789
SENDER_EMAIL=ordini@ondedicacao.com
ADMIN_EMAIL=admin@ondedicacao.com
```

#### 3. Modifica `lib/email-service.ts`
```typescript
import { Resend } from 'resend'

export class EmailService {
  private resend: Resend | null = null

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY)
    }
  }

  async sendOrderConfirmation(data: OrderEmailData, pdfAttachment?: Buffer): Promise<boolean> {
    try {
      const template = this.createOrderConfirmationTemplate(data)
      
      // Aggiungi allegato PDF se fornito
      if (pdfAttachment) {
        template.attachments = [{
          filename: `proforma_${data.orderId}.pdf`,
          content: pdfAttachment,
          contentType: 'application/pdf'
        }]
      }

      // Invio reale con Resend
      if (this.resend) {
        const attachments = template.attachments?.map(att => ({
          filename: att.filename,
          content: att.content
        })) || []

        await this.resend.emails.send({
          from: process.env.SENDER_EMAIL || 'ordini@ondedicacao.com',
          to: data.userEmail,
          subject: template.subject,
          html: template.html,
          attachments
        })

        console.log('✅ Email inviata con Resend:', data.userEmail)
      } else {
        // Fallback modalità mock
        console.log('📧 Email mock (Resend non configurato):', {
          to: data.userEmail,
          subject: template.subject,
          hasAttachment: !!pdfAttachment
        })
      }
      
      return true
    } catch (error) {
      console.error('Errore invio email:', error)
      return false
    }
  }

  // Stesso pattern per sendOrderNotificationToAdmin
  async sendOrderNotificationToAdmin(data: OrderEmailData, pdfAttachment?: Buffer): Promise<boolean> {
    try {
      const template = this.createAdminNotificationTemplate(data)
      
      if (pdfAttachment) {
        template.attachments = [{
          filename: `proforma_${data.orderId}.pdf`,
          content: pdfAttachment,
          contentType: 'application/pdf'
        }]
      }

      if (this.resend) {
        const attachments = template.attachments?.map(att => ({
          filename: att.filename,
          content: att.content
        })) || []

        await this.resend.emails.send({
          from: process.env.SENDER_EMAIL || 'ordini@ondedicacao.com',
          to: process.env.ADMIN_EMAIL || 'admin@ondedicacao.com',
          subject: template.subject,
          html: template.html,
          attachments
        })

        console.log('✅ Notifica admin inviata con Resend')
      } else {
        console.log('📧 Notifica admin mock (Resend non configurato)')
      }
      
      return true
    } catch (error) {
      console.error('Errore invio notifica admin:', error)
      return false
    }
  }
}
```

---

### Opzione 2: SendGrid

#### 1. Installazione
```bash
npm install @sendgrid/mail
```

#### 2. Configurazione ENV
```env
SENDGRID_API_KEY=SG.123456789
SENDER_EMAIL=ordini@ondedicacao.com
ADMIN_EMAIL=admin@ondedicacao.com
```

#### 3. Modifica `lib/email-service.ts`
```typescript
import sgMail from '@sendgrid/mail'

export class EmailService {
  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    }
  }

  async sendOrderConfirmation(data: OrderEmailData, pdfAttachment?: Buffer): Promise<boolean> {
    try {
      const template = this.createOrderConfirmationTemplate(data)
      
      if (pdfAttachment) {
        template.attachments = [{
          filename: `proforma_${data.orderId}.pdf`,
          content: pdfAttachment,
          contentType: 'application/pdf'
        }]
      }

      if (process.env.SENDGRID_API_KEY) {
        const msg = {
          to: data.userEmail,
          from: process.env.SENDER_EMAIL || 'ordini@ondedicacao.com',
          subject: template.subject,
          html: template.html,
          text: template.text,
          attachments: template.attachments?.map(att => ({
            content: att.content.toString('base64'),
            filename: att.filename,
            type: att.contentType,
            disposition: 'attachment'
          }))
        }

        await sgMail.send(msg)
        console.log('✅ Email inviata con SendGrid:', data.userEmail)
      } else {
        console.log('📧 Email mock (SendGrid non configurato)')
      }
      
      return true
    } catch (error) {
      console.error('Errore invio email:', error)
      return false
    }
  }
}
```

---

### Opzione 3: NodeMailer (SMTP Generico)

#### 1. Installazione
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

#### 2. Configurazione ENV
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SENDER_EMAIL=ordini@ondedicacao.com
ADMIN_EMAIL=admin@ondedicacao.com
```

#### 3. Modifica `lib/email-service.ts`
```typescript
import nodemailer from 'nodemailer'

export class EmailService {
  private transporter: any = null

  constructor() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      })
    }
  }

  async sendOrderConfirmation(data: OrderEmailData, pdfAttachment?: Buffer): Promise<boolean> {
    try {
      const template = this.createOrderConfirmationTemplate(data)
      
      if (pdfAttachment) {
        template.attachments = [{
          filename: `proforma_${data.orderId}.pdf`,
          content: pdfAttachment,
          contentType: 'application/pdf'
        }]
      }

      if (this.transporter) {
        await this.transporter.sendMail({
          from: process.env.SENDER_EMAIL,
          to: data.userEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
          attachments: template.attachments?.map(att => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType
          }))
        })

        console.log('✅ Email inviata con NodeMailer:', data.userEmail)
      } else {
        console.log('📧 Email mock (SMTP non configurato)')
      }
      
      return true
    } catch (error) {
      console.error('Errore invio email:', error)
      return false
    }
  }
}
```

---

## Test del Sistema

### 1. Test Generazione PDF
```bash
# Avvia il server di sviluppo
npm run dev

# In un altro terminale, testa l'endpoint PDF
curl -X GET http://localhost:3000/api/orders/[ORDER_ID]/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output test.pdf
```

### 2. Test Email (Mock)
Le email in modalità mock verranno loggate nella console del server. Controlla i log dopo:
- Completamento di un ordine
- Aggiornamento dello stato di un ordine

### 3. Verifica Webhook Stripe
```bash
# Usa Stripe CLI per testare in locale
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger checkout.session.completed
```

## Personalizzazione PDF

Il PDF è completamente personalizzabile modificando `lib/pdf-service.ts`:

- **Logo**: Aggiungi immagine nel metodo `addHeader()`
- **Colori**: Modifica i colori brand nelle costanti
- **Layout**: Personalizza tabelle e sezioni
- **Footer**: Aggiungi informazioni legali/fiscali

## Note Importanti

⚠️ **Produzione**:
- Assicurati di verificare il dominio email con il provider scelto
- Configura SPF, DKIM e DMARC per evitare spam
- Usa variabili d'ambiente per le credenziali (mai committare chiavi API)

✅ **Pronto all'uso**:
- Il sistema attuale funziona in modalità mock
- Basta configurare un provider email per attivare l'invio reale
- Nessuna modifica al flusso ordini richiesta

## Supporto

Per domande o problemi:
1. Verifica i log del server (`console.log`)
2. Controlla le variabili d'ambiente
3. Testa prima in sviluppo, poi in produzione

