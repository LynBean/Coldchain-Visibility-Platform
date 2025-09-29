import AccountIcon from '@/components/assets/account-icon'
import CubesIcon from '@/components/assets/cubes-icon'
import Button from '@/components/button'
import tw from '@/lib/tw'
import { useSupabaseState } from '@/stores/supabase'
import { Box, ButtonBase, Menu, SvgIcon, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'

const AvatarMenu: React.FunctionComponent<{
  anchorEl?: HTMLElement
  open: boolean
  onClose?: () => void
}> = ({ anchorEl, open, onClose }) => {
  const { state: supabaseState, user: supabaseUser } = useSupabaseState()

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      disableAutoFocus
      disableEnforceFocus
      slotProps={{
        list: {
          className: tw`flex flex-col gap-1`,
        },
        paper: {
          className: tw`mt-1 min-w-[128px] max-w-[256px] rounded-sm border-[1px] border-divider bg-[--overlay-background] p-1 text-[--foreground-lighter]`,
        },
      }}
    >
      <Box className="flex w-full flex-col flex-nowrap border-b-[1px] border-b-divider p-1">
        <Typography className="text-[--foreground]" variant="h5">
          {supabaseUser?.user_metadata['name']}
        </Typography>

        <Typography variant="h5">{supabaseUser?.user_metadata['email']}</Typography>
      </Box>

      <ButtonBase className="w-full justify-start rounded-sm p-1 text-[--foreground-lighter]">
        <Typography variant="h4">Logout</Typography>
      </ButtonBase>
    </Menu>
  )
}

const AppBar: React.FunctionComponent = () => {
  const { state: supabaseState, user: supabaseUser } = useSupabaseState()

  const [avatarState, setAvatarState] = React.useState<{
    open: boolean
    anchorEl?: HTMLElement
  }>({
    open: false,
  })

  return (
    <Box className="flex h-[--appbar-height] w-dvw flex-row items-center justify-between border-b-[1px] border-b-divider px-[16px]">
      <Box className="flex flex-row flex-nowrap items-center gap-[2px]">
        <SvgIcon className="text-[1rem] text-[--foreground-lighter]">
          <CubesIcon />
        </SvgIcon>

        <Typography variant="h4">Soonlinmas Org</Typography>
      </Box>

      {supabaseState !== 'authenticated' ? (
        <Button>
          <Typography
            className="text-ellipsis whitespace-nowrap text-foreground"
            variant="h4"
          >
            Sign in
          </Typography>
        </Button>
      ) : (
        <Box
          ref={(el) => {
            if (!el || avatarState.anchorEl) {
              return
            }
            setAvatarState((state) => ({
              ...state,
              anchorEl: el as HTMLDivElement,
            }))
          }}
          className="flex aspect-square h-[64%] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-foreground"
          onClick={(event) => {
            setAvatarState((state) => ({
              ...state,
              open: true,
            }))
          }}
        >
          {supabaseUser && supabaseUser.user_metadata['avatar_url'] ? (
            <Image
              alt="user-avatar"
              src={supabaseUser.user_metadata['avatar_url']}
              objectFit="cover"
              fill
            />
          ) : (
            <SvgIcon className="aspect-[1/0.5] h-[60%] w-auto text-black">
              <AccountIcon />
            </SvgIcon>
          )}
        </Box>
      )}

      <AvatarMenu
        anchorEl={avatarState.anchorEl}
        open={avatarState.open}
        onClose={() => {
          setAvatarState((state) => ({ ...state, open: false }))
        }}
      />
    </Box>
  )
}

export default AppBar
