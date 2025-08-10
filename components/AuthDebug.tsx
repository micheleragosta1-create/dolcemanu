"use client"

import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function AuthDebug() {
  const { signUp, signIn, user, loading } = useAuth()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [debugLog, setDebugLog] = useState<string[]>([])

  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleSignUp = async () => {
    addLog('🔄 Tentativo di registrazione...')
    addLog(`📧 Email: ${email}`)
    addLog(`🔑 Password: ${password.length} caratteri`)
    
    try {
      const result = await signUp(email, password)
      addLog('✅ Registrazione completata')
      addLog(`📊 Risultato: ${JSON.stringify(result, null, 2)}`)
    } catch (err: any) {
      addLog(`❌ Errore registrazione: ${err.message}`)
      addLog(`🔍 Tipo errore: ${err.constructor.name}`)
      addLog(`📋 Stack: ${err.stack}`)
    }
  }

  const handleSignIn = async () => {
    addLog('🔄 Tentativo di login...')
    addLog(`📧 Email: ${email}`)
    
    try {
      const result = await signIn(email, password)
      addLog('✅ Login completato')
      addLog(`📊 Risultato: ${JSON.stringify(result, null, 2)}`)
    } catch (err: any) {
      addLog(`❌ Errore login: ${err.message}`)
      addLog(`🔍 Tipo errore: ${err.constructor.name}`)
      addLog(`📋 Stack: ${err.stack}`)
    }
  }

  const clearLog = () => setDebugLog([])

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🐛 Debug Autenticazione Supabase</h2>
      
      {/* Form di test */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🧪 Test Autenticazione</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="test@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="password123"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '🔄 Caricamento...' : '📝 Registrati'}
          </button>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '🔄 Caricamento...' : '🔑 Accedi'}
          </button>
          <button
            onClick={clearLog}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            🗑️ Pulisci Log
          </button>
        </div>
      </div>

      {/* Stato corrente */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📊 Stato Corrente</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Utente:</strong> {user ? `✅ ${user.email}` : '❌ Non autenticato'}</p>
            <p><strong>Loading:</strong> {loading ? '🔄 Sì' : '❌ No'}</p>
          </div>
          <div>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Password:</strong> {'*'.repeat(password.length)}</p>
            <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Log dettagliato */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📋 Log Dettagliato</h3>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
          {debugLog.length === 0 ? (
            <p className="text-gray-500">Nessun log disponibile. Prova a registrarti o accedere.</p>
          ) : (
            debugLog.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Questo componente mostra informazioni dettagliate sul processo di autenticazione</p>
        <p>Usalo per identificare problemi con Supabase Auth</p>
      </div>
    </div>
  )
}
