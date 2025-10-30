'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { Droplets as CoreIcon, Droplet as NodeIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation.js'
import React from 'react'

const DashboardSidebar: React.FunctionComponent = () => {
  const { setOpen: setSidebarOpen } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Sidebar
      variant="inset"
      className={tw`pr-1 pl-3`}
      collapsible="icon"
      onMouseEnter={() => {
        setSidebarOpen(true)
      }}
      onMouseLeave={() => {
        setSidebarOpen(false)
      }}
    >
      <SidebarContent
        style={{
          padding: '16px 0',
        }}
      >
        {(
          [
            {
              href: '/dashboard/core',
              content: (
                <>
                  <CoreIcon />
                  <Typography variant="inline-code">Core</Typography>
                </>
              ),
              onClick: () => {
                router.push('/dashboard/core')
              },
            },
            {
              href: '/dashboard/node',
              content: (
                <>
                  <NodeIcon />
                  <Typography variant="inline-code">Node</Typography>
                </>
              ),
              onClick: () => {
                router.push('/dashboard/node')
              },
            },
          ] as {
            content: React.ReactNode
            href: string
            onClick: () => void
            children: {
              content: React.ReactNode
              href: string
              onClick: () => void
            }[]
          }[]
        ).map(({ href, content, onClick, children }, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton
              className={pathname.startsWith(href) ? tw`text-green-700` : undefined}
              onClick={onClick}
            >
              {content}
            </SidebarMenuButton>

            {children?.length && (
              <SidebarMenuSub>
                {children.map(({ href, content, onClick }, index) => (
                  <SidebarMenuSubItem key={index}>
                    <SidebarMenuSubButton
                      className={
                        pathname.startsWith(href) ? tw`text-green-700` : undefined
                      }
                      onClick={onClick}
                    >
                      {content}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

const DashboardTemplate: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className={tw`flex h-dvh w-dvw flex-row flex-nowrap`}>
      <DashboardSidebar />
      {children}
    </div>
  )
}

export default DashboardTemplate
