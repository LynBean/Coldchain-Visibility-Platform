import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { Metadata } from 'next'
import React from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soonlinmas Warehouse',
  description: 'Soonlinmas Warehouse',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen flex-col items-center">
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            {children}
          </AppRouterCacheProvider>
        </main>
      </body>
    </html>
  )
}

export default RootLayout
