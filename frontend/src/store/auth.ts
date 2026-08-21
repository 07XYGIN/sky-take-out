import { create } from 'zustand'
import type { SessionUser } from '../types'
import { getStoredUser, getToken, removeStoredUser, removeToken, setStoredUser, setToken } from '../lib/storage'

interface AuthState {
  token: string
  user: SessionUser | null
  setSession: (token: string, user?: SessionUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  user: getStoredUser<SessionUser>(),
  setSession: (token, user) => {
    setToken(token)
    if (user) setStoredUser(user)
    set({ token, user: user ?? null })
  },
  clearSession: () => {
    removeToken()
    removeStoredUser()
    set({ token: '', user: null })
  },
}))
