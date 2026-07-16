import { type FormEvent, useState } from 'react'
import { useLibrary } from '../App'

export default function SettingsPage() {
  const { shelves, addShelf } = useLibrary()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleAddShelf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    addShelf({ name: name.trim(), description: description.trim() })
    setName('')
    setDescription('')
  }

  return (
    <section className="page page-settings">
      <div className="panel">
        <h2>Storage locations</h2>
        <p>Create places where books live and assign them while adding or updating books.</p>
        <form className="settings-form" onSubmit={handleAddShelf}>
          <label>
            Location name
            <input value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Living room shelf" />
          </label>
          <label>
            Description
            <input value={description} onChange={event => setDescription(event.target.value)} placeholder="Short description" />
          </label>
          <button className="button" type="submit">Add location</button>
        </form>
      </div>
      <div className="panel">
        <h3>Existing locations</h3>
        <div className="shelf-list">
          {shelves.map(shelf => (
            <div key={shelf.id} className="shelf-card">
              <strong>{shelf.name}</strong>
              <p>{shelf.description || 'No description added'}</p>
            </div>
          ))}
          {shelves.length === 0 && (
            <div className="empty-state">
              <p>No storage locations yet. Add one above.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
