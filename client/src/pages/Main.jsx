import React, { useContext, useState } from 'react'
import { AuthContext } from '../App'

export default function Main() {
  const { auth, setAuth, API } = useContext(AuthContext)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user', city:'' })
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setAuth(data)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>HKL Website</h2>
        <p>Welcome to Humility, Kindness, Love platform.</p>
        {auth ? (
          <p>You are logged in as <b>{auth.user.name}</b> ({auth.user.role}).</p>
        ) : (
          <form onSubmit={submit} className="form">
            <div style={{ marginBottom: 10 }}>
              <button type="button" className={mode==='login' ? 'primary' : ''} onClick={()=>setMode('login')}>Login</button>
              <button type="button" className={mode==='register' ? 'secondary' : ''} onClick={()=>setMode('register')} style={{ marginLeft: 10 }}>Register</button>
            </div>

            {mode==='register' && (
              <>
                <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
                <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {form.role==='admin' && (
                  <input placeholder="City (required for admin)" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} required />
                )}
              </>
            )}

            <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
            <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />

            <button type="submit" className="primary">{mode==='login' ? 'Login' : 'Register'}</button>
            {error && <div style={{ color:'red' }}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  )
}
