import {
  ApolloClient,
  FetchPolicy,
  FetchResult,
  InMemoryCache,
  OperationVariables,
} from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { observableToAsyncIterable } from '@graphql-tools/utils'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import { DocumentNode, Kind, OperationDefinitionNode } from 'graphql'
import { createClient as createWSClient } from 'graphql-ws'
import React from 'react'
import { useSupabaseState } from '../supabase.tsx'
import { getSdk } from './generated.ts'

const inMemoryCache = new InMemoryCache()

const createGraphQLClient = ({
  endpoint,
  getBearerToken,
}: {
  endpoint: string
  getBearerToken: () => Promise<string | undefined>
}) => {
  const getHeaders = async () => {
    const bearerToken = await getBearerToken()

    const data = {} as Record<string, string>

    if (bearerToken != null) {
      data['Authorization'] = bearerToken
    }

    return data
  }

  return getSdk(
    <R, V>(
      doc: DocumentNode,
      vars?: V,
      options?: { keepAlive?: number; fetchPolicy?: FetchPolicy }
    ) => {
      const definition = doc.definitions.find(
        (def): def is OperationDefinitionNode => def.kind === Kind.OPERATION_DEFINITION
      )

      if (definition?.operation === 'query' || definition?.operation === 'mutation') {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<R>(async (resolve, reject) => {
          const client = new ApolloClient({
            cache: inMemoryCache,
            link: createUploadLink({
              uri: endpoint,
              headers: await getHeaders(),
            }),
          })

          if (definition?.operation === 'query') {
            const { data, errors } = await client.query({
              query: doc,
              variables: vars as OperationVariables | undefined,
              errorPolicy: 'all',
              fetchPolicy: options?.fetchPolicy,
            })
            if (errors) {
              return reject(errors)
            }
            return resolve(data)
          }

          if (definition?.operation === 'mutation') {
            const { data, errors } = await client.mutate({
              mutation: doc,
              variables: vars as OperationVariables | undefined,
              errorPolicy: 'all',
            })
            if (errors) {
              return reject(errors)
            }
            return resolve(data)
          }

          throw new Error('Unsupported operation type')
        }) as Promise<R>
      }

      if (definition?.operation === 'subscription') {
        return {
          [Symbol.asyncIterator](): AsyncIterator<R> {
            let initialized = false
            let iterator: AsyncIterator<R>

            return {
              next: async () => {
                if (!initialized) {
                  initialized = true

                  const client = new ApolloClient({
                    cache: inMemoryCache,
                    link: new GraphQLWsLink(
                      createWSClient({
                        url: endpoint,
                        connectionParams: await getHeaders(),
                        keepAlive: options?.keepAlive,
                      })
                    ),
                  })

                  const observable = client.subscribe({
                    query: doc,
                    variables: vars as OperationVariables | undefined,
                    errorPolicy: 'all',
                    fetchPolicy: options?.fetchPolicy,
                  })

                  const baseAsyncIterable =
                    observableToAsyncIterable<FetchResult<R>>(observable)

                  iterator = (async function* () {
                    for await (const result of baseAsyncIterable) {
                      if (result.errors) {
                        throw result.errors
                      }
                      yield result.data as R
                    }
                  })()
                }

                return iterator.next()
              },
            }
          },
        }
      }

      throw new Error('Unsupported operation type')
    }
  )
}

export const ssrGraphQLClient = createGraphQLClient({
  endpoint: process.env.NEXT_PUBLIC_SSR_API_ENDPOINT_URL as string,
  getBearerToken: async () => undefined,
})

const graphQLContext = React.createContext(
  undefined! as ReturnType<typeof createGraphQLClient>
)

export const Provider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
  const supabaseState = useSupabaseState()

  const [state] = React.useState<ReturnType<typeof createGraphQLClient>>(
    createGraphQLClient({
      endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT_URL as string,
      getBearerToken: async () => {
        const { data, error } = await supabaseState.client.auth.getSession()
        if (error) {
          throw error
        }
        return data.session?.access_token
      },
    })
  )

  return <graphQLContext.Provider value={state}>{props.children}</graphQLContext.Provider>
}

export const useGraphQLClient = () => {
  return React.useContext(graphQLContext)
}
