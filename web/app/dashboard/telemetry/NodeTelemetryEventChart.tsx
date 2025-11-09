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
import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { Cvp_DashboardTelemetry_DisplayNodeColdtagByIdQuery } from '@/stores/graphql/generated.ts'
import { Clock, Cpu, Droplets, LocateFixed, Thermometer } from 'lucide-react'
import React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import EventDialog from './EventDialog.tsx'

const NodeTelemetryEventChart: React.FunctionComponent<{
  events: Cvp_DashboardTelemetry_DisplayNodeColdtagByIdQuery['displayNodeColdtag']['byId']['telemetryEvents']
}> = ({ events }) => {
  type Payload = {
    date: string
    temperature?: number
    humidity?: number
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
        .map(
          (event) =>
            ({
              date: event.eventTime,
              temperature: event.temperature,
              humidity: event.humidity,
              coreColdtag: event.coreColdtag,
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
                  icon: <Thermometer className={tw`text-red-500`} />,
                  title: 'Temperature',
                  description: (
                    <DialogDescription>{`${dialogState.current.temperature?.toLocaleString()} °C`}</DialogDescription>
                  ),
                },
                {
                  icon: <Droplets className={tw`text-blue-500`} />,
                  title: 'Humidity',
                  description: (
                    <DialogDescription>
                      {dialogState.current.humidity?.toLocaleString()}
                    </DialogDescription>
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
                  icon: <Cpu />,
                  title: 'Router Info',
                  description: (
                    <div className="flex flex-col gap-1">
                      <DialogDescription>
                        {dialogState.current.coreColdtag.identifier}
                      </DialogDescription>
                      <div className="flex flex-row gap-1 text-muted-foreground">
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

export default NodeTelemetryEventChart
