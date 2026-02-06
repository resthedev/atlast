import { useEffect } from 'react'
import { useTravelLog } from '@/context/TravelLogContext'

export default function Toast() {
  const { toastMessage, toastVisible, hideToast } = useTravelLog()

  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(hideToast, 2000)
      return () => clearTimeout(timer)
    }
  }, [toastVisible, hideToast])

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-20 rounded-2xl glass px-5 py-3 text-sm transition-all duration-500 ${
        toastVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {toastMessage}
    </div>
  )
}
