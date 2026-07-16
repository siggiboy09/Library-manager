import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <Routes>
                <Route path="/" element={<div>Home</div>} />
                <Route path="/books" element={<div>Books</div>} />
                <Route path="/books/:id" element={<div>Book Details</div>} />
                <Route path="/profile" element={<div>Profile</div>} />
                <Route path="/profile/:id" element={<div>Profile</div>} />
                <Route path="/scanner" element={<div>scanner</div>} />
                <Route path="/settings" element={<div>Settings</div>} />
            </Routes>
        </HashRouter>
    </StrictMode>,
)
