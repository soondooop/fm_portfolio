const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function initGa() {
  if (!GA_ID || typeof document === 'undefined') return
  if (document.getElementById('ga-gtag')) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(..._args: unknown[]) {
    // gtag 공식 스니펫과 동일하게 Arguments 객체를 넣는다
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  // SPA는 라우트 변경 때 직접 page_view를 보낸다
  window.gtag('config', GA_ID, { send_page_view: false })

  const script = document.createElement('script')
  script.id = 'ga-gtag'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
}

export function trackPageview(path: string, title = document.title) {
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  })
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (!GA_ID || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
