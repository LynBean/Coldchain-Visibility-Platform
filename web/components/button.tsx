import { Box, ButtonBase } from '@mui/material'
import React from 'react'

type VariantButtonProps = React.PropsWithChildren & {
  ref?: React.RefObject<HTMLButtonElement>
  disabled?: boolean
  onClick?: (event: React.MouseEvent) => void
}

const BrandedVariant: React.FunctionComponent<VariantButtonProps> = (props) => {
  return (
    <ButtonBase
      ref={props.ref}
      className="bg-brand-500 hover:bg-brand/50 border-brand/30 hover:border-brand focus-visible:outline-brand-600 data-[state=open]:bg-brand-500/80 data-[state=open]:outline-brand-600 relative inline-flex h-[26px] w-min cursor-pointer items-center justify-center rounded-md border px-2.5 py-1 text-center text-xs text-foreground outline-none outline-0 transition-all duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1"
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </ButtonBase>
  )
}

const BlackVariant: React.FunctionComponent<VariantButtonProps> = (props) => {
  return (
    <Box className="outline-foreground-lighter/50 w-full rounded-md outline outline-1 outline-offset-4">
      <ButtonBase
        ref={props.ref}
        className="font-regular bg-alternative dark:bg-muted hover:bg-selection border-strong hover:border-stronger focus-visible:outline-brand-600 data-[state=open]:bg-selection data-[state=open]:outline-brand-600 data-[state=open]:border-button-hover relative flex h-[42px] w-full cursor-pointer items-center justify-center space-x-2 rounded-md border px-4 py-2 text-center text-base text-foreground outline-none outline-0 transition-all duration-200 ease-out focus-visible:outline-4 focus-visible:outline-offset-1"
        disabled={props.disabled}
        onClick={props.onClick}
      >
        {props.children}
      </ButtonBase>
    </Box>
  )
}

const Button: React.FunctionComponent<
  VariantButtonProps & {
    variant?: 'branded'
  }
> = (props) => {
  switch (props.variant) {
    case 'branded':
      return <BrandedVariant {...props} />

    default:
      return <BrandedVariant {...props} />
  }
}

export default Button
