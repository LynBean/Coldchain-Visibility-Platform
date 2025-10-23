import tw from '@/lib/tw.ts'
import React from 'react'

const DashboardShowcaseTemplate: React.FunctionComponent<
  React.PropsWithChildren & {
    sidePanel: React.ReactNode
  }
> = ({ sidePanel, children }) => {
  return (
    <div className={tw`flex h-lvh w-full flex-row`}>
      <div className={tw`h-full w-[328px] shrink-0`}>{sidePanel}</div>

      <div className={tw`h-full w-full overflow-y-auto overflow-x-hidden`}>
        {children}
      </div>
    </div>
  )
}

export default DashboardShowcaseTemplate
