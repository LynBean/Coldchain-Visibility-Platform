import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Cvp_DashboardCycle_DisplayRouteCycleAllQuery } from '@/stores/graphql/generated.ts'
import { Column, Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import React from 'react'
import { statuses } from './RouteCycleTable.tsx'
import RouteCycleTableFacetedFilter from './RouteCycleTableFacetedFilter.tsx'
import RouteCycleTableViewOptions from './RouteCycleTableViewOptions.tsx'

const RouteCycleTableToolbar: React.FC<{
  table: Table<
    Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
  >
  searchTargetColumn?: Column<
    Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
  >
}> = ({ table, searchTargetColumn }) => {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Search"
          value={(searchTargetColumn?.getFilterValue() as string) ?? ''}
          onChange={(event) => searchTargetColumn?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <RouteCycleTableFacetedFilter
          column={table.getColumn('status')}
          title="Status"
          options={Object.entries(statuses).map(([key, value]) => ({
            label: value.label,
            value: key,
            icon: value.icon,
          }))}
        />

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
            Reset
            <X />
          </Button>
        )}
      </div>

      <RouteCycleTableViewOptions table={table} />
    </div>
  )
}

export default RouteCycleTableToolbar
