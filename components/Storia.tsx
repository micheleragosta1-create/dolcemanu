import manuImg from '@/app/assets/images/manu.jpg'

export default function Storia() {
  return (
    <section id="storia" className="storia storia-bg">
      <div className="storia-header">
        <h2 className="storia-title">La mia passione</h2>
      </div>
      
      <div className="storia-visual">
        <div className="storia-text-content">
          <h3>La Mia Storia</h3>
          <p>
            Sono Emanuela Napolitano, pastry chef con una grande passione per l&apos;arte dolciaria. Ho avuto il privilegio di 
            formarmi e lavorare nella splendida cornice della Costiera Amalfitana, in particolare a Positano.
          </p>
          <p>
            Ho collaborato con alcuni dei ristoranti stellati più rinomati. Ogni esperienza mi ha permesso di crescere e di 
            sviluppare una mia visione creativa, che unisce tradizione e innovazione.
          </p>
          <p>
            Per me, la pasticceria è un viaggio di sapori e sensazioni, in cui ogni dolce racconta 
            una storia e regala un momento di pura gioia.
          </p>
        </div>
        
        <div className="storia-image-container">
          <img 
            src="/images/manu.jpg"
            alt="Emanuela Napolitano, pastry chef"
            className="storia-image-main"
          />
          
          <div className="storia-beige-box">
            <h4>✨ La Mia Filosofia ✨</h4>
            <p>
              &quot;Ogni dolce è un&apos;opera d&apos;arte che nasce dal cuore, 
              dove la tradizione napoletana incontra l&apos;innovazione moderna 
              per creare emozioni uniche ad ogni morso.&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
