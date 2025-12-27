# Guida alla Configurazione Vercel per SEO

## Problema Risolto
Google stava mostrando "Vercel" come nome del sito invece di "Onde di Cacao" perché:
1. Mancava il meta tag `og:site_name`
2. Il dominio vercel.app veniva indicizzato insieme al dominio principale
3. I dati strutturati erano presenti ma non completamente ottimizzati

## Modifiche Implementate nel Codice

### ✅ 1. Aggiunto `og:site_name` in `app/layout.tsx`
```typescript
openGraph: {
  siteName: 'Onde di Cacao', // ← AGGIUNTO
  // ... altri campi
}
```

### ✅ 2. Dati Strutturati Schema.org già presenti
Il file `components/SEO.tsx` contiene già i dati strutturati corretti con:
- Organization schema
- WebSite schema con SearchAction

## Configurazioni da Fare su Vercel

### 🔴 IMPORTANTE: Configurazione Variabili d'Ambiente

1. **Vai su Vercel Dashboard** → Il tuo progetto
2. **Settings** → **Environment Variables**
3. **Verifica/Aggiungi questa variabile:**

```
NEXT_PUBLIC_SITE_URL=https://ondedicacao.com
```

⚠️ **FONDAMENTALE:** Assicurati che sia impostata su `https://ondedicacao.com` e NON su `https://dolcemanu.vercel.app`

4. **Dopo aver salvato**, fai un **Redeploy** del progetto per applicare le modifiche

### 🔴 IMPORTANTE: Gestione del Dominio Vercel.app

#### Opzione 1: Redirect Automatico (CONSIGLIATA)
Vercel dovrebbe già reindirizzare automaticamente `dolcemanu.vercel.app` → `ondedicacao.com`.

Per verificare:
1. Vai su **Settings** → **Domains**
2. Assicurati che `ondedicacao.com` sia impostato come **Primary Domain**
3. Il dominio `.vercel.app` dovrebbe avere un'icona di redirect

#### Opzione 2: Bloccare l'Indicizzazione di vercel.app
Nel file `app/robots.ts`, aggiungi questa logica:

```typescript
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ondedicacao.com'
  
  // Se siamo sul dominio vercel.app, blocca i crawler
  if (baseUrl.includes('vercel.app')) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      }
    }
  }
  
  // Altrimenti, permetti l'indicizzazione normale
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### 🔴 IMPORTANTE: Verifica su Google Search Console

1. **Aggiungi entrambi i domini** a Google Search Console:
   - `ondedicacao.com`
   - `dolcemanu.vercel.app`

2. **Per il dominio vercel.app:**
   - Vai su **Impostazioni** → **Cambio di indirizzo**
   - Indica che il sito è stato spostato su `ondedicacao.com`

3. **Richiedi la reindicizzazione delle pagine principali:**
   - Usa lo strumento "Controllo URL"
   - Inserisci `https://ondedicacao.com/`
   - Clicca su "Richiedi indicizzazione"

## Verifica delle Modifiche

### Test dei Meta Tag
Dopo il deploy, vai su: https://metatags.io/ e inserisci `https://ondedicacao.com`

Dovresti vedere:
- ✅ Site Name: "Onde di Cacao"
- ✅ OG Site Name: "Onde di Cacao"
- ✅ Canonical URL: "https://ondedicacao.com"

### Test dei Dati Strutturati
Vai su: https://search.google.com/test/rich-results

Inserisci `https://ondedicacao.com` e verifica che vengano rilevati:
- ✅ Organization
- ✅ WebSite (con nome "Onde di Cacao")

### Test Manuale
Apri il codice sorgente della home page (`Ctrl+U` o `Cmd+U`) e cerca:

```html
<!-- Deve esserci questo meta tag -->
<meta property="og:site_name" content="Onde di Cacao" />

<!-- Deve esserci il canonical assoluto -->
<link rel="canonical" href="https://ondedicacao.com/" />

<!-- Devono esserci i JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Onde di Cacao",
  "url": "https://ondedicacao.com"
}
</script>
```

## Tempistiche

- **Cambio dei meta tag:** Effetto immediato sui nuovi crawl
- **Aggiornamento nei risultati di ricerca:** 1-4 settimane
- **Rimozione del dominio vercel.app:** 2-8 settimane

## Checklist Post-Configurazione

- [ ] Variabile `NEXT_PUBLIC_SITE_URL` impostata su Vercel
- [ ] Redeploy fatto dopo le modifiche
- [ ] `ondedicacao.com` impostato come Primary Domain su Vercel
- [ ] Verifica meta tag su metatags.io
- [ ] Verifica dati strutturati su Google Rich Results Test
- [ ] Richiesta reindicizzazione su Google Search Console
- [ ] (Opzionale) Cambio di indirizzo da vercel.app a ondedicacao.com su GSC

## Supporto

Se dopo 2-3 settimane Google continua a mostrare "Vercel":
1. Verifica che la variabile d'ambiente sia corretta
2. Controlla il codice sorgente della pagina live
3. Richiedi nuovamente l'indicizzazione su Google Search Console
4. Considera di aprire un ticket su Google Search Central Community





