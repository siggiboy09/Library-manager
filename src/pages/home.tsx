import { useLibrary } from '../App'

export default function HomePage() {
  const { books, shelves } = useLibrary()
  const readCount = books.filter(book => book.read).length
  const pageTotal = books.filter(book => book.read).reduce((sum, book) => sum + book.pages, 0)
  const nextShelf = shelves.length ? shelves[0].name : 'No shelves yet'

  return (
    <section className="page page-home">
      <div className="panel summary-panel">
        <h2>Welcome to your library</h2>
        <p>Use the app to store books, assign them to locations, and mark reading progress.</p>
        <div className="grid stats-grid">
          <div className="stat-card">
            <span>Books in library</span>
            <strong>{books.length}</strong>
          </div>
          <div className="stat-card">
            <span>Books read</span>
            <strong>{readCount}</strong>
          </div>
          <div className="stat-card">
            <span>Pages read</span>
            <strong>{pageTotal}</strong>
          </div>
          <div className="stat-card">
            <span>First shelf</span>
            <strong>{nextShelf}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}
