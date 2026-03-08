'use client'

import { ThemeProvider } from '@/components/default/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { ConvexClientProvider } from '@/providers/convex-provider'
import { ClerkProvider } from '@clerk/nextjs'
import { PrivyAuthProvider } from '@/contexts/PrivyAuthContext'
import { NetworkProvider } from '@/contexts/NetworkContext'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <PrivyAuthProvider>
          <NetworkProvider>
            <ReactQueryProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </ReactQueryProvider>
          </NetworkProvider>
        </PrivyAuthProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  )
}
