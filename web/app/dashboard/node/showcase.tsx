'use client'

import { Button } from '@/components/ui/button.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { useErrorState } from '@/stores/error.tsx'
import { Cvp_DashboardNode_DisplayNodeColdtagAllQuery } from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { Plus as AddIcon, Banana as ColdtagIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation.js'
import React from 'react'
import DashboardShowcaseTemplate from '../showcase.tsx'

const DashboardNodeShowcase: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [state, setState] = React.useState<{
    loading: boolean
    items: Cvp_DashboardNode_DisplayNodeColdtagAllQuery['displayNodeColdtag']['all']
  }>({
    loading: true,
    items: [],
  })

  React.useEffect(() => {
    ;(async () => {
      try {
        setState((state) => ({ ...state, loading: true }))
        const {
          displayNodeColdtag: { all: items },
        } = await gqlClient.CVP_DashboardNode_DisplayNodeColdtagAll()
        setState((state) => ({ ...state, items }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    })()
  }, [catchError, gqlClient])

  const debounceScrollColdtagIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    const coldtagId = searchParams.get('coldtagId')
    if (!coldtagId) {
      return
    }
    debounceScrollColdtagIdRef.current = coldtagId
  }, [searchParams])

  return (
    <DashboardShowcaseTemplate
      sidePanel={
        <div
          className={tw`relative flex h-full w-full flex-col border-l border-r border-l-gray-300 border-r-gray-300`}
        >
          <div className={tw`absolute left-0 top-0 z-50 w-full rounded-2xl p-4`}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                router.replace('/dashboard/node/add')
              }}
            >
              <AddIcon />
            </Button>
          </div>

          <div
            className={tw`flex w-full flex-col overflow-y-auto overflow-x-hidden pt-20 scrollbar-hide`}
          >
            {state.items.map((item, index) => (
              <Button
                key={index}
                ref={(el) => {
                  if (!el) {
                    return
                  }
                  if (
                    !debounceScrollColdtagIdRef.current ||
                    debounceScrollColdtagIdRef.current !== searchParams.get('coldtagId')
                  ) {
                    return
                  }
                  el?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  })
                  debounceScrollColdtagIdRef.current = null
                }}
                variant="outline"
                className={tw`flex-0 bg-muted relative m-0 flex h-28 w-full cursor-pointer flex-row items-center justify-start gap-2 rounded-none border-none`}
                onClick={() => {
                  router.replace(`/dashboard/node/${item.id}/info`)
                }}
              >
                <div
                  className={tw`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-300`}
                >
                  <ColdtagIcon />
                </div>

                <div className={tw`flex h-full flex-col justify-between`}>
                  <div className={tw`flex w-full flex-row flex-wrap gap-1`}>
                    <Typography
                      variant="inline-code"
                      className="bg-muted-foreground text-muted text-sm"
                    >
                      {item.id}
                    </Typography>

                    <Typography
                      variant="inline-code"
                      className="bg-muted-foreground text-muted overflow-ellipsis text-sm"
                    >
                      {item.macAddress}
                    </Typography>
                  </div>

                  <Typography
                    variant="lead"
                    className="text-muted-foreground overflow-ellipsis text-left text-sm"
                  >
                    {item.identifier}
                  </Typography>
                </div>
              </Button>
            ))}
          </div>
        </div>
      }
    >
      {children}
    </DashboardShowcaseTemplate>
  )
}

export default DashboardNodeShowcase
