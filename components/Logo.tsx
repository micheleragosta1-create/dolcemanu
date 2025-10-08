import Image from 'next/image'

export default function Logo({ className = "logo-image" }: { className?: string }) {
  return (
    <Image
      src="/images/ondedicacao3.png"
      alt="Onde di Cacao"
      className={className}
      width={180}
      height={60}
      priority={false}
    />
  )
}