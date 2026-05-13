import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 生成或获取用户ID
let userId = localStorage.getItem('talent-showcase-user-id')
if (!userId) {
  userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2)
  localStorage.setItem('talent-showcase-user-id', userId)
}
(window as any).APP_USER_ID = userId

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
