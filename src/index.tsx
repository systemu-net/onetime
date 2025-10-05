import { StrictMode } from 'react'
import { CookiesProvider } from 'react-cookie'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// if (import.meta.env.DEV) {
//   const { worker } = await import('./mocks/browser.ts');
//   worker.start();
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <App />
    </CookiesProvider>
  </StrictMode>
)
