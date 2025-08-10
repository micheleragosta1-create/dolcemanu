# 🎛️ Guida al Pannello Amministrativo - Dolce Manu

## 📋 Panoramica

Il pannello amministrativo di Dolce Manu è un sistema completo per la gestione del negozio online, accessibile solo agli utenti con ruoli di amministratore o super amministratore.

## 🔐 Sistema di Ruoli

### Ruoli Disponibili

1. **👤 Utente (user)**
   - Accesso standard al negozio
   - Possibilità di effettuare acquisti
   - Visualizzazione del proprio profilo

2. **🛡️ Amministratore (admin)**
   - Accesso al pannello amministrativo
   - Gestione prodotti (CRUD completo)
   - Gestione ordini (visualizzazione e modifica stato)
   - Visualizzazione utenti (solo lettura)

3. **👑 Super Amministratore (super_admin)**
   - Tutti i permessi dell'amministratore
   - Gestione ruoli utenti
   - Accesso completo a tutte le funzionalità

## 🚀 Come Accedere

### 1. Registrazione e Login
- Vai alla pagina `/auth`
- Registra un nuovo account o accedi con uno esistente
- **Importante**: Solo gli utenti con ruolo admin/super_admin possono accedere al pannello

### 2. Accesso al Pannello
- Naviga verso `/admin`
- Se non hai i permessi necessari, verrai reindirizzato alla homepage
- Se hai i permessi, vedrai il pannello completo

## 🎯 Funzionalità del Pannello

### 📊 Dashboard
- **Statistiche generali**: Ordini totali, prodotti, utenti, fatturato
- **Metriche chiave**: Ordini in attesa, scorte basse
- **Ultimi ordini**: Lista degli ultimi 5 ordini ricevuti

### 📦 Gestione Prodotti
- **Visualizzazione**: Lista completa dei prodotti con immagini e dettagli
- **Aggiunta**: Form per creare nuovi prodotti
- **Modifica**: Editor inline per aggiornare informazioni
- **Eliminazione**: Rimozione sicura dei prodotti
- **Ricerca**: Filtro per nome, descrizione e categoria
- **Gestione scorte**: Monitoraggio livelli di stock

### 🛒 Gestione Ordini
- **Lista ordini**: Vista completa con filtri e ricerca
- **Aggiornamento stato**: Modifica dello stato degli ordini
- **Dettagli ordine**: Modal con informazioni complete
- **Filtri**: Per stato, data, importo
- **Ricerca**: Per ID ordine o indirizzo di spedizione

### 👥 Gestione Utenti
- **Lista utenti**: Panoramica completa degli utenti registrati
- **Gestione ruoli**: Modifica dei ruoli utente
- **Statistiche ruoli**: Conteggio per tipo di ruolo
- **Filtri**: Per ruolo e ricerca per email/ID

## 🛠️ Configurazione Iniziale

### 1. Database Setup
Esegui questi script SQL nel tuo progetto Supabase:

```sql
-- Esegui prima supabase-schema.sql
-- Poi esegui supabase-roles.sql
```

### 2. Primo Super Admin
Per creare il primo super amministratore:

1. Registra un account normale
2. Vai al dashboard Supabase
3. Esegui questa query SQL:

```sql
INSERT INTO user_roles (user_id, role, created_at, updated_at)
VALUES (
  'ID_UTENTE_QUI', 
  'super_admin', 
  NOW(), 
  NOW()
);
```

### 3. Promozione Admin
Gli utenti esistenti possono essere promossi ad admin tramite:
- Pannello admin → Utenti → Modifica Ruolo
- Oppure direttamente via SQL

## 🔒 Sicurezza

### Row Level Security (RLS)
- **Prodotti**: Solo admin possono modificare
- **Ordini**: Solo admin possono aggiornare stato
- **Utenti**: Solo super admin possono modificare ruoli
- **Ruoli**: Solo super admin possono gestire

### Controllo Accessi
- Verifica automatica dei ruoli ad ogni accesso
- Reindirizzamento automatico per utenti non autorizzati
- Logging delle azioni amministrative

## 📱 Responsive Design

Il pannello è completamente responsive e funziona su:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🎨 Personalizzazione

### Colori e Stili
- **Primario**: Rosa (#ec4899)
- **Secondario**: Blu (#3b82f6)
- **Successo**: Verde (#10b981)
- **Avviso**: Giallo (#f59e0b)
- **Errore**: Rosso (#ef4444)

### Icone
Utilizziamo Lucide React per le icone:
- `Shield` - Amministrazione
- `Package` - Prodotti
- `ShoppingCart` - Ordini
- `Users` - Utenti
- `Crown` - Super Admin

## 🚨 Troubleshooting

### Problemi Comuni

1. **"Accesso negato"**
   - Verifica che l'utente abbia ruolo admin/super_admin
   - Controlla la tabella `user_roles` in Supabase

2. **"Errore durante il caricamento"**
   - Verifica la connessione a Supabase
   - Controlla le variabili d'ambiente
   - Verifica i permessi RLS

3. **"Funzione non trovata"**
   - Esegui nuovamente `supabase-roles.sql`
   - Verifica che le funzioni PostgreSQL siano create

### Debug
Utilizza la console del browser per:
- Verificare errori JavaScript
- Controllare le chiamate API
- Monitorare lo stato dell'autenticazione

## 📞 Supporto

Per problemi tecnici:
1. Controlla i log della console
2. Verifica la configurazione Supabase
3. Controlla i permessi RLS
4. Verifica le funzioni PostgreSQL

## 🔄 Aggiornamenti

Il sistema è progettato per essere facilmente estendibile:
- Nuove funzionalità possono essere aggiunte come nuove tab
- Nuovi ruoli possono essere creati modificando il database
- Nuove tabelle possono essere integrate seguendo il pattern esistente

---

**Nota**: Questa guida è aggiornata alla versione corrente del sistema. Per modifiche o aggiornamenti, consulta la documentazione del codice.
