import { Button } from '@/components/ui/button.tsx'
import InputAlert from '@/components/ui/input-alert.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx'
import { useErrorState } from '@/stores/error.tsx'
import {
  Cvp_DashboardNode_CreateNodeColdtagMutation,
  Cvp_DashboardNode_CreateNodeColdtagMutationVariables,
} from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import React from 'react'
import { toast } from 'sonner'

const NodeCreateSheet: React.FC<{
  open: boolean
  onClose: () => void
  onCreate: (
    value: Cvp_DashboardNode_CreateNodeColdtagMutation['createNodeColdtag']
  ) => void
}> = ({ open, onClose, onCreate }) => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()

  const [state, setState] = React.useState<{
    loading: boolean
    formValues: NodeCreateFormValues
    formErrors: Partial<Record<keyof NodeCreateFormValues, string>>
  }>({
    loading: false,
    formValues: {},
    formErrors: {},
  })

  const setFormValues = <T extends keyof NodeCreateFormValues>(
    label: T,
    value: NodeCreateFormValues[T]
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

  const onContinue = React.useCallback(async () => {
    setState((state) => ({ ...state, loading: true }))

    const { formValues } = state

    try {
      const formErrors: Partial<Record<keyof NodeCreateFormValues, string>> = {
        macAddress: !formValues.macAddress ? 'MAC Address is required' : undefined,
      }
      setState((state) => ({
        ...state,
        formErrors: { ...state.formErrors, ...formErrors },
      }))
      if (Object.values(formErrors).some((error) => error)) {
        return
      }

      const { createNodeColdtag: value } =
        await gqlClient.CVP_DashboardNode_CreateNodeColdtag({
          ...formValues,
          macAddress: formValues.macAddress!,
        })

      onCreate(value)
    } catch (err) {
      catchError(err as Error)
    } finally {
      setState((state) => ({ ...state, loading: false }))
    }
  }, [catchError, gqlClient, onCreate, state])

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Create node device</SheetTitle>
          <SheetDescription>
            Enter the details and click Add to create a new item.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 py-8">
          {(
            [
              {
                label: 'MAC Address',
                value: state.formValues.macAddress,
                onChange: (value) => {
                  setFormValues('macAddress', value)
                },
                error: state.formErrors.macAddress,
              },
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
        </div>
        <SheetFooter>
          <Button
            type="submit"
            disabled={state.loading}
            onClick={() => {
              toast.promise(onContinue(), {
                loading: 'Creating...',
                success: 'Node device has been created.',
              })
            }}
          >
            Add
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

type NodeCreateFormValues = {
  macAddress?: Cvp_DashboardNode_CreateNodeColdtagMutationVariables['macAddress']
  identifier?: Cvp_DashboardNode_CreateNodeColdtagMutationVariables['identifier']
}

export default NodeCreateSheet
