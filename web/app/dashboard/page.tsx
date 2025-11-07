'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { useErrorState } from '@/stores/error.tsx'
import {
  Cvp_Dashboard_DisplayCoreColdtagAllQuery,
  Cvp_Dashboard_DisplayCoreColdtagByIdQuery,
  Cvp_Dashboard_DisplayNodeColdtagAllQuery,
  Cvp_Dashboard_DisplayNodeColdtagByIdQuery,
} from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import React from 'react'
import CoreTelemetryEventChart from './CoreTelemetryEventChart.tsx'
import NodeAlertEventChart from './NodeAlertEventChart.tsx'
import NodeTelemetryEventChart from './NodeTelemetryEventChart.tsx'

const DashboardPage = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()

  const [state, setState] = React.useState<{
    loading: boolean
    cores?: Cvp_Dashboard_DisplayCoreColdtagAllQuery['displayCoreColdtag']['all']
    nodes?: Cvp_Dashboard_DisplayNodeColdtagAllQuery['displayNodeColdtag']['all']

    fetching: boolean
    current?:
      | Cvp_Dashboard_DisplayCoreColdtagByIdQuery['displayCoreColdtag']['byId']
      | Cvp_Dashboard_DisplayNodeColdtagByIdQuery['displayNodeColdtag']['byId']
    selected?:
      | Cvp_Dashboard_DisplayCoreColdtagAllQuery['displayCoreColdtag']['all'][number]
      | Cvp_Dashboard_DisplayNodeColdtagAllQuery['displayNodeColdtag']['all'][number]
  }>({
    loading: true,
    fetching: false,
  })

  React.useEffect(() => {
    setState((state) => ({ ...state, loading: true }))
    ;(async () => {
      try {
        const [
          {
            displayCoreColdtag: { all: cores },
          },
          {
            displayNodeColdtag: { all: nodes },
          },
        ] = await Promise.all([
          gqlClient.CVP_Dashboard_DisplayCoreColdtagAll(),
          gqlClient.CVP_Dashboard_DisplayNodeColdtagAll(),
        ])
        setState((state) => ({ ...state, cores, nodes }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    })()
  }, [catchError, gqlClient])

  React.useEffect(() => {
    setState((state) => ({ ...state, fetching: true }))
    ;(async () => {
      try {
        if (state.selected?.__typename === 'CoreColdtag') {
          const {
            displayCoreColdtag: { byId: current },
          } = await gqlClient.CVP_Dashboard_DisplayCoreColdtagById({
            coreId: state.selected.id,
          })
          setState((state) => ({ ...state, current }))
        }

        if (state.selected?.__typename === 'NodeColdtag') {
          const {
            displayNodeColdtag: { byId: current },
          } = await gqlClient.CVP_Dashboard_DisplayNodeColdtagById({
            nodeId: state.selected.id,
          })
          setState((state) => ({ ...state, current }))
        }
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, fetching: false }))
      }
    })()
  }, [catchError, gqlClient, state.selected?.__typename, state.selected?.id])

  return (
    <div className="flex flex-col px-4">
      <Select
        value={JSON.stringify(state.selected)}
        onValueChange={(value) => {
          setState((state) => ({ ...state, selected: JSON.parse(value) }))
        }}
      >
        <SelectTrigger className="w-xl">
          <SelectValue placeholder="Select a device" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Cores</SelectLabel>
            {state.cores?.map((item) => (
              <SelectItem key={item.id} value={JSON.stringify(item)}>
                {item.identifier} - {item.macAddress}
              </SelectItem>
            ))}

            <SelectSeparator />

            <SelectLabel>Nodes</SelectLabel>
            {state.nodes?.map((item) => (
              <SelectItem key={item.id} value={JSON.stringify(item)}>
                {item.identifier} - {item.macAddress}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {(() => {
        switch (state.current?.__typename) {
          case 'CoreColdtag':
            return (
              <div className="w-full pt-8">
                <CoreTelemetryEventChart events={state.current.telemetryEvents} />
              </div>
            )

          case 'NodeColdtag':
            return (
              <>
                {state.current && state.current.telemetryEvents.length > 0 && (
                  <div className="w-full pt-8">
                    <NodeTelemetryEventChart events={state.current.telemetryEvents} />
                  </div>
                )}

                {state.current &&
                  [...state.current.alertLiquidEvents, ...state.current.alertImpactEvents]
                    .length > 0 && (
                    <div className="w-full pt-8">
                      <NodeAlertEventChart
                        events={[
                          ...state.current.alertLiquidEvents,
                          ...state.current.alertImpactEvents,
                        ]}
                      />
                    </div>
                  )}
              </>
            )
        }
      })()}
    </div>
  )
}

export default DashboardPage
