'use client'

import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { useErrorState } from '@/stores/error.tsx'
import { Cvp_DashboardNodeInfo_DisplayNodeColdtagByIdQuery } from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { useParams } from 'next/navigation.js'
import React from 'react'
import DashboardNodeShowcase from '../../showcase.tsx'

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
      </div>
    </DashboardNodeShowcase>
  )
}

export default DashboardNodeInfoPage
