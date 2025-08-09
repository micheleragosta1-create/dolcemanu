export default function Logo({ className = "logo-image" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 420 180" 
      className={className}
      role="img" 
      aria-label="CACAO & MARE logo"
    >
      <defs>
        <style>{`
          .navy{fill:#0b2a42}
          .brown{fill:#5e3621}
          .cream{fill:#f6f3ea}
          .text{fill:#0b2a42;font-family:'Georgia',serif;font-weight:700}
        `}</style>
      </defs>
      <rect width="420" height="180" className="cream"/>
      {/* Wave + cacao mark */}
      <g transform="translate(30,18)">
        <path className="navy" d="M96,0c42,0,68,23,64,44c-9-10-23-16-39-16c-26,0-46,18-46,42c0,23,20,40,46,40c26,0,45-12,61-16c18-5,36,0,52,14c-24-3-44,12-64,22c-20,9-38,14-58,14C67,144,28,117,20,77C10,29,54,0,96,0Z"/>
        <path className="brown" d="M20,92c18-13,44-13,64,2c20,15,44,22,68,18c24-4,43-19,63-28c20-10,38-12,58-8c-26,6-44,22-66,36c-12,8-26,14-40,18c-10,3-16,9-18,17c-2,7,4,18,4,24c0,10-8,18-18,18c-10,0-18-8-18-18c0-11,6-20,6-30c0-17-22-46-54-52c-18-4-32,2-39,9Z"/>
        {/* cacao drop */}
        <circle cx="172" cy="126" r="10" className="brown"/>
      </g>
      {/* Wordmark */}
      <text className="text" x="30" y="165" fontSize="44">CACAO &amp; MARE</text>
    </svg>
  )
}