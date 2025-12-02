// Servizio per l'invio di email di notifica ordini
// Per ora implementiamo un mock, ma può essere facilmente sostituito con SendGrid, Resend, o altri servizi
import { Readable } from 'stream'

export interface OrderEmailData {
  orderId: string
  userEmail: string
  userName?: string
  totalAmount: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  shippingAddress: string
  status: string
}

export interface EmailAttachment {
  filename: string
  content: Buffer | Readable
  contentType: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
  attachments?: EmailAttachment[]
}

export class EmailService {
  private static instance: EmailService

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  private normalizePrice(value: any): number {
    const n = Number(value)
    if (!Number.isFinite(n)) return 0
    // Se sembra in centesimi (es. 1850), converte in euro
    if (Number.isInteger(n) && n >= 500) return n / 100
    return n
  }

  private formatPriceEUR(value: any): string {
    const n = this.normalizePrice(value)
    return n.toFixed(2)
  }

  // Email di conferma ordine per il cliente
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
      
      // In produzione, qui invieresti l'email tramite un servizio esterno
      // Esempio con Resend, SendGrid, NodeMailer, ecc.
      // await this.sendEmailViaProvider(data.userEmail, template)
      
      console.log('📧 Email di conferma ordine inviata:', {
        to: data.userEmail,
        subject: template.subject,
        orderId: data.orderId,
        hasAttachment: !!pdfAttachment
      })

      // Simula l'invio dell'email
      await this.simulateEmailSending(template)
      
      return true
    } catch (error) {
      console.error('Errore nell\'invio email conferma ordine:', error)
      return false
    }
  }

  // Email di notifica ordine per l'amministratore
  async sendOrderNotificationToAdmin(data: OrderEmailData, pdfAttachment?: Buffer): Promise<boolean> {
    try {
      const template = this.createAdminNotificationTemplate(data)
      
      // Aggiungi allegato PDF se fornito
      if (pdfAttachment) {
        template.attachments = [{
          filename: `proforma_${data.orderId}.pdf`,
          content: pdfAttachment,
          contentType: 'application/pdf'
        }]
      }
      
      console.log('📧 Notifica ordine inviata all\'admin:', {
        orderId: data.orderId,
        subject: template.subject,
        hasAttachment: !!pdfAttachment
      })

      await this.simulateEmailSending(template)
      
      return true
    } catch (error) {
      console.error('Errore nell\'invio notifica admin:', error)
      return false
    }
  }

  // Email di aggiornamento stato ordine
  async sendOrderStatusUpdate(data: OrderEmailData): Promise<boolean> {
    try {
      const template = this.createStatusUpdateTemplate(data)
      
      console.log('📧 Aggiornamento stato ordine inviato:', {
        to: data.userEmail,
        orderId: data.orderId,
        status: data.status
      })

      await this.simulateEmailSending(template)
      
      return true
    } catch (error) {
      console.error('Errore nell\'invio aggiornamento stato:', error)
      return false
    }
  }

  private createOrderConfirmationTemplate(data: OrderEmailData): EmailTemplate {
    const itemsList = data.items.map(item => 
      `<tr><td>${item.name}</td><td>${item.quantity}</td><td>€${this.formatPriceEUR(item.price)}</td></tr>`
    ).join('')

    // URL del sito per le immagini
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ondedicacao.com'
    const logoUrl = `${siteUrl}/images/logo_onde_di_cacao_1024.png`

    return {
      subject: `Conferma Ordine #${data.orderId} - Onde di Cacao`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Conferma Ordine</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="Onde di Cacao" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
              <h2 style="color: #a0522d; margin: 0;">Conferma Ordine</h2>
            </div>
            
            <p>Ciao ${data.userName || 'Cliente'},</p>
            
            <p>Grazie per il tuo ordine! Ecco i dettagli:</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Ordine #${data.orderId}</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #8b4513; color: white;">
                    <th style="padding: 10px; text-align: left;">Prodotto</th>
                    <th style="padding: 10px; text-align: center;">Quantità</th>
                    <th style="padding: 10px; text-align: right;">Prezzo</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              
              <div style="text-align: right; margin-top: 20px;">
                <strong>Totale: €${this.formatPriceEUR(data.totalAmount)}</strong>
              </div>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>Indirizzo di Spedizione:</h4>
              <p>${data.shippingAddress}</p>
            </div>
            
            <p>Il tuo ordine è stato ricevuto e verrà processato al più presto. Riceverai un aggiornamento quando verrà spedito.</p>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>📄 Proforma allegata</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 0.9em;">Trovi in allegato il documento proforma con il riepilogo del tuo ordine.</p>
            </div>
            
            <p>Per qualsiasi domanda, non esitare a contattarci.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Onde di Cacao - Cioccolatini Artigianali dalla Costiera Amalfitana
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Conferma Ordine #${data.orderId} - Onde di Cacao
        
        Ciao ${data.userName || 'Cliente'},
        
        Grazie per il tuo ordine! Ecco i dettagli:
        
        Ordine #${data.orderId}
        ${data.items.map(item => `${item.name} x${item.quantity} - €${this.formatPriceEUR(item.price)}`).join('\n')}
        
        Totale: €${this.formatPriceEUR(data.totalAmount)}
        
        Indirizzo di Spedizione: ${data.shippingAddress}
        
        Il tuo ordine è stato ricevuto e verrà processato al più presto.
        
        Onde di Cacao - Cioccolatini Artigianali dalla Costiera Amalfitana
      `
    }
  }

  private createAdminNotificationTemplate(data: OrderEmailData): EmailTemplate {
    const itemsList = data.items.map(item => 
      `<tr><td>${item.name}</td><td>${item.quantity}</td><td>€${this.formatPriceEUR(item.price)}</td></tr>`
    ).join('')

    return {
      subject: `Nuovo Ordine #${data.orderId} - ${data.userEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nuovo Ordine</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8b4513;">🆕 Nuovo Ordine Ricevuto</h1>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Ordine #${data.orderId}</h3>
              <p><strong>Cliente:</strong> ${data.userEmail}</p>
              <p><strong>Totale:</strong> €${this.formatPriceEUR(data.totalAmount)}</p>
              <p><strong>Stato:</strong> ${data.status}</p>
            </div>
            
            <h4>Prodotti Ordinati:</h4>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; border: 1px solid #ddd;">Prodotto</th>
                  <th style="padding: 10px; border: 1px solid #ddd;">Quantità</th>
                  <th style="padding: 10px; border: 1px solid #ddd;">Prezzo</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>Indirizzo di Spedizione:</h4>
              <p>${data.shippingAddress}</p>
            </div>
            
            <p>Accedi al pannello amministrativo per gestire questo ordine.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Nuovo Ordine Ricevuto
        
        Ordine #${data.orderId}
        Cliente: ${data.userEmail}
        Totale: €${this.formatPriceEUR(data.totalAmount)}
        Stato: ${data.status}
        
        Prodotti Ordinati:
        ${data.items.map(item => `${item.name} x${item.quantity} - €${this.formatPriceEUR(item.price)}`).join('\n')}
        
        Indirizzo di Spedizione: ${data.shippingAddress}
        
        Accedi al pannello amministrativo per gestire questo ordine.
      `
    }
  }

  private createStatusUpdateTemplate(data: OrderEmailData): EmailTemplate {
    const statusLabels: Record<string, string> = {
      'processing': 'In Elaborazione',
      'shipped': 'Spedito',
      'delivered': 'Consegnato',
      'cancelled': 'Annullato'
    }

    const statusLabel = statusLabels[data.status] || data.status

    return {
      subject: `Aggiornamento Ordine #${data.orderId} - ${statusLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Aggiornamento Ordine</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8b4513;">📦 Aggiornamento Ordine</h1>
            
            <p>Ciao ${data.userName || 'Cliente'},</p>
            
            <p>Il tuo ordine #${data.orderId} ha un nuovo aggiornamento:</p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="color: #28a745; margin: 0;">Stato: ${statusLabel}</h2>
            </div>
            
            <p>Continueremo a tenerti aggiornato sui progressi del tuo ordine.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Onde di Cacao - Cioccolatini Artigianali dalla Costiera Amalfitana
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Aggiornamento Ordine
        
        Ciao ${data.userName || 'Cliente'},
        
        Il tuo ordine #${data.orderId} ha un nuovo aggiornamento:
        
        Stato: ${statusLabel}
        
        Continueremo a tenerti aggiornato sui progressi del tuo ordine.
        
        Onde di Cacao - Cioccolatini Artigianali dalla Costiera Amalfitana
      `
    }
  }

  private async simulateEmailSending(template: EmailTemplate): Promise<void> {
    // Simula un ritardo di invio email
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

export default EmailService.getInstance()
