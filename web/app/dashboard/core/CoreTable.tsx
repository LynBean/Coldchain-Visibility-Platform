import { Button } from '@/components/ui/button.tsx'
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
import { Typography } from '@/components/ui/typography.tsx'
import { Cvp_DashboardCore_DisplayCoreColdtagAllQuery } from '@/stores/graphql/generated.ts'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import React from 'react'

const CoreTable: React.FC<{
  items: Cvp_DashboardCore_DisplayCoreColdtagAllQuery['displayCoreColdtag']['all']
  onClickEdit?: (
    value: Cvp_DashboardCore_DisplayCoreColdtagAllQuery['displayCoreColdtag']['all'][number]
  ) => void
}> = ({ items, onClickEdit }) => {
  const [tableSortingState, setTableSortingState] = React.useState<SortingState>([])
  const [tableColumnFiltersState, setTableColumnFiltersState] =
    React.useState<ColumnFiltersState>([])
  const [tableVisibilityState, setTableVisibilityState] = React.useState<VisibilityState>(
    {}
  )
  const [tableRowSelectionState, setTableRowSelectionState] = React.useState({})

  const table = useReactTable({
    data: items,
    columns: [
      {
        accessorKey: 'identifier',
        header: 'Name',
        cell: ({ row }) => (
          <Typography className="capitalize">{row.getValue('identifier')}</Typography>
        ),
      },
      {
        accessorKey: 'macAddress',
        header: 'Description',
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
    ],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setTableColumnFiltersState,
    onColumnVisibilityChange: setTableVisibilityState,
    onRowSelectionChange: setTableRowSelectionState,
    onSortingChange: setTableSortingState,
    state: {
      sorting: tableSortingState,
      columnFilters: tableColumnFiltersState,
      columnVisibility: tableVisibilityState,
      rowSelection: tableRowSelectionState,
    },
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
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
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={items.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export default CoreTable
