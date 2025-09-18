import React from 'react';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { blogWriterApi } from '../../services/blogWriterApi';
import { useOutlinePolling } from '../../hooks/usePolling';
import { useClaimFixer } from '../../hooks/useClaimFixer';
import { useMarkdownProcessor } from '../../hooks/useMarkdownProcessor';
import { useBlogWriterState } from '../../hooks/useBlogWriterState';
import { useSuggestions } from './SuggestionsGenerator';
import EnhancedOutlineEditor from './EnhancedOutlineEditor';
import ContinuityBadge from './ContinuityBadge';
import EnhancedTitleSelector from './EnhancedTitleSelector';
import SEOMiniPanel from './SEOMiniPanel';
import ResearchResults from './ResearchResults';
import KeywordInputForm from './KeywordInputForm';
import ResearchAction from './ResearchAction';
import { CustomOutlineForm } from './CustomOutlineForm';
import { ResearchDataActions } from './ResearchDataActions';
import { EnhancedOutlineActions } from './EnhancedOutlineActions';
import HallucinationChecker from './HallucinationChecker';
import Publisher from './Publisher';
import OutlineGenerator from './OutlineGenerator';
import SectionGenerator from './SectionGenerator';
import OutlineRefiner from './OutlineRefiner';
import SEOProcessor from './SEOProcessor';
import BlogWriterLanding from './BlogWriterLanding';
import ResearchProgressModal from './ResearchProgressModal';

export const BlogWriter: React.FC = () => {
  // Use custom hook for all state management
  const {
    research,
    outline,
    titleOptions,
    selectedTitle,
    sections,
    seoAnalysis,
    genMode,
    seoMetadata,
    continuityRefresh,
    outlineTaskId,
    sourceMappingStats,
    groundingInsights,
    optimizationResults,
    researchCoverage,
    researchTitles,
    aiGeneratedTitles,
    setOutline,
    setTitleOptions,
    setSections,
    setSeoAnalysis,
    setGenMode,
    setSeoMetadata,
    setOutlineTaskId,
    handleResearchComplete,
    handleOutlineComplete,
    handleOutlineError,
    handleSectionGenerated,
    handleContinuityRefresh,
    handleTitleSelect,
    handleCustomTitle
  } = useBlogWriterState();

  // Custom hooks for complex functionality
  const { buildFullMarkdown, buildUpdatedMarkdownForClaim, applyClaimFix } = useClaimFixer(
    outline,
    sections,
    setSections
  );
  
  const { convertMarkdownToHTML, getTotalWords, getOutlineStats } = useMarkdownProcessor(
    outline,
    sections
  );

  // Get suggestions
  const suggestions = useSuggestions(research, outline);

  // Outline polling hook
  const outlinePolling = useOutlinePolling({
    onComplete: handleOutlineComplete,
    onError: handleOutlineError
  });




  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Outline Progress Modal */}
      <ResearchProgressModal
        open={Boolean(outlineTaskId && (outlinePolling.isPolling || outlinePolling.currentStatus === 'pending' || outlinePolling.currentStatus === 'running'))}
        title="Outline generation in progress"
        status={outlinePolling.currentStatus}
        messages={outlinePolling.progressMessages}
        error={outlinePolling.error}
        onClose={() => { /* informational while processing */ }}
      />
      {/* Extracted Components */}
      <KeywordInputForm onResearchComplete={handleResearchComplete} />
      <CustomOutlineForm onOutlineCreated={setOutline} />
      <ResearchAction onResearchComplete={handleResearchComplete} />
      <ResearchDataActions 
        research={research} 
        onOutlineCreated={setOutline} 
        onTitleOptionsSet={setTitleOptions} 
      />
      <EnhancedOutlineActions 
        outline={outline} 
        onOutlineUpdated={setOutline} 
      />
      
      {/* New extracted functionality components */}
      <OutlineGenerator
        research={research}
        onTaskStart={(taskId) => setOutlineTaskId(taskId)}
        onPollingStart={(taskId) => outlinePolling.startPolling(taskId)}
      />
      <SectionGenerator
        outline={outline}
        research={research}
        genMode={genMode}
        onSectionGenerated={handleSectionGenerated}
        onContinuityRefresh={handleContinuityRefresh}
      />
      <OutlineRefiner
        outline={outline}
        onOutlineUpdated={setOutline}
      />
      <SEOProcessor
        buildFullMarkdown={buildFullMarkdown}
        seoMetadata={seoMetadata}
        onSEOAnalysis={setSeoAnalysis}
        onSEOMetadata={setSeoMetadata}
      />
      <HallucinationChecker
        buildFullMarkdown={buildFullMarkdown}
        buildUpdatedMarkdownForClaim={buildUpdatedMarkdownForClaim}
        applyClaimFix={applyClaimFix}
      />
      <Publisher
        buildFullMarkdown={buildFullMarkdown}
        convertMarkdownToHTML={convertMarkdownToHTML}
        seoMetadata={seoMetadata}
      />
      
      {!research ? (
        <BlogWriterLanding 
          onStartWriting={() => {
            // This will trigger the copilot to start the research process
            // The user can then interact with the copilot to begin research
          }}
        />
      ) : (
        <>
      <div style={{ padding: 16, borderBottom: '1px solid #eee' }}>
        <h2 style={{ margin: 0 }}>AI Blog Writer</h2>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'auto' }}>
          {research && outline.length === 0 && <ResearchResults research={research} />}
          {outline.length > 0 && (
            <div>
              {/* Enhanced Title Selection */}
              <EnhancedTitleSelector
                  titleOptions={titleOptions}
                  selectedTitle={selectedTitle}
                sections={outline}
                researchTitles={researchTitles}
                aiGeneratedTitles={aiGeneratedTitles}
                onTitleSelect={handleTitleSelect}
                onCustomTitle={handleCustomTitle}
                />
              

              {/* Enhanced Outline Editor */}
              <EnhancedOutlineEditor 
                outline={outline} 
                research={research}
                sourceMappingStats={sourceMappingStats}
                groundingInsights={groundingInsights}
                optimizationResults={optimizationResults}
                researchCoverage={researchCoverage}
                onRefine={(op, id, payload) => blogWriterApi.refineOutline({ outline, operation: op, section_id: id, payload }).then((res: any) => setOutline(res.outline))} 
              />

              {/* Draft/Polished Mode Toggle */}
              <div style={{ margin: '12px 0' }}>
                <label style={{ marginRight: 8 }}>Generation mode:</label>
                <select value={genMode} onChange={(e) => setGenMode(e.target.value as 'draft' | 'polished')}>
                  <option value="draft">Draft (faster, lower cost)</option>
                  <option value="polished">Polished (higher quality)</option>
                </select>
              </div>

              {outline.map(s => (
                <div key={s.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ margin: 0 }}>{s.heading}</h4>
                    {/* Continuity badge */}
                    {sections[s.id] && (
                      <ContinuityBadge sectionId={s.id} refreshToken={continuityRefresh} />
                    )}
                  </div>
                  {sections[s.id] ? (
                    <>
                      <pre style={{ whiteSpace: 'pre-wrap' }}>{sections[s.id]}</pre>
                      <SEOMiniPanel analysis={seoAnalysis} />
                    </>
                  ) : (
                    <div style={{ fontStyle: 'italic', color: '#666' }}>Ask the copilot to generate this section.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      <CopilotSidebar
        labels={{ 
          title: 'ALwrity Co-Pilot', 
          initial: !research 
            ? 'Hi! I can help you research, outline, and draft your blog. Just tell me what topic you want to write about and I\'ll get started!' 
            : 'Great! I can see you have research data. Let me help you create an outline and generate content for your blog.'
        }}
        suggestions={suggestions}
        makeSystemMessage={(context: string, additional?: string) => {
          // Get current state information
          const hasResearch = research !== null;
          const hasOutline = outline.length > 0;
          const researchInfo = hasResearch ? {
            sources: research.sources?.length || 0,
            queries: research.search_queries?.length || 0,
            angles: research.suggested_angles?.length || 0,
            primaryKeywords: research.keyword_analysis?.primary || [],
            searchIntent: research.keyword_analysis?.search_intent || 'informational'
          } : null;

          const toolGuide = `
You are the ALwrity Blog Writing Assistant. You MUST call the appropriate frontend actions (tools) to fulfill user requests.

CURRENT STATE:
${hasResearch && researchInfo ? `
✅ RESEARCH COMPLETED:
- Found ${researchInfo.sources} sources with Google Search grounding
- Generated ${researchInfo.queries} search queries
- Created ${researchInfo.angles} content angles
- Primary keywords: ${researchInfo.primaryKeywords.join(', ')}
- Search intent: ${researchInfo.searchIntent}
` : '❌ No research completed yet'}

${hasOutline ? `✅ OUTLINE GENERATED: ${outline.length} sections created` : '❌ No outline generated yet'}

Available tools:
- getResearchKeywords(prompt?: string) - Get keywords from user for research
- performResearch(formData: string) - Perform research with collected keywords (formData is JSON string with keywords and blogLength)
- researchTopic(keywords: string, industry?: string, target_audience?: string)
- chatWithResearchData(question: string) - Chat with research data to explore insights and get recommendations
- generateOutline()
- createOutlineWithCustomInputs(customInstructions: string) - Create outline with user's custom instructions
- generateSection(sectionId: string)
- generateAllSections()
- refineOutline(operation: add|remove|move|merge|rename, sectionId?: string, payload?: object)
- enhanceSection(sectionId: string, focus?: string) - Enhance a specific section with AI improvements
- optimizeOutline(focus?: string) - Optimize entire outline for better flow, SEO, and engagement
- rebalanceOutline(targetWords?: number) - Rebalance word count distribution across sections
- runSEOAnalyze(keywords?: string)
- generateSEOMetadata(title?: string)
- runHallucinationCheck()
- publishToPlatform(platform: 'wix'|'wordpress', schedule_time?: string)

       CRITICAL BEHAVIOR & USER GUIDANCE:
       - When user wants to research ANY topic, IMMEDIATELY call getResearchKeywords() to get their input
       - When user asks to research something, call getResearchKeywords() first to collect their keywords
       - After getResearchKeywords() completes, IMMEDIATELY call performResearch() with the collected data
       
       USER GUIDANCE STRATEGY:
       - After research completion, ALWAYS guide user toward outline creation as the next step
       - If user wants to explore research data, use chatWithResearchData() but then guide them to outline creation
       - If user has specific outline requirements, use createOutlineWithCustomInputs() with their instructions
       - When user asks for outline, call generateOutline() or createOutlineWithCustomInputs() based on their needs
       - When user asks to generate content, call generateSection or generateAllSections
       
       ENGAGEMENT TACTICS:
       - DO NOT ask for clarification - take action immediately with the information provided
       - Always call the appropriate tool instead of just talking about what you could do
       - Be aware of the current state and reference research results when relevant
       - Guide users through the process: Research → Outline → Content → SEO → Publish
       - Use encouraging language and highlight progress made
       - If user seems lost, remind them of the current stage and suggest the next step
       - When research is complete, emphasize the value of the data found and guide to outline creation
`;
          return [toolGuide, additional].filter(Boolean).join('\n\n');
        }}
      />
    </div>
  );
};

export default BlogWriter;