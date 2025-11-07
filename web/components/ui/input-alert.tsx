import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircleIcon, LucideIcon } from 'lucide-react'
import React from 'react'

const InputAlert: React.FC<{
  open?: boolean
  title?: string
  description?: string
  icon?: LucideIcon
}> = ({ open, title, description, icon: Icon = AlertCircleIcon }) => {
  return (
    <AnimatePresence initial={false} mode="wait">
      {open && (
        <motion.div
          key={open.toString()}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert
            variant="destructive"
            className="flex flex-row items-center py-2 text-xs [&>svg]:top-auto [&>svg]:left-auto"
          >
            {Icon && <Icon size="1.2rem" />}
            {title && <AlertTitle>{title}</AlertTitle>}
            {description && <AlertDescription>{description}</AlertDescription>}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InputAlert
