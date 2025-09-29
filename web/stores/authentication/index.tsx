import { useRouter } from 'next/navigation'
import React from 'react'
import { useErrorState } from '../error'
import { useGraphQLClient } from '../graphql'
import { Slm_StoresAuthentication_DisplayUserByAccessTokenQuery } from '../graphql/generated'
import { useSupabaseState } from '../supabase'

type AuthenticationState =
  | {
      state: 'uninitialized'
      user: undefined
    }
  | {
      state: 'unauthenticated'
      user: undefined
    }
  | {
      state: 'authenticated'
      user: Slm_StoresAuthentication_DisplayUserByAccessTokenQuery['displayUser']['byAccessToken']
    }

type AuthenticationAction = {
  signInWithGoogleOAuth: (redirectTo?: string) => Promise<void>
  signUp: (redirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const authenticationContext = React.createContext([
  undefined! as AuthenticationState,
  undefined! as AuthenticationAction,
] as const)

export const Provider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()
  const router = useRouter()
  const supabaseState = useSupabaseState()

  const [state, setState] = React.useState<AuthenticationState>({
    state: 'uninitialized',
    user: undefined,
  })

  React.useEffect(() => {
    ;(async () => {
      switch (supabaseState.state) {
        case 'uninitialized':
          break

        case 'authenticated':
          try {
            const {
              displayUser: { byAccessToken: user },
            } = await gqlClient.Slm_StoresAuthentication_DisplayUserByAccessToken()

            setState({
              state: 'authenticated',
              user,
            })
          } catch (err) {
            setState({
              state: 'unauthenticated',
              user: undefined,
            })
            catchError(err as Error)
          }

          break

        case 'unauthenticated':
          setState({
            state: 'unauthenticated',
            user: undefined,
          })
          break
      }
    })()
  }, [catchError, supabaseState])

  const signInWithGoogleOAuth: AuthenticationAction['signInWithGoogleOAuth'] = async (
    redirectTo?: string
  ) => {
    const { error } = await supabaseState.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: (() => {
          const url = `${process.env.NEXT_PUBLIC_WEB_URL}${redirectTo}`
          return url.length > 0 ? url : undefined
        })(),
      },
    })
    if (error) {
      throw error
    }
  }

  const signUp: AuthenticationAction['signUp'] = async (redirectTo?: string) => {
    const supabaseUser = supabaseState.user

    if (!supabaseUser) {
      throw Error('User is invalid.')
    }

    try {
      const {
        createUser: { byAccessToken: user },
      } = await gqlClient.Slm_StoresAuthentication_CreateUserByAccessToken()

      setState((state) => ({ ...state, state: 'authenticated', user }))
      await router.push(`${process.env.NEXT_PUBLIC_WEB_URL}${redirectTo}`)
    } catch (error) {
      setState((state) => ({ ...state, state: 'unauthenticated', user: undefined }))
      catchError(error as Error)
    }
  }

  const signOut: AuthenticationAction['signOut'] = async () => {
    const { error } = await supabaseState.client.auth.signOut()
    if (error) {
      throw error
    }
  }

  return (
    <authenticationContext.Provider
      value={[
        state,
        {
          signInWithGoogleOAuth,
          signUp,
          signOut,
        },
      ]}
    >
      {props.children}
    </authenticationContext.Provider>
  )
}

export const useAuthenticationState = () => {
  return React.useContext(authenticationContext)
}
