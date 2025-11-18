import React from 'react'
import Home from './pages/Home'
import Search from './pages/Search'
import Playlist from './pages/Playlist'
import Like from './pages/Like'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Nav from './components/Nav'

const App = () => {
  return (
    <BrowserRouter>
      <Nav/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/search' element={<Search/>}/>
        <Route path='playlist' element={<Playlist/>} />
        <Route path='like' element={<Like/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App