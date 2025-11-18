import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import React from 'react'

const EventDialog: React.FunctionComponent<
  React.PropsWithChildren & {
    title: string
    description?: string | React.ReactNode
    open: boolean
    onClose: () => void
  }
> = ({ open, onClose, ...props }) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="
          w-lg max-w-11/12 rounded 
          bg-white text-foreground
          dark:bg-[#062334] dark:text-white
          shadow-xl
        "
      >
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          {props.description}
        </DialogHeader>

        {props.children}
      </DialogContent>
    </Dialog>
  )
}

export default EventDialog
