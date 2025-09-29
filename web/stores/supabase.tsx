import * as Supabase from '@supabase/supabase-js'
import React from 'react'

type SupabaseState =
  | {
      state: 'uninitialized'
      client: Supabase.SupabaseClient
      user: undefined
    }
  | {
      state: 'unauthenticated'
      client: Supabase.SupabaseClient
      user: undefined
    }
  | {
      state: 'authenticated'
      client: Supabase.SupabaseClient
      user: Supabase.User
    }

const supabaseContext = React.createContext(undefined! as SupabaseState)

const client = Supabase.createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export const Provider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
  const [state, setState] = React.useState<SupabaseState>({
    state: 'uninitialized',
    client,
    user: undefined,
  })

  React.useEffect(() => {
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_, session) => {
      if (!session) {
        setState(() => ({ state: 'unauthenticated', client, user: undefined }))
      } else {
        setState(() => ({ state: 'authenticated', client, user: session.user }))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <supabaseContext.Provider value={state}>{props.children}</supabaseContext.Provider>
  )
}

export const useSupabaseState = () => {
  return React.useContext(supabaseContext)
}
