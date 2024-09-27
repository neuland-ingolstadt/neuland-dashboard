import { DialogsProvider } from '@/lib/providers/dialogsProvider'
import { ThemeProvider } from '@/lib/providers/themeProvider'
import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'

import { Inter } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <DialogsProvider>
          <Component {...pageProps} />
        </DialogsProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
