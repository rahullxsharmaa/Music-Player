import React, { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import PlayerBar from './components/PlayerBar'
import Queue from './components/Queue'
import Home from './pages/Home'
import Search from './pages/Search'
import NowPlaying from './pages/NowPlaying'
import Like from './pages/Like'
import Playlist from './pages/Playlist'

const App = () => {
  const [showQueue, setShowQueue] = useState(false)

  return (
    <BrowserRouter>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-primary)',
        overflow: 'hidden'
      }}>
        {/* Top area: sidebar + content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar (desktop) */}
          <Nav />

          {/* Main content */}
          <main style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingBottom: '20px'
          }}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/search' element={<Search />} />
              <Route path='/now-playing' element={<NowPlaying />} />
              <Route path='/liked' element={<Like />} />
              <Route path='/playlist/:id?' element={<Playlist />} />
            </Routes>
          </main>

          {/* Queue sidebar */}
          {showQueue && <Queue onClose={() => setShowQueue(false)} />}
        </div>

        {/* Bottom player bar */}
        <PlayerBar onQueueToggle={() => setShowQueue(prev => !prev)} showQueue={showQueue} />

        {/* Mobile bottom nav */}
        <div className="mobile-nav-spacer" style={{
          display: 'none',
          height: 'var(--nav-mobile-height)',
          flexShrink: 0
        }} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-nav-spacer {
            display: block !important;
          }
        }
      `}</style>
    </BrowserRouter>
  )
}

export default App