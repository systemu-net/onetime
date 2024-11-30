import './index.css'
import { CookiesProvider } from 'react-cookie'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookiesProvider defaultSetOptions={{ page: '/' }}>
      <App />
    </CookiesProvider>
  </StrictMode>
)
