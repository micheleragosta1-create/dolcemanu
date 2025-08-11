export default function Logo({ className = "logo-image" }: { className?: string }) {
  return (
    // Usa un asset in public/images come logo principale
    // Inserisci il file a questo percorso: /public/images/logo-onde-di-cacao.png
    // In mancanza del file, verrà mostrato solo l'alt del tag img
    <img
      src="/images/logo-onde-di-cacao.png"
      alt="Onde di Cacao"
      className={className}
      loading="lazy"
      decoding="async"
    />
  )
}