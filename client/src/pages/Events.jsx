import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../App'

export default function Events() {
  const { auth, API } = useContext(AuthContext)
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ title:'', description:'', date:'', city:'', location:'' })
  const [editId, setEditId] = useState(null) // 👈 track which event is being edited
  const [editForm, setEditForm] = useState({})
  const [error, setError] = useState(null)

  const fetchEvents = async () => {
    const res = await fetch(`${API}/api/events`)
    const data = await res.json()
    setEvents(data)
  }
  useEffect(() => { fetchEvents() }, [])

  const canManage = auth && (auth.user.role === 'admin' || auth.user.role === 'super_admin')

  const createEvent = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(`${API}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth ? { 'Authorization': `Bearer ${auth.token}` } : {})
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create event')
      setForm({ title:'', description:'', date:'', city:'', location:'' })
      fetchEvents()
    } catch (err) {
      setError(err.message)
    }
  }

  const del = async (id) => {
    if (!window.confirm("Delete this event?")) return
    const res = await fetch(`${API}/api/events/${id}`, {
      method: 'DELETE',
      headers: { ...(auth ? { 'Authorization': `Bearer ${auth.token}` } : {}) }
    })
    if (res.ok) fetchEvents()
  }

  const startEdit = (ev) => {
    setEditId(ev._id)
    setEditForm({ title: ev.title, description: ev.description, date: ev.date.split('T')[0], city: ev.city, location: ev.location })
  }

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API}/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update event')
      setEditId(null)
      fetchEvents()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Events</h2>
        {canManage && (
          <form onSubmit={createEvent} className="form" style={{ display:'grid', gap: 10 }}>
            <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
            <input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
            <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required />
            <input placeholder="City" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} required />
            <input placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} />
            <button type="submit" className="secondary">Create Event</button>
            {error && <div style={{ color:'red' }}>{error}</div>}
          </form>
        )}
      </div>

      {events.map(ev => (
        <div key={ev._id} className="card">
          {editId === ev._id ? (
            <>
              <h3>Edit Event</h3>
              <input placeholder="Title" value={editForm.title} onChange={e=>setEditForm({...editForm, title:e.target.value})} />
              <input placeholder="Description" value={editForm.description} onChange={e=>setEditForm({...editForm, description:e.target.value})} />
              <input type="date" value={editForm.date} onChange={e=>setEditForm({...editForm, date:e.target.value})} />
              <input placeholder="City" value={editForm.city} onChange={e=>setEditForm({...editForm, city:e.target.value})} />
              <input placeholder="Location" value={editForm.location} onChange={e=>setEditForm({...editForm, location:e.target.value})} />
              <div style={{ marginTop: 10 }}>
                <button onClick={()=>saveEdit(ev._id)} className="primary" style={{ marginRight: 8 }}>Save</button>
                <button onClick={()=>setEditId(null)} className="secondary">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <h3>{ev.title}</h3>
              <p>{ev.description}</p>
              <p><b>Date:</b> {new Date(ev.date).toLocaleDateString()}</p>
              <p><b>City:</b> {ev.city} {ev.location ? `@ ${ev.location}` : ''}</p>
              {canManage && (
                <div style={{ marginTop: 10 }}>
                  <button onClick={()=>startEdit(ev)} className="primary" style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={()=>del(ev._id)} className="danger">Delete</button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}