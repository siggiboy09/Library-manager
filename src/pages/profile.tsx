import { useMemo } from 'react'
import { useLibrary } from '../App'

export default function ProfilePage() {
  const { books, shelves } = useLibrary()
  const booksRead = books.filter(book => book.read).length
  const pagesRead = books.filter(book => book.read).reduce((sum, book) => sum + book.pages, 0)
  const unread = books.length - booksRead
  const shelfSummaries = useMemo(() => {
    return shelves.map(shelf => ({
      ...shelf,
      count: books.filter(book => book.shelfId === shelf.id).length,
    }))
  }, [shelves, books])

  return (
    <section className="page page-profile">
      <div className="panel">
        <h2>Profile</h2>
        <p>Your reading and shelf progress at a glance.</p>
        <div className="grid stats-grid">
          <div className="stat-card">
            <span>Total books</span>
            <strong>{books.length}</strong>
          </div>
          <div className="stat-card">
            <span>Books read</span>
            <strong>{booksRead}</strong>
          </div>
          <div className="stat-card">
            <span>Pages read</span>
            <strong>{pagesRead}</strong>
          </div>
          <div className="stat-card">
            <span>Books left</span>
            <strong>{unread}</strong>
          </div>
        </div>
      </div>
      <div className="panel">
        <h3>Shelf overview</h3>
        <div className="shelf-list">
          {shelfSummaries.map(shelf => (
            <div key={shelf.id} className="shelf-card">
              <strong>{shelf.name}</strong>
              <span>{shelf.count} book(s)</span>
              <p>{shelf.description || 'No shelf description'}</p>
            </div>
          ))}
          {shelfSummaries.length === 0 && (
            <div className="empty-state">
              <p>No shelves configured yet. Add one in settings.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
