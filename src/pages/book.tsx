import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLibrary } from '../App'

export default function BookDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { books, shelves, updateBook } = useLibrary()
  const book = useMemo(() => books.find(item => item.id === id), [books, id])
  const [editPages, setEditPages] = useState(book?.pages ?? 0)
  const [editShelf, setEditShelf] = useState(book?.shelfId ?? '')
  const [editBarcode, setEditBarcode] = useState(book?.barcode ?? '')
  const [notes, setNotes] = useState(book?.notes ?? '')

  if (!book) {
    return (
      <section className="page page-book-details">
        <div className="panel">
          <h2>Book not found</h2>
          <p>This book does not exist or may have been removed.</p>
          <Link className="button" to="/books">Back to books</Link>
        </div>
      </section>
    )
  }

  function handleSave() {
    if (!book) return
    updateBook(book.id, {
      pages: editPages,
      shelfId: editShelf || null,
      barcode: editBarcode.trim() || null,
      notes,
    })
    navigate('/books')
  }

  function toggleRead() {
    if (!book) return
    updateBook(book.id, { read: !book.read })
  }

  return (
    <section className="page page-book-details">
      <div className="panel">
        <div className="page-header">
          <div>
            <h2>{book.title}</h2>
            <p>{book.author}</p>
          </div>
          <button className="button" onClick={toggleRead}>
            Mark as {book.read ? 'not read' : 'read'}
          </button>
        </div>
        <div className="detail-grid">
          <div className="detail-card">
            <label>
              Pages
              <input type="number" value={editPages} min={1} onChange={event => setEditPages(Number(event.target.value))} />
            </label>
            <label>
              Shelf location
              <select value={editShelf} onChange={event => setEditShelf(event.target.value)}>
                <option value="">Unassigned</option>
                {shelves.map(shelf => (
                  <option key={shelf.id} value={shelf.id}>{shelf.name}</option>
                ))}
              </select>
            </label>
            <label>
              Barcode
              <input value={editBarcode} onChange={event => setEditBarcode(event.target.value)} placeholder="Enter or update barcode" />
            </label>
          </div>
          <div className="detail-card">
            <p><strong>Status:</strong> {book.read ? 'Read' : 'Not read'}</p>
            <p><strong>Current shelf:</strong> {shelves.find(shelf => shelf.id === book.shelfId)?.name ?? 'None'}</p>
            <p><strong>Barcode:</strong> {book.barcode ?? 'None'}</p>
            <p><strong>Created:</strong> {new Date(book.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <label className="notes-field">
          Notes
          <textarea value={notes} onChange={event => setNotes(event.target.value)} rows={5} />
        </label>
        <div className="button-row">
          <button className="button" type="button" onClick={handleSave}>Save changes</button>
          <Link className="button secondary" to="/books">Cancel</Link>
        </div>
      </div>
    </section>
  )
}
