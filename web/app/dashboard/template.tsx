'use client'

import tw from '@/lib/tw.ts'
import React from 'react'
import DashboardSidebar from './DashboardSidebar.tsx'

const DashboardTemplate: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className={tw`flex h-dvh w-dvw`}>
      <DashboardSidebar>{children}</DashboardSidebar>
    </div>
  )
}

export default DashboardTemplate
