import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import BooksPage from './pages/books'
import BookDetailsPage from './pages/book'
import HomePage from './pages/home'
import ProfilePage from './pages/profile'
import ScannerPage from './pages/scanner'
import SettingsPage from './pages/settings'
import type { Book, LibraryContextValue, Shelf } from './types'
import './index.css'

const storageKey = 'library-manager-data'
const fallbackShelves: Shelf[] = [
  { id: 'shelf-home', name: 'Home Shelf', description: 'Default storage location for your books' },
]
const fallbackBooks: Book[] = [
  {
    id: 'book-1',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    pages: 310,
    shelfId: 'shelf-home',
    barcode: '9780261102217',
    read: true,
    notes: 'First classic in the collection',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'book-2',
    title: 'Digital Minimalism',
    author: 'Cal Newport',
    pages: 272,
    shelfId: 'shelf-home',
    barcode: null,
    read: false,
    notes: '',
    createdAt: new Date().toISOString(),
  },
]

const LibraryContext = createContext<LibraryContextValue | null>(null)

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function loadData() {
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) return { books: fallbackBooks, shelves: fallbackShelves }
  try {
    const parsed = JSON.parse(raw) as { books: Book[]; shelves: Shelf[] }
    if (!Array.isArray(parsed.books) || !Array.isArray(parsed.shelves)) {
      return { books: fallbackBooks, shelves: fallbackShelves }
    }
    return parsed
  } catch {
    return { books: fallbackBooks, shelves: fallbackShelves }
  }
}

function saveData(books: Book[], shelves: Shelf[]) {
  window.localStorage.setItem(storageKey, JSON.stringify({ books, shelves }))
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider')
  }
  return context
}

export default function App() {
  const initial = loadData()
  const [books, setBooks] = useState<Book[]>(initial.books)
  const [shelves, setShelves] = useState<Shelf[]>(initial.shelves)

  useEffect(() => {
    saveData(books, shelves)
  }, [books, shelves])

  const contextValue = useMemo<LibraryContextValue>(() => ({
    books,
    shelves,
    addBook(book) {
      setBooks(current => [
        {
          ...book,
          id: createId('book'),
          createdAt: new Date().toISOString(),
        },
        ...current,
      ])
    },
    updateBook(id, updates) {
      setBooks(current => current.map(book => book.id === id ? { ...book, ...updates } : book))
    },
    addShelf(shelf) {
      setShelves(current => [
        {
          id: createId('shelf'),
          ...shelf,
        },
        ...current,
      ])
    },
    linkBarcodeToBook(bookId, barcode) {
      setBooks(current => current.map(book => book.id === bookId ? { ...book, barcode } : book))
    },
  }), [books, shelves])

  return (
    <LibraryContext.Provider value={contextValue}>
      <HashRouter>
        <div className="app-shell">
          <header className="app-header">
            <div>
              <h1>Library Manager</h1>
              <p>Track books, shelves, reading progress, and barcode links.</p>
            </div>
          </header>
          <main className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:id" element={<BookDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <nav className="bottom-nav" aria-label="Main navigation">
            <Link className="bottom-nav-link" to="/">
              <span className="material-symbols-outlined">home</span>
              <span className="nav-label">Home</span>
            </Link>
            <Link className="bottom-nav-link" to="/books">
              <span className="material-symbols-outlined">menu_book</span>
              <span className="nav-label">Books</span>
            </Link>
            <Link className="bottom-nav-link" to="/profile">
              <span className="material-symbols-outlined">person</span>
              <span className="nav-label">Profile</span>
            </Link>
            <Link className="bottom-nav-link" to="/scanner">
              <span className="material-symbols-outlined">qr_code_scanner</span>
              <span className="nav-label">Scanner</span>
            </Link>
            <Link className="bottom-nav-link" to="/settings">
              <span className="material-symbols-outlined">settings</span>
              <span className="nav-label">Settings</span>
            </Link>
          </nav>
        </div>
      </HashRouter>
    </LibraryContext.Provider>
  )
}
