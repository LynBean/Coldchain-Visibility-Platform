import * as React from 'react'
import { Provider as ErrorProvider } from './error.tsx'
import { Provider as GraphQLClientProvider } from './graphql/index.tsx'
import { Provider as SupabaseProvider } from './supabase.tsx'

const providers = [ErrorProvider, SupabaseProvider, GraphQLClientProvider]

const Provider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
  return providers.reduceRight(
    (child, Provider) => <Provider>{child}</Provider>,
    <>{props.children}</>
  )
}

export default Provider
