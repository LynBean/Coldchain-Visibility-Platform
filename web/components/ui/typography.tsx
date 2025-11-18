import { cn } from '@/lib/utils.ts'
import React from 'react'

const variantMap = {
  h1: {
    component: 'h1',
    className: cn`scroll-m-20 text-balance text-center text-4xl font-extrabold tracking-normal`,
  },
  h2: {
    component: 'h2',
    className: cn`scroll-m-20 pb-2 text-3xl font-bold tracking-normal first:mt-0`,
  },
  h3: {
    component: 'h3',
    className: cn`scroll-m-20 text-2xl font-bold tracking-normal`,
  },
  h4: {
    component: 'h4',
    className: cn`scroll-m-20 text-lg font-normal tracking-normal`,
  },
  p: {
    component: 'p',
    className: cn``,
  },
  blockquote: {
    component: 'blockquote',
    className: cn`mt-6 border-l-2 pl-6 italic`,
  },
  'inline-code': {
    component: 'code',
    className: cn`bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold`,
  },
  lead: {
    component: 'p',
    className: cn`text-muted-foreground text-xl`,
  },
  large: {
    component: 'div',
    className: cn`text-lg font-semibold`,
  },
  small: {
    component: 'small',
    className: cn`text-sm font-medium leading-none`,
  },
  muted: {
    component: 'p',
    className: cn`text-muted-foreground text-sm`,
  },
} as const

type TypographyProps = React.PropsWithChildren &
  React.HTMLAttributes<HTMLElement> & {
    variant?: keyof typeof variantMap
  }

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'p', children, className, ...props }, ref) => {
    const selected = variantMap[variant] ?? variantMap['p']
    const Component = selected.component as 'p'

    return (
      <Component
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className={cn(selected.className, className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Typography.displayName = 'Typography'
