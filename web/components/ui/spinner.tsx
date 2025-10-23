import { cn } from '@/lib/utils.ts'
import { Loader2Icon } from 'lucide-react'
import React from 'react'

function Spinner({ ref, className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      ref={ref as React.RefObject<SVGSVGElement> | undefined}
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
