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
  ChartArea,
  ChartSpline,
  ChevronRight,
  Cpu,
  GalleryVerticalEnd,
  Moon,
  Sun,
  Table,
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
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
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

const DashboardAdminPanel: React.FC = () => {
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
              router.push('/dashboard')
              setOpenMobile(false)
            }}
          >
            <Target />
            <a href="/dashboard">
              <span>Overview</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/** Telemetry */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="telemetry"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              router.push('/dashboard/telemetry')
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
                      router.push('/dashboard/core')
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
                      router.push('/dashboard/node')
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

const DashboardRouteCyclePanel: React.FC = () => {
  const router = useRouter()
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Route Cycle</SidebarGroupLabel>
      <SidebarMenu>
        {/** Report */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="report"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              router.push('/dashboard/cycle/report')
              setOpenMobile(false)
            }}
          >
            <ChartArea />
            <a href="/dashboard/cycle/report">
              <span>Report</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/** Cycles */}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="cycles"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              router.push('/dashboard/cycle')
              setOpenMobile(false)
            }}
          >
            <Table />
            <a href="/dashboard/cycle">
              <span>Cycles</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
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
          <DashboardAdminPanel />
          <DashboardRouteCyclePanel />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 w-full shrink-0 items-center gap-2 transition-[width,height] ease-linear">
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
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
