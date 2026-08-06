import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './theme/ThemeProvider'
import GridPointerFx from './theme/GridPointerFx'
import { initGa } from './analytics/ga'
import GaRouteTracker from './analytics/GaRouteTracker'
import './styles/global.css'

initGa()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <GridPointerFx />
      <BrowserRouter>
        <GaRouteTracker />
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
