"""PDF generation service using Pillow."""

import io

import httpx
from PIL import Image

from app.schemas.post import PdfSlide


# A4 dimensions in pixels at 150 DPI
A4_WIDTH = 1240
A4_HEIGHT = 1754


def _fit_image_to_page(img: Image.Image) -> Image.Image:
    """Resize and center an image to fit within an A4 page.
    
    Maintains aspect ratio and places the image centered on a white background.
    """
    # Convert to RGB (required for PDF)
    if img.mode != "RGB":
        img = img.convert("RGB")
    
    # Calculate scale to fit within A4, maintaining aspect ratio
    scale_w = A4_WIDTH / img.width
    scale_h = A4_HEIGHT / img.height
    scale = min(scale_w, scale_h)
    
    new_w = int(img.width * scale)
    new_h = int(img.height * scale)
    
    # Resize with high-quality resampling
    img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Create white A4 background and paste centered
    page = Image.new("RGB", (A4_WIDTH, A4_HEIGHT), (255, 255, 255))
    offset_x = (A4_WIDTH - new_w) // 2
    offset_y = (A4_HEIGHT - new_h) // 2
    page.paste(img_resized, (offset_x, offset_y))
    
    return page


async def generate_pdf(slides: list[PdfSlide]) -> bytes:
    """Download slide images and assemble them into a PDF.
    
    Args:
        slides: Ordered list of slides with image URLs.
        
    Returns:
        PDF file contents as bytes.
    """
    # Sort slides by their order
    sorted_slides = sorted(slides, key=lambda s: s.order)
    
    pages: list[Image.Image] = []
    
    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        },
    ) as client:
        for slide in sorted_slides:
            response = await client.get(slide.url)
            response.raise_for_status()
            
            img = Image.open(io.BytesIO(response.content))
            page = _fit_image_to_page(img)
            pages.append(page)
    
    if not pages:
        raise ValueError("No images to include in PDF")
    
    # Generate PDF into memory buffer
    buffer = io.BytesIO()
    
    if len(pages) == 1:
        pages[0].save(buffer, format="PDF", resolution=150.0)
    else:
        pages[0].save(
            buffer,
            format="PDF",
            resolution=150.0,
            save_all=True,
            append_images=pages[1:],
        )
    
    buffer.seek(0)
    return buffer.read()
