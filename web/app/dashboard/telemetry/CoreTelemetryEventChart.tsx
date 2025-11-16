'use client'

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
import { DialogDescription } from '@/components/ui/dialog.tsx'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item.tsx'
import tw from '@/lib/tw.ts'
import { Cvp_DashboardTelemetry_DisplayCoreColdtagByIdQuery } from '@/stores/graphql/generated.ts'
import { Battery, Clock, LocateFixed } from 'lucide-react'
import React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import EventDialog from './EventDialog.tsx'

const CoreTelemetryEventChart: React.FunctionComponent<{
  events: Cvp_DashboardTelemetry_DisplayCoreColdtagByIdQuery['displayCoreColdtag']['byId']['telemetryEvents']
}> = ({ events }) => {
  type Payload = {
    date: string
    battery?: number // TODO(Victor): Battery
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
        .map(
          (event) =>
            ({
              date: event.eventTime,
              battery: (() => {
                const seed = new Date(event.eventTime).getTime()
                return 1000 + (seed % 3001)
              })(),
              coordinate: event.coordinate,
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
                battery: {
                  label: 'Battery',
                  color: 'var(--chart-5)',
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
                <linearGradient id="fillBattery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-battery)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-battery)" stopOpacity={0.1} />
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
                dataKey="battery"
                type="bump"
                fill="url(#fillBattery)"
                stroke="var(--color-battery)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
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
                  icon: <Battery className={tw`text-green-400`} />,
                  title: 'Battery',
                  description: (
                    <DialogDescription>{`${dialogState.current.battery} mAh`}</DialogDescription>
                  ),
                },
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
