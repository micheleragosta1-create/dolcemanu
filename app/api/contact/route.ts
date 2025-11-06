import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Inizializza Resend con la chiave API
const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Email di base validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      )
    }

    // Verifica che RESEND_API_KEY sia configurata
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY non configurata')
      return NextResponse.json(
        { error: 'Servizio email non configurato' },
        { status: 500 }
      )
    }

    // Invia l'email a info@ondedicacao.com
    // Per test: usa 'onboarding@resend.dev' se il dominio non è ancora verificato
    const fromEmail = process.env.NODE_ENV === 'production' 
      ? 'Sito Web Dolce Manu <noreply@ondedicacao.com>'
      : 'Dolce Manu <onboarding@resend.dev>' // Dominio sandbox per test

    // In sviluppo con sandbox, Resend permette solo l'invio al tuo email verificato
    // In produzione, invia a info@ondedicacao.com
    const toEmail = process.env.NODE_ENV === 'production'
      ? ['info@ondedicacao.com']
      : ['michele.ragosta1@gmail.com'] // Email di test in sviluppo

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
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
              <h1 style="color: #8b4513;">🍫 Dolce Manu</h1>
              <h2 style="color: #a0522d;">Nuovo Messaggio dal Sito Web</h2>
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
              ${process.env.NODE_ENV !== 'production' ? `
              <p style="color: #ff6b6b; font-size: 12px; margin-top: 10px;">
                ⚠️ MODALITÀ TEST: In produzione, questa email andrà a info@ondedicacao.com
              </p>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Nuovo Messaggio dal Sito Web - Dolce Manu
        
        Dettagli Contatto:
        Nome: ${name}
        Email: ${email}
        ${phone ? `Telefono: ${phone}` : ''}
        
        Messaggio:
        ${message}
        
        ---
        Questo messaggio è stato inviato tramite il form di contatto su ondedicacao.com
        ${process.env.NODE_ENV !== 'production' ? '\n⚠️ MODALITÀ TEST: In produzione, questa email andrà a info@ondedicacao.com' : ''}
      `
    })

    if (error) {
      console.error('Errore Resend:', error)
      return NextResponse.json(
        { error: 'Errore nell\'invio dell\'email' },
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
        emailId: data?.id,
        // Info per debug in sviluppo
        ...(process.env.NODE_ENV !== 'production' && {
          testMode: true,
          sentTo: toEmail[0]
        })
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

