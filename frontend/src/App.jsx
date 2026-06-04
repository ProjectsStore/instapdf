import { useSlides } from './hooks/useSlides';
import UrlInput from './components/UrlInput';
import SlideGrid from './components/SlideGrid';
import DownloadButton from './components/DownloadButton';
import './App.css';

export default function App() {
  const {
    slides,
    postInfo,
    loading,
    pdfLoading,
    error,
    fetchSlides,
    removeSlide,
    reorderSlides,
    generatePdf,
    reset,
    setError,
  } = useSlides();

  const hasSlides = slides.length > 0;

  return (
    <div className="app">
      {/* Hero Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <h1 className="app-title">InstaPDF</h1>
        <p className="app-subtitle">
          Turn <span>Instagram</span> posts into beautiful PDFs
        </p>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* URL Input — always visible when no slides */}
        {!hasSlides && (
          <UrlInput
            onFetch={fetchSlides}
            loading={loading}
            error={error}
            onClearError={() => setError(null)}
          />
        )}

        {/* Loading state */}
        {loading && (
          <div className="app-loading">
            <div className="spinner" />
            <p className="app-loading-text">
              Fetching slides from Instagram…
            </p>
          </div>
        )}

        {/* Slide Grid */}
        {hasSlides && (
          <>
            <SlideGrid
              slides={slides}
              postInfo={postInfo}
              onDelete={removeSlide}
              onReorder={reorderSlides}
            />

            <DownloadButton
              slideCount={slides.length}
              loading={pdfLoading}
              onDownload={generatePdf}
            />

            {/* Error during PDF generation */}
            {error && (
              <div className="url-input-error" role="alert" style={{ maxWidth: '500px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Reset / Fetch another */}
            <button className="app-reset-btn" onClick={reset}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
              Fetch another post
            </button>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>InstaPDF — Public posts only · No login required</p>
      </footer>
    </div>
  );
}
