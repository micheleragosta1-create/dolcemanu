export default function Logo({ className = "logo-image" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 480 180"
      className={className}
      role="img"
      aria-label="Ondi di Cioccolato logo"
    >
      <defs>
        <style>{`
          .cobalt{fill:#0047ab}
          .choco{fill:#5e3621}
          .cream{fill:#faf7f0}
          .turq{fill:#2bb1c9}
          .text{fill:#0b2a42;font-family:'Poppins',sans-serif;font-weight:700;letter-spacing:0.5px}
        `}</style>
        <linearGradient id="chocoGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#6b3a21"/>
          <stop offset="100%" stopColor="#3f2416"/>
        </linearGradient>
      </defs>
      <rect width="480" height="180" className="cream"/>
      {/* Onda di mare... di cioccolato */}
      <g transform="translate(20,20)">
        <path fill="url(#chocoGrad)" d="M0,70 C40,40 80,40 120,70 C160,100 200,100 240,70 C280,40 320,40 360,70 C390,90 420,92 440,88 L440,140 L0,140 Z"/>
        {/* Goccia di cioccolato sulla cresta */}
        <path className="choco" d="M248,58 c8,0 14,6 14,14 c0,10 -12,22 -14,26 c-2,-4 -14,-16 -14,-26 c0,-8 6,-14 14,-14z"/>
        {/* Riflessi */}
        <path className="turq" opacity="0.25" d="M10,118 C60,108 120,116 160,118 C200,120 260,124 320,118"/>
      </g>
      {/* Wordmark */}
      <text className="text" x="24" y="162" fontSize="42">Ondi di Cioccolato</text>
    </svg>
  )
}