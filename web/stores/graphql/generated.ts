import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
};

export type ColdtagEventConnectionStatus =
  | 'connected'
  | 'disconnected';

export type CoreColdtag = {
  __typename?: 'CoreColdtag';
  createdTime: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  events: CoreColdtagEvents;
  id: Scalars['ID']['output'];
  identifier?: Maybe<Scalars['String']['output']>;
  macAddress: Scalars['String']['output'];
  nodes: Array<NodeColdtag>;
  updatedTime: Scalars['DateTime']['output'];
};

export type CoreColdtagEvent = {
  __typename?: 'CoreColdtagEvent';
  coldtag: CoreColdtag;
  connectionStatus: ColdtagEventConnectionStatus;
  eventTime: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  time: Scalars['DateTime']['output'];
};

export type CoreColdtagEvents = {
  __typename?: 'CoreColdtagEvents';
  basic: Array<CoreColdtagEvent>;
};

export type DisplayCoreColdtagFields = {
  __typename?: 'DisplayCoreColdtagFields';
  all: Array<CoreColdtag>;
  byId: CoreColdtag;
};


export type DisplayCoreColdtagFieldsByIdArgs = {
  coreId: Scalars['ID']['input'];
};

export type DisplayNodeColdtagFields = {
  __typename?: 'DisplayNodeColdtagFields';
  all: Array<NodeColdtag>;
  byId: NodeColdtag;
};


export type DisplayNodeColdtagFieldsByIdArgs = {
  nodeId: Scalars['ID']['input'];
};

export type MutationSchema = {
  __typename?: 'MutationSchema';
  createCoreColdtag: CoreColdtag;
  deleteCoreColdtag: CoreColdtag;
  updateCoreColdtag: CoreColdtag;
};


export type MutationSchemaCreateCoreColdtagArgs = {
  identifier?: InputMaybe<Scalars['String']['input']>;
  macAddress: Scalars['String']['input'];
};


export type MutationSchemaDeleteCoreColdtagArgs = {
  coreColdtagId: Scalars['ID']['input'];
};


export type MutationSchemaUpdateCoreColdtagArgs = {
  coreColdtagId: Scalars['ID']['input'];
  identifier?: InputMaybe<Scalars['String']['input']>;
};

export type NodeColdtag = {
  __typename?: 'NodeColdtag';
  core: CoreColdtag;
  createdTime: Scalars['DateTime']['output'];
  deleted: Scalars['Boolean']['output'];
  events: NodeColdtagEvents;
  id: Scalars['ID']['output'];
  identifier?: Maybe<Scalars['String']['output']>;
  macAddress: Scalars['String']['output'];
  updatedTime: Scalars['DateTime']['output'];
};

export type NodeColdtagEvent = {
  __typename?: 'NodeColdtagEvent';
  coldtag: NodeColdtag;
  connectionStatus: ColdtagEventConnectionStatus;
  eventTime: Scalars['DateTime']['output'];
  humidity?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  temperature?: Maybe<Scalars['Float']['output']>;
  time: Scalars['DateTime']['output'];
};

export type NodeColdtagEventAlertImpact = {
  __typename?: 'NodeColdtagEventAlertImpact';
  coldtag: NodeColdtag;
  connectionStatus: ColdtagEventConnectionStatus;
  eventTime: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  time: Scalars['DateTime']['output'];
};

export type NodeColdtagEventAlertLiquid = {
  __typename?: 'NodeColdtagEventAlertLiquid';
  coldtag: NodeColdtag;
  connectionStatus: ColdtagEventConnectionStatus;
  eventTime: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  time: Scalars['DateTime']['output'];
};

export type NodeColdtagEvents = {
  __typename?: 'NodeColdtagEvents';
  alertImpact: Array<NodeColdtagEventAlertImpact>;
  alertLiquid: Array<NodeColdtagEventAlertLiquid>;
  basic: Array<NodeColdtagEvent>;
};

export type QuerySchema = {
  __typename?: 'QuerySchema';
  displayCoreColdtag: DisplayCoreColdtagFields;
  displayNodeColdtag: DisplayNodeColdtagFields;
};

export type Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQueryVariables = Exact<{
  coreId: Scalars['ID']['input'];
}>;


export type Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQuery = { __typename?: 'QuerySchema', displayCoreColdtag: { __typename?: 'DisplayCoreColdtagFields', byId: { __typename?: 'CoreColdtag', id: string, macAddress: string, identifier?: string | null, nodes: Array<{ __typename?: 'NodeColdtag', id: string, macAddress: string, identifier?: string | null, events: { __typename?: 'NodeColdtagEvents', basic: Array<{ __typename?: 'NodeColdtagEvent', id: string, connectionStatus: ColdtagEventConnectionStatus, temperature?: number | null, humidity?: number | null, latitude?: number | null, longitude?: number | null, eventTime: string }>, alertLiquid: Array<{ __typename?: 'NodeColdtagEventAlertLiquid', id: string, connectionStatus: ColdtagEventConnectionStatus, latitude?: number | null, longitude?: number | null, eventTime: string }>, alertImpact: Array<{ __typename?: 'NodeColdtagEventAlertImpact', id: string, connectionStatus: ColdtagEventConnectionStatus, latitude?: number | null, longitude?: number | null, eventTime: string }> } }>, events: { __typename?: 'CoreColdtagEvents', basic: Array<{ __typename?: 'CoreColdtagEvent', id: string, connectionStatus: ColdtagEventConnectionStatus, eventTime: string }> } } } };

export type Cvp_DashboardCoreAdd_CreateCoreColdtagMutationVariables = Exact<{
  macAddress: Scalars['String']['input'];
  identifier?: InputMaybe<Scalars['String']['input']>;
}>;


export type Cvp_DashboardCoreAdd_CreateCoreColdtagMutation = { __typename?: 'MutationSchema', createCoreColdtag: { __typename?: 'CoreColdtag', id: string } };

export type Cvp_DashboardCore_DisplayCoreColdtagAllQueryVariables = Exact<{ [key: string]: never; }>;


export type Cvp_DashboardCore_DisplayCoreColdtagAllQuery = { __typename?: 'QuerySchema', displayCoreColdtag: { __typename?: 'DisplayCoreColdtagFields', all: Array<{ __typename?: 'CoreColdtag', id: string, macAddress: string, identifier?: string | null }> } };


export const Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdDocument = gql`
    query CVP_DashboardCoreInfo_DisplayCoreColdtagById($coreId: ID!) {
  displayCoreColdtag {
    byId(coreId: $coreId) {
      id
      macAddress
      identifier
      nodes {
        id
        macAddress
        identifier
        events {
          basic {
            id
            connectionStatus
            temperature
            humidity
            latitude
            longitude
            eventTime
          }
          alertLiquid {
            id
            connectionStatus
            latitude
            longitude
            eventTime
          }
          alertImpact {
            id
            connectionStatus
            latitude
            longitude
            eventTime
          }
        }
      }
      events {
        basic {
          id
          connectionStatus
          eventTime
        }
      }
    }
  }
}
    `;
export const Cvp_DashboardCoreAdd_CreateCoreColdtagDocument = gql`
    mutation CVP_DashboardCoreAdd_CreateCoreColdtag($macAddress: String!, $identifier: String) {
  createCoreColdtag(macAddress: $macAddress, identifier: $identifier) {
    id
  }
}
    `;
export const Cvp_DashboardCore_DisplayCoreColdtagAllDocument = gql`
    query CVP_DashboardCore_DisplayCoreColdtagAll {
  displayCoreColdtag {
    all {
      id
      macAddress
      identifier
    }
  }
}
    `;
export type Requester<C = {}> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C>(requester: Requester<C>) {
  return {
    CVP_DashboardCoreInfo_DisplayCoreColdtagById(variables: Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQueryVariables, options?: C): Promise<Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQuery> {
      return requester<Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQuery, Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQueryVariables>(Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdDocument, variables, options) as Promise<Cvp_DashboardCoreInfo_DisplayCoreColdtagByIdQuery>;
    },
    CVP_DashboardCoreAdd_CreateCoreColdtag(variables: Cvp_DashboardCoreAdd_CreateCoreColdtagMutationVariables, options?: C): Promise<Cvp_DashboardCoreAdd_CreateCoreColdtagMutation> {
      return requester<Cvp_DashboardCoreAdd_CreateCoreColdtagMutation, Cvp_DashboardCoreAdd_CreateCoreColdtagMutationVariables>(Cvp_DashboardCoreAdd_CreateCoreColdtagDocument, variables, options) as Promise<Cvp_DashboardCoreAdd_CreateCoreColdtagMutation>;
    },
    CVP_DashboardCore_DisplayCoreColdtagAll(variables?: Cvp_DashboardCore_DisplayCoreColdtagAllQueryVariables, options?: C): Promise<Cvp_DashboardCore_DisplayCoreColdtagAllQuery> {
      return requester<Cvp_DashboardCore_DisplayCoreColdtagAllQuery, Cvp_DashboardCore_DisplayCoreColdtagAllQueryVariables>(Cvp_DashboardCore_DisplayCoreColdtagAllDocument, variables, options) as Promise<Cvp_DashboardCore_DisplayCoreColdtagAllQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;