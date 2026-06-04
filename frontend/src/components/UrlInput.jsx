import { useState } from 'react';
import './UrlInput.css';

/**
 * URL input bar for pasting Instagram post links.
 */
export default function UrlInput({ onFetch, loading, error, onClearError }) {
  const [url, setUrl] = useState('');

  const isValidUrl = (value) => {
    return /instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+/.test(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || !isValidUrl(url)) return;
    onClearError?.();
    onFetch(url.trim());
  };

  const handlePaste = (e) => {
    // Auto-submit on paste if valid
    setTimeout(() => {
      const pasted = e.target.value;
      if (isValidUrl(pasted)) {
        onClearError?.();
        onFetch(pasted.trim());
      }
    }, 100);
  };

  return (
    <div className="url-input-wrapper">
      <form onSubmit={handleSubmit}>
        <div className="url-input-container">
          {/* Instagram icon */}
          <div className="url-input-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>

          <input
            id="url-input"
            className="url-input-field"
            type="text"
            placeholder="Paste Instagram post URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={handlePaste}
            disabled={loading}
            autoComplete="off"
            spellCheck="false"
          />

          <button
            id="fetch-btn"
            className="url-input-btn"
            type="submit"
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Fetching…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Fetch Slides
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="url-input-error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
