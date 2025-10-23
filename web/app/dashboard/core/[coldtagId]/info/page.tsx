'use client'

import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { useErrorState } from '@/stores/error.tsx'
import { Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQuery } from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { useSearchParams } from 'next/navigation.js'
import React from 'react'
import DashboardCorePage from '../../page.tsx'

const DashboardCoreInfo: React.FunctionComponent = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()
  const searchParams = useSearchParams()

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
      const coldtagId = searchParams.get('coldtagId')
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
  }, [catchError, gqlClient, searchParams])

  return (
    <DashboardCorePage>
      <div className={tw`flex h-full w-full flex-col`}>
        <div className={tw`h-16 w-full border border-b-gray-300`}>
          <Typography variant="h2">
            {state.item?.identifier ?? state.item?.macAddress}
          </Typography>
        </div>
      </div>
    </DashboardCorePage>
  )
}

export default DashboardCoreInfo
