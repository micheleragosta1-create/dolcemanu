// Servizio per la generazione di PDF proforma degli ordini
import jsPDF from 'jspdf'
import * as fs from 'fs'
import * as path from 'path'

export interface OrderData {
  orderId: string
  orderNumber?: string
  userEmail: string
  userName?: string
  totalAmount: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  shippingAddress: string
  shippingCity?: string
  shippingPostalCode?: string
  shippingCountry?: string
  status: string
  createdAt: string
}

// Dati aziendali
const COMPANY_INFO = {
  name: 'Onde di Cacao',
  subtitle: 'Cioccolatini Artigianali dalla Costiera Amalfitana',
  address: 'Via Esempio 123',
  city: '84011 Amalfi (SA)',
  country: 'Italia',
  vatNumber: 'P.IVA: 12345678901',
  phone: 'Tel: +39 089 123456',
  email: 'info@ondedicacao.com'
}

export class PDFService {
  private static instance: PDFService

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService()
    }
    return PDFService.instance
  }

  /**
   * Carica il logo come base64
   */
  private getLogoBase64(): string | null {
    try {
      const logoPath = path.join(process.cwd(), 'public', 'images', 'logo_onde_di_cacao_1024.png')
      const logoBuffer = fs.readFileSync(logoPath)
      return `data:image/png;base64,${logoBuffer.toString('base64')}`
    } catch (error) {
      console.error('Errore caricamento logo:', error)
      return null
    }
  }

  /**
   * Genera un PDF proforma per un ordine
   * @param orderData Dati dell'ordine
   * @returns Buffer contenente il PDF generato
   */
  async generateProformaPDF(orderData: OrderData): Promise<Buffer> {
    try {
      const doc = new jsPDF()
      
      let y = 20
      
      // ===== HEADER AZIENDALE CON LOGO =====
      const logoBase64 = this.getLogoBase64()
      
      if (logoBase64) {
        // Logo a sinistra con proporzioni corrette (quadrato 1:1)
        // Dimensioni: 30mm x 30mm per mantenere le proporzioni
        try {
          doc.addImage(logoBase64, 'PNG', 20, y, 30, 30)
        } catch (e) {
          console.error('Errore inserimento logo:', e)
          // Fallback: usa testo se il logo non carica
          doc.setFontSize(18)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(139, 69, 19)
          doc.text(COMPANY_INFO.name, 20, y + 15)
        }
      } else {
        // Fallback: usa testo se il logo non è disponibile
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(139, 69, 19)
        doc.text(COMPANY_INFO.name, 20, y + 15)
      }
      
      y += 35
      
      // Sottotitolo
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 100, 100)
      doc.text(COMPANY_INFO.subtitle, 20, y)
      
      y += 10
      
      // Dati aziendali (sinistra) e Data documento (destra)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      
      // Colonna sinistra - Dati azienda
      const leftCol = 20
      doc.text(COMPANY_INFO.address, leftCol, y)
      y += 4
      doc.text(COMPANY_INFO.city + ', ' + COMPANY_INFO.country, leftCol, y)
      y += 4
      doc.text(COMPANY_INFO.vatNumber, leftCol, y)
      
      // Colonna destra - Data documento
      const rightCol = 190
      const docY = y - 8
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      doc.text('Data: ' + new Date(orderData.createdAt).toLocaleDateString('it-IT'), rightCol, docY, { align: 'right' })
      doc.text('Doc. N.: ' + (orderData.orderNumber || orderData.orderId.substring(0, 8).toUpperCase()), rightCol, docY + 5, { align: 'right' })
      
      y += 8
      
      // Linea separatrice
      doc.setDrawColor(139, 69, 19)
      doc.setLineWidth(0.5)
      doc.line(20, y, 190, y)
      
      y += 12
      
      // ===== INFORMAZIONI ORDINE =====
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 60, 60)
      doc.text('DETTAGLI ORDINE', 20, y)
      
      y += 7
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.text('Stato: ' + this.getStatusLabel(orderData.status), 20, y)
      
      y += 12
      
      // ===== INFORMAZIONI CLIENTE =====
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 60, 60)
      doc.text('CLIENTE', 20, y)
      
      y += 7
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      
      if (orderData.userName) {
        doc.text('Nome: ' + orderData.userName, 20, y)
        y += 5
      }
      doc.text('Email: ' + orderData.userEmail, 20, y)
      
      y += 12
      
      // ===== INDIRIZZO DI SPEDIZIONE =====
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 60, 60)
      doc.text('INDIRIZZO DI SPEDIZIONE', 20, y)
      
      y += 7
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      
      // Gestisci indirizzo multi-linea
      const addressLines = orderData.shippingAddress.split(',').map(s => s.trim())
      addressLines.forEach((line) => {
        if (line) {
          doc.text(line, 20, y)
          y += 4.5
        }
      })
      
      if (orderData.shippingCity && orderData.shippingPostalCode) {
        doc.text(orderData.shippingPostalCode + ' ' + orderData.shippingCity, 20, y)
        y += 4.5
      }
      
      if (orderData.shippingCountry) {
        doc.text(orderData.shippingCountry, 20, y)
        y += 4.5
      }
      
      y += 10
      
      // ===== TABELLA PRODOTTI =====
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(60, 60, 60)
      doc.text('PRODOTTI ORDINATI', 20, y)
      
      y += 8
      
      // Header tabella
      doc.setFillColor(139, 69, 19) // Marrone
      doc.rect(20, y, 170, 7, 'F')
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255) // Bianco
      doc.text('Descrizione', 25, y + 5)
      doc.text('Qt.', 130, y + 5, { align: 'center' })
      doc.text('Prezzo Unit.', 155, y + 5, { align: 'right' })
      doc.text('Totale', 185, y + 5, { align: 'right' })
      
      y += 7
      
      // Righe prodotti
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      
      let alternate = false
      orderData.items.forEach((item) => {
        // Sfondo alternato
        if (alternate) {
          doc.setFillColor(245, 245, 245)
          doc.rect(20, y, 170, 6, 'F')
        }
        
        const itemTotal = item.price * item.quantity
        
        doc.setFontSize(8)
        // Tronca il nome se troppo lungo
        const itemName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name
        doc.text(itemName, 25, y + 4)
        doc.text(item.quantity.toString(), 130, y + 4, { align: 'center' })
        doc.text('EUR ' + item.price.toFixed(2), 155, y + 4, { align: 'right' })
        doc.text('EUR ' + itemTotal.toFixed(2), 185, y + 4, { align: 'right' })
        
        y += 6
        alternate = !alternate
      })
      
      // Linea sotto tabella
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(20, y, 190, y)
      
      y += 8
      
      // ===== TOTALI =====
      // Subtotale
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.text('Subtotale:', 130, y)
      doc.text('EUR ' + orderData.totalAmount.toFixed(2), 185, y, { align: 'right' })
      
      y += 8
      
      // Totale
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(139, 69, 19)
      
      // Box totale
      doc.setFillColor(255, 243, 230) // Beige chiaro
      doc.setDrawColor(139, 69, 19)
      doc.setLineWidth(0.5)
      doc.rect(120, y - 2, 70, 9, 'FD')
      
      doc.text('TOTALE:', 125, y + 4)
      doc.text('EUR ' + orderData.totalAmount.toFixed(2), 185, y + 4, { align: 'right' })
      
      y += 15
      
      // ===== FOOTER =====
      // Posizione footer in fondo alla pagina
      const footerY = 270
      
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.3)
      doc.line(20, footerY - 5, 190, footerY - 5)
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(120, 120, 120)
      doc.text('Questo documento e\' un proforma e non ha valore fiscale.', 105, footerY, { align: 'center' })
      doc.text('Per informazioni: ' + COMPANY_INFO.email + ' - ' + COMPANY_INFO.phone, 105, footerY + 5, { align: 'center' })
      
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text('Generato il ' + new Date().toLocaleDateString('it-IT') + ' alle ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }), 105, footerY + 12, { align: 'center' })
      
      // Converti in Buffer
      const pdfOutput = doc.output('arraybuffer')
      return Buffer.from(pdfOutput)
    } catch (error) {
      console.error('Errore generazione PDF:', error)
      throw error
    }
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'In Attesa',
      'processing': 'In Elaborazione',
      'shipped': 'Spedito',
      'delivered': 'Consegnato',
      'cancelled': 'Annullato'
    }
    return labels[status] || status
  }
}

export default PDFService.getInstance()
