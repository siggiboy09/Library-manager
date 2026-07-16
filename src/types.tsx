export interface Book {
  id: string
  title: string
  author: string
  pages: number
  shelfId: string | null
  barcode: string | null
  read: boolean
  notes: string
  createdAt: string
}

export interface Shelf {
  id: string
  name: string
  description: string
}

export interface LibraryContextValue {
  books: Book[]
  shelves: Shelf[]
  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => void
  updateBook: (id: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>) => void
  addShelf: (shelf: Omit<Shelf, 'id'>) => void
  linkBarcodeToBook: (bookId: string, barcode: string) => void
}
