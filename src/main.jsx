import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

import { seedInitialData } from '@/utils/seedData'

// Attempt to seed data before rendering
seedInitialData().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
})

