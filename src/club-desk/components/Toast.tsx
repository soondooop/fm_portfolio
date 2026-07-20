import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { hideToast } from '../features/ui/uiSlice'

export default function Toast() {
  const dispatch = useAppDispatch()
  const toast = useAppSelector((s) => s.ui.toast)

  useEffect(() => {
    if (!toast.visible) return undefined
    const timer = setTimeout(() => dispatch(hideToast()), 2600)
    return () => clearTimeout(timer)
  }, [toast.visible, toast.message, dispatch])

  if (!toast.visible) return null

  return (
    <div className={`cd-toast cd-toast--${toast.type}`} role="status">
      {toast.message}
    </div>
  )
}
