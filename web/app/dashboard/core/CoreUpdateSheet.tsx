import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import InputAlert from '@/components/ui/input-alert.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { useErrorState } from '@/stores/error.tsx'
import {
  Cvp_DashboardCore_DisplayCoreColdtagAllQuery,
  Cvp_DashboardCore_UpdateCoreColdtagMutation,
  Cvp_DashboardCore_UpdateCoreColdtagMutationVariables,
} from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import React from 'react'
import { toast } from 'sonner'

const CoreUpdateSheet: React.FC<{
  open: boolean
  value?: Cvp_DashboardCore_DisplayCoreColdtagAllQuery['displayCoreColdtag']['all'][number]
  onClose: () => void
  onEdit: (
    value: Cvp_DashboardCore_UpdateCoreColdtagMutation['updateCoreColdtag']
  ) => void
}> = ({ open, value, onClose, onEdit: onUpdate }) => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()

  const [state, setState] = React.useState<{
    loading: boolean
    originalValues: CoreUpdateFormValues
    formValues: CoreUpdateFormValues
    formErrors: Partial<Record<keyof CoreUpdateFormValues, string>>
  }>({
    loading: false,
    originalValues: {},
    formValues: {},
    formErrors: {},
  })

  const setFormValues = <T extends keyof CoreUpdateFormValues>(
    label: T,
    value: CoreUpdateFormValues[T]
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

  const debounceCoreId = React.useRef<string | null>(null)

  React.useEffect(() => {
    const coreId = value?.id
    if (coreId == null) {
      return
    }
    debounceCoreId.current = coreId
    ;(async () => {
      try {
        setState((state) => ({ ...state, loading: true }))
        const {
          displayCoreColdtag: { byId: formValues },
        } = await gqlClient.CVP_DashboardCore_DisplayCoreColdtagById({
          coreId: coreId,
        })

        if (debounceCoreId.current !== coreId) {
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
      (Object.keys(formValues) as (keyof CoreUpdateFormValues)[]).every(
        (key) => JSON.stringify(formValues[key]) === JSON.stringify(originalValues[key])
      )
    ) {
      onClose()
      toast.warning('No changes detected.')
      return
    }

    const formErrors: Partial<Record<keyof CoreUpdateFormValues, string>> = {
      identifier: !formValues.identifier ? 'Name is required' : undefined,
    }
    setState((state) => ({
      ...state,
      formErrors: { ...state.formErrors, ...formErrors },
    }))
    if (Object.values(formErrors).some((error) => error)) {
      return
    }

    const updatedFields: CoreUpdateFormValues = {
      identifier:
        formValues.identifier !== originalValues.identifier
          ? formValues.identifier
          : undefined,
    }

    try {
      if (Object.values(updatedFields).some((updated) => updated)) {
        const { updateCoreColdtag: item } =
          await gqlClient.CVP_DashboardCore_UpdateCoreColdtag({
            coreColdtagId: value.id as string,
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
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update core device</DialogTitle>
          <DialogDescription>
            Make changes to {state.originalValues.identifier} here. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 py-8">
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
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={state.loading}
            onClick={() => {
              toast.promise(onContinue(), {
                loading: 'Updating...',
                success: 'Core device has been updated.',
              })
            }}
          >
            Save changes
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type CoreUpdateFormValues = {
  identifier?: Cvp_DashboardCore_UpdateCoreColdtagMutationVariables['identifier']
}

export default CoreUpdateSheet
