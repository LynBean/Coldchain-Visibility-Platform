import tw from '@/lib/tw.ts'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircleIcon } from 'lucide-react'
import React from 'react'
import { Alert, AlertDescription, AlertTitle } from './alert.tsx'

const InputAlert: React.FunctionComponent<InputAlertProps> = (props) => {
  return (
    <AnimatePresence mode="wait">
      {(props.title || props.message) && (
        <motion.div
          key={props.toString()}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
        >
          <Alert variant="destructive">
            <AlertCircleIcon className={tw`m-0 h-5`} />
            <AlertTitle>{props.title}</AlertTitle>
            <AlertDescription>{props.message}</AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type InputAlertProps = {
  title?: string | React.ReactNode
  message?: string | React.ReactNode
}

export default InputAlert
