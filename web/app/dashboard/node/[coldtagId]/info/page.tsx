'use client'

import { capitalize } from '@/common/string.ts'
import { Button } from '@/components/ui/button.tsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { useErrorState } from '@/stores/error.tsx'
import { Cvp_DashboardNodeInfo_DisplayNodeColdtagByIdQuery } from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { Droplets, ExternalLink, Thermometer } from 'lucide-react'
import { useParams } from 'next/navigation.js'
import React from 'react'
import RechartsPrimitive, {
  Area,
  AreaChart,
  CartesianGrid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from 'recharts'
import DashboardNodeShowcase from '../../DashboardNodeShowcase.tsx'

const DashboardNodeEventDialog: React.FunctionComponent<
  React.PropsWithChildren & {
    title: string
    description: string | React.ReactNode
    open: boolean
    onClose: () => void
  }
> = ({ open, onClose, ...props }) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>

        {props.children}
      </DialogContent>
    </Dialog>
  )
}

const DashboardNodeTelemetryEventsChart: React.FunctionComponent<{
  events: Cvp_DashboardNodeInfo_DisplayNodeColdtagByIdQuery['displayNodeColdtag']['byId']['telemetryEvents']
}> = ({ events }) => {
  type Payload = {
    date: string
    temperature?: number
    humidity?: number
    latitude?: number
    longitude?: number
    coreColdtagId: string
  }

  const [state, setState] = React.useState<{
    payload: Payload[]
  }>({
    payload: [],
  })

  const [dialogState, setDialogState] = React.useState<{
    open: boolean
    current?: Payload
  }>({
    open: false,
  })

  React.useEffect(() => {
    setState((state) => ({
      ...state,
      payload: events
        .map(
          (event) =>
            ({
              date: event.eventTime,
              temperature: event.temperature,
              humidity: event.humidity,
              latitude: event.latitude,
              longitude: event.longitude,
              coreColdtagId: event.coreColdtag.id,
            }) as Payload
        )
        .toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    }))
  }, [events])

  return (
    <>
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Telemetry</CardTitle>
            <CardDescription>Showing telemetry records of all time</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={
              {
                temperature: {
                  label: 'Temperature',
                  color: 'var(--chart-1)',
                },
                humidity: {
                  label: 'Humidity',
                  color: 'var(--chart-2)',
                },
              } satisfies ChartConfig
            }
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart
              data={state.payload}
              onClick={(chartState) => {
                if (
                  chartState &&
                  chartState.activePayload &&
                  chartState.activePayload.length
                ) {
                  setDialogState((state) => ({
                    ...state,
                    open: true,
                    current: chartState.activePayload?.[0].payload as Payload,
                  }))
                }
              }}
            >
              <defs>
                <linearGradient id="fillTemperature" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-temperature)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-temperature)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-humidity)" stopOpacity={0.8} />
                  <stop
                    offset="95%"
                    stopColor="var(--color-humidity)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="temperature"
                type="bump"
                fill="url(#fillTemperature)"
                stroke="var(--color-temperature)"
                stackId="a"
              />
              <Area
                dataKey="humidity"
                type="bump"
                fill="url(#fillHumidity)"
                stroke="var(--color-humidity)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {dialogState.current && (
        <DashboardNodeEventDialog
          title="Telemetry Event"
          description={
            <div className={tw`flex flex-row items-center gap-2`}>
              <span>Recorded at</span>
              <Typography variant="inline-code" className={tw`text-gray-600`}>
                {new Date(dialogState.current.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Typography>
            </div>
          }
          open={dialogState.open}
          onClose={() => {
            setDialogState((state) => ({ ...state, open: false }))
          }}
        >
          <div className={tw`flex flex-col flex-wrap gap-2 py-4`}>
            {(
              [
                {
                  icon: <Thermometer className={tw`text-red-500`} />,
                  content: `${dialogState.current.temperature?.toLocaleString()} °C`,
                },
                {
                  icon: <Droplets className={tw`text-blue-500`} />,
                  content: dialogState.current.humidity?.toLocaleString(),
                },
              ] as {
                icon: React.ReactNode
                content: string | undefined
              }[]
            ).map(({ icon, content }, index) => (
              <div key={index} className={tw`flex items-center justify-start`}>
                <div className={tw`flex flex-row items-center gap-1`}>
                  {icon}

                  <Typography variant="inline-code" className={tw`text-sm`}>
                    {content}
                  </Typography>
                </div>
              </div>
            ))}
          </div>

          <div className={tw`flex flex-col items-end gap-2`}>
            {(
              [
                {
                  title: 'Core Info',
                  onClick: () => {
                    window.open(
                      `${process.env.NEXT_PUBLIC_WEB_URL}/dashboard/core/${dialogState.current?.coreColdtagId}/info`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  },
                },
                {
                  title: 'View on map',
                  onClick: () => {
                    window.open(
                      `https://www.google.com/maps?q=${dialogState.current?.latitude},${dialogState.current?.longitude}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  },
                },
              ] as {
                title: string
                onClick: () => void
              }[]
            ).map(({ title, onClick }, index) => (
              <div key={index} className={tw`flex items-center justify-start`}>
                <div className={tw`flex flex-col gap-1`}>
                  <Button
                    className="flex flex-row items-center justify-center"
                    variant="outline"
                    onClick={onClick}
                  >
                    <ExternalLink />
                    {title}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardNodeEventDialog>
      )}
    </>
  )
}

const DashboardNodeAlertEventsChart: React.FunctionComponent<{
  events: (
    | Cvp_DashboardNodeInfo_DisplayNodeColdtagByIdQuery['displayNodeColdtag']['byId']['alertLiquidEvents'][number]
    | Cvp_DashboardNodeInfo_DisplayNodeColdtagByIdQuery['displayNodeColdtag']['byId']['alertImpactEvents'][number]
  )[]
}> = ({ events }) => {
  type Payload = {
    date: number
    type: 'liquid' | 'impact'
    liquid?: number
    impact?: number
    latitude: number
    longitude: number
    coreColdtagId: string
  }

  const [state, setState] = React.useState<{
    payload: Payload[]
  }>({
    payload: [],
  })

  const [dialogState, setDialogState] = React.useState<{
    open: boolean
    current?: Payload
  }>({
    open: false,
  })

  React.useEffect(() => {
    setState((state) => ({
      ...state,
      payload: events
        .toSorted(
          (a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()
        )
        .map((event, index, arr) => {
          const currentTime = new Date(event.eventTime).getTime()
          const prevTime = index > 0 ? new Date(arr[index - 1].eventTime).getTime() : 0
          const timeDiff = index > 0 ? Math.abs(currentTime - prevTime) : 0
          const variance = Math.min(1, 100000 / (timeDiff + 1)) // closer times → higher variance
          const randomOffset = (Math.random() - 0.5) * variance

          const baseValue = 1.5 + randomOffset
          const clampedValue = Math.min(2, Math.max(1, baseValue))

          return {
            date: currentTime,
            type:
              event.__typename === 'NodeColdtagEventAlertLiquid' ? 'liquid' : 'impact',
            liquid:
              event.__typename === 'NodeColdtagEventAlertLiquid'
                ? clampedValue
                : undefined,
            impact:
              event.__typename === 'NodeColdtagEventAlertImpact'
                ? clampedValue
                : undefined,
            latitude: event.latitude ?? 0,
            longitude: event.longitude ?? 0,
            coreColdtagId: event.coreColdtag.id,
          } as Payload
        }),
    }))
  }, [events])

  return (
    <>
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Showing alert records of all time</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={
              {
                liquid: {
                  label: 'Liquid Alert',
                  color: 'var(--chart-3)',
                },
                impact: {
                  label: 'Impact Alert',
                  color: 'var(--chart-4)',
                },
              } satisfies ChartConfig
            }
            className="aspect-auto h-[250px] w-full"
          >
            <ScatterChart
              data={state.payload}
              onClick={(chartState) => {
                if (
                  chartState &&
                  chartState.activePayload &&
                  chartState.activePayload.length
                ) {
                  setDialogState((state) => ({
                    ...state,
                    open: true,
                    current: chartState.activePayload?.[0].payload as Payload,
                  }))
                }
              }}
            >
              <CartesianGrid syncWithTicks />
              <XAxis
                dataKey="date"
                type="number"
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  return new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                  })
                }}
              />
              <YAxis type="number" domain={[0, 3]} hide />
              <ChartTooltip
                cursor={false}
                content={
                  (({ payload }, ref) => {
                    return (
                      <div
                        ref={ref}
                        className={tw`grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl`}
                      >
                        {payload && payload.length && (
                          <>
                            <div className={tw`font-medium`}>
                              {new Date(payload[0].value as number).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                }
                              )}
                            </div>

                            <div
                              className={tw`flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground`}
                            >
                              <div
                                className={tw`flex flex-1 justify-between gap-1.5 leading-none`}
                              >
                                <div className={tw`grid gap-1.5`}>
                                  <span className={tw`text-muted-foreground`}>
                                    {capitalize(payload[0].payload.type)} alert
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  }) as React.FunctionComponent<
                    React.ComponentProps<typeof RechartsPrimitive.Tooltip>
                  >
                }
              />
              <Scatter dataKey="liquid" fill="var(--color-liquid)" shape="circle" />
              <Scatter dataKey="impact" fill="var(--color-impact)" shape="triangle" />
              <ChartLegend content={<ChartLegendContent />} />
            </ScatterChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {dialogState.current && (
        <DashboardNodeEventDialog
          title={`${capitalize(dialogState.current.type)} alert`}
          description={
            <div className={tw`flex flex-row items-center gap-2`}>
              <span>Recorded at</span>
              <Typography variant="inline-code" className={tw`text-gray-600`}>
                {new Date(dialogState.current.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Typography>
            </div>
          }
          open={dialogState.open}
          onClose={() => {
            setDialogState((state) => ({ ...state, open: false }))
          }}
        >
          <div className={tw`flex flex-col items-end gap-2`}>
            {(
              [
                {
                  title: 'Core Info',
                  onClick: () => {
                    window.open(
                      `${process.env.NEXT_PUBLIC_WEB_URL}/dashboard/core/${dialogState.current?.coreColdtagId}/info`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  },
                },
                {
                  title: 'View on map',
                  onClick: () => {
                    window.open(
                      `https://www.google.com/maps?q=${dialogState.current?.latitude},${dialogState.current?.longitude}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  },
                },
              ] as {
                title: string
                onClick: () => void
              }[]
            ).map(({ title, onClick }, index) => (
              <div key={index} className={tw`flex items-center justify-start`}>
                <div className={tw`flex flex-col gap-1`}>
                  <Button
                    className="flex flex-row items-center justify-center"
                    variant="outline"
                    onClick={onClick}
                  >
                    <ExternalLink />
                    {title}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardNodeEventDialog>
      )}
    </>
  )
}

const DashboardNodeInfoPage: React.FunctionComponent = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()
  const params = useParams()

  const [state, setState] = React.useState<{
    loading: boolean
    item?: Cvp_DashboardNodeInfo_DisplayNodeColdtagByIdQuery['displayNodeColdtag']['byId']
  }>({
    loading: true,
  })

  const debounceColdtagIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    setState((state) => ({ ...state, loading: true }))
    ;(async () => {
      const coldtagId = params.coldtagId as string | null
      if (debounceColdtagIdRef.current === coldtagId) {
        return
      }
      debounceColdtagIdRef.current = coldtagId

      try {
        const {
          displayNodeColdtag: { byId: item },
        } = await gqlClient.CVP_DashboardNodeInfo_DisplayNodeColdtagById({
          nodeId: coldtagId as string,
        })
        if (debounceColdtagIdRef.current !== coldtagId) {
          return
        }
        setState((state) => ({ ...state, item }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    })()
  }, [catchError, gqlClient, params])

  return (
    <DashboardNodeShowcase>
      <div className={tw`flex h-full w-full flex-col`}>
        <div className={tw`h-16 w-full border border-b-gray-300`}>
          <Typography
            variant="h2"
            className={tw`flex h-full w-full flex-row items-center px-4 text-start text-gray-600`}
          >
            {state.item?.identifier ?? state.item?.macAddress}
          </Typography>
        </div>

        <div className={tw`grid w-full grid-cols-2 gap-y-8 px-4 py-8`}>
          {(
            [
              {
                title: 'Identifier',
                content: state.item?.identifier,
              },
              {
                title: 'ID',
                content: state.item?.id,
              },
              {
                title: 'MAC Address',
                content: state.item?.macAddress,
              },
            ] as {
              title: string
              content: string | undefined
            }[]
          ).map(({ title, content }, index) => (
            <div key={index} className={tw`flex items-center justify-start`}>
              <div className={tw`flex flex-col gap-1`}>
                <Typography variant="muted" className={tw`text-md font-bold`}>
                  {title}
                </Typography>
                <Typography variant="inline-code" className={tw`text-md`}>
                  {content}
                </Typography>
              </div>
            </div>
          ))}
        </div>

        {state.item && state.item.telemetryEvents.length > 0 && (
          <div className="w-full px-4 pt-8">
            <DashboardNodeTelemetryEventsChart events={state.item.telemetryEvents} />
          </div>
        )}

        {state.item &&
          [...state.item.alertLiquidEvents, ...state.item.alertImpactEvents].length >
            0 && (
            <div className="w-full px-4 pt-8">
              <DashboardNodeAlertEventsChart
                events={[
                  ...state.item.alertLiquidEvents,
                  ...state.item.alertImpactEvents,
                ]}
              />
            </div>
          )}
      </div>
    </DashboardNodeShowcase>
  )
}

export default DashboardNodeInfoPage
