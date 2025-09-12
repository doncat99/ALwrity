from fastapi import APIRouter, HTTPException
from typing import Any, Dict

from models.blog_models import (
    BlogResearchRequest,
    BlogResearchResponse,
    BlogOutlineRequest,
    BlogOutlineResponse,
    BlogOutlineRefineRequest,
    BlogSectionRequest,
    BlogSectionResponse,
    BlogOptimizeRequest,
    BlogOptimizeResponse,
    BlogSEOAnalyzeRequest,
    BlogSEOAnalyzeResponse,
    BlogSEOMetadataRequest,
    BlogSEOMetadataResponse,
    BlogPublishRequest,
    BlogPublishResponse,
    HallucinationCheckRequest,
    HallucinationCheckResponse,
)
from services.blog_writer.blog_service import BlogWriterService


router = APIRouter(prefix="/api/blog", tags=["AI Blog Writer"])

service = BlogWriterService()


@router.get("/health")
async def health() -> Dict[str, Any]:
    return {"status": "ok", "service": "ai_blog_writer"}


@router.post("/research", response_model=BlogResearchResponse)
async def research(request: BlogResearchRequest) -> BlogResearchResponse:
    try:
        return await service.research(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/outline/generate", response_model=BlogOutlineResponse)
async def generate_outline(request: BlogOutlineRequest) -> BlogOutlineResponse:
    try:
        return await service.generate_outline(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/outline/refine", response_model=BlogOutlineResponse)
async def refine_outline(request: BlogOutlineRefineRequest) -> BlogOutlineResponse:
    try:
        return await service.refine_outline(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/section/generate", response_model=BlogSectionResponse)
async def generate_section(request: BlogSectionRequest) -> BlogSectionResponse:
    try:
        return await service.generate_section(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/section/optimize", response_model=BlogOptimizeResponse)
async def optimize_section(request: BlogOptimizeRequest) -> BlogOptimizeResponse:
    try:
        return await service.optimize_section(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quality/hallucination-check", response_model=HallucinationCheckResponse)
async def hallucination_check(request: HallucinationCheckRequest) -> HallucinationCheckResponse:
    try:
        return await service.hallucination_check(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/seo/analyze", response_model=BlogSEOAnalyzeResponse)
async def seo_analyze(request: BlogSEOAnalyzeRequest) -> BlogSEOAnalyzeResponse:
    try:
        return await service.seo_analyze(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/seo/metadata", response_model=BlogSEOMetadataResponse)
async def seo_metadata(request: BlogSEOMetadataRequest) -> BlogSEOMetadataResponse:
    try:
        return await service.seo_metadata(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/publish", response_model=BlogPublishResponse)
async def publish(request: BlogPublishRequest) -> BlogPublishResponse:
    try:
        return await service.publish(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


