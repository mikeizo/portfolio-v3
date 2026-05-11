export interface InputRotationOptions {
  mouseSensitivity?: number
  touchSensitivity?: number
  gyroSensitivity?: number
  lerpFactor?: number
}

type RequestPermissionFn = () => Promise<'granted' | 'denied'>

function getGyroPermissionRequester(): RequestPermissionFn | null {
  if (typeof DeviceOrientationEvent === 'undefined') return null
  const DOE = DeviceOrientationEvent as unknown as {
    requestPermission?: RequestPermissionFn
  }
  if (typeof DOE.requestPermission !== 'function') return null
  return () => DOE.requestPermission!()
}

export function useInputRotation(options: InputRotationOptions = {}) {
  const {
    mouseSensitivity = 0.0005,
    touchSensitivity = 0.003,
    gyroSensitivity = 0.015,
    lerpFactor = 0.05
  } = options

  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }
  const gyro = { x: 0, y: 0, targetX: 0, targetY: 0 }

  let touchStartX = 0
  let touchStartY = 0
  let touchStartTargetX = 0
  let touchStartTargetY = 0

  let gyroBaselineBeta: number | null = null
  let gyroBaselineGamma: number | null = null
  let gyroPermissionRequested = false
  let gyroListenerAttached = false

  const requestGyroPermissionFn = getGyroPermissionRequester()

  function resetMouseTarget(): void {
    mouse.targetX = 0
    mouse.targetY = 0
  }

  function onMouseMove(e: MouseEvent): void {
    mouse.targetX = (e.clientX - window.innerWidth / 2) * mouseSensitivity
    mouse.targetY = (e.clientY - window.innerHeight / 2) * mouseSensitivity
  }

  function onTouchStart(e: TouchEvent): void {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchStartTargetX = mouse.targetX
      touchStartTargetY = mouse.targetY
    }
    requestGyroPermission()
  }

  function onTouchMove(e: TouchEvent): void {
    if (e.touches.length > 0) {
      const deltaX = e.touches[0].clientX - touchStartX
      const deltaY = e.touches[0].clientY - touchStartY

      mouse.targetX = touchStartTargetX + deltaX * touchSensitivity
      mouse.targetY = touchStartTargetY + deltaY * touchSensitivity
    }
  }

  function onDeviceOrientation(e: DeviceOrientationEvent): void {
    if (e.beta === null || e.gamma === null) return

    if (gyroBaselineBeta === null || gyroBaselineGamma === null) {
      gyroBaselineBeta = e.beta
      gyroBaselineGamma = e.gamma
      return
    }

    const deltaBeta = e.beta - gyroBaselineBeta
    const deltaGamma = e.gamma - gyroBaselineGamma

    gyro.targetX = deltaGamma * gyroSensitivity
    gyro.targetY = deltaBeta * gyroSensitivity
  }

  function attachGyroListener(): void {
    if (gyroListenerAttached) return
    window.addEventListener('deviceorientation', onDeviceOrientation)
    gyroListenerAttached = true
  }

  async function requestGyroPermission(): Promise<void> {
    if (gyroPermissionRequested || !requestGyroPermissionFn) return
    gyroPermissionRequested = true

    try {
      const result = await requestGyroPermissionFn()
      if (result === 'granted') attachGyroListener()
    } catch {
      // permission denied or unavailable
    }
  }

  function init(): void {
    window.addEventListener('mousemove', onMouseMove)
    document.documentElement.addEventListener('mouseleave', resetMouseTarget)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', resetMouseTarget)

    if (!requestGyroPermissionFn) attachGyroListener()
  }

  function update(): void {
    mouse.x += (mouse.targetX - mouse.x) * lerpFactor
    mouse.y += (mouse.targetY - mouse.y) * lerpFactor

    gyro.x += (gyro.targetX - gyro.x) * lerpFactor
    gyro.y += (gyro.targetY - gyro.y) * lerpFactor
  }

  function cleanup(): void {
    window.removeEventListener('mousemove', onMouseMove)
    document.documentElement.removeEventListener('mouseleave', resetMouseTarget)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', resetMouseTarget)

    if (gyroListenerAttached) {
      window.removeEventListener('deviceorientation', onDeviceOrientation)
      gyroListenerAttached = false
    }
  }

  return { mouse, gyro, init, update, cleanup }
}
