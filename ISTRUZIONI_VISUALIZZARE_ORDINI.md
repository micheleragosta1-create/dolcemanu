# 🎯 Come Visualizzare gli Ordini nell'Area Admin

## Problema
L'area admin non mostra gli ordini a causa delle policy RLS (Row Level Security) di Supabase che bloccano l'accesso.

## ✅ Soluzione in 3 Passi

### Passo 1: Esegui lo Script SQL su Supabase

1. **Apri il Browser** e vai su:
   ```
   https://supabase.com/dashboard
   ```

2. **Seleziona il progetto** "Onde di Cacao" (o il nome del tuo progetto)

3. **Clicca su "SQL Editor"** nella sidebar sinistra
   - Cerca l'icona `</>` oppure la voce "SQL Editor"

4. **Clicca "New Query"** in alto a destra

5. **Copia TUTTO il contenuto** del file `supabase-simple-admin-fix.sql`
   - Il file è già aperto nel tuo editor
   - Premi `Ctrl+A` per selezionare tutto
   - Premi `Ctrl+C` per copiare

6. **Incolla nel SQL Editor** di Supabase
   - Clicca nell'editor di Supabase
   - Premi `Ctrl+V` per incollare

7. **Clicca "RUN"** (o premi `Ctrl+Enter`)
   - Dovresti vedere: "Success. No rows returned"
   - Questo significa che le policy sono state aggiornate! ✅

---

### Passo 2: Verifica che il Server sia in Esecuzione

```bash
# Se non è già avviato, esegui:
npm run dev
```

Il server dovrebbe essere su: `http://localhost:3000`

---

### Passo 3: Accedi all'Area Admin

1. **Apri il browser** e vai su:
   ```
   http://localhost:3000/auth
   ```

2. **Effettua il login** con le tue credenziali admin

3. **Vai all'area admin ordini**:
   ```
   http://localhost:3000/admin/orders
   ```

4. **Dovresti vedere l'ordine di test**:
   - 📧 Email: `cliente.test@example.com`
   - 💰 Totale: €163.10
   - 📦 Status: In Elaborazione
   - 🛍️ 3 prodotti

---

## 🎉 Test del PDF

Quando vedi l'ordine:

1. **Clicca sull'ordine** nella lista
2. Si apriranno i **dettagli** sulla destra
3. In alto a destra vedrai il pulsante **"Scarica PDF"** 📄
4. **Clicca** sul pulsante
5. Il PDF proforma verrà scaricato automaticamente!

---

## ⚠️ Troubleshooting

### Problema: "Accesso negato" nell'area admin

**Soluzione:**
- Assicurati di aver eseguito lo script SQL su Supabase (Passo 1)
- Verifica di essere loggato su `/auth`
- Controlla che il tuo utente sia admin

### Problema: Lo script SQL dà errore

**Soluzione:**
- Controlla di aver copiato **tutto** il contenuto del file
- Assicurati di non aver modificato nulla
- Prova a eseguire i comandi uno alla volta

### Problema: Ancora non vedo gli ordini

**Soluzione 1 - Controlla la console del browser:**
1. Apri gli strumenti sviluppatore (`F12`)
2. Vai su "Console"
3. Cerca errori in rosso
4. Inviami lo screenshot se ci sono errori

**Soluzione 2 - Verifica che l'ordine esista:**
```bash
node scripts/check-order.js
```

Dovrebbe mostrare: "✅ Trovati 1 ordini totali"

---

## 📋 Checklist Rapida

- [ ] Script SQL eseguito su Supabase
- [ ] Server in esecuzione (`npm run dev`)
- [ ] Login effettuato su `/auth`
- [ ] Pagina admin aperta `/admin/orders`
- [ ] Ordine visibile nella lista
- [ ] PDF scaricabile

---

## 🚀 Tutto Funziona?

Se vedi l'ordine e riesci a scaricare il PDF, il sistema è **completo e funzionante**!

Prossimi passi:
- Configura il servizio email (vedi `EMAIL_SETUP_GUIDE.md`)
- Personalizza il PDF se necessario
- Testa il flusso completo di un ordine reale

