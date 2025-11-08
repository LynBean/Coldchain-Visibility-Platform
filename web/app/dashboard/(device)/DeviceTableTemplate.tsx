import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import {
  ColumnDef,
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
import React from 'react'

type DeviceTableTemplateProps<T> = {
  items: T[]
  columns: ColumnDef<T>[]
}

const DeviceTableTemplate = <T,>({ items, columns }: DeviceTableTemplateProps<T>) => {
  const [tableSortingState, setTableSortingState] = React.useState<SortingState>([])
  const [tableColumnFiltersState, setTableColumnFiltersState] =
    React.useState<ColumnFiltersState>([])
  const [tableVisibilityState, setTableVisibilityState] = React.useState<VisibilityState>(
    {}
  )
  const [tableRowSelectionState, setTableRowSelectionState] = React.useState({})

  const table = useReactTable({
    data: items,
    columns,
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

export default DeviceTableTemplate
