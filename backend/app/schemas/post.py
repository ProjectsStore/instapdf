"""Pydantic schemas for Instagram post data."""

from pydantic import BaseModel, HttpUrl


class FetchRequest(BaseModel):
    """Request body for fetching post slides."""
    url: str


class Slide(BaseModel):
    """A single slide from an Instagram post."""
    id: str
    url: str
    width: int
    height: int
    is_video: bool
    order: int


class FetchResponse(BaseModel):
    """Response containing all slides from an Instagram post."""
    shortcode: str
    slides: list[Slide]
    caption: str | None = None
    username: str | None = None


class PdfSlide(BaseModel):
    """A slide reference for PDF generation."""
    url: str
    order: int


class PdfRequest(BaseModel):
    """Request body for generating a PDF from slides."""
    slides: list[PdfSlide]
