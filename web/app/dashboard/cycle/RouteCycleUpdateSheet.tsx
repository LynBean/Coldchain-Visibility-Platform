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
  Cvp_DashboardCycle_DisplayRouteCycleAllQuery,
  Cvp_DashboardCycle_UpdateRouteCycleMutation,
  Cvp_DashboardCycle_UpdateRouteCycleMutationVariables,
} from '@/stores/graphql/generated.ts'
import { useGraphQLClient } from '@/stores/graphql/index.tsx'
import React from 'react'
import { toast } from 'sonner'

const RouteCycleUpdateSheet: React.FC<{
  open: boolean
  value?: Cvp_DashboardCycle_DisplayRouteCycleAllQuery['displayRouteCycle']['all'][number]
  onClose: () => void
  onUpdate: (
    value: Cvp_DashboardCycle_UpdateRouteCycleMutation['updateRouteCycle']
  ) => void
}> = ({ open, value, onClose, onUpdate }) => {
  const [, { catchError }] = useErrorState()
  const gqlClient = useGraphQLClient()

  const [state, setState] = React.useState<{
    loading: boolean
    originalValues: RouteCycleUpdateFormValues
    formValues: RouteCycleUpdateFormValues
    formErrors: Partial<Record<keyof RouteCycleUpdateFormValues, string>>
  }>({
    loading: false,
    originalValues: {},
    formValues: {},
    formErrors: {},
  })

  const setFormValues = <T extends keyof RouteCycleUpdateFormValues>(
    label: T,
    value: RouteCycleUpdateFormValues[T]
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

  const debounceRouteCycleId = React.useRef<string | null>(null)

  React.useEffect(() => {
    const routeCycleId = value?.id
    if (routeCycleId == null) {
      return
    }
    debounceRouteCycleId.current = routeCycleId
    ;(async () => {
      try {
        setState((state) => ({ ...state, loading: true }))
        const {
          displayRouteCycle: { byId: formValues },
        } = await gqlClient.CVP_DashboardCycle_DisplayRouteCycleById({
          routeCycleId: routeCycleId,
        })

        if (debounceRouteCycleId.current !== routeCycleId) {
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
      (Object.keys(formValues) as (keyof RouteCycleUpdateFormValues)[]).every(
        (key) => JSON.stringify(formValues[key]) === JSON.stringify(originalValues[key])
      )
    ) {
      onClose()
      toast.warning('No changes detected.')
      return
    }

    const updatedFields: RouteCycleUpdateFormValues = {
      identifier:
        formValues.identifier !== originalValues.identifier
          ? formValues.identifier
          : undefined,
      description:
        formValues.description !== originalValues.description
          ? formValues.description
          : undefined,
      ownerName:
        formValues.ownerName !== originalValues.ownerName
          ? formValues.ownerName
          : undefined,
      placedAt:
        formValues.placedAt !== originalValues.placedAt ? formValues.placedAt : undefined,
      departureLatitude:
        formValues.departureLatitude !== originalValues.departureLatitude
          ? formValues.departureLatitude
          : undefined,
      departureLongitude:
        formValues.departureLongitude !== originalValues.departureLongitude
          ? formValues.departureLongitude
          : undefined,
      destinationLatitude:
        formValues.destinationLatitude !== originalValues.destinationLatitude
          ? formValues.destinationLatitude
          : undefined,
      destinationLongitude:
        formValues.destinationLongitude !== originalValues.destinationLongitude
          ? formValues.destinationLongitude
          : undefined,
      temperatureAlertThreshold:
        formValues.temperatureAlertThreshold !== originalValues.temperatureAlertThreshold
          ? formValues.temperatureAlertThreshold
          : undefined,
      humidityAlertThreshold:
        formValues.humidityAlertThreshold !== originalValues.humidityAlertThreshold
          ? formValues.humidityAlertThreshold
          : undefined,
    }

    try {
      if (Object.values(updatedFields).some((updated) => updated)) {
        const { updateRouteCycle: item } =
          await gqlClient.CVP_DashboardCycle_UpdateRouteCycle({
            routeCycleId: value.id as string,
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
      <DialogContent className="flex h-7/9 w-lg max-w-11/12 flex-col rounded">
        <DialogHeader>
          <DialogTitle>Update route cycle</DialogTitle>
          <DialogDescription>
            Make changes to {value?.identifier} here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid auto-rows-min gap-6 overflow-y-scroll px-4 py-8">
          {(
            [
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
        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            type="submit"
            disabled={state.loading}
            onClick={() => {
              toast.promise(onContinue(), {
                loading: 'Updating device...',
                success: 'Device updated successfully.',
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

type RouteCycleUpdateFormValues = {
  identifier?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['identifier']
  description?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['description']
  ownerName?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['ownerName']
  placedAt?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['placedAt']
  departureLatitude?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['departureLatitude']
  departureLongitude?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['departureLongitude']
  destinationLatitude?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['destinationLatitude']
  destinationLongitude?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['destinationLongitude']
  temperatureAlertThreshold?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['temperatureAlertThreshold']
  humidityAlertThreshold?: Cvp_DashboardCycle_UpdateRouteCycleMutationVariables['humidityAlertThreshold']
}

export default RouteCycleUpdateSheet
