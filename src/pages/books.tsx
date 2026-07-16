import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLibrary } from '../App'

export default function BooksPage() {
  const { books, shelves, addBook } = useLibrary()
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [pages, setPages] = useState(0)
  const [barcode, setBarcode] = useState('')
  const [shelfId, setShelfId] = useState(shelves[0]?.id || '')
  const [read, setRead] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setShelfId(shelves[0]?.id || '')
  }, [shelves])

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return books.filter(book =>
      q.length === 0 ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      (book.barcode ?? '').includes(q) ||
      (shelves.find(shelf => shelf.id === book.shelfId)?.name.toLowerCase() ?? '').includes(q)
    )
  }, [books, search, shelves])

  const visibleBooks = filteredBooks.slice(0, visibleCount)
  const canLoadMore = filteredBooks.length > visibleCount

  useEffect(() => {
    function handleScroll() {
      const current = listRef.current
      if (!current) return
      if (current.scrollTop + current.clientHeight >= current.scrollHeight - 100 && canLoadMore) {
        setVisibleCount(count => Math.min(filteredBooks.length, count + 10))
      }
    }
    const current = listRef.current
    if (!current) return
    current.addEventListener('scroll', handleScroll)
    return () => current.removeEventListener('scroll', handleScroll)
  }, [canLoadMore, filteredBooks.length])

  function handleAddBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || !author.trim() || pages <= 0) return
    addBook({
      title: title.trim(),
      author: author.trim(),
      pages,
      shelfId: shelfId || null,
      barcode: barcode.trim() || null,
      read,
      notes: '',
    })
    setTitle('')
    setAuthor('')
    setPages(0)
    setBarcode('')
    setRead(false)
  }

  return (
    <section className="page page-books">
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Books</h2>
            <p>Search, browse, and add books to your library.</p>
          </div>
          <input
            className="search-input"
            placeholder="Search by title, author, shelf, or barcode"
            value={search}
            onChange={event => { setSearch(event.target.value); setVisibleCount(10) }}
          />
        </div>
        <div className="books-grid">
          <div className="books-sidebar">
            <h3>Add a new book</h3>
            <form className="book-form" onSubmit={handleAddBook}>
              <label>
                Title
                <input value={title} onChange={event => setTitle(event.target.value)} placeholder="The book title" />
              </label>
              <label>
                Author
                <input value={author} onChange={event => setAuthor(event.target.value)} placeholder="Book author" />
              </label>
              <label>
                Pages
                <input type="number" value={pages} onChange={event => setPages(Number(event.target.value))} min={1} />
              </label>
              <label>
                Shelf
                <select value={shelfId} onChange={event => setShelfId(event.target.value)}>
                  <option value="">Unassigned</option>
                  {shelves.map(shelf => (<option key={shelf.id} value={shelf.id}>{shelf.name}</option>))}
                </select>
              </label>
              <label>
                Barcode
                <input value={barcode} onChange={event => setBarcode(event.target.value)} placeholder="Optional barcode" />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={read} onChange={event => setRead(event.target.checked)} />
                Mark as read
              </label>
              <button className="button" type="submit">Add book</button>
            </form>
          </div>
          <div className="books-list-wrapper" ref={listRef}>
            {visibleBooks.length === 0 ? (
              <div className="empty-state">
                <p>No books match your search yet. Add your first book above.</p>
              </div>
            ) : (
              visibleBooks.map(book => {
                const shelf = shelves.find(shelf => shelf.id === book.shelfId)
                return (
                  <article key={book.id} className="book-card">
                    <Link className="book-link" to={`/books/${book.id}`}>
                      <h3>{book.title}</h3>
                      <p>{book.author}</p>
                    </Link>
                    <div className="book-meta">
                      <span>{book.pages} pages</span>
                      <span>{book.read ? 'Read' : 'Not read'}</span>
                      <span>{shelf ? shelf.name : 'No shelf'}</span>
                    </div>
                    <div className="book-barcode">{book.barcode ? `Barcode: ${book.barcode}` : 'No barcode'}</div>
                  </article>
                )
              })
            )}
            {canLoadMore && (
              <button className="button secondary" type="button" onClick={() => setVisibleCount(count => Math.min(filteredBooks.length, count + 10))}>
                Load more
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
