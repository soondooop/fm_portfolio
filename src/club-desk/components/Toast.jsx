import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { hideToast } from '../features/ui/uiSlice'

export default function Toast() {
  const dispatch = useDispatch()
  const toast = useSelector((s) => s.ui.toast)

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
