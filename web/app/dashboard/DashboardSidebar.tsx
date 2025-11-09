import { Button } from '@/components/ui/button.tsx'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar.tsx'
import {
  ChartSpline,
  ChevronRight,
  Cpu,
  GalleryVerticalEnd,
  Moon,
  Sun,
  Target,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation.js'
import React from 'react'

const DashboardSidebarHeader: React.FC = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Coldchain Vis. Plat.</span>
            <span className="truncate text-xs">Enterprise</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

const DashboardSidebarContent: React.FC = () => {
  const router = useRouter()
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarMenu>
        {/** Overview */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="dashboard"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              router.replace('/dashboard')
              setOpenMobile(false)
            }}
          >
            <Target />
            <a href="/dashboard">
              <span>Overview</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/** Charts */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="telemetry"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              router.replace('/dashboard/telemetry')
              setOpenMobile(false)
            }}
          >
            <ChartSpline />
            <a href="/dashboard/telemetry">
              <span>Telemetry</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/** Devices */}
        <Collapsible asChild defaultOpen={true} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="devices">
                <Cpu />
                <span>Devices</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  {/** Core */}
                  <SidebarMenuSubButton
                    asChild
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      router.replace('/dashboard/core')
                      setOpenMobile(false)
                    }}
                  >
                    <a href="/dashboard/core">
                      <span>Core device</span>
                    </a>
                  </SidebarMenuSubButton>
                  {/** Node */}
                  <SidebarMenuSubButton
                    asChild
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      router.replace('/dashboard/node')
                      setOpenMobile(false)
                    }}
                  >
                    <a href="/dashboard/node">
                      <span>Node device</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}

const DashboardSidebar: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { setTheme } = useTheme()

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <DashboardSidebarHeader />
        </SidebarHeader>
        <SidebarContent>
          <DashboardSidebarContent />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 w-full shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full flex-row justify-between px-4">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main>{children}</main>
      </SidebarInset>
    </>
  )
}

export default DashboardSidebar
