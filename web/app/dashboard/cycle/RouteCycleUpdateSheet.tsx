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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
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
      <DialogContent className="bg-dialog h-7/9 w-lg max-w-11/12 flex flex-col rounded">
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
                label: 'Title',
                value: state.formValues.identifier,
                onChange: (value) => {
                  setFormValues('identifier', value)
                },
                error: state.formErrors.identifier,
              },
              {
                label: 'Description',
                value: state.formValues.description,
                onChange: (value) => {
                  setFormValues('description', value)
                },
                error: state.formErrors.description,
              },
              {
                label: 'Client',
                value: state.formValues.ownerName,
                onChange: (value) => {
                  setFormValues('ownerName', value)
                },
                error: state.formErrors.ownerName,
              },
              {
                label: 'Placing at',
                value: state.formValues.placedAt,
                onChange: (value) => {
                  setFormValues('placedAt', value)
                },
                error: state.formErrors.placedAt,
              },
              {
                label: 'Departure latitude',
                value: state.formValues.departureLatitude,
                inputType: 'number',
                onChange: (value) => {
                  setFormValues('departureLatitude', parseFloat(value))
                },
                error: state.formErrors.departureLatitude,
              },
              {
                label: 'Departure longitude',
                value: state.formValues.departureLongitude,
                inputType: 'number',
                onChange: (value) => {
                  setFormValues('departureLongitude', parseFloat(value))
                },
                error: state.formErrors.departureLongitude,
              },
              {
                label: 'Destination latitude',
                value: state.formValues.destinationLatitude,
                inputType: 'number',
                onChange: (value) => {
                  setFormValues('destinationLatitude', parseFloat(value))
                },
                error: state.formErrors.destinationLatitude,
              },
              {
                label: 'Destination longitude',
                value: state.formValues.destinationLongitude,
                inputType: 'number',
                onChange: (value) => {
                  setFormValues('destinationLongitude', parseFloat(value))
                },
                error: state.formErrors.destinationLongitude,
              },
              {
                label: 'Max Temp. (°C)',
                value: state.formValues.temperatureAlertThreshold,
                inputType: 'number',
                onChange: (value) => {
                  setFormValues('temperatureAlertThreshold', parseFloat(value))
                },
                error: state.formErrors.temperatureAlertThreshold,
              },
              {
                label: 'Max Humid.',
                value: state.formValues.humidityAlertThreshold,
                inputType: 'number',
                onChange: (value) => {
                  setFormValues('humidityAlertThreshold', parseFloat(value))
                },
                error: state.formErrors.humidityAlertThreshold,
              },
            ] as ((
              | {
                  type: 'input'
                  value: string | undefined
                  inputType: React.HTMLInputTypeAttribute
                }
              | {
                  type: 'select'
                  loading: boolean
                  placeholder: string
                  values: { label: string; value: string }[] | undefined
                }
            ) & {
              label: string
              onChange: (value: string) => void
              error: string | undefined
            })[]
          ).map(({ label, onChange, error, ...attr }, index) => (
            <div key={index} className="grid gap-3">
              <Label htmlFor={label}>{label}</Label>
              {(() => {
                switch (attr.type) {
                  case 'select': {
                    return (
                      <Select disabled={attr.loading}>
                        <SelectTrigger>
                          {attr.loading && <Spinner />}
                          <SelectValue placeholder={attr.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{label}</SelectLabel>
                            {attr.values?.map(({ label, value }, index) => (
                              <SelectItem key={index} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )
                  }

                  default:
                  case 'input': {
                    return (
                      <Input
                        id={label}
                        disabled={state.loading}
                        value={attr.value}
                        type={attr.inputType}
                        onChange={(event) => {
                          onChange(event.currentTarget.value)
                        }}
                      />
                    )
                  }
                }
              })()}
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
                loading: 'Updating route cycle...',
                success: 'Route cycle updated successfully.',
                error: 'Route cycle failed to update.',
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
