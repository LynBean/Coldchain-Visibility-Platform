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
import { CircuitBoard, Cpu, Droplets, LucideIcon, ServerCrash } from 'lucide-react'
import { useRouter } from 'next/navigation.js'
import React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const DashboardPage = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()
  const router = useRouter()

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
    <div className="flex h-full w-full justify-center">
      <div className="flex h-full w-full max-w-6xl flex-col px-8">
        <div className="flex h-48 w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Typography variant="h2" className="font-semibold">
            Coldchain Visibility Platform
          </Typography>

          <div className="flex flex-row gap-x-6">
            {(
              [
                {
                  label: 'Cores',
                  value: state.counts?.core,
                  href: '/dashboard/core',
                },
                {
                  label: 'Nodes',
                  value: state.counts?.node,
                  href: '/dashboard/node',
                },
                {
                  label: 'Route Cycles',
                  value: state.counts?.routeCycle,
                  href: '/dashboard/cycle',
                },
              ] as {
                label: string
                value: number
                href: string
              }[]
            ).map(({ label, value, href }, index) => (
              <div key={index} className="flex flex-col items-start gap-y-2">
                <button
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    router.push(href)
                  }}
                >
                  <a
                    className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                    href={href}
                  >
                    {label}
                  </a>
                </button>
                <span className="text-2xl tabular-nums">
                  {state.loading ? <Spinner /> : value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Separator orientation="horizontal" />

        {!state.loading && (
          <div className="flex flex-col gap-y-4 py-4">
            <span className="p-4 text-xs font-semibold text-muted-foreground">
              Statistics for last 60 minutes
            </span>

            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4">
              {(
                [
                  {
                    icon: CircuitBoard,
                    title: 'Core Telemetry',
                    data: state.statistics?.core,
                  },
                  {
                    icon: Cpu,
                    title: 'Node Telemetry',
                    data: state.statistics?.node,
                  },
                  {
                    icon: Droplets,
                    title: 'Liquid Alert',
                    data: state.statistics?.nodeAlertLiquid,
                  },
                  {
                    icon: ServerCrash,
                    title: 'Impact Alert',
                    data: state.statistics?.nodeAlertImpact,
                  },
                ] as {
                  icon: LucideIcon
                  title: string
                  data: { eventTime: string }[] | undefined
                }[]
              ).map(({ icon: Icon, title, data }, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>
                      <div className="flex flex-row items-center gap-x-3">
                        <Icon
                          size="2.4rem"
                          className="rounded-lg border p-2 text-muted-foreground"
                        />
                        <span className="text-foreground">{title}</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="flex flex-col">
                      <span className="text-foreground-lighter gap-y-0.5 text-sm">
                        Requests
                      </span>
                      <span className="text-xl font-normal text-foreground">
                        {data?.length}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      className="w-full"
                      config={
                        {
                          counts: {
                            label: 'Counts',
                            color: `var(--chart-${(index % 4) + 1})`,
                          },
                        } satisfies ChartConfig
                      }
                    >
                      <BarChart
                        accessibilityLayer
                        data={(() => {
                          const t0 = data?.[0]
                            ? new Date(data[0].eventTime)
                            : new Date(Date.now() - 60 * 60000)

                          const base = Array.from({ length: 6 }, (_, i) => {
                            const time = new Date(t0.getTime() + 10 * 60000 * i)
                            return {
                              time,
                              counts: 0,
                            }
                          })

                          const result =
                            data?.reduce((acc, item) => {
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
                        <Bar dataKey="counts" fill="var(--color-counts)" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
