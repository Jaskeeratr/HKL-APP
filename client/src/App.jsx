import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Main from './pages/Main'
import Events from './pages/Events'
import Signups from './pages/Signups'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const AuthContext = React.createContext(null)

function App() {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem('auth')
    return raw ? JSON.parse(raw) : null
  })
  const navigate = useNavigate()

  const logout = () => {
    setAuth(null)
    localStorage.removeItem('auth')
    navigate('/')
  }

  useEffect(() => {
    if (auth) localStorage.setItem('auth', JSON.stringify(auth))
  }, [auth])

  return (
    <AuthContext.Provider value={{ auth, setAuth, API }}>
      <nav style={{ display:'flex', gap: 12, padding: 10, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Main</Link>
        <Link to="/events">Events</Link>
        <Link to="/signups">Signups</Link>
        <span style={{ marginLeft:'auto' }}>
          {auth ? (
            <>
              <strong>{auth.user.name}</strong> ({auth.user.role}{auth.user.city ? `, ${auth.user.city}` : ''}) 
              <button onClick={logout} style={{ marginLeft: 10 }}>Logout</button>
            </>
          ) : null}
        </span>
      </nav>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/events" element={<Events />} />
        <Route path="/signups" element={<Signups />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthContext.Provider>
  )
}

export default App
