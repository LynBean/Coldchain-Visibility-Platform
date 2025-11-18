'use client'

import { ButtonGroup } from '@/components/ui/button-group.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import { useIsMobile } from '@/hooks/use-mobile.ts'
import { cn } from '@/lib/utils.ts'
import { useErrorState } from '@/stores/error.tsx'
import { Cvp_DashboardCore_DisplayCoreColdtagAllQuery } from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { PlusIcon } from 'lucide-react'
import React from 'react'
import CoreCreateSheet from './CoreCreateSheet.tsx'
import CoreTable from './CoreTable.tsx'
import CoreUpdateSheet from './CoreUpdateSheet.tsx'

const DashboardCorePage = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()
  const isMobile = useIsMobile()

  const [state, setState] = React.useState<{
    loading: boolean
    items?: Cvp_DashboardCore_DisplayCoreColdtagAllQuery['displayCoreColdtag']['all']
  }>({
    loading: true,
    items: undefined,
  })

  const [createSheetState, setCreateSheetState] = React.useState<{
    open: boolean
  }>({
    open: false,
  })

  const [editSheetState, setEditSheetState] = React.useState<{
    open: boolean
    value?: Cvp_DashboardCore_DisplayCoreColdtagAllQuery['displayCoreColdtag']['all'][number]
  }>({
    open: false,
  })

  React.useEffect(() => {
    setState((state) => ({ ...state, loading: true }))
    ;(async () => {
      try {
        const {
          displayCoreColdtag: { all: items },
        } = await gqlClient.CVP_DashboardCore_DisplayCoreColdtagAll()
        setState((state) => ({ ...state, items }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    })()
  }, [catchError, gqlClient, setState])

  return (
    <>
      <AnimatePresence mode="wait">
        <div className="flex h-full w-full flex-col items-center">
          <div className="w-6xl max-w-5/6 flex flex-col items-center gap-8 py-12">
            <div
              className={cn(
                'flex w-full justify-between',
                isMobile ? 'flex-col gap-4' : 'flex-row items-center'
              )}
            >
              <div className="flex w-full flex-col">
                <Typography variant="h3" className="text-accent-foreground">
                  Core Device List
                </Typography>
                <Typography variant="h4" className="text-muted-foreground">
                  Manage your core devices here.
                </Typography>
              </div>

              <div>
                <ButtonGroup>
                  <Button
                    variant="default"
                    className="flex flex-row"
                    onClick={() => {
                      setCreateSheetState((state) => ({ ...state, open: true }))
                    }}
                  >
                    <PlusIcon />
                    <Typography>Create Core Device</Typography>
                  </Button>
                </ButtonGroup>
              </div>
            </div>

            {state.loading ? (
              <motion.div
                key="device-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Empty className="w-full">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Spinner />
                    </EmptyMedia>
                    <EmptyTitle>Loading devices</EmptyTitle>
                    <EmptyDescription>Just a moment.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </motion.div>
            ) : (
              <motion.div
                key="device-table"
                className="w-full overflow-hidden rounded-md border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CoreTable
                  items={state.items ?? []}
                  onClickEdit={(value) => {
                    setEditSheetState((state) => ({ ...state, open: true, value }))
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </AnimatePresence>

      <CoreCreateSheet
        open={createSheetState.open}
        onClose={() => {
          setCreateSheetState((state) => ({ ...state, open: false }))
        }}
        onCreate={(value) => {
          setState((state) => ({
            ...state,
            items: state.items ? [...state.items, value] : [value],
          }))
          setCreateSheetState((state) => ({ ...state, open: false }))
        }}
      />

      <CoreUpdateSheet
        open={editSheetState.open}
        value={editSheetState.value}
        onClose={() => {
          setEditSheetState((state) => ({ ...state, open: false }))
        }}
        onEdit={(value) => {
          setState((state) => ({
            ...state,
            items: state.items?.map((item) => {
              if (item.id !== value.id) {
                return item
              }
              return value
            }),
          }))
          setEditSheetState((state) => ({ ...state, open: false }))
        }}
      />
    </>
  )
}

export default DashboardCorePage
