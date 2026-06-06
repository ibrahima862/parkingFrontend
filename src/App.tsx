// App.tsx
import { RouterProvider } from 'react-router-dom' // <-- Ajoute "-dom"
import { router } from './routes'
import { ToastProvider } from './context/toastContext'

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}

export default App