import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 60000,
});

/**
 * Fetch all slides from an Instagram post URL.
 * @param {string} url - Full Instagram post URL
 * @returns {Promise<{shortcode: string, slides: Array, caption: string|null, username: string|null}>}
 */
export async function fetchPostSlides(url) {
  const response = await api.post('/posts/fetch', { url });
  return response.data;
}

/**
 * Generate and download a PDF from ordered slides.
 * @param {Array<{url: string, order: number}>} slides - Ordered slide list
 * @returns {Promise<Blob>} PDF file blob
 */
export async function downloadPdf(slides) {
  const response = await api.post(
    '/posts/pdf',
    { slides },
    { responseType: 'blob' }
  );
  return response.data;
}
