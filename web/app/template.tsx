'use client'

import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import React from 'react'
import StoreProvider from '../stores'

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
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-my">
      <Providers>
        <CssBaseline />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Providers>
    </LocalizationProvider>
  )
}

export default RootTemplate
