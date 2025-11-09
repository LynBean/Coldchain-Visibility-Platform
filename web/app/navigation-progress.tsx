import { usePathname } from 'next/navigation.js'
import React from 'react'
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar'

type NavigationProgressAction = {
  continuousStart: () => void
  complete: () => void
}

const navigationProgressContext = React.createContext(
  undefined! as NavigationProgressAction
)

export const Provider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
  const pathname = usePathname()

  const ref = React.useRef<LoadingBarRef>(null)

  React.useEffect(() => {
    ref.current?.continuousStart()
    setTimeout(() => {
      ref.current?.complete()
    }, 300)
  }, [pathname])

  const continuousStart = React.useCallback(() => {
    ref.current?.continuousStart()
  }, [])

  const complete = React.useCallback(() => {
    ref.current?.complete()
  }, [])

  return (
    <navigationProgressContext.Provider value={{ continuousStart, complete }}>
      <LoadingBar color="var(--muted-foreground)" ref={ref} shadow={true} height={2} />
      {props.children}
    </navigationProgressContext.Provider>
  )
}

export const useNavigationProgressState = () => {
  return React.useContext(navigationProgressContext)
}
