"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database (in production this would be in a real database)
const mockUsers: (User & { password: string })[] = [
  { id: '1', name: 'Mario Rossi', email: 'mario@example.com', password: 'password123' },
  { id: '2', name: 'Giulia Verdi', email: 'giulia@example.com', password: 'password123' }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on page load
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
      setIsLoading(false)
      return false
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password
    }
    
    mockUsers.push(newUser)
    
    const userData = { id: newUser.id, name: newUser.name, email: newUser.email }
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}