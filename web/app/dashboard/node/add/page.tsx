'use client'

import InputAlert from '@/components/ui/input-alert.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Typography } from '@/components/ui/typography.tsx'
import tw from '@/lib/tw.ts'
import { useErrorState } from '@/stores/error.tsx'
import { Cvp_DashboardNodeAdd_CreateNodeColdtagMutationVariables } from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import { useRouter } from 'next/navigation.js'
import React from 'react'
import DashboardFormPage from '../../form.tsx'

const DashboardNodeAddPageTemplate: React.FunctionComponent<
  DashboardNodeAddPageTemplateProps
> = (props) => {
  return (
    <DashboardFormPage
      title={props.title}
      loading={props.loading}
      onContinue={props.onContinue}
    >
      <div className={tw`flex flex-col gap-4`}>
        <div className={tw`g-2 flex w-full flex-row flex-nowrap`}>
          <Typography variant="h2" className={tw`font-bold text-green-800`}>
            Node info
          </Typography>

          {props.caption && (
            <Typography variant="h2" className={tw`font-bold text-gray-600`}>
              - {props.caption}
            </Typography>
          )}
        </div>

        <div className={tw`flex h-full w-full flex-col gap-8`}>
          <div className="grid w-full max-w-md items-center gap-3">
            <Label htmlFor="mac-address">MAC Address</Label>
            <Input
              type="text"
              placeholder="MAC Address"
              onChange={(event) => {
                props.macAddress.onChange?.(event.target.value, event)
              }}
            />
            <InputAlert message={props.macAddress.error} />
          </div>

          <div className="grid w-full max-w-md items-center gap-3">
            <Label htmlFor="identifier">Identifier</Label>
            <Input
              type="text"
              placeholder="Identifier"
              onChange={(event) => {
                props.identifier.onChange?.(event.target.value, event)
              }}
            />
            <InputAlert message={props.identifier.error} />
          </div>
        </div>
      </div>
    </DashboardFormPage>
  )
}

type DashboardNodeAddPageTemplateProps = {
  title: string
  caption?: string
  loading: boolean
  onContinue: () => PromiseLike<void>

  macAddress: {
    value?: string
    error?: string
    onChange?: (
      value: string,
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void
  }

  identifier: {
    value?: string
    error?: string
    onChange?: (
      value: string,
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void
  }
}

const DashboardNodeAddPage: React.FunctionComponent = () => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()
  const router = useRouter()

  const [state, setState] = React.useState<DashboardNodeAddPageState>({
    loading: false,
    uploading: false,
    formValues: {},
    formErrors: {},
  })

  const setFormValues = <T extends keyof NodeFormValues>(
    label: T,
    value: NodeFormValues[T]
  ) => {
    setState((state) => ({
      ...state,
      formValues: {
        ...state.formValues,
        [label]: value,
      },
      formErrors: {
        ...state.formErrors,
        [label]: undefined,
      },
    }))
  }

  const onContinue = React.useCallback(async () => {
    const { formValues } = state
    if (
      Object.values(formValues).every(
        (formValue) => formValue === undefined || !formValue?.toString().length
      )
    ) {
      router.push('/dashboard/node')
      return
    }

    try {
      const formErrors: Partial<Record<keyof NodeFormValues, string>> = {
        macAddress: !formValues.macAddress?.length
          ? 'MAC Address is required'
          : undefined,
      }
      setState((state) => ({
        ...state,
        formErrors: { ...state.formErrors, ...formErrors },
      }))
      if (Object.values(formErrors).some((error) => error)) {
        return
      }

      setState((state) => ({ ...state, uploading: true }))
      const {
        createNodeColdtag: { id },
      } = await gqlClient.CVP_DashboardNodeAdd_CreateNodeColdtag({
        macAddress: formValues.macAddress!,
        identifier: formValues.identifier?.length ? formValues.identifier : undefined,
      })

      router.push(`/dashboard/node/${id}/info`)
    } catch (err) {
      catchError(err as Error)
    } finally {
      setState((state) => ({ ...state, uploading: false }))
    }
  }, [catchError, gqlClient, router, state])

  return (
    <DashboardNodeAddPageTemplate
      title="Add node"
      loading={state.loading}
      onContinue={onContinue}
      macAddress={{
        value: state.formValues.macAddress,
        error: state.formErrors.macAddress,
        onChange: (value) => {
          setFormValues('macAddress', value)
        },
      }}
      identifier={{
        value: state.formValues.identifier ?? undefined,
        error: state.formErrors.identifier,
        onChange: (value) => {
          setFormValues('identifier', value)
        },
      }}
    />
  )
}

type NodeFormValues = {
  macAddress?: Cvp_DashboardNodeAdd_CreateNodeColdtagMutationVariables['macAddress']
  identifier?: Cvp_DashboardNodeAdd_CreateNodeColdtagMutationVariables['identifier']
}

type DashboardNodeAddPageState = {
  loading: boolean
  uploading: boolean
  formValues: NodeFormValues
  formErrors: Partial<Record<keyof NodeFormValues, string>>
}

export default DashboardNodeAddPage
