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
  Cvp_DashboardCycle_CreateRouteCycleMutation,
  Cvp_DashboardCycle_CreateRouteCycleMutationVariables,
} from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import React from 'react'
import { toast } from 'sonner'

const RouteCycleCreateSheet: React.FC<{
  open: boolean
  onClose: () => void
  onCreate: (
    value: Cvp_DashboardCycle_CreateRouteCycleMutation['createRouteCycle']
  ) => void
}> = ({ open, onClose, onCreate }) => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()

  const [state, setState] = React.useState<{
    loading: boolean
    formValues: RouteCycleCreateFormValues
    formErrors: Partial<Record<keyof RouteCycleCreateFormValues, string>>
  }>({
    loading: false,
    formValues: {},
    formErrors: {},
  })

  const setFormValues = <T extends keyof RouteCycleCreateFormValues>(
    label: T,
    value: RouteCycleCreateFormValues[T]
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
      const formErrors: Partial<Record<keyof RouteCycleCreateFormValues, string>> = {
        nodeColdtagId: !formValues.nodeColdtagId ? 'Node Coldtag is required' : undefined,
      }
      setState((state) => ({
        ...state,
        formErrors: { ...state.formErrors, ...formErrors },
      }))
      if (Object.values(formErrors).some((error) => error)) {
        return
      }

      const { createRouteCycle: value } =
        await gqlClient.CVP_DashboardCycle_CreateRouteCycle({
          ...formValues,
          nodeColdtagId: formValues.nodeColdtagId!,
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
      <SheetContent side="right" className="flex h-full flex-col">
        <SheetHeader>
          <SheetTitle>Create route cycle</SheetTitle>
          <SheetDescription>
            Enter the details and click Add to create a new item.
          </SheetDescription>
        </SheetHeader>
        <div className="grid auto-rows-min gap-6 overflow-y-scroll px-4 py-8">
          {(
            [
              {
                label: 'nodeColdtagId',
                value: state.formValues.nodeColdtagId,
                onChange: (value) => {
                  setFormValues('nodeColdtagId', value)
                },
                error: state.formErrors.nodeColdtagId,
              },
              {
                label: 'identifier',
                value: state.formValues.identifier,
                onChange: (value) => {
                  setFormValues('identifier', value)
                },
                error: state.formErrors.identifier,
              },
              {
                label: 'description',
                value: state.formValues.description,
                onChange: (value) => {
                  setFormValues('description', value)
                },
                error: state.formErrors.description,
              },
              {
                label: 'ownerName',
                value: state.formValues.ownerName,
                onChange: (value) => {
                  setFormValues('ownerName', value)
                },
                error: state.formErrors.ownerName,
              },
              {
                label: 'placedAt',
                value: state.formValues.placedAt,
                onChange: (value) => {
                  setFormValues('placedAt', value)
                },
                error: state.formErrors.placedAt,
              },
              {
                label: 'departureLatitude',
                value: state.formValues.departureLatitude,
                onChange: (value) => {
                  setFormValues('departureLatitude', parseFloat(value))
                },
                error: state.formErrors.departureLatitude,
              },
              {
                label: 'departureLongitude',
                value: state.formValues.departureLongitude,
                onChange: (value) => {
                  setFormValues('departureLongitude', parseFloat(value))
                },
                error: state.formErrors.departureLongitude,
              },
              {
                label: 'destinationLatitude',
                value: state.formValues.destinationLatitude,
                onChange: (value) => {
                  setFormValues('destinationLatitude', parseFloat(value))
                },
                error: state.formErrors.destinationLatitude,
              },
              {
                label: 'destinationLongitude',
                value: state.formValues.destinationLongitude,
                onChange: (value) => {
                  setFormValues('destinationLongitude', parseFloat(value))
                },
                error: state.formErrors.destinationLongitude,
              },
              {
                label: 'temperatureAlertThreshold',
                value: state.formValues.temperatureAlertThreshold,
                onChange: (value) => {
                  setFormValues('temperatureAlertThreshold', parseFloat(value))
                },
                error: state.formErrors.temperatureAlertThreshold,
              },
              {
                label: 'humidityAlertThreshold',
                value: state.formValues.humidityAlertThreshold,
                onChange: (value) => {
                  setFormValues('humidityAlertThreshold', parseFloat(value))
                },
                error: state.formErrors.humidityAlertThreshold,
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
        <SheetFooter className="flex-row justify-end gap-2">
          <Button
            type="submit"
            disabled={state.loading}
            onClick={() => {
              toast.promise(onContinue(), {
                loading: 'Creating route cycle...',
                success: 'Route cycle created successfully.',
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

type RouteCycleCreateFormValues = {
  nodeColdtagId?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['nodeColdtagId']
  identifier?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['identifier']
  description?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['description']
  ownerName?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['ownerName']
  placedAt?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['placedAt']
  departureLatitude?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['departureLatitude']
  departureLongitude?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['departureLongitude']
  destinationLatitude?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['destinationLatitude']
  destinationLongitude?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['destinationLongitude']
  temperatureAlertThreshold?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['temperatureAlertThreshold']
  humidityAlertThreshold?: Cvp_DashboardCycle_CreateRouteCycleMutationVariables['humidityAlertThreshold']
}

export default RouteCycleCreateSheet
