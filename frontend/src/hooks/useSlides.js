import { useState, useCallback } from 'react';
import { fetchPostSlides, downloadPdf } from '../api/instagram';

/**
 * Custom hook for managing slide state — fetch, reorder, delete, PDF download.
 */
export function useSlides() {
  const [slides, setSlides] = useState([]);
  const [postInfo, setPostInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Fetch slides from an Instagram URL */
  const fetchSlides = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    setSlides([]);
    setPostInfo(null);

    try {
      const data = await fetchPostSlides(url);
      // Filter out video slides
      const imageSlides = data.slides.filter((s) => !s.is_video);
      setSlides(imageSlides);
      setPostInfo({
        shortcode: data.shortcode,
        caption: data.caption,
        username: data.username,
      });
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to fetch post. Please check the URL and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Remove a slide by ID */
  const removeSlide = useCallback((id) => {
    setSlides((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i }))
    );
  }, []);

  /** Reorder slides after drag-and-drop */
  const reorderSlides = useCallback((oldIndex, newIndex) => {
    setSlides((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return updated.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  /** Generate and trigger PDF download */
  const generatePdf = useCallback(async () => {
    if (slides.length === 0) return;

    setPdfLoading(true);
    setError(null);

    try {
      const orderedSlides = slides.map((s, i) => ({
        url: s.url,
        order: i,
      }));
      const blob = await downloadPdf(orderedSlides);

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instapdf_${postInfo?.shortcode || 'download'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to generate PDF. Please try again.';
      setError(message);
    } finally {
      setPdfLoading(false);
    }
  }, [slides, postInfo]);

  /** Reset all state */
  const reset = useCallback(() => {
    setSlides([]);
    setPostInfo(null);
    setError(null);
  }, []);

  return {
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
  };
}
