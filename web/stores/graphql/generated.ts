import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never
}
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  DateTime: { input: string; output: string }
}

export type CreateUserFields = {
  __typename?: 'CreateUserFields'
  byAccessToken: User
}

export type DisplayUserFields = {
  __typename?: 'DisplayUserFields'
  byAccessToken: User
}

export type User = {
  __typename?: 'User'
  id: Scalars['ID']['output']
  time: Scalars['DateTime']['output']
}

export type UserCreate = {
  __typename?: 'UserCreate'
  createUser: CreateUserFields
}

export type UserDisplay = {
  __typename?: 'UserDisplay'
  displayUser: DisplayUserFields
}

export type Slm_StoresAuthentication_DisplayUserByAccessTokenQueryVariables = Exact<{
  [key: string]: never
}>

export type Slm_StoresAuthentication_DisplayUserByAccessTokenQuery = {
  __typename?: 'UserDisplay'
  displayUser: {
    __typename?: 'DisplayUserFields'
    byAccessToken: { __typename?: 'User'; id: string; time: string }
  }
}

export type Slm_StoresAuthentication_CreateUserByAccessTokenMutationVariables = Exact<{
  [key: string]: never
}>

export type Slm_StoresAuthentication_CreateUserByAccessTokenMutation = {
  __typename?: 'UserCreate'
  createUser: {
    __typename?: 'CreateUserFields'
    byAccessToken: { __typename?: 'User'; id: string; time: string }
  }
}

export const Slm_StoresAuthentication_DisplayUserByAccessTokenDocument = gql`
  query Slm_StoresAuthentication_DisplayUserByAccessToken {
    displayUser {
      byAccessToken {
        id
        time
      }
    }
  }
`
export const Slm_StoresAuthentication_CreateUserByAccessTokenDocument = gql`
  mutation Slm_StoresAuthentication_CreateUserByAccessToken {
    createUser {
      byAccessToken {
        id
        time
      }
    }
  }
`
export type Requester<C = {}> = <R, V>(
  doc: DocumentNode,
  vars?: V,
  options?: C
) => Promise<R> | AsyncIterable<R>
export function getSdk<C>(requester: Requester<C>) {
  return {
    Slm_StoresAuthentication_DisplayUserByAccessToken(
      variables?: Slm_StoresAuthentication_DisplayUserByAccessTokenQueryVariables,
      options?: C
    ): Promise<Slm_StoresAuthentication_DisplayUserByAccessTokenQuery> {
      return requester<
        Slm_StoresAuthentication_DisplayUserByAccessTokenQuery,
        Slm_StoresAuthentication_DisplayUserByAccessTokenQueryVariables
      >(
        Slm_StoresAuthentication_DisplayUserByAccessTokenDocument,
        variables,
        options
      ) as Promise<Slm_StoresAuthentication_DisplayUserByAccessTokenQuery>
    },
    Slm_StoresAuthentication_CreateUserByAccessToken(
      variables?: Slm_StoresAuthentication_CreateUserByAccessTokenMutationVariables,
      options?: C
    ): Promise<Slm_StoresAuthentication_CreateUserByAccessTokenMutation> {
      return requester<
        Slm_StoresAuthentication_CreateUserByAccessTokenMutation,
        Slm_StoresAuthentication_CreateUserByAccessTokenMutationVariables
      >(
        Slm_StoresAuthentication_CreateUserByAccessTokenDocument,
        variables,
        options
      ) as Promise<Slm_StoresAuthentication_CreateUserByAccessTokenMutation>
    },
  }
}
export type Sdk = ReturnType<typeof getSdk>
