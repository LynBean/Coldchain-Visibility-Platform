import * as React from 'react'
import { Provider as AuthenticationProvider } from './authentication'
import { Provider as ErrorProvider } from './error'
import { Provider as GraphQLClientProvider } from './graphql'
import { Provider as SupabaseProvider } from './supabase'

const providers = [
  ErrorProvider,
  SupabaseProvider,
  GraphQLClientProvider,
  AuthenticationProvider,
]

const Provider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
  return providers.reduceRight(
    (child, Provider) => <Provider>{child}</Provider>,
    <>{props.children}</>
  )
}

export default Provider
