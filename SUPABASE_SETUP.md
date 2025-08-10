# Integrazione Supabase - Dolce Manu

## Configurazione

### 1. Creare un progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Crea un nuovo progetto
3. Prendi nota di:
   - URL del progetto
   - Chiave anonima (anon key)

### 2. Configurare le variabili d'ambiente

Crea un file `.env.local` nella root del progetto con:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tgixtlyofhtbfcdrkdhm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnaXh0bHlvZmh0YmZjZHJrZGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjEzOTIsImV4cCI6MjA3MDM5NzM5Mn0.xL7_27YPt_jIsJynmBMJg6k93bxvukfN6bA4TNyPkhU
```

### 3. Eseguire lo schema del database

1. Vai nel dashboard Supabase del tuo progetto
2. Apri l'editor SQL
3. Copia e incolla il contenuto di `supabase-schema.sql`
4. Esegui lo script

### 4. Configurare l'autenticazione

Nel dashboard Supabase:
1. Vai su Authentication > Settings
2. Configura i provider di autenticazione (email/password)
3. Imposta le URL di redirect per il tuo dominio

## Funzionalità implementate

### ✅ Autenticazione
- Login/registrazione utenti
- Gestione sessioni
- Protezione delle rotte

### ✅ Database
- Tabella prodotti con RLS
- Tabella ordini con RLS
- Tabella item ordini con RLS
- Indici per performance

### ✅ Hook personalizzati
- `useProducts()` - gestione prodotti
- `useOrders()` - gestione ordini
- `useSupabaseAuth()` - gestione autenticazione

### ✅ Componenti
- `AuthProvider` - provider per l'autenticazione
- `LoginForm` - form di login/registrazione
- Integrazione con le pagine esistenti

## Utilizzo

### Hook per i prodotti

```tsx
import { useProducts } from '@/hooks/useSupabase'

function MyComponent() {
  const { products, loading, error, refetch } = useProducts()
  
  if (loading) return <div>Caricamento...</div>
  if (error) return <div>Errore: {error}</div>
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### Hook per l'autenticazione

```tsx
import { useAuth } from '@/components/AuthContext'

function MyComponent() {
  const { user, signIn, signOut } = useAuth()
  
  if (user) {
    return (
      <div>
        Benvenuto {user.email}
        <button onClick={signOut}>Logout</button>
      </div>
    )
  }
  
  return <div>Non autenticato</div>
}
```

## Sicurezza

- Row Level Security (RLS) abilitato su tutte le tabelle
- Politiche per limitare l'accesso ai dati
- Autenticazione JWT per le operazioni sensibili
- Validazione lato client e server

## Prossimi passi

1. Implementare la gestione del profilo utente
2. Aggiungere la gestione degli indirizzi di spedizione
3. Implementare il sistema di notifiche
4. Aggiungere analytics e tracking ordini
5. Implementare il sistema di recensioni

## Troubleshooting

### Errore "Supabase non è configurato"
- Controlla che il file `.env.local` esista
- Verifica che le variabili d'ambiente siano corrette
- Riavvia il server di sviluppo

### Errore di autenticazione
- Verifica le impostazioni di autenticazione nel dashboard Supabase
- Controlla le URL di redirect
- Verifica che l'email sia confermata (se richiesto)

### Problemi con il database
- Controlla che lo schema sia stato eseguito correttamente
- Verifica le politiche RLS
- Controlla i log nel dashboard Supabase
