import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const showToast = useCallback((msg: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMessage(msg)
    setVisible(true)
  }, [])

  const hideToast = useCallback(() => {
    setVisible(false)
  }, [])

  return { message, visible, showToast, hideToast }
}
