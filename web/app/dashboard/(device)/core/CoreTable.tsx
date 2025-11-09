import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import { Cvp_DashboardCore_DisplayCoreColdtagAllQuery } from '@/stores/graphql/generated.ts'
import { MoreHorizontal } from 'lucide-react'
import React from 'react'
import DeviceTableTemplate from '../DeviceTableTemplate.tsx'

const CoreTable: React.FC<{
  items: Cvp_DashboardCore_DisplayCoreColdtagAllQuery['displayCoreColdtag']['all']
  onClickEdit?: (
    value: Cvp_DashboardCore_DisplayCoreColdtagAllQuery['displayCoreColdtag']['all'][number]
  ) => void
}> = ({ items, onClickEdit }) => {
  return (
    <DeviceTableTemplate
      items={items}
      columns={[
        {
          accessorKey: 'identifier',
          header: 'Name',
          cell: ({ row }) => (
            <Typography className="capitalize">{row.getValue('identifier')}</Typography>
          ),
        },
        {
          accessorKey: 'macAddress',
          header: 'MAC Address',
          cell: ({ row }) => (
            <Typography className="capitalize">{row.getValue('macAddress')}</Typography>
          ),
        },
        {
          id: 'actions',
          enableHiding: false,
          cell: ({ row }) => {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      onClickEdit?.(row.original)
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          },
        },
      ]}
    />
  )
}

export default CoreTable
