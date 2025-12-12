# 📸 Guida Integrazione Instagram - Onde di Cacao

## 🎯 Panoramica

Questa guida ti aiuterà a configurare l'integrazione Instagram per mostrare i tuoi ultimi post direttamente sul sito.

## ✅ Prerequisiti

- Un account Instagram Business o Creator
- Una pagina Facebook collegata al tuo account Instagram
- Un account Facebook Developer

## 🔧 Passaggi per la Configurazione

### 1. Crea un'App Facebook

1. Vai su [Facebook Developers](https://developers.facebook.com/)
2. Clicca su "Le mie App" → "Crea App"
3. Seleziona "Business" come tipo di app
4. Compila nome e email, poi clicca "Crea App"

### 2. Configura Instagram Basic Display API

1. Nel dashboard della tua app, vai su "Aggiungi Prodotti"
2. Cerca "Instagram Basic Display" e clicca "Configura"
3. Vai su "Basic Display" → "Impostazioni"
4. Compila:
   - **Nome visualizzato**: Onde di Cacao Website
   - **URI OAuth redirect validi**: `https://tuosito.com/` (o `http://localhost:3000/` per test)
   - **URI deauthorize**: `https://tuosito.com/deauth`
   - **URI eliminazione dati**: `https://tuosito.com/delete`

### 3. Genera il Token di Accesso

#### Metodo Semplice (Token di Breve Durata)

1. Nel dashboard app, vai su "Instagram Basic Display" → "Basic Display"
2. Scorri fino a "User Token Generator"
3. Clicca "Generate Token" accanto al tuo account Instagram
4. Autorizza l'accesso quando richiesto
5. Copia il token generato

#### Metodo Consigliato (Token di Lunga Durata)

Il token di breve durata scade dopo 1 ora. Per ottenere un token di lunga durata (60 giorni):

```bash
# Sostituisci {SHORT_LIVED_TOKEN} col tuo token
# Sostituisci {APP_SECRET} con il Secret della tua app

curl -X GET \
  "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret={APP_SECRET}&access_token={SHORT_LIVED_TOKEN}"
```

Risposta:
```json
{
  "access_token": "IL_TUO_TOKEN_LUNGO",
  "token_type": "bearer",
  "expires_in": 5184000
}
```

### 4. Ottieni il tuo User ID

Con il token ottenuto, esegui questa richiesta per ottenere il tuo User ID:

```bash
curl -X GET \
  "https://graph.instagram.com/me?fields=id,username&access_token={IL_TUO_TOKEN}"
```

Risposta:
```json
{
  "id": "123456789",
  "username": "ondedicacao"
}
```

### 5. Configura le Variabili d'Ambiente

Aggiungi queste variabili al tuo file `.env.local`:

```bash
# Instagram API Configuration
IG_USER_ID=123456789          # L'ID ottenuto al passo 4
IG_ACCESS_TOKEN=IL_TUO_TOKEN  # Il token di lunga durata
```

### 6. Riavvia il Server

```bash
npm run dev
```

## 🔄 Rinnovo Token (Ogni 60 Giorni)

Il token di lunga durata scade dopo 60 giorni. Per rinnovarlo:

```bash
curl -X GET \
  "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={TOKEN_ATTUALE}"
```

**💡 Suggerimento**: Imposta un promemoria nel calendario per rinnovare il token ogni 50 giorni!

## 🧪 Test dell'Integrazione

### Verifica API

Visita questo URL nel browser per testare:
```
https://graph.instagram.com/{IG_USER_ID}/media?fields=id,caption,media_url,permalink,thumbnail_url&access_token={IG_ACCESS_TOKEN}&limit=6
```

### Verifica sul Sito

1. Avvia il server di sviluppo
2. Vai sulla homepage
3. Scorri fino alla sezione Instagram
4. Se configurato correttamente, vedrai i tuoi ultimi 6 post

### Se Qualcosa Non Funziona

L'API fallback mostrerà immagini placeholder. Controlla:
- Le variabili d'ambiente sono impostate?
- Il token non è scaduto?
- L'account Instagram è Business/Creator?

## 📱 Come Funziona

Il componente `InstagramGallery.tsx` funziona così:

1. Chiama l'API `/api/instagram` all'avvio
2. L'API verifica se le credenziali sono configurate
3. Se sì, recupera gli ultimi 6 post dall'API Instagram
4. Se no, mostra le immagini placeholder di fallback

I post vengono cachati per 1 ora per evitare troppe chiamate all'API.

## 🔒 Sicurezza

- **NON** condividere mai il tuo `IG_ACCESS_TOKEN`
- **NON** committare il file `.env.local` nel repository
- Assicurati che `.env.local` sia nel `.gitignore`

## 🆘 Problemi Comuni

### "missing_env" nell'API response
→ Le variabili `IG_USER_ID` o `IG_ACCESS_TOKEN` non sono configurate

### I post non appaiono
→ Controlla la console del browser per errori
→ Verifica che il token non sia scaduto

### Errore 400 Bad Request
→ Il token potrebbe essere scaduto, generane uno nuovo

### Solo alcuni post appaiono
→ L'API mostra solo post pubblici
→ I Reels potrebbero avere solo `thumbnail_url` e non `media_url`

## 📞 Supporto

Per problemi con l'API Instagram:
- [Instagram Basic Display API Documentation](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Facebook Developer Support](https://developers.facebook.com/support/)

---

**🎉 Una volta configurato, i tuoi post Instagram appariranno automaticamente sul sito!**

