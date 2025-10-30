'use client'

import { Button } from '@/components/ui/button.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

const DashboardFormPage: React.FunctionComponent<DashboardFormPageProps> = (props) => {
  const [state, setState] = React.useState<{
    continuing: boolean
  }>({
    continuing: false,
  })

  const [layoutState, setLayoutState] = React.useState<{
    bottom: number
  }>({
    bottom: 0,
  })

  const debounceFooterElObserverRef = React.useRef<ResizeObserver | null>(null)

  const observeFooterEl = React.useCallback((el: HTMLDivElement) => {
    if (!el) {
      return
    }
    if (debounceFooterElObserverRef.current) {
      debounceFooterElObserverRef.current.disconnect()
      debounceFooterElObserverRef.current = null
    }

    const updateHeight = () => {
      const height = el.getBoundingClientRect().height ?? 0
      setLayoutState((state) => ({ ...state, bottom: height }))
    }
    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(el)

    debounceFooterElObserverRef.current = observer
  }, [])

  return (
    <div className={tw`flex h-full w-full flex-row`}>
      <div className={tw`h-full w-2/5 shrink-0 bg-green-300 p-12 text-right`}>
        {props.title && (
          <Typography variant="h2" className={tw`font-bold text-green-800`}>
            {props.title}
          </Typography>
        )}
      </div>

      <form className={tw`relative h-full w-full overflow-hidden`}>
        <AnimatePresence mode="wait">
          {props.loading ? (
            <motion.div
              key="loading"
              className={tw`absolute flex h-full w-full items-center justify-center`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Spinner className={tw`h-8 w-8`} />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              className={tw`h-full w-full`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className={tw`h-full w-full overflow-x-hidden overflow-y-auto p-12`}
                style={{
                  paddingBottom: `calc(${layoutState.bottom}px + 3rem)`,
                }}
              >
                {props.children}
              </div>

              <div
                ref={observeFooterEl}
                className={tw`absolute bottom-0 left-0 flex w-full flex-row justify-center border-t border-t-gray-300 py-4`}
              >
                <Button
                  type="submit"
                  className={tw`w-96`}
                  variant="default"
                  disabled={state.continuing}
                  onClick={async (event) => {
                    event.preventDefault()

                    try {
                      setState((state) => ({ ...state, continuing: true }))
                      await props.onContinue?.()
                    } finally {
                      setState((state) => ({ ...state, continuing: false }))
                    }
                  }}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}

type DashboardFormPageProps = React.PropsWithChildren & {
  title?: string
  loading?: boolean
  onContinue?: () => PromiseLike<void>
}

export default DashboardFormPage
