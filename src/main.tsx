import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 一次性清理历史数据：只在首次访问时执行一次
const hasCleanedOldData = localStorage.getItem('talent-showcase-cleaned')

if (!hasCleanedOldData) {
  localStorage.removeItem('talent-showcase-owner-data')
  localStorage.removeItem('talent-showcase-visitor-limit')
  localStorage.removeItem('talent-showcase-media-cache')
  localStorage.setItem('talent-showcase-cleaned', 'true')
  console.log('[数据清理完成] 已删除所有历史演示数据')
}

// 生成或获取用户ID（用于跨设备同步）
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
