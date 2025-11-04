'use client'

import { Button } from '@/components/ui/button.tsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { useErrorState } from '@/stores/error.tsx'
import { Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQuery } from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { ExternalLink } from 'lucide-react'
import { useParams } from 'next/navigation.js'
import React from 'react'
import RechartsPrimitive, { CartesianGrid, Scatter, ScatterChart, XAxis } from 'recharts'
import DashboardCoreShowcase from '../../DashboardCoreShowcase.tsx'

const DashboardCoreEventDialog: React.FunctionComponent<
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
          {props.description}
        </DialogHeader>

        {props.children}
      </DialogContent>
    </Dialog>
  )
}

const DashboardCoreTelemetryEventsChart: React.FunctionComponent<{
  events: Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQuery['displayCoreColdtag']['byId']['telemetryEvents']
}> = ({ events }) => {
  type Payload = {
    date: string
    latitude?: number
    longitude?: number
    y: number
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
            latitude: event.coordinate?.latitude,
            longitude: event.coordinate?.longitude,
            y: clampedValue,
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
        <DashboardCoreEventDialog
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
          <div className={tw`flex flex-col items-end gap-2`}>
            {(
              [
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
        </DashboardCoreEventDialog>
      )}
    </>
  )
}

const DashboardCoreInfoPage: React.FunctionComponent = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()
  const params = useParams()

  const [state, setState] = React.useState<{
    loading: boolean
    item?: Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQuery['displayCoreColdtag']['byId']
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
          displayCoreColdtag: { byId: item },
        } = await gqlClient.CVP_DashboardCoreInfo_DisplayCoreColdtagById({
          coreId: coldtagId as string,
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
    <DashboardCoreShowcase>
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
            <DashboardCoreTelemetryEventsChart events={state.item.telemetryEvents} />
          </div>
        )}
      </div>
    </DashboardCoreShowcase>
  )
}

export default DashboardCoreInfoPage
