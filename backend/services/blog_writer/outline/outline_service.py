"""
Outline Service - Core outline generation and management functionality.

Handles AI-powered outline generation, refinement, and optimization.
"""

from typing import Dict, Any, List
import asyncio
from loguru import logger

from models.blog_models import (
    BlogOutlineRequest,
    BlogOutlineResponse,
    BlogOutlineRefineRequest,
    BlogOutlineSection,
)

from .outline_generator import OutlineGenerator
from .outline_optimizer import OutlineOptimizer
from .section_enhancer import SectionEnhancer


class OutlineService:
    """Service for generating and managing blog outlines using AI."""
    
    def __init__(self):
        self.outline_generator = OutlineGenerator()
        self.outline_optimizer = OutlineOptimizer()
        self.section_enhancer = SectionEnhancer()
    
    async def generate_outline(self, request: BlogOutlineRequest) -> BlogOutlineResponse:
        """
        Stage 2: Content Planning with AI-generated outline using research results
        Uses Gemini with research data to create comprehensive, SEO-optimized outline
        """
        return await self.outline_generator.generate(request)
    
    async def generate_outline_with_progress(self, request: BlogOutlineRequest, task_id: str) -> BlogOutlineResponse:
        """
        Outline generation method with progress updates for real-time feedback.
        """
        return await self.outline_generator.generate_with_progress(request, task_id)
    
    async def refine_outline(self, request: BlogOutlineRefineRequest) -> BlogOutlineResponse:
        """
        Refine outline with HITL (Human-in-the-Loop) operations
        Supports add, remove, move, merge, rename operations
        """
        outline = request.outline.copy()
        operation = request.operation.lower()
        section_id = request.section_id
        payload = request.payload or {}
        
        try:
            if operation == 'add':
                # Add new section
                new_section = BlogOutlineSection(
                    id=f"s{len(outline) + 1}",
                    heading=payload.get('heading', 'New Section'),
                    subheadings=payload.get('subheadings', []),
                    key_points=payload.get('key_points', []),
                    references=[],
                    target_words=payload.get('target_words', 300)
                )
                outline.append(new_section)
                logger.info(f"Added new section: {new_section.heading}")
                
            elif operation == 'remove' and section_id:
                # Remove section
                outline = [s for s in outline if s.id != section_id]
                logger.info(f"Removed section: {section_id}")
                
            elif operation == 'rename' and section_id:
                # Rename section
                for section in outline:
                    if section.id == section_id:
                        section.heading = payload.get('heading', section.heading)
                        break
                logger.info(f"Renamed section {section_id} to: {payload.get('heading')}")
                
            elif operation == 'move' and section_id:
                # Move section (reorder)
                direction = payload.get('direction', 'down')  # 'up' or 'down'
                current_index = next((i for i, s in enumerate(outline) if s.id == section_id), -1)
                
                if current_index != -1:
                    if direction == 'up' and current_index > 0:
                        outline[current_index], outline[current_index - 1] = outline[current_index - 1], outline[current_index]
                    elif direction == 'down' and current_index < len(outline) - 1:
                        outline[current_index], outline[current_index + 1] = outline[current_index + 1], outline[current_index]
                logger.info(f"Moved section {section_id} {direction}")
                
            elif operation == 'merge' and section_id:
                # Merge with next section
                current_index = next((i for i, s in enumerate(outline) if s.id == section_id), -1)
                if current_index != -1 and current_index < len(outline) - 1:
                    current_section = outline[current_index]
                    next_section = outline[current_index + 1]
                    
                    # Merge sections
                    current_section.heading = f"{current_section.heading} & {next_section.heading}"
                    current_section.subheadings.extend(next_section.subheadings)
                    current_section.key_points.extend(next_section.key_points)
                    current_section.references.extend(next_section.references)
                    current_section.target_words = (current_section.target_words or 0) + (next_section.target_words or 0)
                    
                    # Remove the next section
                    outline.pop(current_index + 1)
                logger.info(f"Merged section {section_id} with next section")
                
            elif operation == 'update' and section_id:
                # Update section details
                for section in outline:
                    if section.id == section_id:
                        if 'heading' in payload:
                            section.heading = payload['heading']
                        if 'subheadings' in payload:
                            section.subheadings = payload['subheadings']
                        if 'key_points' in payload:
                            section.key_points = payload['key_points']
                        if 'target_words' in payload:
                            section.target_words = payload['target_words']
                        break
                logger.info(f"Updated section {section_id}")
            
            # Reassign IDs to maintain order
            for i, section in enumerate(outline):
                section.id = f"s{i+1}"
            
            return BlogOutlineResponse(
                success=True, 
                title_options=["Refined Outline"], 
                outline=outline
            )
            
        except Exception as e:
            logger.error(f"Outline refinement failed: {e}")
            return BlogOutlineResponse(
                success=False, 
                title_options=["Error"], 
                outline=request.outline
            )
    
    async def enhance_section_with_ai(self, section: BlogOutlineSection, focus: str = "general improvement") -> BlogOutlineSection:
        """Enhance a section using AI with research context."""
        return await self.section_enhancer.enhance(section, focus)
    
    async def optimize_outline_with_ai(self, outline: List[BlogOutlineSection], focus: str = "general optimization") -> List[BlogOutlineSection]:
        """Optimize entire outline for better flow, SEO, and engagement."""
        return await self.outline_optimizer.optimize(outline, focus)
    
    def rebalance_word_counts(self, outline: List[BlogOutlineSection], target_words: int) -> List[BlogOutlineSection]:
        """Rebalance word count distribution across sections."""
        return self.outline_optimizer.rebalance_word_counts(outline, target_words)
