## AI Blog Writer — Implementation Specification (Copilot-first, Research-led)

### Overview
- **Goal**: Build a SOTA AI blog writer that guides non-technical users end-to-end: research → outline → section generation → quality/SEO → publishing.
- **Approach**: Copilot-first UX using CopilotKit. Reuse LinkedIn assistive writing patterns: Google Search grounding, Exa research, hallucination detector, quality analysis, citations.
- **User Interaction Model**: The user only talks to the Copilot; the editor reflects all state and changes via generative UI and HITL confirmations.

### Key Principles
- **AI-first, HITL**: The assistant leads with intelligent suggestions; the user approves via render-and-wait HITL components where appropriate.
- **Research fidelity**: Google grounding + Exa researcher; hallucination detection with claim verification; pervasive citations.
- **Persona-aware**: Import blog writing persona from DB and apply it across planning/generation/optimizations.
- **SEO-excellent**: Real-time SEO analysis, metadata generation, schema, and image alt handling.
- **Publish-ready**: Smooth handoff to Wix/WordPress; preview and scheduling.

---

## 1) Workflow (4 Stages)

### Stage 1: Research & Strategy (AI Orchestration)
Inputs
- `keywords: string[]`, `industry: string`, `targetAudience: string`, `tone: string`, `wordCountTarget: number`, `userId`
- Persona is fetched from DB and persisted in session

Backend/Services
- Reuse LinkedIn research handler patterns: Google native grounding (Gemini provider), optional Exa research.
- Reuse hallucination detector service and models: `/api/hallucination-detector/*` for claim extraction and verification.

CopilotKit Actions
- `getPersonaFromDB(userId)` → persona constraints and style.
- `analyzeKeywords(keywords, industry, audience)` → search intent, primary/secondary/long-tail, difficulty, volume.
- `researchTopic(topic, depth, sources=['google','exa'])` → aggregated research sources (with credibility + timestamps).
- `analyzeCompetitors(keywords, industry)` → top pages, headings used, gaps/opportunities.

Generative UI (render-only)
- Research Summary card: sources, credibility score, proposed angles.
- Suggested Keywords: chip list; add/remove HITL.

Suggestions (programmatic)
- “Confirm research”, “Refine keywords”, “Add competitor”, “Proceed to outline”.

---

### Stage 2: Content Planning (AI + Human)
Deliverables
- Structured outline (H1/H2/H3), per-section key points, citations to use, target word counts.

CopilotKit Actions
- `generateOutline(research, persona, wordCount)` → full outline with per-section targets and suggested refs.
- `refineOutline(operation, sectionId, payload?)` → add/remove/move/merge sections (HITL diff in UI).
- `attachReferences(sectionId, sourceIds[])` → associate sources to sections.

Generative UI (HITL)
- Outline Editor: draggable sections/subsections, per-section references and target words, persona style hints.

Suggestions
- “Generate [Section 1]”, “Regenerate [Section 2]”, “Attach sources to [Section]”, “Generate All Sections”.

---

### Stage 3: Content Generation (CopilotKit-only, no multi-agent)
Deliverables
- Long-form markdown content with inline citations, persona-aligned tone, and sectioned structure.

CopilotKit Actions
- `generateSection(sectionPlan, keywords, tone, persona, refs[])` → returns markdown + inline cites.
- `generateAllSections(outline)` → sequential section generation with progress render.
- `optimizeSection(content, goals[])` → readability/EEAT/examples/data improvements; UI shows diff preview (HITL confirm).
- `runHallucinationCheck(content)` → uses `/api/hallucination-detector/detect` to flag claims + propose fixes.

Editor/UI Updates
- Per-section markdown tabs; word count; inline citation chips; section mini-SEO score.
- DiffPreview component for any AI edit prior to apply.

Suggestions
- “Add table/figure”, “Insert case study with source”, “Strengthen introduction”, “Tighten conclusion CTA”.

---

### Stage 4: Optimization & Publishing (AI + Human)
SEO Optimization
- `analyzeSEO(content, keywords)` → density, heading structure, links, readability, image alt coverage, overall SEO score.
- `generateSEOMetadata(content, title, keywords)` → title options, meta description, OG/Twitter cards, schema Article/FAQ.
- `applySEOFixes(suggestions[])` → diff preview + HITL apply.

Publishing
- `prepareForPublish(platform: 'wix' | 'wordpress')` → HTML + images + metadata packaging.
- `publishToPlatform(platform, schedule?)` → uses Wix/WordPress clients (ToBeMigrated integrations). Shows URL/status.

Suggestions
- “Run SEO analysis”, “Apply recommended fixes”, “Generate metadata”, “Publish to WordPress”, “Schedule on Wix”.

---

## 2) SEO Tools Integration & Metadata

Existing Services to Wrap
- Meta Description, OpenGraph, Image Alt, On-Page SEO, Technical SEO, Content Strategy (see `backend/services/seo_tools/*` and docs).

Unified Endpoints
- `POST /api/blog/seo/analyze` → { seoScore, density, structure, readability, link suggestions, image alt status, recs }
- `POST /api/blog/seo/metadata` → { titleOptions, metaDescriptionOptions, openGraph, twitterCard, schema: { Article, FAQ?, Breadcrumb, Org/Person } }

Editor SEO Panel
- Live density and distribution, readability (Flesch-Kincaid), heading hierarchy, internal/external link suggestions.
- One-click “Apply Fix” with diff preview.

Schema
- Default Article schema; optional FAQ when Q&A snippets exist; Breadcrumb, Organization/Person as applicable.

---

## 3) Dedicated Blog Editor Design (Copilot-first)

Layout
- Left: Markdown Editor (per-section tabs), word count, persona cues, inline citation chips.
- Right: Live Preview (desktop/mobile), SEO SERP snippet preview, social preview (OG/Twitter).
- Sidebar Panels: Research (sources, claims), SEO (scores/fixes), Media (AI images + alt text), History (versions).

Core Components
- `BlogResearchCard` (render-only): sources, credibility scores, add-to-outline.
- `OutlineEditor` (HITL): drag-drop H2/H3, per-section refs and target words.
- `SectionEditor`: markdown area with persona/tone badges; per-section SEO mini-score.
- `DiffPreview` (HITL): apply/reject AI edits.
- `SEOPanel`: density/structure/readability + apply fix.
- `MediaPanel`: AI images, compression, automatic alt-text.

CopilotKit Integrations
- Suggestions: set programmatically (`useCopilotChatHeadless_c`) or via `CopilotSidebar` props.
- Generative UI: `useCopilotAction({ render })` for research cards, outline editor, diff preview, publish dialog.
- HITL: `renderAndWaitForResponse` for approvals at outline, diff apply, and publish steps.
- References: CopilotKit docs — Frontend Actions, Generative UI, Suggestions, HITL.

Persistence
- Persist outline, per-section content, references, persona snapshot, SEO state, metadata drafts.
- Auto-save every 30s; version history for undo.

---

## 4) Backend APIs

New Blog Endpoints
- `POST /api/blog/research` → inputs: keywords/industry/audience/tone/wordCount, personaId?; returns research bundle.
- `POST /api/blog/outline/generate` → returns structured outline with targets and ref suggestions.
- `POST /api/blog/outline/refine` → returns updated outline (operation-based).
- `POST /api/blog/section/generate` → returns markdown + inline citations.
- `POST /api/blog/section/optimize` → returns optimized content + rationale.
- `POST /api/blog/quality/hallucination-check` → proxies hallucination detector results for blog.
- `POST /api/blog/seo/analyze` → wraps SEO analyzers; returns scores/suggestions.
- `POST /api/blog/seo/metadata` → returns title/meta/OG/Twitter/schema.
- `POST /api/blog/publish` → platform: wix|wordpress, schedule?; returns URL/status.

Reuse
- `/api/hallucination-detector/detect|extract-claims|verify-claim|health` (already implemented).

Models (indicative)
- `BlogResearchRequest`, `BlogResearchResponse`
- `BlogOutline`, `BlogOutlineRefinement`
- `BlogSectionRequest`, `BlogSectionResponse`
- `BlogSEOAnalysisRequest`, `BlogSEOMetadataResponse`

---

## 5) CopilotKit Action Inventory

Research
- `getPersonaFromDB`, `analyzeKeywords`, `researchTopic`, `analyzeCompetitors`

Planning
- `generateOutline`, `refineOutline`, `attachReferences`

Generation
- `generateSection`, `generateAllSections`, `optimizeSection`, `runHallucinationCheck`

SEO
- `analyzeSEO`, `generateSEOMetadata`, `applySEOFixes`

Publishing
- `prepareForPublish`, `publishToPlatform`

UX/Render-only/HITL
- `showResearchCard`, `showOutlineEditor`, `showDiffPreview`, `showSEOPanel`, `showPublishDialog`

---

## 6) Intelligent Suggestions (states)

Before research
- “Load persona”, “Analyze keywords”, “Research topic”

After research
- “Generate outline”, “Add competitor H2s”, “Attach sources”

Outline ready
- “Generate [Section 1]”, “…”, “Generate all sections”

Draft ready
- “Run fact-check”, “Run SEO analysis”, “Generate metadata”

Final
- “Publish to WordPress”, “Schedule on Wix”

---

## 7) Delivery Plan / Milestones

Milestone 1: Research + Outline
- Actions: persona load, analyze keywords, research topic, generate outline, outline editor (HITL)

Milestone 2: Section Generation + Quality
- generateSection/generateAllSections, optimizeSection with diff preview, hallucination check + fixes

Milestone 3: SEO & Metadata
- analyzeSEO panel, generateSEOMetadata (title/meta/OG/Twitter/schema), apply fixes

Milestone 4: Publishing
- prepareForPublish, publishToPlatform (Wix/WordPress), schedule, success URL

Milestone 5: Polish
- Readability aids, version history, performance, accessibility

---

## 8) References
- CopilotKit Quickstart, Frontend Actions, Generative UI, HITL, Suggestions
  - Quickstart: https://docs.copilotkit.ai/direct-to-llm/guides/quickstart
  - Frontend Actions: https://docs.copilotkit.ai/frontend-actions
  - Generative UI: https://docs.copilotkit.ai/direct-to-llm/guides/generative-ui
  - Headless + Suggestions + HITL: https://docs.copilotkit.ai/premium/headless-ui

---

## 9) Notes on Reuse from LinkedIn Writer
- Research handler; Gemini grounded provider; citation manager; quality analyzer.
- Hallucination detector + Exa verification endpoints.
- CopilotKit integration patterns: actions, suggestions, render/HITL, state persistence.


