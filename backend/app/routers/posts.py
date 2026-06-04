"""API router for Instagram post operations."""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.schemas.post import FetchRequest, FetchResponse, PdfRequest
from app.services.instagram import fetch_post_slides
from app.services.pdf import generate_pdf

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/posts", tags=["posts"])


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
