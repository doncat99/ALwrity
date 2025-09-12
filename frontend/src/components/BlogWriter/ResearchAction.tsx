import React from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import { blogWriterApi, BlogResearchRequest, BlogResearchResponse } from '../../services/blogWriterApi';

const useCopilotActionTyped = useCopilotAction as any;

interface ResearchActionProps {
  onResearchComplete?: (research: BlogResearchResponse) => void;
}

export const ResearchAction: React.FC<ResearchActionProps> = ({ onResearchComplete }) => {
  useCopilotActionTyped({
    name: 'researchTopic',
    description: 'Research topic with keywords and persona context using Google Search grounding',
    parameters: [
      { name: 'keywords', type: 'string', description: 'Comma-separated keywords or topic description', required: true },
      { name: 'industry', type: 'string', description: 'Industry', required: false },
      { name: 'target_audience', type: 'string', description: 'Target audience', required: false },
      { name: 'blogLength', type: 'string', description: 'Target blog length in words', required: false }
    ],
    handler: async ({ keywords, industry, target_audience, blogLength }: { keywords: string; industry?: string; target_audience?: string; blogLength?: string }) => {
      try {
        // If keywords is a topic description, extract keywords from it
        const keywordList = keywords.includes(',') 
          ? keywords.split(',').map(k => k.trim())
          : keywords.split(' ').filter(k => k.length > 1).slice(0, 5); // Extract up to 5 meaningful words (including 2-char words like "AI")
        
        const payload: BlogResearchRequest = { 
          keywords: keywordList, 
          industry: industry || 'General', 
          target_audience: target_audience || 'General',
          word_count_target: blogLength ? parseInt(blogLength) : 1000
        };
        
        const res = await blogWriterApi.research(payload);
        
        // Check if research failed gracefully
        if (!res.success) {
          return {
            success: false,
            message: `❌ Research failed: ${res.error_message || 'Unknown error occurred'}. Please try again with different keywords or contact support if the problem persists.`,
            error_details: res.error_message
          };
        }
        
        // Notify parent component
        onResearchComplete?.(res);
        
        // Create detailed success message with research insights
        const sourcesCount = res.sources?.length || 0;
        const queriesCount = res.search_queries?.length || 0;
        const anglesCount = res.suggested_angles?.length || 0;
        
        return { 
          success: true, 
          message: `🔍 Research completed for "${keywords}"! Found ${sourcesCount} sources, ${queriesCount} search queries, and ${anglesCount} content angles. The research results are now displayed in the UI. You can explore the sources, keywords, and content angles to understand the topic better before we create an outline.`,
          research_summary: {
            topic: keywords,
            sources: sourcesCount,
            queries: queriesCount,
            angles: anglesCount,
            primary_keywords: res.keyword_analysis?.primary || [],
            search_intent: res.keyword_analysis?.search_intent || 'informational'
          }
        };
      } catch (error) {
        console.error(`Research failed: ${error}`);
        return { 
          success: false, 
          message: `❌ Research failed: ${error}. The AI research system encountered an issue. Please try again with different keywords or contact support if the problem persists.` 
        };
      }
    },
    render: ({ status }: any) => {
      if (status === 'inProgress' || status === 'executing') {
        return (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            margin: '8px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                border: '2px solid #1976d2',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <h4 style={{ margin: 0, color: '#1976d2' }}>🔍 Researching Your Topic</h4>
            </div>
            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
              <p style={{ margin: '0 0 8px 0' }}>• Starting research operation...</p>
              <p style={{ margin: '0 0 8px 0' }}>• Connecting to Google Search grounding...</p>
              <p style={{ margin: '0 0 8px 0' }}>• Analyzing keywords and search intent...</p>
              <p style={{ margin: '0 0 8px 0' }}>• Gathering relevant sources and statistics...</p>
              <p style={{ margin: '0 0 8px 0' }}>• Generating content angles and search queries...</p>
              <p style={{ margin: '0', fontStyle: 'italic', color: '#888' }}>⏳ This may take 1-3 minutes. Please wait...</p>
            </div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        );
      }
      return null;
    }
  });

  return null; // This component only provides the CopilotKit action, no UI
};

export default ResearchAction;
