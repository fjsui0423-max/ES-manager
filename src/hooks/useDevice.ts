'use client'

import { useState, useEffect } from 'react'

type Device = 'pc' | 'mobile' | 'unknown'

export function useDevice(): Device {
  const [device, setDevice] = useState<Device>('unknown')

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setDevice(mq.matches ? 'mobile' : 'pc')

    const handler = (e: MediaQueryListEvent) => {
      setDevice(e.matches ? 'mobile' : 'pc')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return device
}
