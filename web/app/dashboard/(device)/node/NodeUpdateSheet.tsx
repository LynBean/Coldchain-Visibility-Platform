import InputAlert from '@/components/ui/input-alert.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { useErrorState } from '@/stores/error.tsx'
import {
  Cvp_DashboardNode_DisplayNodeColdtagAllQuery,
  Cvp_DashboardNode_UpdateNodeColdtagMutation,
  Cvp_DashboardNode_UpdateNodeColdtagMutationVariables,
} from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import React from 'react'
import { toast } from 'sonner'
import DeviceUpdateSheetTemplate from '../DeviceUpdateSheetTemplate.tsx'

const NodeUpdateSheet: React.FC<{
  open: boolean
  value?: Cvp_DashboardNode_DisplayNodeColdtagAllQuery['displayNodeColdtag']['all'][number]
  onClose: () => void
  onEdit: (
    value: Cvp_DashboardNode_UpdateNodeColdtagMutation['updateNodeColdtag']
  ) => void
}> = ({ open, value, onClose, onEdit: onUpdate }) => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()

  const [state, setState] = React.useState<{
    loading: boolean
    originalValues: NodeUpdateFormValues
    formValues: NodeUpdateFormValues
    formErrors: Partial<Record<keyof NodeUpdateFormValues, string>>
  }>({
    loading: false,
    originalValues: {},
    formValues: {},
    formErrors: {},
  })

  const setFormValues = <T extends keyof NodeUpdateFormValues>(
    label: T,
    value: NodeUpdateFormValues[T]
  ) => {
    setState((state) => ({
      ...state,
      formErrors: {
        ...state.formErrors,
        [label]: undefined,
      },
      formValues: {
        ...state.formValues,
        [label]: value,
      },
    }))
  }

  const debounceNodeId = React.useRef<string | null>(null)

  React.useEffect(() => {
    const nodeId = value?.id
    if (nodeId == null) {
      return
    }
    debounceNodeId.current = nodeId
    ;(async () => {
      try {
        setState((state) => ({ ...state, loading: true }))
        const {
          displayNodeColdtag: { byId: formValues },
        } = await gqlClient.CVP_DashboardNode_DisplayNodeColdtagById({
          nodeId: nodeId,
        })

        if (debounceNodeId.current !== nodeId) {
          return
        }

        setState((state) => ({
          ...state,
          originalValues: formValues,
          formValues,
          formErrors: {},
        }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setState((state) => ({ ...state, loading: false }))
      }
    })()
  }, [catchError, gqlClient, open, value?.id])

  const onContinue = React.useCallback(async () => {
    if (!value) {
      return
    }

    setState((state) => ({ ...state, loading: true }))

    const { originalValues, formValues } = state
    if (
      (Object.keys(formValues) as (keyof NodeUpdateFormValues)[]).every(
        (key) => JSON.stringify(formValues[key]) === JSON.stringify(originalValues[key])
      )
    ) {
      onClose()
      toast.warning('No changes detected.')
      return
    }

    const formErrors: Partial<Record<keyof NodeUpdateFormValues, string>> = {
      identifier: !formValues.identifier ? 'Name is required' : undefined,
    }
    setState((state) => ({
      ...state,
      formErrors: { ...state.formErrors, ...formErrors },
    }))
    if (Object.values(formErrors).some((error) => error)) {
      return
    }

    const updatedFields: NodeUpdateFormValues = {
      identifier:
        formValues.identifier !== originalValues.identifier
          ? formValues.identifier
          : undefined,
    }

    try {
      if (Object.values(updatedFields).some((updated) => updated)) {
        const { updateNodeColdtag: item } =
          await gqlClient.CVP_DashboardNode_UpdateNodeColdtag({
            nodeColdtagId: value.id as string,
            ...updatedFields,
          })

        onUpdate(item)
      }
    } catch (err) {
      catchError(err as Error)
    } finally {
      setState((state) => ({ ...state, loading: false }))
    }
  }, [catchError, gqlClient, onClose, onUpdate, state, value])

  return (
    <DeviceUpdateSheetTemplate
      loading={state.loading}
      open={open}
      onClose={onClose}
      title="Update core device"
      identifier={state.originalValues.identifier ?? undefined}
      onContinue={onContinue}
    >
      {(
        [
          {
            label: 'Name',
            value: state.formValues.identifier,
            onChange: (value) => {
              setFormValues('identifier', value)
            },
            error: state.formErrors.identifier,
          },
        ] as {
          label: string
          value: string | undefined
          type: React.HTMLInputTypeAttribute
          onChange: (value: string) => void
          error: string | undefined
        }[]
      ).map(({ label, value, type = 'text', onChange, error }, index) => (
        <div key={index} className="grid gap-3">
          <Label htmlFor={label}>{label}</Label>
          <Input
            id={label}
            disabled={state.loading}
            value={value}
            type={type}
            onChange={(event) => {
              onChange(event.currentTarget.value)
            }}
          />
          <InputAlert open={error != null} title={error} />
        </div>
      ))}
    </DeviceUpdateSheetTemplate>
  )
}

type NodeUpdateFormValues = {
  identifier?: Cvp_DashboardNode_UpdateNodeColdtagMutationVariables['identifier']
}

export default NodeUpdateSheet
