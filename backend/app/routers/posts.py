"""API router for Instagram post operations."""

import logging
import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from app.schemas.post import FetchRequest, FetchResponse, PdfRequest
from app.services.instagram import fetch_post_slides
from app.services.pdf import generate_pdf

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.get("/proxy-image")
async def proxy_image(url: str = Query(..., description="The direct Instagram CDN image URL to proxy")):
    """Proxy image requests to bypass browser Same-Origin Policy (CORP/CORS) blocks."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            response = await client.get(url, headers=headers, timeout=20.0)
            response.raise_for_status()
            
            # Extract content type
            content_type = response.headers.get("content-type", "image/jpeg")
            
            return Response(
                content=response.content,
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Access-Control-Allow-Origin": "*",  # Explicitly allow CORS for the image proxy
                }
            )
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error proxying image: {e.response.status_code} for URL: {url}")
            raise HTTPException(status_code=e.response.status_code, detail="Failed to fetch image from CDN")
        except Exception as e:
            logger.exception(f"Unexpected error proxying image: {url}")
            raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")



@router.post("/fetch", response_model=FetchResponse)
async def fetch_slides(request: FetchRequest):
    """Fetch all slides from an Instagram post URL.
    
    Accepts a public Instagram post URL and returns metadata
    for all image slides in the post (carousel or single).
    """
    try:
        result = fetch_post_slides(request.url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Failed to fetch post slides")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch post: {str(e)}",
        )


@router.post("/pdf")
async def create_pdf(request: PdfRequest):
    """Generate a PDF from the provided slides.
    
    Downloads each slide image and assembles them into a
    multi-page PDF document (one slide per A4 page).
    """
    if not request.slides:
        raise HTTPException(status_code=400, detail="No slides provided")
    
    try:
        pdf_bytes = await generate_pdf(request.slides)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=instapdf_download.pdf"
            },
        )
    except Exception as e:
        logger.exception("Failed to generate PDF")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF: {str(e)}",
        )
