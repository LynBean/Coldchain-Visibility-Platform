'use client'

import '@/app/global.css'
import { SidebarProvider } from '@/components/ui/sidebar.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'
import { ThemeProvider } from 'next-themes'
import React from 'react'
import { LoadingBarContainer } from 'react-top-loading-bar'
import StoreProvider from '../stores/index.tsx'
import { Provider as NavigationProgressProvider } from './navigation-progress.tsx'

const Providers: React.FunctionComponent<React.PropsWithChildren> = ({ children }) => {
  const providers = [StoreProvider, NavigationProgressProvider]

  return providers.reduceRight(
    (child, Provider) => <Provider>{child}</Provider>,
    <>{children}</>
  )
}

const RootTemplate = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Providers>
        <SidebarProvider defaultOpen={true}>
          <Toaster closeButton={true} position="top-right" />
          <LoadingBarContainer>{children}</LoadingBarContainer>
        </SidebarProvider>
      </Providers>
    </ThemeProvider>
  )
}

export default RootTemplate
