import { Button } from '@/components/ui/button.tsx'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import { Cvp_DashboardCycleReport_DisplayRouteCycleByIdQuery } from '@/stores/graphql/generated.ts'
import { SquareArrowOutUpRight } from 'lucide-react'
import React from 'react'
import { useReactToPrint } from 'react-to-print'

const RouteCyclePrintReport: React.FC<{
  data?: Cvp_DashboardCycleReport_DisplayRouteCycleByIdQuery['displayRouteCycle']['byId']
}> = ({ data }) => {
  const contentRef = React.useRef<HTMLDivElement>(null)

  const documentTitle = React.useMemo(() => {
    return `RouteCycle_${data?.id}`
  }, [data])

  const onPrint = useReactToPrint({
    contentRef,
    documentTitle,
  })

  return (
    <div>
      <Button className="flex flex-row items-center" onClick={onPrint}>
        <SquareArrowOutUpRight />
        Export as PDF
      </Button>

      <div ref={contentRef} className="hidden rounded-md bg-white p-8 print:block">
        <div className="flex flex-col gap-8">
          <Typography variant="h1" className="text-start">
            Route Cycle Report
          </Typography>

          <Table>
            <TableBody>
              {(
                [
                  {
                    label: 'ID',
                    value: data?.id,
                  },
                  {
                    label: 'Title',
                    value: data?.identifier,
                  },
                  {
                    label: 'Description',
                    value: data?.description,
                  },
                  {
                    label: 'Client',
                    value: data?.ownerName,
                  },
                  {
                    label: 'Placing at',
                    value: data?.placedAt,
                  },
                  {
                    label: 'Max Temp.',
                    value: `${data?.temperatureAlertThreshold} °C`,
                  },
                  {
                    label: 'Max Humid.',
                    value: data?.humidityAlertThreshold,
                  },
                  {
                    label: 'Status',
                    value: (() => {
                      if (data?.canceled) {
                        return 'Canceled'
                      }
                      if (data?.completed) {
                        return 'Completed'
                      }
                      if (data?.started) {
                        return 'In progress'
                      }
                      return 'Pending'
                    })(),
                  },
                  {
                    label: 'Dispatch Time',
                    value: data?.dispatchTime,
                  },
                  {
                    label: 'Completion Time',
                    value: data?.completionTime,
                  },
                  {
                    label: 'Node ID',
                    value: data?.nodeColdtag.id,
                  },
                  {
                    label: 'Departure',
                    value: `${data?.departureCoordinate?.latitude}, ${data?.departureCoordinate?.longitude}`,
                  },
                  {
                    label: 'Destination',
                    value: `${data?.destinationCoordinate?.latitude}, ${data?.destinationCoordinate?.longitude}`,
                  },
                ] as {
                  label: string
                  value: string
                }[]
              ).map(({ label, value }, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Table className="break-before-page">
            <TableCaption>Telemetry events of all time.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Humidity</TableHead>
                <TableHead>Event time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.telemetryEvents.map(
                ({ id, temperature, humidity, eventTime }, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{id}</TableCell>
                    <TableCell>{temperature?.toLocaleString()} °C</TableCell>
                    <TableCell>{humidity?.toLocaleString()}</TableCell>
                    <TableCell>{eventTime}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={1}>Average</TableCell>
                <TableCell>
                  {data
                    ? `${(
                        data.telemetryEvents.reduce(
                          (sum, event) => sum + (event.temperature ?? 0),
                          0
                        ) / data.telemetryEvents.length
                      ).toLocaleString()} °C`
                    : 'Not Available'}
                </TableCell>
                <TableCell>
                  {data
                    ? `${(
                        data.telemetryEvents.reduce(
                          (sum, event) => sum + (event.humidity ?? 0),
                          0
                        ) / data.telemetryEvents.length
                      ).toLocaleString()} °C`
                    : 'Not Available'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>Total</TableCell>
                <TableCell>{data?.telemetryEvents.length} counts</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <Table>
            <TableCaption>Impact alert events of all time.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Event time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.alertImpactEvents.map(({ id, eventTime }, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{id}</TableCell>
                  <TableCell>{eventTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell>{data?.alertImpactEvents.length} counts</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <Table>
            <TableCaption>Liquid alert events of all time.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Event time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.alertLiquidEvents.map(({ id, eventTime }, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{id}</TableCell>
                  <TableCell>{eventTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell>{data?.alertLiquidEvents.length} counts</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default RouteCyclePrintReport
