import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { useLibrary } from '../App'

declare global {
  interface BarcodeDetectorScanResult {
    rawValue: string | null
  }

  interface BarcodeDetector {
    detect(image: ImageBitmapSource): Promise<BarcodeDetectorScanResult[]>
  }

  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): BarcodeDetector
    }
  }
}

export default function ScannerPage() {
  const { books, shelves, addBook, linkBarcodeToBook } = useLibrary()
  const [barcode, setBarcode] = useState('')
  const [resultId, setResultId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [option, setOption] = useState<'new' | 'link'>('new')
  const [selectedBookId, setSelectedBookId] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newPages, setNewPages] = useState(0)
  const [newShelf, setNewShelf] = useState(shelves[0]?.id || '')
  const [newRead, setNewRead] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  const scanResult = useMemo(() => books.find(book => book.barcode === barcode.trim()), [books, barcode])
  const candidates = books.filter(book => !book.barcode)

  useEffect(() => {
    if (!cameraActive) return
    const videoElement = videoRef.current
    if (!videoElement) return
    const video = videoElement

    const handleError = (message: string) => {
      setCameraError(message)
      setCameraActive(false)
    }

    async function startCamera() {
      try {
        if (!window.BarcodeDetector) {
          const reader = new BrowserMultiFormatReader()
          codeReaderRef.current = reader

          controlsRef.current = await reader.decodeFromVideoDevice(undefined, video, (result, error) => {
            if (result?.getText()) {
              setBarcode(result.getText().trim())
              setCameraError('')
              setCameraActive(false)
              setResultId(null)
              stopCamera()
            } else if (error) {
              console.error(error)
            }
          })

          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        streamRef.current = stream
        video.srcObject = stream
        await video.play()

        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'qr_code', 'code_128', 'upc_a', 'upc_e'] })

        const scanFrame = async () => {
          if (video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
            rafRef.current = requestAnimationFrame(scanFrame)
            return
          }
          try {
            const barcodes = await detector.detect(video)
            if (barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue?.trim()
              if (rawValue) {
                setBarcode(rawValue)
                setCameraError('')
                setCameraActive(false)
                setResultId(null)
                stopCamera()
                return
              }
            }
          } catch (err) {
            console.error(err)
          }
          rafRef.current = requestAnimationFrame(scanFrame)
        }

        rafRef.current = requestAnimationFrame(scanFrame)
      } catch (err) {
        handleError('Unable to access the camera. Please allow camera permission.')
      }
    }

    startCamera()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      stopCamera()
    }
  }, [cameraActive])

  function stopCamera() {
    if (controlsRef.current) {
      controlsRef.current.stop()
      controlsRef.current = null
    }
    if (codeReaderRef.current) {
      codeReaderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function toggleCamera() {
    setCameraError('')
    setResultId(null)
    setCameraActive(active => {
      if (active) {
        stopCamera()
        return false
      }
      return true
    })
  }

  function handleManualScan() {
    setError('')
    if (!barcode.trim()) {
      setError('Enter a barcode to scan.')
      setResultId(null)
      return
    }
    if (scanResult) {
      setResultId(scanResult.id)
      return
    }
    setResultId(null)
  }

  function handleCreateBook() {
    if (!newTitle.trim() || !newAuthor.trim() || newPages <= 0) {
      setError('Fill in the title, author, and pages before creating a new book.')
      return
    }
    addBook({
      title: newTitle.trim(),
      author: newAuthor.trim(),
      pages: newPages,
      shelfId: newShelf || null,
      barcode: barcode.trim() || null,
      read: newRead,
      notes: '',
    })
    setNewTitle('')
    setNewAuthor('')
    setNewPages(0)
    setNewRead(false)
    setError('Book created with scanned barcode.')
  }

  function handleLinkBook() {
    if (!selectedBookId) {
      setError('Select a book to link with this barcode.')
      return
    }
    linkBarcodeToBook(selectedBookId, barcode.trim())
    setError('Barcode linked to existing book.')
  }

  return (
    <section className="page page-scanner">
      <div className="panel">
        <h2>Barcode scanner</h2>
        <p>Use your camera to scan a book barcode. You can also enter it manually.</p>
        <div className="scanner-card">
          <div className="scanner-actions">
            <button className="button" type="button" onClick={toggleCamera}>
              {cameraActive ? 'Stop camera' : 'Use camera'}
            </button>
            <button className="button secondary" type="button" onClick={handleManualScan}>
              Manual scan
            </button>
          </div>
          {cameraActive ? (
            <div className="video-wrapper">
              <video ref={videoRef} className="scanner-video" muted playsInline />
              <div className="scanner-frame" />
            </div>
          ) : (
            <label>
              Barcode
              <input value={barcode} onChange={event => setBarcode(event.target.value)} placeholder="1234567890123" />
            </label>
          )}
        </div>
        {(error || cameraError) && <div className="message error">{error || cameraError}</div>}
        {resultId ? (
          <div className="panel">
            <h3>Book found</h3>
            <p>This barcode is already linked to a book.</p>
            <Link className="button" to={`/books/${resultId}`}>Open book info</Link>
          </div>
        ) : barcode.trim() ? (
          <div className="panel">
            <h3>No book found</h3>
            <div className="option-row">
              <label>
                <input type="radio" checked={option === 'new'} onChange={() => setOption('new')} />
                Create a new book
              </label>
              <label>
                <input type="radio" checked={option === 'link'} onChange={() => setOption('link')} />
                Link barcode to an existing book
              </label>
            </div>
            {option === 'new' ? (
              <div className="new-book-form">
                <label>
                  Title
                  <input value={newTitle} onChange={event => setNewTitle(event.target.value)} />
                </label>
                <label>
                  Author
                  <input value={newAuthor} onChange={event => setNewAuthor(event.target.value)} />
                </label>
                <label>
                  Pages
                  <input type="number" value={newPages} min={1} onChange={event => setNewPages(Number(event.target.value))} />
                </label>
                <label>
                  Shelf
                  <select value={newShelf} onChange={event => setNewShelf(event.target.value)}>
                    <option value="">Unassigned</option>
                    {shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={newRead} onChange={event => setNewRead(event.target.checked)} />
                  Mark as read
                </label>
                <button className="button" type="button" onClick={handleCreateBook}>Create new book</button>
              </div>
            ) : (
              <div className="existing-link-form">
                {candidates.length === 0 ? (
                  <p>No existing books without barcode are available to link.</p>
                ) : (
                  <>
                    <label>
                      Select a book
                      <select value={selectedBookId} onChange={event => setSelectedBookId(event.target.value)}>
                        <option value="">Choose a book</option>
                        {candidates.map(book => (
                          <option key={book.id} value={book.id}>{book.title} — {book.author}</option>
                        ))}
                      </select>
                    </label>
                    <button className="button" type="button" onClick={handleLinkBook}>Link barcode</button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
