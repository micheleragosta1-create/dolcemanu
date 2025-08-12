export default function Logo({ className = "logo-image" }: { className?: string }) {
  return (
    <img
      src="/images/ondedicacao.png"
      alt="Onde di Cacao"
      className={className}
      loading="lazy"
      decoding="async"
    />
  )
}