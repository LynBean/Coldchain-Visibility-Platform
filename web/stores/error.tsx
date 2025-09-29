import React from 'react'

type ErrorState = {
  errors: {
    id: string
    error: Error | string
  }[]
}

type ErrorAction = {
  catchError: (error: Error | object) => void
}

const errorContext = React.createContext([
  undefined! as ErrorState,
  undefined! as ErrorAction,
] as const)

export const Provider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
  const [state, setState] = React.useState<ErrorState>({
    errors: [],
  })

  const timers = React.useRef<Record<string, NodeJS.Timeout>>({})

  const catchError = React.useCallback((error: Error | object) => {
    const id = crypto.randomUUID()
    setState((state) => ({
      ...state,
      errors: [
        ...state.errors,
        {
          id,
          error: (() => {
            if (error instanceof Error) {
              return error
            } else {
              return JSON.stringify(error)
            }
          })(),
        },
      ],
    }))
    timers.current[id] = setTimeout(() => {
      setState((state) => ({
        ...state,
        errors: state.errors.filter(({ id: errorId }) => errorId !== id),
      }))
    }, 8000)
  }, [])

  React.useEffect(() => {
    if (state.errors.length <= 3) {
      return
    }
    const id = state.errors[0].id
    clearTimeout(timers.current[id])
    setState((state) => ({
      ...state,
      errors: state.errors.filter((error) => error.id !== id),
    }))
    delete timers.current[id]
  }, [state.errors])

  return (
    <errorContext.Provider value={[state, { catchError }]}>
      {props.children}
    </errorContext.Provider>
  )
}

export const useErrorState = () => {
  return React.useContext(errorContext)
}
