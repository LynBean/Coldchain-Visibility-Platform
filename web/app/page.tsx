'use client'

import { useRouter } from 'next/navigation.js'
import React from 'react'

const Page: React.FunctionComponent = () => {
  const router = useRouter()

  React.useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return undefined
}

export default Page
