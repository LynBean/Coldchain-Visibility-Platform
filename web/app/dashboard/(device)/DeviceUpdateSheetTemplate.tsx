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
import React from 'react'
import { toast } from 'sonner'

const DeviceUpdateSheetTemplate: React.FC<
  React.PropsWithChildren & {
    loading: boolean
    open: boolean
    title: string
    identifier: string | undefined
    onClose: () => void
    onContinue: () => Promise<void>
  }
> = ({ loading, open, title, identifier, onClose, onContinue, children }) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="w-lg max-w-11/12 rounded bg-dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Make changes to {identifier} here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4 py-8">{children}</div>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            type="submit"
            disabled={loading}
            onClick={() => {
              toast.promise(onContinue(), {
                loading: 'Updating device...',
                success: 'Device updated successfully.',
                error: 'Device failed to update.',
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

export default DeviceUpdateSheetTemplate
