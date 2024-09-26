import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  export interface Session {
    user: {
      groups: string[]
    } & DefaultSession['user']
  }

  export interface Profile {
    groups?: string[]
  }
}

declare module 'next-auth/jwt' {
  export interface JWT {
    groups?: string[]
  }
}
