import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
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
    <SessionProvider
      session={pageProps.session}
      refetchInterval={5 * 60} // 5 minutes
      refetchOnWindowFocus={true}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={150}>
          <DialogsProvider>
            <Component {...pageProps} />
            <Toaster richColors />
          </DialogsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
