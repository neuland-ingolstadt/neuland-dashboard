import NextAuth, { NextAuthOptions } from 'next-auth'
import AuthentikProvider from 'next-auth/providers/authentik'

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET!,
  providers: [
    AuthentikProvider({
      clientId: process.env.AUTHENTIK_ID!,
      clientSecret: process.env.AUTHENTIK_SECRET!,
      issuer: process.env.AUTHENTIK_ISSUER!,
      authorization: { params: { scope: 'openid email profile groups' } },
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.groups) {
        token.groups = profile.groups
      }

      return token
    },
    async session({ session, token }) {
      if (token.groups) {
        session.user.groups = token.groups || []
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
