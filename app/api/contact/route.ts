import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Inizializza Resend solo se la chiave API è presente
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    // Validazione input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nome, email e messaggio sono obbligatori' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      )
    }

    // Verifica che RESEND_API_KEY sia configurata
    if (!resend) {
      console.error('RESEND_API_KEY non configurata')
      return NextResponse.json(
        { error: 'Servizio email non configurato. Contattaci via email a info@ondedicacao.com' },
        { status: 503 }
      )
    }

    // Usa il dominio verificato su Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL 
      || 'noreply@ondedicacao.com'
    
    const fromName = 'Onde di Cacao'

    // Destinatario: usa la variabile d'ambiente o l'email di default
    const toEmail = process.env.ADMIN_EMAIL || 'info@ondedicacao.com'
    
    // URL del sito per le immagini
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ondedicacao.com'
    const logoUrl = `${siteUrl}/images/logo_onde_di_cacao_1024.png`

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [toEmail],
      replyTo: email, // Permette di rispondere direttamente al cliente
      subject: `Nuovo messaggio da ${name} - Sito Web`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nuovo Messaggio dal Sito</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="Onde di Cacao" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
              <h2 style="color: #a0522d; margin: 0;">Nuovo Messaggio dal Sito Web</h2>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Dettagli Contatto:</h3>
              <p><strong>Nome:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong>Telefono:</strong> ${phone}</p>` : ''}
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Messaggio:</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 0.9em;">
                💡 <strong>Suggerimento:</strong> Puoi rispondere direttamente a questa email per contattare il cliente.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Questo messaggio è stato inviato tramite il form di contatto su ondedicacao.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nuovo Messaggio dal Sito Web - Onde di Cacao

Dettagli Contatto:
Nome: ${name}
Email: ${email}
${phone ? `Telefono: ${phone}` : ''}

Messaggio:
${message}

---
Questo messaggio è stato inviato tramite il form di contatto su ondedicacao.com
      `
    })

    if (error) {
      console.error('Errore Resend:', error)
      return NextResponse.json(
        { error: `Errore nell'invio dell'email: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Email inviata con successo:', {
      id: data?.id,
      to: toEmail,
      from: fromEmail
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Messaggio inviato con successo!',
        emailId: data?.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Errore nel processamento della richiesta:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

