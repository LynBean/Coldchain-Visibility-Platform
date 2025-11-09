'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart.tsx'
import { DialogDescription } from '@/components/ui/dialog.tsx'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item.tsx'
import tw from '@/lib/tw.ts'
import { Cvp_DashboardTelemetry_DisplayCoreColdtagByIdQuery } from '@/stores/graphql/generated.ts'
import { Clock, LocateFixed } from 'lucide-react'
import React from 'react'
import RechartsPrimitive, { CartesianGrid, Scatter, ScatterChart, XAxis } from 'recharts'
import EventDialog from './EventDialog.tsx'

const CoreTelemetryEventChart: React.FunctionComponent<{
  events: Cvp_DashboardTelemetry_DisplayCoreColdtagByIdQuery['displayCoreColdtag']['byId']['telemetryEvents']
}> = ({ events }) => {
  type Payload = {
    date: string
    y: number
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
            date: event.eventTime,
            y: clampedValue,
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
            <CardTitle>Telemetry</CardTitle>
            <CardDescription>Showing telemetry records of all time</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={
              { date: { label: 'Date', color: 'var(--chart-2)' } } satisfies ChartConfig
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
                          </>
                        )}
                      </div>
                    )
                  }) as React.FunctionComponent<
                    React.ComponentProps<typeof RechartsPrimitive.Tooltip>
                  >
                }
              />
              <Scatter dataKey="y" fill="var(--color-date)" shape="circle" />
            </ScatterChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {dialogState.current && (
        <EventDialog
          title="Telemetry Event"
          description={
            <DialogDescription>
              Telemetry metrics recorded for this event
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

export default CoreTelemetryEventChart
