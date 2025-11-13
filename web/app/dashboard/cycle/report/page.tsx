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
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import { useErrorState } from '@/stores/error.tsx'
import {
  Cvp_DashboardCycleReport_DisplayRouteCycleAllQuery,
  Cvp_DashboardCycleReport_DisplayRouteCycleByIdQuery,
} from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Braces,
  CircleOff,
  Container,
  Cpu,
  Droplets,
  Locate,
  LocateFixed,
  PlaneLanding,
  PlaneTakeoff,
  Thermometer,
  User,
} from 'lucide-react'
import React from 'react'
import NodeAlertEventChart from '../../telemetry/NodeAlertEventChart.tsx'
import NodeTelemetryEventChart from '../../telemetry/NodeTelemetryEventChart.tsx'
import RouteCycleAlertEventChart from './RouteCycleAlertEventChart.tsx'
import RouteCyclePrintReport from './RouteCyclePrintReport.tsx'

const DashboardChartsPage = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()

  const [state, setState] = React.useState<{
    loading: boolean
    items?: Cvp_DashboardCycleReport_DisplayRouteCycleAllQuery['displayRouteCycle']['all']

    fetching: boolean
    current?: Cvp_DashboardCycleReport_DisplayRouteCycleByIdQuery['displayRouteCycle']['byId']
    selected?: Cvp_DashboardCycleReport_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
  }>({
    loading: true,
    fetching: false,
  })

  React.useEffect(() => {
    setState((state) => ({ ...state, loading: true }))
    ;(async () => {
      try {
        const {
          displayRouteCycle: { all: items },
        } = await gqlClient.CVP_DashboardCycleReport_DisplayRouteCycleAll()
        setState((state) => ({ ...state, items }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    })()
  }, [catchError, gqlClient])

  const debounceRouteCycleIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!state.selected?.started) {
      return
    }
    const routeCycleId = state.selected?.id
    if (routeCycleId == null) {
      return
    }
    debounceRouteCycleIdRef.current = routeCycleId
    setState((state) => ({ ...state, fetching: true }))
    ;(async () => {
      try {
        const {
          displayRouteCycle: { byId: current },
        } = await gqlClient.CVP_DashboardCycleReport_DisplayRouteCycleById({
          routeCycleId,
        })
        if (debounceRouteCycleIdRef.current !== routeCycleId) {
          return
        }
        setState((state) => ({ ...state, current }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, fetching: false }))
      }
    })()
  }, [
    catchError,
    gqlClient,
    state.selected?.__typename,
    state.selected?.id,
    state.selected?.started,
  ])

  const RouteCycleSelectGroup: React.FC = () => (
    <Select
      disabled={state.fetching}
      value={JSON.stringify(state.selected)}
      onValueChange={(value) => {
        setState((state) => ({ ...state, selected: JSON.parse(value) }))
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a cycle" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {state.items?.map((item) => (
            <SelectItem key={item.id} value={JSON.stringify(item)}>
              <div className="flex flex-row gap-1">
                <span className="w-18 text-muted-foreground">CYCLE-{item.id}</span>
                <span className="max-w-sm truncate font-medium">{item.identifier}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )

  const RouteCycleInfo: React.FC = () => {
    return (
      <div className="grid grid-cols-2 gap-2 py-4">
        {(
          [
            {
              icon: <User className="text-blue-800" />,
              title: 'Client',
              description: state.current?.ownerName ? (
                <ItemDescription>{state.current.ownerName}</ItemDescription>
              ) : (
                <ItemDescription>Not Available</ItemDescription>
              ),
            },
            {
              icon: <Container className="text-orange-600" />,
              title: 'Placing at',
              description: state.current?.placedAt ? (
                <ItemDescription>{state.current.placedAt}</ItemDescription>
              ) : (
                <ItemDescription>Not Available</ItemDescription>
              ),
            },
            {
              icon: <PlaneTakeoff className="text-amber-600" />,
              title: 'Dispatch Time',
              description: state.current?.dispatchTime && (
                <ItemDescription>
                  {new Date(state.current.dispatchTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </ItemDescription>
              ),
            },
            {
              icon: <PlaneLanding className="text-green-600" />,
              title: 'Completion Time',
              description: state.current?.completionTime ? (
                <ItemDescription>
                  {new Date(state.current.completionTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </ItemDescription>
              ) : (
                <ItemDescription>In progress</ItemDescription>
              ),
            },

            {
              icon: <Locate className="text-yellow-600" />,
              title: 'Departure',
              description: state.current?.departureCoordinate ? (
                <ItemDescription>
                  {`${state.current?.departureCoordinate.latitude}, ${state.current?.departureCoordinate.longitude}`}
                </ItemDescription>
              ) : (
                <ItemDescription>Not Available</ItemDescription>
              ),
            },
            {
              icon: <LocateFixed className="text-red-600" />,
              title: 'Destination',
              description: state.current?.destinationCoordinate ? (
                <ItemDescription>
                  {`${state.current.destinationCoordinate.latitude}, ${state.current.destinationCoordinate.longitude}`}
                </ItemDescription>
              ) : (
                <ItemDescription>Not Available</ItemDescription>
              ),
            },
            {
              icon: <Thermometer className="text-red-600" />,
              title: 'Max Temp.',
              description: state.current?.temperatureAlertThreshold ? (
                <ItemDescription>
                  {`${state.current.temperatureAlertThreshold} °C`}
                </ItemDescription>
              ) : (
                <ItemDescription>Not Available</ItemDescription>
              ),
            },
            {
              icon: <Droplets className="text-blue-600" />,
              title: 'Max Humid.',
              description: state.current?.humidityAlertThreshold ? (
                <ItemDescription>
                  {`${state.current.humidityAlertThreshold} °C`}
                </ItemDescription>
              ) : (
                <ItemDescription>Not Available</ItemDescription>
              ),
            },
            {
              icon: <Cpu className="text-purple-800" />,
              title: 'Node Info',
              description: (
                <div className="flex flex-col gap-1">
                  <ItemDescription>
                    {state.current?.nodeColdtag.identifier}
                  </ItemDescription>
                  <div className="flex flex-row gap-1 text-muted-foreground">
                    <Typography variant="inline-code">
                      {state.current?.nodeColdtag.id}
                    </Typography>
                    <Typography variant="inline-code">
                      {state.current?.nodeColdtag.macAddress}
                    </Typography>
                  </div>
                </div>
              ),
            },
          ] as {
            className?: string
            icon: React.ReactNode
            title: string | undefined
            description?: string | React.ReactNode | undefined
          }[]
        ).map(({ className, icon, title, description }, index) => (
          <Item key={index} className={className} variant="outline">
            <ItemMedia variant="icon">{icon}</ItemMedia>
            <ItemContent>
              <ItemTitle>{title}</ItemTitle>
              {description}
            </ItemContent>
          </Item>
        ))}
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <div className="flex flex-col px-4">
        {state.selected && (
          <motion.div
            key="cycle-selected-group"
            className="flex flex-row flex-nowrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RouteCyclePrintReport data={state.current} />
            <RouteCycleSelectGroup />
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
                    <EmptyTitle>Loading cycles</EmptyTitle>
                    <EmptyDescription>Just a moment.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </motion.div>
            )
          }

          if (state.fetching) {
            return (
              <>
                <motion.div
                  key="skeleton-cycle"
                  className="h-64 w-full pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Skeleton className="h-full w-full" />
                </motion.div>

                <motion.div
                  key="skeleton-cycle-2"
                  className="h-64 w-full pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Skeleton className="h-full w-full" />
                </motion.div>
              </>
            )
          }

          if (state.selected && !state.selected.started) {
            return (
              <motion.div
                key="chart-cycle-not-started"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CircleOff />
                    </EmptyMedia>
                    <EmptyTitle>Cycle Not Started</EmptyTitle>
                    <EmptyDescription>
                      This chart hasn&apos;t been started yet. Either start this cycle or
                      try selecting a different cycle.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </motion.div>
            )
          }

          if (!state.current) {
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
                    <EmptyTitle>Select a cycle</EmptyTitle>
                    <EmptyDescription>
                      You haven&apos;t selected any cycles yet. Get started by selecting a
                      cycle.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <RouteCycleSelectGroup />
                  </EmptyContent>
                </Empty>
              </motion.div>
            )
          }

          const totalEvents = [
            ...state.current.telemetryEvents,
            ...state.current.alertLiquidEvents,
            ...state.current.alertImpactEvents,
          ]
          if (totalEvents.length <= 0) {
            return (
              <motion.div
                key="chart-cycle-empty"
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
                      This chart has no data to display. Try selecting a different cycle.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </motion.div>
            )
          }

          return (
            <>
              <RouteCycleInfo />

              {[
                ...state.current.alertTemperatureEvents,
                ...state.current.alertHumidityEvents,
              ].length > 0 && (
                <motion.div
                  key="chart-cycle"
                  className="w-full pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RouteCycleAlertEventChart
                    events={[
                      ...state.current.alertTemperatureEvents,
                      ...state.current.alertHumidityEvents,
                    ]}
                  />
                </motion.div>
              )}

              {state.current.telemetryEvents.length > 0 && (
                <motion.div
                  key="chart-cycle-2"
                  className="w-full pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <NodeTelemetryEventChart events={state.current.telemetryEvents} />
                </motion.div>
              )}

              {[...state.current.alertLiquidEvents, ...state.current.alertImpactEvents]
                .length > 0 && (
                <motion.div
                  key="chart-cycle-3"
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
        })()}
      </div>
    </AnimatePresence>
  )
}

export default DashboardChartsPage
