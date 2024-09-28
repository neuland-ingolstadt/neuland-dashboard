import { withAuth } from 'next-auth/middleware'

export default withAuth({
  secret: process.env.AUTHENTIK_SECRET,
  pages: {
    signIn: '/auth/signIn',
    error: '/auth/error',
  },
})
