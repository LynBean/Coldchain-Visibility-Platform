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
import { Cvp_DashboardCycle_DisplayRouteCycleAllQuery } from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { PlusIcon } from 'lucide-react'
import React from 'react'
import RouteCycleCreateSheet from './RouteCycleCreateSheet.tsx'
import RouteCycleTable from './RouteCycleTable.tsx'
import RouteCycleUpdateSheet from './RouteCycleUpdateSheet.tsx'

const DashboardCyclePage: React.FC = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()
  const isMobile = useIsMobile()

  const [state, setState] = React.useState<{
    loading: boolean
    items?: Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all']
  }>({
    loading: true,
  })

  const [createSheetState, setCreateSheetState] = React.useState<{
    open: boolean
  }>({
    open: false,
  })

  const [editSheetState, setUpdateSheetState] = React.useState<{
    open: boolean
    value?: Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
  }>({
    open: false,
  })

  React.useEffect(() => {
    setState((state) => ({ ...state, loading: true }))
    ;(async () => {
      try {
        const {
          displayRouteCycle: { all: items },
        } = await gqlClient.CVP_DashboardCycle_DisplayRouteCycleAll()
        setState((state) => ({ ...state, items }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    })()
  }, [catchError, gqlClient])

  const onClickStart = React.useCallback(
    async (
      value: Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
    ) => {
      try {
        const { startRouteCycle: next } =
          await gqlClient.CVP_DashboardCycle_StartRouteCycle({
            routeCycleId: value.id as string,
          })
        setState((state) => ({
          ...state,
          items: state.items
            ? state.items.map((prev) => (prev.id === next.id ? next : prev))
            : undefined,
        }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    },
    [catchError, gqlClient]
  )

  const onClickComplete = React.useCallback(
    async (
      value: Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
    ) => {
      try {
        const { completeRouteCycle: next } =
          await gqlClient.CVP_DashboardCycle_CompleteRouteCycle({
            routeCycleId: value.id as string,
          })
        setState((state) => ({
          ...state,
          items: state.items
            ? state.items.map((prev) => (prev.id === next.id ? next : prev))
            : undefined,
        }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    },
    [catchError, gqlClient]
  )

  const onClickCancel = React.useCallback(
    async (
      value: Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
    ) => {
      try {
        const { cancelRouteCycle: next } =
          await gqlClient.CVP_DashboardCycle_CancelRouteCycle({
            routeCycleId: value.id as string,
          })
        setState((state) => ({
          ...state,
          items: state.items
            ? state.items.map((prev) => (prev.id === next.id ? next : prev))
            : undefined,
        }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    },
    [catchError, gqlClient]
  )

  return (
    <>
      <AnimatePresence mode="wait">
        <div className="flex h-full w-full flex-col items-center">
          <div className="flex w-6xl max-w-5/6 flex-col items-center gap-8 py-12">
            <div
              className={cn(
                'flex w-full justify-between',
                isMobile ? 'flex-col gap-4' : 'flex-row items-center'
              )}
            >
              <div className="flex w-full flex-col">
                <Typography variant="h3" className="text-accent-foreground">
                  Route Cycle List
                </Typography>
                <Typography variant="h4" className="text-muted-foreground">
                  Manage your route cycles here.
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
                    <Typography>Create Route Cycle</Typography>
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
                    <EmptyTitle>Loading route cycles...</EmptyTitle>
                    <EmptyDescription>Just a moment.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </motion.div>
            ) : (
              <motion.div
                key="device-table"
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <RouteCycleTable
                  items={state.items ?? []}
                  onClickEdit={(value) => {
                    setUpdateSheetState((state) => ({ ...state, open: true, value }))
                  }}
                  onClickStart={onClickStart}
                  onClickComplete={onClickComplete}
                  onClickCancel={onClickCancel}
                />
              </motion.div>
            )}
          </div>
        </div>
      </AnimatePresence>

      <RouteCycleCreateSheet
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

      <RouteCycleUpdateSheet
        open={editSheetState.open}
        value={editSheetState.value}
        onClose={() => {
          setUpdateSheetState((state) => ({ ...state, open: false }))
        }}
        onUpdate={(value) => {
          setState((state) => ({
            ...state,
            items: state.items?.map((item) => {
              if (item.id !== value.id) {
                return item
              }
              return value
            }),
          }))
          setUpdateSheetState((state) => ({ ...state, open: false }))
        }}
      />
    </>
  )
}

export default DashboardCyclePage
