import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (
    email: string, 
    password: string
  ) => Promise<{ user: User | null; session: Session | null; }>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)