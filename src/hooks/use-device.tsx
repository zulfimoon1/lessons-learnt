
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = React.useState<DeviceType>('desktop')

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setDeviceType('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    const mediaQueryMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const mediaQueryTablet = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    
    mediaQueryMobile.addEventListener("change", updateDeviceType)
    mediaQueryTablet.addEventListener("change", updateDeviceType)
    updateDeviceType()
    
    return () => {
      mediaQueryMobile.removeEventListener("change", updateDeviceType)
      mediaQueryTablet.removeEventListener("change", updateDeviceType)
    }
  }, [])

  return deviceType
}

export function useIsMobile(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'mobile'
}

export function useIsTablet(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'tablet'
}

export function useIsDesktop(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'desktop'
}
