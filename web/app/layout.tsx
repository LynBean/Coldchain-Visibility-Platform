import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Coldchain Visibility Platform',
  description: 'Coldchain Visibility Platform',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen flex-col items-center">{children}</main>
      </body>
    </html>
  )
}

export default RootLayout
