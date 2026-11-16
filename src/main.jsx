import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './lib/queryClient'
import { AdminAuthProvider, SiteAuthProvider } from './context/auth'
import App from './App.jsx'
import './index.css'

// تطبيق الثيم قبل أول render حتى ما يصير وميض
try {
  document.documentElement.dataset.theme = localStorage.getItem('sairna_theme') || 'light'
} catch {
  /* التخزين مو متاح */
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SiteAuthProvider>
          <AdminAuthProvider>
            <App />
            <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Cairo, sans-serif', fontWeight: 700 } }} />
          </AdminAuthProvider>
        </SiteAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
