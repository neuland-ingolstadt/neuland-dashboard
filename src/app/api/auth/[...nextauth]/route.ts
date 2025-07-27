import NextAuth, { type NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import AuthentikProvider from 'next-auth/providers/authentik'

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      console.error('No refresh token available to refresh access token.')
      return { ...token, error: 'RefreshAccessTokenError' }
    }

    const params = new URLSearchParams({
      client_id: process.env.AUTHENTIK_ID || '',
      client_secret: process.env.AUTHENTIK_SECRET || '',
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    })

    const response = await fetch(
      'https://sso.informatik.sexy/application/o/token/',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body: params.toString(),
      }
    )

    const refreshedTokens = await response.json()

    if (!response.ok) {
      console.error(
        'Failed to refresh token:',
        response.status,
        refreshedTokens
      )
      return { ...token, error: 'RefreshAccessTokenError' }
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined,
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)
    return { ...token, error: 'RefreshAccessTokenError' }
  }
}

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
    async signIn({ profile }): Promise<boolean> {
      if (!profile) {
        return false
      }

      const groups = profile.groups || []
      return groups.includes('Neuland Next')
    },

    async jwt({ token, profile, account }): Promise<JWT> {
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at * 1000,
          refreshToken: account.refresh_token,
          user: {
            ...token.user,
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            groups: profile.groups,
          },
          error: undefined,
        }
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token
      }

      return refreshAccessToken(token)
    },

    async session({ session, token }): Promise<typeof session> {
      if (token.error === 'RefreshAccessTokenError') {
        return { ...session, error: 'RefreshAccessTokenError' }
      }

      if (token.accessToken && token.accessTokenExpires && token.user?.groups) {
        session.accessToken = token.accessToken
        session.accessTokenExpires = token.accessTokenExpires
        session.user = {
          ...session.user,
          groups: token.user.groups,
        }
      } else {
        console.warn(
          'Session callback missing expected token properties. Forcing re-login.'
        )
        return { ...session, error: 'RefreshAccessTokenError' }
      }

      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
