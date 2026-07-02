import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Tts from './pages/Tts'
import Subtitle from './pages/Subtitle'
import Silence from './pages/Silence'
import Ebooks from './pages/Ebooks'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tts" element={<Tts />} />
          <Route path="/subtitle" element={<Subtitle />} />
          <Route path="/silence" element={<Silence />} />
          <Route path="/ebooks" element={<Ebooks />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>,
)
