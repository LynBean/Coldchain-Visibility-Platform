'use client'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx'
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
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { useErrorState } from '@/stores/error.tsx'
import {
  Cvp_Dashboard_DisplayCoreColdtagAllQuery,
  Cvp_Dashboard_DisplayCoreColdtagByIdQuery,
  Cvp_Dashboard_DisplayNodeColdtagAllQuery,
  Cvp_Dashboard_DisplayNodeColdtagByIdQuery,
} from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { Braces, Cpu } from 'lucide-react'
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

  const DeviceSelectGroup: React.FC = () => (
    <Select
      disabled={state.fetching}
      value={JSON.stringify(state.selected)}
      onValueChange={(value) => {
        setState((state) => ({ ...state, selected: JSON.parse(value) }))
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a device" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Cores</SelectLabel>
          {state.cores?.map((item) => (
            <SelectItem key={item.id} value={JSON.stringify(item)}>
              {item.identifier}
            </SelectItem>
          ))}

          <SelectSeparator />

          <SelectLabel>Nodes</SelectLabel>
          {state.nodes?.map((item) => (
            <SelectItem key={item.id} value={JSON.stringify(item)}>
              {item.identifier}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )

  return (
    <AnimatePresence mode="wait">
      <div className="flex flex-col px-4">
        {state.selected && (
          <motion.div
            key="device-selected-group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DeviceSelectGroup />
          </motion.div>
        )}

        {(() => {
          if (state.loading) {
            return (
              <motion.div
                key="empty-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Empty className="w-full">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Spinner />
                    </EmptyMedia>
                    <EmptyTitle>Loading devices</EmptyTitle>
                    <EmptyDescription>Just a moment.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </motion.div>
            )
          }
          if (state.fetching) {
            switch (state.selected?.__typename) {
              case 'CoreColdtag':
                return (
                  <motion.div
                    key="skeleton-corecoldtag"
                    className="h-64 w-full pt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Skeleton className="h-full w-full" />
                  </motion.div>
                )

              case 'NodeColdtag':
                return (
                  <>
                    <motion.div
                      key="skeleton-nodecoldtag"
                      className="h-64 w-full pt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Skeleton className="h-full w-full" />
                    </motion.div>

                    <motion.div
                      key="skeleton-nodecoldtag-2"
                      className="h-64 w-full pt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Skeleton className="h-full w-full" />
                    </motion.div>
                  </>
                )

              default:
                return undefined
            }
          }

          switch (state.current?.__typename) {
            case 'CoreColdtag': {
              return (
                <motion.div
                  key="chart-corecoldtag"
                  className="w-full pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CoreTelemetryEventChart events={state.current.telemetryEvents} />
                </motion.div>
              )
            }

            case 'NodeColdtag': {
              const totalEvents = [
                ...state.current.telemetryEvents,
                ...state.current.alertLiquidEvents,
                ...state.current.alertImpactEvents,
              ]
              if (totalEvents.length <= 0) {
                return (
                  <motion.div
                    key="empty-data"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Braces />
                        </EmptyMedia>
                        <EmptyTitle>No Data Available</EmptyTitle>
                        <EmptyDescription>
                          This chart has no data to display. Try selecting a different
                          device.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </motion.div>
                )
              }

              return (
                <>
                  {state.current.telemetryEvents.length > 0 && (
                    <motion.div
                      key="chart-nodecoldtag"
                      className="w-full pt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <NodeTelemetryEventChart events={state.current.telemetryEvents} />
                    </motion.div>
                  )}

                  {[
                    ...state.current.alertLiquidEvents,
                    ...state.current.alertImpactEvents,
                  ].length > 0 && (
                    <motion.div
                      key="chart-nodecoldtag-2"
                      className="w-full pt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <NodeAlertEventChart
                        events={[
                          ...state.current.alertLiquidEvents,
                          ...state.current.alertImpactEvents,
                        ]}
                      />
                    </motion.div>
                  )}
                </>
              )
            }

            default: {
              return (
                <motion.div
                  key="empty-selected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Cpu />
                      </EmptyMedia>
                      <EmptyTitle>Select a device</EmptyTitle>
                      <EmptyDescription>
                        You haven&apos;t selected any devices yet. Get started by
                        selecting a device.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <DeviceSelectGroup />
                    </EmptyContent>
                  </Empty>
                </motion.div>
              )
            }
          }
        })()}
      </div>
    </AnimatePresence>
  )
}

export default DashboardPage
