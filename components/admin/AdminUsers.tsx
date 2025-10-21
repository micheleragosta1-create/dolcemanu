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
  AlertCircle,
  X
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
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newRole, setNewRole] = useState<string>('user')
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<'email' | 'role' | 'created_at'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchAllUsers()
  }, [fetchAllUsers])

  const filteredUsers = users.filter(user => {
    const userId = user.id || user.user_id
    const userEmail = user.email || ''
    const matchesSearch = userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (userId && userId.toLowerCase().includes(searchTerm.toLowerCase()))
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
        case 'email': return (a.email || '').toLowerCase()
        case 'role': return (a.role || 'user').toLowerCase()
        case 'created_at': {
          try {
            return new Date(a.created_at || 0).getTime()
          } catch {
            return 0
          }
        }
      }
    })()
    const vb = ((): any => {
      switch (sortKey) {
        case 'email': return (b.email || '').toLowerCase()
        case 'role': return (b.role || 'user').toLowerCase()
        case 'created_at': {
          try {
            return new Date(b.created_at || 0).getTime()
          } catch {
            return 0
          }
        }
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

  const openUserDetails = (user: any) => {
    setSelectedUser(user)
    setNewRole(user.role || 'user')
  }

  const handleRoleChange = async () => {
    if (!selectedUser) return

    const userId = selectedUser.id || selectedUser.user_id
    setUpdatingUser(userId)
    try {
      const result = await changeUserRole(userId, newRole as any)
      if (result && result.error) {
        alert(`Errore: ${result.error}`)
      } else {
        setSelectedUser({ ...selectedUser, role: newRole })
        fetchAllUsers()
        alert('Ruolo aggiornato con successo!')
      }
    } finally {
      setUpdatingUser(null)
    }
  }

  const roleConfig = {
    super_admin: {
      label: 'Super Admin',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      icon: Crown,
      description: 'Accesso completo a tutto il sistema'
    },
    admin: {
      label: 'Admin',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      icon: Shield,
      description: 'Gestione prodotti e ordini'
    },
    user: {
      label: 'Utente',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      icon: User,
      description: 'Utente standard del negozio'
    }
  }

  const getRoleInfo = (role: string) => roleConfig[role as keyof typeof roleConfig] || roleConfig.user

  const getRoleLabel = (role: string) => {
    return getRoleInfo(role).label
  }

  const formatDateTime = (iso: string) => {
    if (!mounted) return iso
    try {
      const d = new Date(iso)
      return d.toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return iso
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
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Ricerca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca utenti per email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-users"
              />
            </div>

            {/* Filtro per ruolo */}
            <div className="relative lg:w-auto">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select-users"
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
      <div className="stats-grid">
        <div className="stat-card-users">
          <div className="stat-icon-wrapper">
            <User className="stat-icon-users" style={{color: '#6b7280'}} />
          </div>
          <div className="stat-content">
            <p className="stat-label-users">Utenti</p>
            <p className="stat-value-users">
              {users.filter(u => u.role === 'user' || !u.role).length}
            </p>
          </div>
        </div>

        <div className="stat-card-users">
          <div className="stat-icon-wrapper">
            <Shield className="stat-icon-users" style={{color: '#3b82f6'}} />
          </div>
          <div className="stat-content">
            <p className="stat-label-users">Admin</p>
            <p className="stat-value-users">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>

        <div className="stat-card-users">
          <div className="stat-icon-wrapper">
            <Crown className="stat-icon-users" style={{color: '#f59e0b'}} />
          </div>
          <div className="stat-content">
            <p className="stat-label-users">Super Admin</p>
            <p className="stat-value-users">
              {users.filter(u => u.role === 'super_admin').length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista utenti in tabella */}
      <div className="card">
        <div className="card-head"><h3>Utenti ({filteredUsers.length})</h3></div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('email')}>Utente {sortKey==='email' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('role')}>Ruolo {sortKey==='role' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('created_at')}>Registrazione {sortKey==='created_at' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role || 'user')
                const RoleIcon = roleInfo.icon
                const userId = user.id || user.user_id
                
                return (
                  <tr key={userId} className={selectedUser && (selectedUser.id === userId || selectedUser.user_id === userId) ? 'selected-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <Mail className="row-icon" />
                        <div>
                          <div className="user-email">{user.email || 'Email non disponibile'}</div>
                          <div className="user-id">ID: {userId ? userId.slice(0,8) : 'N/A'}...</div>
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      <span 
                        className="status-badge"
                        style={{
                          backgroundColor: roleInfo.bgColor,
                          color: roleInfo.color
                        }}
                      >
                        <RoleIcon size={14} />
                        {roleInfo.label}
                      </span>
                    </td>
                    
                    <td>
                      <span className="row-with-icon">
                        <Calendar className="row-icon" />
                        {formatDateTime(user.created_at)}
                      </span>
                    </td>
                    
                    <td>
                      <button
                        onClick={() => openUserDetails(user)}
                        className="btn-view-details"
                      >
                        <Edit3 size={14} />
                        Modifica Ruolo
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
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

      {/* Pannello Dettagli Utente - Stile identico a ordini */}
      {selectedUser && (
        <div className="user-details">
          <div className="details-header">
            <h2>Modifica Ruolo Utente</h2>
            <button 
              className="close-btn"
              onClick={() => setSelectedUser(null)}
            >
              ×
            </button>
          </div>

          <div className="details-content">
            {/* User Info */}
            <div className="user-section">
              <h3>Informazioni Utente</h3>
              <div className="user-info-card">
                <div className="user-avatar">
                  <Mail size={24} />
                </div>
                <div className="user-info-details">
                  <p className="user-email-large">{selectedUser.email}</p>
                  <p className="user-id-small">ID: {selectedUser.id || selectedUser.user_id}</p>
                </div>
              </div>
            </div>

            {/* Current Role */}
            <div className="role-section">
              <h3>Ruolo Attuale</h3>
              {(() => {
                const roleInfo = getRoleInfo(selectedUser.role || 'user')
                const RoleIcon = roleInfo.icon
                return (
                  <div 
                    className="role-display"
                    style={{
                      backgroundColor: roleInfo.bgColor,
                      color: roleInfo.color
                    }}
                  >
                    <RoleIcon size={20} />
                    <div>
                      <strong>{roleInfo.label}</strong>
                      <p>{roleInfo.description}</p>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Change Role */}
            <div className="role-change-section">
              <h3>Cambia Ruolo</h3>
              <div className="role-select-wrapper">
                <label>Nuovo Ruolo:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="role-select"
                >
                  <option value="user">Utente</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <p className="role-description">
                  {getRoleInfo(newRole).description}
                </p>
              </div>

              <div className="role-actions">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="btn-cancel"
                >
                  Annulla
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={updatingUser === (selectedUser.id || selectedUser.user_id) || newRole === (selectedUser.role || 'user')}
                  className="btn-submit"
                >
                  {updatingUser === (selectedUser.id || selectedUser.user_id) ? 'Aggiornamento...' : 'Aggiorna Ruolo'}
                </button>
              </div>
            </div>

            {/* Registration Info */}
            <div className="timeline-section">
              <h3>Informazioni Registrazione</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <Calendar size={16} />
                  </div>
                  <div className="timeline-content">
                    <strong>Data Registrazione</strong>
                    <span>{formatDateTime(selectedUser.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .search-input-users {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          background: white;
        }

        .search-input-users:focus {
          outline: none;
          border-color: var(--color-brown);
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }

        .search-input-users::placeholder {
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .filter-select-users {
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 180px;
        }

        .filter-select-users:focus {
          outline: none;
          border-color: var(--color-brown);
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }

        /* Responsive adjustments for filters */
        .flex.flex-col.lg\\:flex-row.gap-4 {
          align-items: stretch;
        }

        @media (max-width: 1024px) {
          .flex.flex-col.lg\\:flex-row.gap-4 {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .filter-select-users {
            min-width: auto;
            width: 100%;
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card-users {
          background: white;
          padding: 1.25rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-users {
          width: 20px;
          height: 20px;
        }

        .stat-content {
          flex: 1;
          min-width: 0;
        }

        .stat-label-users {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0 0 0.125rem 0;
          font-weight: 500;
        }

        .stat-value-users {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          line-height: 1;
        }

        .user-cell {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .user-email {
          font-weight: 500;
          color: #1f2937;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.4;
        }

        .user-id {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0.125rem 0 0 0;
          line-height: 1.2;
        }

        .selected-row {
          background: #dbeafe !important;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .btn-view-details {
          padding: 0.5rem 1rem;
          background: var(--color-brown);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-view-details:hover {
          background: #a0522d;
          transform: translateY(-1px);
        }

        /* User Details Panel - Stile identico a /admin/orders */
        .user-details {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          margin-top: 2rem;
          overflow: hidden;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .details-header h2 {
          color: var(--color-navy);
          font-size: 1.3rem;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #999;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #666;
        }

        .details-content {
          padding: 1.5rem;
        }

        .user-section,
        .role-section,
        .role-change-section,
        .timeline-section {
          margin-bottom: 1.5rem;
        }

        .user-section h3,
        .role-section h3,
        .role-change-section h3,
        .timeline-section h3 {
          color: var(--color-navy);
          font-size: 1rem;
          margin: 0 0 0.75rem 0;
          font-weight: 600;
        }

        .user-info-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--color-brown);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-info-details {
          flex: 1;
          min-width: 0;
        }

        .user-email-large {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin: 0 0 0.25rem 0;
          line-height: 1.3;
        }

        .user-id-small {
          font-size: 0.8rem;
          color: #666;
          margin: 0;
          line-height: 1.2;
        }

        .role-display {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .role-display strong {
          display: block;
          margin: 0 0 0.125rem 0;
          font-size: 0.95rem;
        }

        .role-display p {
          font-size: 0.85rem;
          opacity: 0.85;
          margin: 0;
          line-height: 1.3;
        }

        .role-select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .role-select-wrapper label {
          font-weight: 600;
          color: var(--color-navy);
          font-size: 0.875rem;
          margin: 0;
        }

        .role-select {
          padding: 0.625rem 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
        }

        .role-select:focus {
          outline: none;
          border-color: var(--color-brown);
        }

        .role-description {
          font-size: 0.8rem;
          color: #666;
          margin: 0;
          font-style: italic;
          line-height: 1.3;
        }

        .role-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid #e9ecef;
        }

        .btn-cancel {
          padding: 0.625rem 1.25rem;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .btn-submit {
          padding: 0.625rem 1.25rem;
          background: var(--color-brown);
          border: none;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .btn-submit:hover:not(:disabled) {
          background: #a0522d;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .timeline-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-brown);
          flex-shrink: 0;
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .timeline-content strong {
          color: var(--color-navy);
          font-size: 0.875rem;
          margin: 0;
          font-weight: 600;
        }

        .timeline-content span {
          color: #666;
          font-size: 0.8rem;
          line-height: 1.3;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .details-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .role-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
