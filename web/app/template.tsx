'use client'

import '@/app/global.css'
import { SidebarProvider } from '@/components/ui/sidebar.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import { usePathname } from 'next/navigation.js'
import React from 'react'
import StoreProvider from '../stores/index.tsx'

const Providers: React.FunctionComponent<React.PropsWithChildren> = ({ children }) => {
  const providers = [StoreProvider]

  return providers.reduceRight(
    (child, Provider) => <Provider>{child}</Provider>,
    <>{children}</>
  )
}

const RootTemplate = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  return (
    <Providers>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider defaultOpen={true}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Toaster closeButton={true} position="top-right" />
              {children}
            </motion.div>
          </AnimatePresence>
        </SidebarProvider>
      </ThemeProvider>
    </Providers>
  )
}

export default RootTemplate
