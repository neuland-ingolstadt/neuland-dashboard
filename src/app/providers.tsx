'use client'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DialogsProvider } from '@/lib/providers/dialogsProvider'
import { ThemeProvider } from '@/lib/providers/themeProvider'
import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={150}>
          <DialogsProvider>
            {children}
            <Toaster richColors />
          </DialogsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
