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
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import { useErrorState } from '@/stores/error.tsx'
import {
  Cvp_Dashboard_DisplayCoreColdtagCountQuery,
  Cvp_Dashboard_DisplayCoreColdtagEventsAllByTimeRangeQuery,
  Cvp_Dashboard_DisplayNodeColdtagCountQuery,
  Cvp_Dashboard_DisplayNodeColdtagEventAlertImpactsAllByTimeRangeQuery,
  Cvp_Dashboard_DisplayNodeColdtagEventAlertLiquidsAllByTimeRangeQuery,
  Cvp_Dashboard_DisplayNodeColdtagEventsAllByTimeRangeQuery,
  Cvp_Dashboard_DisplayRouteCycleCountQuery,
} from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const DashboardPage = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()

  const [state, setState] = React.useState<{
    loading: boolean
    counts?: {
      core: Cvp_Dashboard_DisplayCoreColdtagCountQuery['displayCoreColdtag']['count']
      node: Cvp_Dashboard_DisplayNodeColdtagCountQuery['displayNodeColdtag']['count']
      routeCycle: Cvp_Dashboard_DisplayRouteCycleCountQuery['displayRouteCycle']['count']
    }
    statistics?: {
      core: Cvp_Dashboard_DisplayCoreColdtagEventsAllByTimeRangeQuery['displayCoreColdtagEvent']['allByTimeRange']
      node: Cvp_Dashboard_DisplayNodeColdtagEventsAllByTimeRangeQuery['displayNodeColdtagEvent']['allByTimeRange']
      nodeAlertLiquid: Cvp_Dashboard_DisplayNodeColdtagEventAlertLiquidsAllByTimeRangeQuery['displayNodeColdtagEventAlertLiquid']['allByTimeRange']
      nodeAlertImpact: Cvp_Dashboard_DisplayNodeColdtagEventAlertImpactsAllByTimeRangeQuery['displayNodeColdtagEventAlertImpact']['allByTimeRange']
    }
  }>({
    loading: true,
  })

  React.useEffect(() => {
    setState((state) => ({ ...state, loading: true }))
    ;(async () => {
      try {
        const [
          {
            displayCoreColdtag: { count: core },
          },
          {
            displayNodeColdtag: { count: node },
          },
          {
            displayRouteCycle: { count: routeCycle },
          },
          {
            displayCoreColdtagEvent: { allByTimeRange: coreStatistics },
          },
          {
            displayNodeColdtagEvent: { allByTimeRange: nodeStatistics },
          },
          {
            displayNodeColdtagEventAlertLiquid: {
              allByTimeRange: nodeAlertLiquidStatistics,
            },
          },
          {
            displayNodeColdtagEventAlertImpact: {
              allByTimeRange: nodeAlertImpactStatistics,
            },
          },
        ] = await Promise.all([
          gqlClient.CVP_Dashboard_DisplayCoreColdtagCount(),
          gqlClient.CVP_Dashboard_DisplayNodeColdtagCount(),
          gqlClient.CVP_Dashboard_DisplayRouteCycleCount(),
          gqlClient.CVP_Dashboard_DisplayCoreColdtagEventsAllByTimeRange({
            a: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          }),
          gqlClient.CVP_Dashboard_DisplayNodeColdtagEventsAllByTimeRange({
            a: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          }),
          gqlClient.CVP_Dashboard_DisplayNodeColdtagEventAlertLiquidsAllByTimeRange({
            a: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          }),
          gqlClient.CVP_Dashboard_DisplayNodeColdtagEventAlertImpactsAllByTimeRange({
            a: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          }),
        ])
        setState((state) => ({
          ...state,
          counts: { core, node, routeCycle },
          statistics: {
            core: coreStatistics,
            node: nodeStatistics,
            nodeAlertLiquid: nodeAlertLiquidStatistics,
            nodeAlertImpact: nodeAlertImpactStatistics,
          },
        }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    })()
  }, [catchError, gqlClient])

  return (
    <div className="flex h-full flex-col [&>div]:px-48">
      <div className="flex h-48 w-full flex-row items-center justify-between">
        <Typography variant="h2" className="font-semibold">
          Coldchain Visibility Platform
        </Typography>

        <div className="flex flex-row gap-x-6">
          {(
            [
              {
                label: 'Cores',
                value: state.counts?.core,
              },
              {
                label: 'Nodes',
                value: state.counts?.node,
              },
              {
                label: 'Route Cycles',
                value: state.counts?.routeCycle,
              },
            ] as {
              label: string
              value: number
            }[]
          ).map(({ label, value }, index) => (
            <div key={index} className="flex flex-col items-start gap-y-2">
              <span className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                {label}
              </span>
              <span className="text-2xl tabular-nums">
                {state.loading ? <Spinner /> : value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator orientation="horizontal" />

      {!state.loading && (
        <div className="grid w-full grid-cols-3 gap-4 py-16">
          {(
            [
              {
                title: 'Core Telemetry Event',
                description: 'MQTT Requests',
                data: state.statistics?.core,
              },
              {
                title: 'Node Telemetry Event',
                description: 'MQTT Requests',
                data: state.statistics?.node,
              },
              {
                title: 'Node Alert Liquid Event',
                description: 'MQTT Requests',
                data: state.statistics?.nodeAlertLiquid,
              },
              {
                title: 'Node Alert Impact Event',
                description: 'MQTT Requests',
                data: state.statistics?.nodeAlertImpact,
              },
            ] as {
              title: string
              description: string
              data: { eventTime: string }[] | undefined
            }[]
          ).map(({ title, description, data }, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="w-full"
                  config={
                    {
                      counts: {
                        label: 'Counts',
                        color: 'var(--chart-1)',
                      },
                    } satisfies ChartConfig
                  }
                >
                  <BarChart
                    accessibilityLayer
                    data={(() => {
                      if (!data) {
                        return
                      }
                      const t0 = new Date(data[0].eventTime)

                      const base = Array.from({ length: 6 }, (_, i) => {
                        const time = new Date(t0.getTime() + 10 * 60000 * i)
                        return {
                          time,
                          counts: 0,
                        }
                      })

                      const result =
                        data.reduce((acc, item) => {
                          const t = new Date(item.eventTime)
                          const diff = t.getTime() - t0.getTime()
                          const bucketIndex = Math.floor(diff / (10 * 60000))
                          if (bucketIndex >= 0 && bucketIndex < acc.length) {
                            acc[bucketIndex].counts += 1
                          }
                          return acc
                        }, base) ?? base

                      return result
                    })()}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => {
                        return value.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="counts" fill="var(--color-counts)" radius={2} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardPage
