"use client"

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { 
  Search, 
  Shield, 
  User, 
  Crown, 
  Mail,
  Calendar,
  Edit3,
  AlertCircle
} from 'lucide-react'

export default function AdminUsers() {
  const { 
    fetchAllUsers, 
    changeUserRole,
    users, 
    usersLoading 
  } = useAdmin()

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [newRole, setNewRole] = useState<string>('user')
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<'email' | 'role' | 'created_at'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  useEffect(() => {
    fetchAllUsers()
  }, [fetchAllUsers])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    const va = ((): any => {
      switch (sortKey) {
        case 'email': return (a.email||'').toLowerCase()
        case 'role': return (a.role||'user').toLowerCase()
        case 'created_at': return new Date(a.created_at).getTime()
      }
    })()
    const vb = ((): any => {
      switch (sortKey) {
        case 'email': return (b.email||'').toLowerCase()
        case 'role': return (b.role||'user').toLowerCase()
        case 'created_at': return new Date(b.created_at).getTime()
      }
    })()
    if (va < vb) return -1 * dir
    if (va > vb) return 1 * dir
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedUsers = sortedUsers.slice(pageStart, pageStart + pageSize)

  const openRoleModal = (user: any) => {
    setEditingUser(user)
    setNewRole(user.role || 'user')
    setShowRoleModal(true)
  }

  const handleRoleChange = async () => {
    if (!editingUser) return

    setUpdatingUser(editingUser.id)
    try {
      const result = await changeUserRole(editingUser.id, newRole as any)
      if (result.error) {
        alert(`Errore: ${result.error}`)
      } else {
        setShowRoleModal(false)
        fetchAllUsers()
      }
    } finally {
      setUpdatingUser(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="w-4 h-4 text-yellow-600" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-600" />
      default: return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-yellow-600 bg-yellow-100'
      case 'admin': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin'
      case 'admin': return 'Admin'
      default: return 'Utente'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Accesso completo a tutto il sistema'
      case 'admin': return 'Gestione prodotti e ordini'
      default: return 'Utente standard del negozio'
    }
  }

  if (usersLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-2 text-gray-600">Caricamento utenti...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container" style={{ padding: '2rem' }}>
      {/* Header e filtri */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-head"><h3>Gestione Utenti</h3></div>
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Ricerca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cerca utenti per email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Filtro per ruolo */}
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white shadow-sm"
              >
                <option value="all">Tutti i ruoli</option>
                <option value="user">Utenti</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiche ruoli */}
      <div className="admin-grid-3">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <User className="w-8 h-8 text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Utenti</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'user' || !u.role).length}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">Utenti standard del negozio</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">Gestione prodotti e ordini</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Super Admin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'super_admin').length}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">Accesso completo al sistema</p>
        </div>
      </div>

      {/* Lista utenti in tabella: una riga per utente */}
      <div className="card">
        <div className="card-head"><h3>Utenti</h3></div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('email')}>Utente {sortKey==='email' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('role')}>Ruolo {sortKey==='role' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('created_at')}>Data Registrazione {sortKey==='created_at' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="row-with-icon"><Mail className="row-icon" />{user.email}</span>
                    <div className="text-xs text-gray-500">ID: {user.id.slice(0,8)}...</div>
                  </td>
                  
                  <td>
                    <div className="flex items-center">
                      {getRoleIcon(user.role || 'user')}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role || 'user')}`}>
                        {getRoleLabel(user.role || 'user')}
                      </span>
                    </div>
                  </td>
                  
                  <td>
                    <span className="row-with-icon"><Calendar className="row-icon" />{new Date(user.created_at).toLocaleDateString('it-IT')}</span>
                  </td>
                  
                  <td>
                    <button
                      onClick={() => openRoleModal(user)}
                      className="btn btn-secondary small flex items-center"
                      title="Modifica ruolo"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Modifica Ruolo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
          <div>
            <label style={{marginRight:8}}>Righe per pagina</label>
            <select value={pageSize} onChange={(e)=>{setPageSize(parseInt(e.target.value)); setPage(1)}} className="px-2 py-1 border border-gray-200 rounded-lg">
              {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="btn btn-secondary small" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>Precedente</button>
            <span>Pagina {currentPage} di {totalPages}</span>
            <button className="btn btn-primary small" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>Successiva</button>
          </div>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="card-body center text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nessun utente trovato</p>
            <p className="text-sm">Prova a modificare i filtri di ricerca</p>
          </div>
        )}
      </div>

      {/* Modal modifica ruolo */}
        {showRoleModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Modifica Ruolo Utente</h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{editingUser.email}</p>
                    <p className="text-sm text-gray-500">ID: {editingUser.id.slice(0, 8)}...</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruolo Attuale
                  </label>
                  <div className="flex items-center">
                    {getRoleIcon(editingUser.role || 'user')}
                    <span className={`ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(editingUser.role || 'user')}`}>
                      {getRoleLabel(editingUser.role || 'user')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getRoleDescription(editingUser.role || 'user')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuovo Ruolo
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="user">Utente</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {getRoleDescription(newRole)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="btn btn-secondary"
                >
                  Annulla
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={updatingUser === editingUser.id || newRole === (editingUser.role || 'user')}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingUser === editingUser.id ? 'Aggiornamento...' : 'Aggiorna Ruolo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
