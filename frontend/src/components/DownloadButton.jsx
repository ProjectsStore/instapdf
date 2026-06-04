import './DownloadButton.css';

/**
 * PDF download button with loading state and shimmer animation.
 */
export default function DownloadButton({ slideCount, loading, onDownload }) {
  if (slideCount === 0) return null;

  return (
    <div className="download-section">
      <button
        id="download-pdf-btn"
        className={`download-btn ${loading ? 'loading' : ''}`}
        onClick={onDownload}
        disabled={loading || slideCount === 0}
      >
        {loading ? (
          <>
            <span className="spinner" />
            <span className="download-btn-text">Generating PDF…</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            <span className="download-btn-text">
              Download PDF ({slideCount} page{slideCount !== 1 ? 's' : ''})
            </span>
          </>
        )}
      </button>
      <span className="download-hint">
        Each slide becomes a full-page image in the PDF
      </span>
    </div>
  );
}
