# 🔧 Fix: Google mostra "Vercel" invece del nome del sito

## ❌ Problema
Quando cerchi il sito su Google, compare "Vercel" invece di "Onde di Cacao - Artigianato dalla Costiera Amalfitana"

## ✅ Soluzione Completata

### 1. **Metadati aggiornati in `app/layout.tsx`**
Ho aggiunto metadati SEO completi:
- ✅ Title e description ottimizzati
- ✅ Keywords per i motori di ricerca
- ✅ Open Graph completo (Facebook, LinkedIn, WhatsApp)
- ✅ Twitter Card
- ✅ Locale italiano (it_IT)
- ✅ Robots ottimizzato per Google

### 2. **Configurazione Vercel (DA FARE)**

#### Passo 1: Aggiungi le variabili d'ambiente
1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto **dolcemanu**
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi queste variabili:

```
Nome: NEXT_PUBLIC_SITE_URL
Valore: https://ondedicacao.com
Environment: Production, Preview, Development
```

✅ **Codice di verifica Google già inserito nel codice**
Il codice `XIq4acpxTlNtBAd8h-dGNQp0mAhwEh-yhRJ0lqspMyQ` è già stato aggiunto nei metadati.

#### Passo 2: Configura il dominio personalizzato (se non l'hai già fatto)
1. Vai su **Settings** → **Domains**
2. Aggiungi `ondedicacao.com` come dominio personalizzato
3. Configura i DNS secondo le istruzioni di Vercel

#### Passo 3: Rideploy il sito
1. Vai su **Deployments**
2. Clicca sui tre puntini dell'ultimo deployment
3. Seleziona **Redeploy**
4. Aspetta che il deployment sia completato

### 3. **Google Search Console (RACCOMANDATO)**

Per velocizzare l'indicizzazione:

1. Vai su [Google Search Console](https://search.google.com/search-console)
2. Aggiungi il tuo sito (se non l'hai già fatto)
3. Verifica la proprietà del sito
4. Invia la sitemap: `https://ondedicacao.com/sitemap.xml`
5. Richiedi l'indicizzazione delle pagine principali:
   - Homepage
   - /shop
   - /policy

### 4. **Verifica le modifiche**

Dopo il redeploy, verifica che i metadati siano corretti:

1. **Testa Open Graph**: https://www.opengraph.xyz/
   - Inserisci: `https://ondedicacao.com`
   - Dovresti vedere "Onde di Cacao" come titolo

2. **Testa Twitter Card**: https://cards-dev.twitter.com/validator
   - Inserisci: `https://ondedicacao.com`

3. **Verifica Google**: cerca su Google:
   - `site:ondedicacao.com`
   - Entro 24-48 ore dovresti vedere i nuovi metadati

### 5. **Tempi di aggiornamento**
- **Vercel**: immediato dopo il redeploy
- **Google**: 24-48 ore per vedere i cambiamenti
- **Google Cache completo**: 1-2 settimane

## 📊 Metadati Aggiunti

### SEO Base
- ✅ Title: "Onde di Cacao - Artigianato dalla Costiera Amalfitana"
- ✅ Description ottimizzata
- ✅ Keywords: cioccolatini artigianali, Costiera Amalfitana, etc.
- ✅ Author, Creator, Publisher

### Open Graph (Social Media)
- ✅ Tipo: website
- ✅ Locale: it_IT
- ✅ Site Name completo
- ✅ Immagine con dimensioni (1200x630)
- ✅ URL canonico

### Twitter
- ✅ Card: summary_large_image
- ✅ Title e description specifici
- ✅ Immagine

### Robots
- ✅ Index e Follow attivi
- ✅ GoogleBot ottimizzato per immagini e snippet

## 🔍 Come verificare che funzioni

1. **Condividi su WhatsApp/Facebook**: dovresti vedere l'anteprima corretta con "Onde di Cacao"
2. **Cerca su Google**: `site:ondedicacao.com` → dopo 24-48h vedrai i nuovi titoli
3. **Controlla il codice sorgente**: 
   ```bash
   curl https://ondedicacao.com | grep -i "onde di cacao"
   ```

## ⚠️ Note Importanti

1. **Non dimenticare** di aggiungere `NEXT_PUBLIC_SITE_URL` su Vercel
2. **Senza quella variabile**, il sito userà ancora `http://localhost:3000`
3. **Dopo ogni modifica**, fai sempre il redeploy su Vercel
4. **Google impiega tempo**: non aspettarti risultati immediati

## 🎯 Risultato Atteso

Dopo aver completato tutti i passaggi, quando cerchi su Google o condividi il link, vedrai:

**Titolo**: Onde di Cacao - Artigianato dalla Costiera Amalfitana
**Descrizione**: Cioccolatini artigianali di alta qualità dalla Costiera Amalfitana. Esperienza stellata, ingredienti premium.
**Immagine**: Logo di Onde di Cacao

---

✅ **Codice aggiornato** - Ready per il deploy
⏳ **Configurazione Vercel** - Da completare manualmente
🔄 **Redeploy** - Necessario dopo aver aggiunto le variabili d'ambiente

