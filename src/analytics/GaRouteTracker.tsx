import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageview } from './ga'

/** React Router SPA 페이지뷰 전송 */
export default function GaRouteTracker() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    trackPageview(`${pathname}${search}`)
  }, [pathname, search])

  return null
}
