import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../App'

export default function Signups() {
  const { auth, API } = useContext(AuthContext)
  const [events, setEvents] = useState([])
  const [mySignups, setMySignups] = useState([])
  const [mode, setMode] = useState('signup') // signup or conversation
  const [type, setType] = useState('personal') // personal or event
  const [eventId, setEventId] = useState('')
  const [personName, setPersonName] = useState('')
  const [pending, setPending] = useState([])
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState([])

  const fetchEvents = async () => {
    const res = await fetch(`${API}/api/events`)
    const data = await res.json()
    setEvents(data)
  }

  const fetchSignups = async () => {
    if (!auth) return
    const res = await fetch(`${API}/api/signups`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
    const data = await res.json()
    setMySignups(data)
  }

  useEffect(() => { fetchEvents() }, [])
  useEffect(() => { fetchSignups() }, [auth])

  const addPending = (e) => {
    e.preventDefault()
    if (!personName.trim()) {
      setError('Please enter the person’s name')
      return
    }
    if ((mode === 'signup' || mode === 'conversation') && type === 'event' && !eventId) {
      setError('Please select an event')
      return
    }
    const newItem = {
      category: mode,        // 'signup' or 'conversation'
      type,                   // 'personal' or 'event'
      eventId: type === 'event' ? eventId : null,
      eventName: type === 'event' ? (events.find(ev => ev._id === eventId)?.title || '') : '',
      personName: personName.trim()
    }
    setPending([...pending, newItem])
    // reset form parts
    setPersonName('')
    setEventId('')
    setType('personal')
    setError(null)
  }

  const submitAll = async () => {
    if (!auth) { setError('Login required'); return }
    for (let item of pending) {
      try {
        await fetch(`${API}/api/signups`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${auth.token}` 
          },
          body: JSON.stringify({
            type: item.type,
            eventId: item.eventId,
            category: item.category,
            personName: item.personName
          })
        })
      } catch (err) {
        console.error(err)
      }
    }
    setPending([])
    fetchSignups()
  }

  const previewExport = () => {
    fetch(`${API}/api/signups`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(s => ({
          user: s.user?.name || "",
          category: s.category === "conversation" ? "Conversation" : "Signup",
          type: s.type,
          event: s.type === "event" ? (s.event?.title || "") : "",
          personName: s.personName || "",
          signupDate: s.timestamp ? new Date(s.timestamp).toLocaleString() : "",
          city: s.city || (s.event?.city ?? "")
        }))
        setPreview(formatted)
      })
  }

  const exportCsv = () => {
    const url = new URL(`${API}/api/signups/export`)
    if (auth.user.role === 'super_admin') {
      const city = prompt('Filter by city (optional):', '')
      if (city) url.searchParams.set('city', city)
    }
    fetch(url, { headers: { 'Authorization': `Bearer ${auth.token}` } })
      .then(res => res.blob())
      .then(blob => {
        if (blob.size === 0) {
          alert("No records found.")
          return
        }
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = "signups.csv"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
  }

  const deleteSignup = async (id) => {
    if (!window.confirm("Delete this record?")) return
    await fetch(`${API}/api/signups/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
    fetchSignups()
  }

  const showExport = auth && (auth.user.role === 'admin' || auth.user.role === 'super_admin')

  return (
    <div className="container">
      <div className="card">
        <h2>Signups & Conversations</h2>

        {auth ? (
          <>
            {/* Mode toggle */}
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setMode('signup')}
                className={mode === 'signup' ? 'primary' : ''}
                style={{ marginRight: 8 }}
              >
                Signup
              </button>
              <button
                onClick={() => setMode('conversation')}
                className={mode === 'conversation' ? 'secondary' : ''}
              >
                Had a Convo
              </button>
            </div>

            {/* Form (Signup or Conversation) */}
            <form onSubmit={addPending} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              {/* Person name required */}
              <input
                placeholder="Name of person"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                required
              />

              <label>
                <input type="radio" checked={type === 'personal'} onChange={() => setType('personal')} /> Personal
              </label>
              <label>
                <input type="radio" checked={type === 'event'} onChange={() => setType('event')} /> Event
              </label>
              {type === 'event' && (
                <select value={eventId} onChange={e => setEventId(e.target.value)} required>
                  <option value="">Select event</option>
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title} — {ev.city} — {new Date(ev.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
              <button type="submit" className={mode === 'signup' ? 'primary' : 'secondary'}>
                Add to Pending
              </button>
            </form>

            {/* Pending entries */}
            {pending.length > 0 && (
              <div className="card">
                <h4>Pending Entries</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Event</th>
                      <th>Person</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((p, i) => (
                      <tr key={i}>
                        <td>{p.category}</td>
                        <td>{p.type}</td>
                        <td>{p.eventName || ''}</td>
                        <td>{p.personName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={submitAll} className="secondary" style={{ marginTop: 10 }}>Submit All</button>
              </div>
            )}

            {error && <div style={{ color:'red' }}>{error}</div>}
          </>
        ) : (
          <p><em>Login to submit signups or conversations.</em></p>
        )}
      </div>

      {/* Your / Visible Records */}
      <div className="card">
        <h3>Your/Visible Records</h3>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Category</th>
              <th>Type</th>
              <th>Event</th>
              <th>Person</th>
              <th>Date</th>
              <th>City</th>
              {(auth && (auth.user.role === 'admin' || auth.user.role === 'super_admin')) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {mySignups.map((s, i) => (
              <tr key={i}>
                <td>{s.user?.name}</td>
                <td>{s.category}</td>
                <td>{s.type}</td>
                <td>{s.event ? s.event.title : ''}</td>
                <td>{s.personName}</td>
                <td>{new Date(s.timestamp).toLocaleString()}</td>
                <td>{s.city || (s.event?.city ?? '')}</td>
                {(auth && (auth.user.role === 'admin' || auth.user.role === 'super_admin')) && (
                  <td>
                    <button onClick={() => deleteSignup(s._id)} className="danger">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export & Preview */}
      {showExport && (
        <div className="card">
          <button onClick={exportCsv} className="primary" style={{ marginRight: 8 }}>Export CSV</button>
          <button onClick={previewExport} className="secondary">Preview Export</button>
        </div>
      )}

      {preview.length > 0 && (
        <div className="card">
          <h4>Export Preview</h4>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Category</th>
                <th>Type</th>
                <th>Event</th>
                <th>Person</th>
                <th>Date</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  <td>{row.user}</td>
                  <td>{row.category}</td>
                  <td>{row.type}</td>
                  <td>{row.event}</td>
                  <td>{row.personName}</td>
                  <td>{row.signupDate}</td>
                  <td>{row.city}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  )
}
