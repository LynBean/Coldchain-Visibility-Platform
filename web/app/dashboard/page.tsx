'use client'

import { useRouter } from 'next/navigation.js'
import React from 'react'

const DashboardPage = () => {
  const router = useRouter()

  React.useEffect(() => {
    router.replace('/dashboard/core')
  }, [router])

  return undefined
}

export default DashboardPage
