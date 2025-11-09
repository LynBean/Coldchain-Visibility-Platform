import { Button } from '@/components/ui/button.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx'
import React from 'react'
import { toast } from 'sonner'

const DeviceCreateSheetTemplate: React.FC<
  React.PropsWithChildren & {
    loading: boolean
    open: boolean
    title: string
    onClose: () => void
    onContinue: () => Promise<void>
  }
> = ({ loading, open, title, onClose, onContinue, children }) => {
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
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Enter the details and click Add to create a new item.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 py-8">{children}</div>
        <SheetFooter className="flex-row justify-end gap-2">
          <Button
            type="submit"
            disabled={loading}
            onClick={() => {
              toast.promise(onContinue(), {
                loading: 'Creating device...',
                success: 'Device created successfully.',
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

export default DeviceCreateSheetTemplate
