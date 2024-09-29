import NextAuth, { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import AuthentikProvider from 'next-auth/providers/authentik'

async function refreshAccessToken(token: JWT) {
  try {
    const url = 'https://sso.informatik.sexy/application/o/token/'

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.AUTHENTIK_ID!,
        client_secret: process.env.AUTHENTIK_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken || '',
      }),
      method: 'POST',
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error('Error refreshing access token', error)

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signIn',
    error: '/auth/error',
  },
  providers: [
    AuthentikProvider({
      clientId: process.env.AUTHENTIK_ID!,
      clientSecret: process.env.AUTHENTIK_SECRET!,
      issuer: process.env.AUTHENTIK_ISSUER!,
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

      // Return previous token if it's still valid
      if (Date.now() < (token.accessTokenExpires || 0)) {
        return token
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      if (token.groups && token.accessToken) {
        session.user.groups = token.groups || []
        session.accessToken = token.accessToken
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
