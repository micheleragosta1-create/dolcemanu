export default function SEO() {
  const siteName = 'Cioccolatini Michele'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const logoUrl = `${siteUrl}/images/ondedicacao.png`

  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: logoUrl,
  }

  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/shop?query={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <link rel="icon" href="/images/ondedicacao.png" />
      <link rel="apple-touch-icon" href="/images/ondedicacao.png" />
      <meta name="theme-color" content="#5e3621" />
      {/* GA4 (env) */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{anonymize_ip:true});` }} />
        </>
      )}
      {/* Meta Pixel (env) */}
      {process.env.NEXT_PUBLIC_FB_PIXEL && (
        <script dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.NEXT_PUBLIC_FB_PIXEL}');fbq('track','PageView');` }} />
      )}
      {process.env.NEXT_PUBLIC_FB_PIXEL && (
        <noscript>
          <img height="1" width="1" style={{display:'none'}} src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL}&ev=PageView&noscript=1`} />
        </noscript>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }} />
    </>
  )
}


