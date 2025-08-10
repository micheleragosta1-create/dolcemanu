"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

type Toast = {
  id: string
  type: ToastType
  message: string
  duration?: number
}

type ToastContextValue = {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'success', duration: number = 3000) => {
    const id = Math.random().toString(36).slice(2)
    const toast: Toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 6rem;
          right: 1rem;
          z-index: 1050;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 400px;
          width: 100%;
        }
        
        @media (max-width: 480px) {
          .toast-container {
            left: 1rem;
            right: 1rem;
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={18} />
      case 'error': return <AlertCircle size={18} />
      case 'warning': return <AlertCircle size={18} />
      case 'info': return <Info size={18} />
    }
  }

  const getColors = () => {
    switch (toast.type) {
      case 'success': return 'toast-success'
      case 'error': return 'toast-error'
      case 'warning': return 'toast-warning'
      case 'info': return 'toast-info'
    }
  }

  return (
    <div className={`toast ${getColors()} ${isVisible ? 'toast-visible' : ''}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-message">
        {toast.message}
      </div>
      <button className="toast-close" onClick={handleRemove}>
        <X size={16} />
      </button>
      
      <style jsx>{`
        .toast {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border-left: 4px solid;
          transform: translateX(100%);
          opacity: 0;
          transition: all 0.3s ease;
          max-width: 100%;
        }
        
        .toast-visible {
          transform: translateX(0);
          opacity: 1;
        }
        
        .toast-success {
          border-left-color: #10b981;
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        }
        
        .toast-error {
          border-left-color: #ef4444;
          background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
        }
        
        .toast-warning {
          border-left-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
        }
        
        .toast-info {
          border-left-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
        }
        
        .toast-icon {
          flex-shrink: 0;
        }
        
        .toast-success .toast-icon {
          color: #10b981;
        }
        
        .toast-error .toast-icon {
          color: #ef4444;
        }
        
        .toast-warning .toast-icon {
          color: #f59e0b;
        }
        
        .toast-info .toast-icon {
          color: #3b82f6;
        }
        
        .toast-message {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-navy);
          line-height: 1.4;
        }
        
        .toast-close {
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          color: #6b7280;
          transition: all 0.2s ease;
        }
        
        .toast-close:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--color-navy);
        }
      `}</style>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}