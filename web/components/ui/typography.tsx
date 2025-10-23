import tw from '@/lib/tw.ts'
import React from 'react'
import { twMerge } from 'tailwind-merge'

const variantMap = {
  h1: {
    component: 'h1',
    className: tw`scroll-m-20 text-balance text-center text-4xl font-extrabold tracking-tight`,
  },
  h2: {
    component: 'h2',
    className: tw`scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0`,
  },
  h3: {
    component: 'h3',
    className: tw`scroll-m-20 text-2xl font-semibold tracking-tight`,
  },
  h4: {
    component: 'h4',
    className: tw`scroll-m-20 text-xl font-semibold tracking-tight`,
  },
  p: {
    component: 'p',
    className: tw`not-first:mt-6 leading-7`,
  },
  blockquote: {
    component: 'blockquote',
    className: tw`mt-6 border-l-2 pl-6 italic`,
  },
  'inline-code': {
    component: 'code',
    className: tw`bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold`,
  },
  lead: {
    component: 'p',
    className: tw`text-muted-foreground text-xl`,
  },
  large: {
    component: 'div',
    className: tw`text-lg font-semibold`,
  },
  small: {
    component: 'small',
    className: tw`text-sm font-medium leading-none`,
  },
  muted: {
    component: 'p',
    className: tw`text-muted-foreground text-sm`,
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
        className={twMerge(selected.className, className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Typography.displayName = 'Typography'
