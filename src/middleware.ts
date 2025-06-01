import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/signIn',
    error: '/auth/error',
  },
})

export const config = {
  matcher: [
    '/((?!favicon.ico|logo.webp).*)',
  ],
}
