import type { DefaultSession, DefaultUser } from 'next-auth'
import type { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  export interface Session {
    accessToken: string
    accessTokenExpires: number
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      groups: string[]
    } & DefaultSession['user']
    error?: 'RefreshAccessTokenError'
  }

  export interface User extends DefaultUser {
    groups?: string[]
  }

  export interface Account {
    access_token: string
    expires_at: number
    refresh_token?: string
  }

  export interface Profile {
    groups?: string[]
    sub?: string
    email?: string
    name?: string
  }
}

declare module 'next-auth/jwt' {
  export interface JWT extends DefaultJWT {
    groups?: string[]
    accessToken?: string
    accessTokenExpires?: number
    refreshToken?: string
    error?: 'RefreshAccessTokenError'
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      groups?: string[]
    }
  }
}
