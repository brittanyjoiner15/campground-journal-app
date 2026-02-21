import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: StrictMode disabled for better dev performance (enables double-rendering)
// Re-enable before production build if needed for debugging
createRoot(document.getElementById('root')!).render(
  <App />
)
