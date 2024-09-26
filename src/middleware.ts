import { withAuth } from 'next-auth/middleware'

export default withAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/',
    error: '/error',
  },
})
