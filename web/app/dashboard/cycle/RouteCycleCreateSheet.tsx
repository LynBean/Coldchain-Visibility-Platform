import { Button } from '@/components/ui/button.tsx'
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { useErrorState } from '@/stores/error.tsx'
import {
  Cvp_DashboardCycle_CreateRouteCycleMutation,
  Cvp_DashboardCycle_CreateRouteCycleMutationVariables,
  Cvp_DashboardCycle_DisplayNodeColdtagAllQuery,
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

  const [nodeState, setNodeState] = React.useState<{
    loading: boolean
    items?: Cvp_DashboardCycle_DisplayNodeColdtagAllQuery['displayNodeColdtag']['allAvailableForRouteCycle']
  }>({
    loading: true,
  })

  React.useEffect(() => {
    setNodeState((state) => ({ ...state, loading: true }))
    ;(async () => {
      try {
        const {
          displayNodeColdtag: { allAvailableForRouteCycle: items },
        } = await gqlClient.CVP_DashboardCycle_DisplayNodeColdtagAll()
        setNodeState((state) => ({ ...state, items }))
      } catch (err) {
        catchError(err as Error)
      } finally {
        setNodeState((state) => ({ ...state, loading: false }))
      }
    })()
  }, [catchError, gqlClient])

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
                type: 'select',
                loading: nodeState.loading,
                label: 'Node',
                placeholder: 'Select a node',
                values: nodeState.items?.map(({ id, identifier }) => ({
                  label: identifier,
                  value: id,
                })),
                onChange: (value) => {
                  setFormValues('nodeColdtagId', value)
                },
                error: state.formErrors.nodeColdtagId,
              },
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
                      <Select disabled={attr.loading} onValueChange={onChange}>
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
        <SheetFooter className="flex-row justify-end gap-2">
          <Button
            type="submit"
            disabled={state.loading}
            onClick={() => {
              toast.promise(onContinue(), {
                loading: 'Creating route cycle...',
                success: 'Route cycle created successfully.',
                error: 'Route cycle failed to create.',
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
