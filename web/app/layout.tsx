import { customFont, sourceCodePro } from '@/fonts/index.ts'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Coldchain Visibility Platform',
  description: 'Coldchain Visibility Platform',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-custom: ${customFont.style.fontFamily};
                --font-source-code-pro: ${sourceCodePro.style.fontFamily};
                --default-font-family: var(--font-custom);
              }
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground">
        <main className="flex min-h-screen flex-col items-center">{children}</main>
      </body>
    </html>
  )
}

export default RootLayout
