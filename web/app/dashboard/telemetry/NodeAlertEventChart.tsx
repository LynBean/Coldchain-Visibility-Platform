'use client'

import { capitalize } from '@/common/string.ts'
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
} from '@/components/ui/chart.tsx'
import { DialogDescription } from '@/components/ui/dialog.tsx'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { Cvp_DashboardTelemetry_DisplayNodeColdtagByIdQuery } from '@/stores/graphql/generated.ts'
import { Clock, Cpu, LocateFixed } from 'lucide-react'
import React from 'react'
import RechartsPrimitive, {
  CartesianGrid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from 'recharts'
import EventDialog from './EventDialog.tsx'

const NodeAlertEventChart: React.FunctionComponent<{
  events: (
    | Cvp_DashboardTelemetry_DisplayNodeColdtagByIdQuery['displayNodeColdtag']['byId']['alertLiquidEvents'][number]
    | Cvp_DashboardTelemetry_DisplayNodeColdtagByIdQuery['displayNodeColdtag']['byId']['alertImpactEvents'][number]
  )[]
}> = ({ events }) => {
  type Payload = {
    date: number
    type: 'liquid' | 'impact'
    liquid?: number
    impact?: number
    coreColdtag: {
      id: string
      identifier?: string
      macAddress: string
    }
    coordinate?: {
      latitude: number
      longitude: number
    }
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
            coreColdtag: event.coreColdtag,
            coordinate: event.coordinate,
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
                        className={tw`border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl`}
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
                              className={tw`[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5`}
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
        <EventDialog
          title={`${capitalize(dialogState.current.type)} alert`}
          description={
            <DialogDescription>
              Telemetry metrics recorded for this alert event
            </DialogDescription>
          }
          open={dialogState.open}
          onClose={() => {
            setDialogState((state) => ({ ...state, open: false }))
          }}
        >
          <div className={tw`grid grid-cols-2 gap-2 py-4`}>
            {(
              [
                {
                  className: 'col-span-2',
                  icon: <Clock />,
                  title: 'Time',
                  description: (
                    <DialogDescription>
                      {new Date(dialogState.current.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </DialogDescription>
                  ),
                },
                {
                  className: 'col-span-2',
                  icon: <Cpu />,
                  title: 'Router Info',
                  description: (
                    <div className="flex flex-col gap-1">
                      <DialogDescription>
                        {dialogState.current.coreColdtag.identifier}
                      </DialogDescription>
                      <div className="text-muted-foreground flex flex-row gap-1">
                        <Typography variant="inline-code">
                          {dialogState.current.coreColdtag.id}
                        </Typography>
                        <Typography variant="inline-code">
                          {dialogState.current.coreColdtag.macAddress}
                        </Typography>
                      </div>
                    </div>
                  ),
                },
                {
                  className: 'col-span-2',
                  icon: <LocateFixed />,
                  title: 'Coordinate',
                  description: dialogState.current.coordinate ? (
                    <DialogDescription>
                      {`${dialogState.current.coordinate.latitude}, ${dialogState.current.coordinate.longitude}`}
                    </DialogDescription>
                  ) : (
                    <DialogDescription>Not Available</DialogDescription>
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
        </EventDialog>
      )}
    </>
  )
}

export default NodeAlertEventChart
