import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Cvp_DashboardCycle_DisplayRouteCycleAllQuery } from '@/stores/graphql/generated.ts'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { CheckCircle, Circle, CircleOff, MoreHorizontal, Timer } from 'lucide-react'
import React from 'react'
import RouteCycleTableColumnHeader from './RouteCycleTableColumnHeader.tsx'
import RouteCycleTablePagination from './RouteCycleTablePagination.tsx'
import RouteCycleTableToolbar from './RouteCycleTableToolbar.tsx'

export const statuses = {
  pending: {
    label: 'Pending',
    icon: Circle,
  },
  inProgress: {
    label: 'In Progress',
    icon: Timer,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
  },
  canceled: {
    label: 'Canceled',
    icon: CircleOff,
  },
} as const

const getTableColumns = ({
  onClickEdit,
}: {
  onClickEdit?: (
    value: Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
  ) => void
}): ColumnDef<
  Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    cell: ({ row }) => <div className="w-20">CYCLE-{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
    meta: {
      label: 'Cycle',
    },
  },
  {
    accessorKey: 'identifier',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    cell: ({ row }) => (
      <span className="max-w-[500px] truncate font-medium">
        {row.getValue('identifier')}
      </span>
    ),
    meta: {
      label: 'Title',
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    cell: ({ row }) => (
      <span className="max-w-[500px] truncate font-medium">
        {row.getValue('description')}
      </span>
    ),
    meta: {
      label: 'Description',
    },
  },
  {
    id: 'status',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    cell: ({ row }) => {
      const status = (() => {
        const { canceled, completed } = row.original
        if (canceled) {
          return statuses['canceled']
        }
        if (completed) {
          return statuses['completed']
        }
        return statuses['inProgress']
      })()

      return (
        <div className="flex w-[100px] items-center gap-2">
          <status.icon className="size-4 text-muted-foreground" />
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, _, values) => {
      const status = (() => {
        const { canceled, completed } = row.original
        if (canceled) {
          return 'canceled'
        }
        if (completed) {
          return 'completed'
        }
        return 'inProgress'
      })()

      return values.includes(status)
    },
    meta: {
      label: 'Status',
    },
  },
  {
    accessorKey: 'ownerName',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    meta: {
      label: 'Owner',
    },
  },
  {
    accessorKey: 'placedAt',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    meta: {
      label: 'Placed at',
    },
  },
  {
    id: 'departure',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    cell: ({ row }) => {
      const { departureLatitude, departureLongitude } = row.original
      return (
        <span>
          {departureLatitude}, {departureLongitude}
        </span>
      )
    },
    meta: {
      label: 'Departure',
    },
  },
  {
    id: 'destination',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    cell: ({ row }) => {
      const { destinationLatitude, destinationLongitude } = row.original
      return (
        <span>
          {destinationLatitude}, {destinationLongitude}
        </span>
      )
    },
    meta: {
      label: 'Destination',
    },
  },
  {
    accessorKey: 'temperatureAlertThreshold',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    cell: ({ row }) => <span>{row.getValue('temperatureAlertThreshold')} °C</span>,
    meta: {
      label: 'Max Temp.',
    },
  },
  {
    accessorKey: 'humidityAlertThreshold',
    header: ({ column }) => (
      <RouteCycleTableColumnHeader
        column={column}
        title={(column.columnDef.meta as { label: string }).label}
      />
    ),
    cell: ({ row }) => <span>{row.getValue('humidityAlertThreshold')}</span>,
    meta: {
      label: 'Max Humid.',
    },
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
]

const RouteCycleTable: React.FC<{
  items: Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all']
  onClickEdit?: (
    value: Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
  ) => void
}> = ({ items, onClickEdit }) => {
  const [columnFilters, onColumnFiltersChange] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, onColumnVisibilityChange] = React.useState<VisibilityState>({
    ownerName: false,
    placedAt: false,
    departure: false,
    destination: false,
    temperatureAlertThreshold: false,
    humidityAlertThreshold: false,
  })
  const [rowSelection, onRowSelectionChange] = React.useState({})
  const [sorting, onSortingChange] = React.useState<SortingState>([])

  const table = useReactTable({
    data: items,
    columns: getTableColumns({ onClickEdit }),
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange,
    onColumnVisibilityChange,
    onRowSelectionChange,
    onSortingChange,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      sorting,
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <RouteCycleTableToolbar
        table={table}
        searchTargetColumn={table.getColumn('identifier')}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-nowrap"
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RouteCycleTablePagination table={table} />
    </div>
  )
}

export default RouteCycleTable
