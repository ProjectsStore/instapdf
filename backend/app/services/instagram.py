"""Instagram post fetching service using instaloader."""

import re
import uuid

import instaloader

from app.schemas.post import FetchResponse, Slide


def _extract_shortcode(url: str) -> str:
    """Extract the shortcode from an Instagram post URL.
    
    Supports formats:
    - https://www.instagram.com/p/ABC123/
    - https://instagram.com/p/ABC123/
    - https://www.instagram.com/reel/ABC123/
    """
    pattern = r"instagram\.com/(?:p|reel)/([A-Za-z0-9_-]+)"
    match = re.search(pattern, url)
    if not match:
        raise ValueError(
            "Invalid Instagram URL. Expected format: "
            "https://www.instagram.com/p/SHORTCODE/"
        )
    return match.group(1)


def fetch_post_slides(url: str) -> FetchResponse:
    """Fetch all image slides from an Instagram post.
    
    Args:
        url: Full Instagram post URL.
        
    Returns:
        FetchResponse with slide metadata and image URLs.
        
    Raises:
        ValueError: If URL is invalid.
        Exception: If post cannot be fetched (private, deleted, rate-limited).
    """
    shortcode = _extract_shortcode(url)
    
    loader = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
    )
    
    post = instaloader.Post.from_shortcode(loader.context, shortcode)
    
    slides: list[Slide] = []
    
    if post.typename == "GraphSidecar":
        # Carousel post — multiple slides
        for index, node in enumerate(post.get_sidecar_nodes()):
            slides.append(
                Slide(
                    id=str(uuid.uuid4()),
                    url=node.display_url,
                    width=node.dimensions[0] if hasattr(node, "dimensions") else 1080,
                    height=node.dimensions[1] if hasattr(node, "dimensions") else 1080,
                    is_video=node.is_video,
                    order=index,
                )
            )
    else:
        # Single image/video post
        slides.append(
            Slide(
                id=str(uuid.uuid4()),
                url=post.url,
                width=post.dimensions[0] if hasattr(post, "dimensions") else 1080,
                height=post.dimensions[1] if hasattr(post, "dimensions") else 1080,
                is_video=post.is_video,
                order=0,
            )
        )
    
    return FetchResponse(
        shortcode=shortcode,
        slides=slides,
        caption=post.caption,
        username=post.owner_username,
    )
