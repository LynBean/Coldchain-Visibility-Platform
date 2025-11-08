'use client'

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
import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { Cvp_DashboardCharts_DisplayNodeColdtagByIdQuery } from '@/stores/graphql/generated.ts'
import { Droplets, ExternalLink, Thermometer } from 'lucide-react'
import React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import EventDialog from './EventDialog.tsx'

const NodeTelemetryEventChart: React.FunctionComponent<{
  events: Cvp_DashboardCharts_DisplayNodeColdtagByIdQuery['displayNodeColdtag']['byId']['telemetryEvents']
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
              latitude: event.coordinate?.latitude,
              longitude: event.coordinate?.longitude,
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
        <EventDialog
          title="Telemetry Event"
          description={
            <div className={tw`flex flex-row items-center gap-2`}>
              <span>Recorded at</span>
              <Typography variant="inline-code">
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
                  title:
                    dialogState.current.latitude != null &&
                    dialogState.current.longitude != null
                      ? 'View on map'
                      : 'Map not available',
                  disabled: !(
                    dialogState.current.latitude != null &&
                    dialogState.current.longitude != null
                  ),
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
                disabled?: boolean
                onClick: () => void
              }[]
            ).map(({ title, disabled, onClick }, index) => (
              <div key={index} className={tw`flex items-center justify-start`}>
                <div className={tw`flex flex-col gap-1`}>
                  <Button
                    disabled={disabled}
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
        </EventDialog>
      )}
    </>
  )
}

export default NodeTelemetryEventChart
