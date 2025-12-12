"use client"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function PolicyPage() {
  const oggi = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main>
      <Header />
      <section className="policy-section">
        <div className="policy-container">
          <h1 className="poppins">Termini e Condizioni di Vendita</h1>
          <p className="updated">Ultimo aggiornamento: {oggi}</p>

          <div className="policy-content">
            <p>
              Benvenuto nel nostro store online dedicato al cioccolato artigianale. Ti invitiamo a leggere
              attentamente le presenti Condizioni Generali di Vendita prima di effettuare un ordine.
            </p>

            <h2>1. Oggetto</h2>
            <p>
              Le presenti Condizioni Generali disciplinano la vendita a distanza di prodotti alimentari
              artigianali (principalmente a base di cioccolato) tramite il sito web [Nome del tuo sito],
              gestito da [Tuo nome/azienda], con sede legale in [Indirizzo], P.IVA [Numero].
            </p>

            <h2>2. Caratteristiche dei Prodotti</h2>
            <p>
              I prodotti in vendita sono descritti e presentati nel modo più accurato possibile. Trattandosi
              di produzioni artigianali, possono verificarsi leggere variazioni di forma, peso o colore rispetto
              alle immagini.
            </p>

            <h2>3. Prezzi</h2>
            <p>
              Tutti i prezzi sono espressi in Euro (€) e sono comprensivi di IVA. Le spese di spedizione, ove
              applicabili, vengono indicate al momento dell’ordine.
            </p>

            <h2>4. Ordini</h2>
            <p>
              L’ordine si intende confermato al momento della ricezione del pagamento. Riceverai un’email di
              conferma con il riepilogo dei dettagli.
            </p>

            <h2>5. Pagamenti</h2>
            <p>Accettiamo i seguenti metodi di pagamento:</p>
            <ul>
              <li>Carte di credito/debito</li>
              <li>PayPal</li>
              <li>Bonifico bancario anticipato</li>
            </ul>
            <p>
              I dati di pagamento vengono gestiti in modo sicuro e non sono in alcun modo salvati nei nostri
              sistemi.
            </p>

            <h2 id="spedizione">6. Spedizioni</h2>
            <p>
              I prodotti vengono spediti entro 15 giorni lavorativi dalla ricezione del pagamento. La consegna
              viene effettuata tramite corriere espresso all’indirizzo indicato dal cliente in fase d’ordine.
            </p>
            <p>
              Non siamo responsabili di eventuali ritardi imputabili al corriere o a cause di forza maggiore
              (scioperi, eventi atmosferici, festività, ecc.).
            </p>
            <p>
              Durante i mesi più caldi, adottiamo accorgimenti speciali per preservare la qualità del cioccolato;
              tuttavia, non possiamo garantire l’integrità del prodotto se esposto a temperature elevate durante
              il trasporto.
            </p>

            <h2>7. Diritto di Recesso</h2>
            <p>
              Ai sensi dell’art. 59 del Codice del Consumo, il diritto di recesso non si applica ai prodotti
              alimentari deperibili, come il cioccolato artigianale.
            </p>

            <h2>8. Prodotti Difettosi o Errati</h2>
            <p>
              In caso di ricezione di un prodotto danneggiato o errato, ti invitiamo a contattarci entro 48 ore
              dalla consegna allegando fotografie che documentino il problema. Valuteremo la richiesta ed
              eventualmente provvederemo alla sostituzione o al rimborso.
            </p>

            <h2>9. Responsabilità</h2>
            <p>
              Non siamo responsabili per eventuali danni derivanti da un uso improprio dei prodotti o da
              allergie/intolleranze non comunicate dal cliente. Gli ingredienti e gli allergeni sono sempre
              indicati in etichetta.
            </p>

            <h2 id="privacy">10. Privacy</h2>
            <p>
              I dati personali forniti dal cliente sono trattati in conformità al Regolamento UE 2016/679 (GDPR).
              Per maggiori informazioni, consulta la nostra Privacy Policy.
            </p>

            <h2>11. Legge Applicabile e Foro Competente</h2>
            <p>
              Le presenti condizioni sono regolate dalla legge italiana. Per qualsiasi controversia sarà competente
              il Foro di [tua città o residenza del consumatore se diverso].
            </p>

            <h2>Politica di Spedizione</h2>
            <ul>
              <li>Tempi di evasione ordine: entro 15 giorni lavorativi dalla ricezione del pagamento.</li>
              <li>
                Tempi di consegna: variabili in base alla destinazione e al corriere utilizzato (generalmente 1-3
                giorni lavorativi in Italia).
              </li>
              <li>
                Spedizione in periodi caldi: nei mesi estivi le spedizioni potrebbero essere sospese o programmate
                solo nei primi giorni della settimana per evitare giacenze nei magazzini del corriere.
              </li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .policy-section { position: relative; z-index: 10; padding: 15rem 2rem 3rem; background: var(--color-cream); }
        .policy-container { max-width: 900px; margin: 0 auto; background: #fff; border: 1px solid rgba(0,0,0,.06); border-radius: 12px; padding: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,.06); }
        .policy-content { display: grid; gap: 1rem; color: #333; }
        h1 { margin-bottom: .25rem; color: var(--color-navy); font-size: 2rem; }
        h2 { margin-top: 1rem; color: var(--color-navy); font-size: 1.15rem; }
        .updated { color: #667; margin-bottom: 1rem; }
        ul { padding-left: 1.2rem; }
        li { margin: .25rem 0; }
      `}</style>
    </main>
  )
}


