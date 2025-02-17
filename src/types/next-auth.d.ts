import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  export interface Session {
    accessToken: string
    accessTokenExpires: number
    user: {
      groups: string[]
    } & DefaultSession['user']
  }

  export interface Profile {
    groups?: string[]
  }

  export interface Account {
    access_token: string
    expires_at: number
    refresh_token: string
  }
}

declare module 'next-auth/jwt' {
  export interface JWT {
    groups?: string[]
    accessToken?: string
    accessTokenExpires?: number
    refreshToken?: string
  }
}
