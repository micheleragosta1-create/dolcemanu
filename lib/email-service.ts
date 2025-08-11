// Servizio per l'invio di email di notifica ordini
// Per ora implementiamo un mock, ma può essere facilmente sostituito con SendGrid, Resend, o altri servizi

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

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private static instance: EmailService

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  // Email di conferma ordine per il cliente
  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    try {
      const template = this.createOrderConfirmationTemplate(data)
      
      // In produzione, qui invieresti l'email tramite un servizio esterno
      console.log('📧 Email di conferma ordine inviata:', {
        to: data.userEmail,
        subject: template.subject,
        orderId: data.orderId
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
  async sendOrderNotificationToAdmin(data: OrderEmailData): Promise<boolean> {
    try {
      const template = this.createAdminNotificationTemplate(data)
      
      console.log('📧 Notifica ordine inviata all\'admin:', {
        orderId: data.orderId,
        subject: template.subject
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
      `<tr><td>${item.name}</td><td>${item.quantity}</td><td>€${item.price.toFixed(2)}</td></tr>`
    ).join('')

    return {
      subject: `Conferma Ordine #${data.orderId} - Dolce Manu`,
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
              <h1 style="color: #8b4513;">🍫 Dolce Manu</h1>
              <h2 style="color: #a0522d;">Conferma Ordine</h2>
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
                <strong>Totale: €${data.totalAmount.toFixed(2)}</strong>
              </div>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>Indirizzo di Spedizione:</h4>
              <p>${data.shippingAddress}</p>
            </div>
            
            <p>Il tuo ordine è stato ricevuto e verrà processato al più presto. Riceverai un aggiornamento quando verrà spedito.</p>
            
            <p>Per qualsiasi domanda, non esitare a contattarci.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Dolce Manu - Cioccolatini Artigianali dalla Costiera Amalfitana
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Conferma Ordine #${data.orderId} - Dolce Manu
        
        Ciao ${data.userName || 'Cliente'},
        
        Grazie per il tuo ordine! Ecco i dettagli:
        
        Ordine #${data.orderId}
        ${data.items.map(item => `${item.name} x${item.quantity} - €${item.price.toFixed(2)}`).join('\n')}
        
        Totale: €${data.totalAmount.toFixed(2)}
        
        Indirizzo di Spedizione: ${data.shippingAddress}
        
        Il tuo ordine è stato ricevuto e verrà processato al più presto.
        
        Dolce Manu - Cioccolatini Artigianali dalla Costiera Amalfitana
      `
    }
  }

  private createAdminNotificationTemplate(data: OrderEmailData): EmailTemplate {
    const itemsList = data.items.map(item => 
      `<tr><td>${item.name}</td><td>${item.quantity}</td><td>€${item.price.toFixed(2)}</td></tr>`
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
              <p><strong>Totale:</strong> €${data.totalAmount.toFixed(2)}</p>
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
        Totale: €${data.totalAmount.toFixed(2)}
        Stato: ${data.status}
        
        Prodotti Ordinati:
        ${data.items.map(item => `${item.name} x${item.quantity} - €${item.price.toFixed(2)}`).join('\n')}
        
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
                Dolce Manu - Cioccolatini Artigianali dalla Costiera Amalfitana
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
        
        Dolce Manu - Cioccolatini Artigianali dalla Costiera Amalfitana
      `
    }
  }

  private async simulateEmailSending(template: EmailTemplate): Promise<void> {
    // Simula un ritardo di invio email
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

export default EmailService.getInstance()
