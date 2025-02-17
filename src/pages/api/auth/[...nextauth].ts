import NextAuth, { type NextAuthOptions } from 'next-auth'
import AuthentikProvider from 'next-auth/providers/authentik'

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signIn',
    error: '/auth/error',
  },
  providers: [
    AuthentikProvider({
      clientId: process.env.AUTHENTIK_ID || '',
      clientSecret: process.env.AUTHENTIK_SECRET || '',
      issuer: process.env.AUTHENTIK_ISSUER || '',
      authorization: {
        params: { scope: 'openid email profile groups offline_access' },
      },
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      if (!profile) {
        return false
      }

      const groups = profile.groups || []
      return groups.includes('Neuland Next')
    },
    async jwt({ token, profile, account }) {
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at * 1000,
          refreshToken: account.refresh_token,
          groups: profile.groups,
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.groups && token.accessToken && token.accessTokenExpires) {
        session.user.groups = token.groups || []
        session.accessToken = token.accessToken
        session.accessTokenExpires = token.accessTokenExpires
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
