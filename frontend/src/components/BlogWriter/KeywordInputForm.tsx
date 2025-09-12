import React, { useState, useRef, useEffect } from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import { blogWriterApi, BlogResearchRequest, BlogResearchResponse } from '../../services/blogWriterApi';

const useCopilotActionTyped = useCopilotAction as any;

interface KeywordInputFormProps {
  onKeywordsReceived?: (data: { keywords: string; blogLength: string }) => void;
  onResearchComplete?: (researchData: BlogResearchResponse) => void;
}

export const KeywordInputForm: React.FC<KeywordInputFormProps> = ({ onKeywordsReceived, onResearchComplete }) => {
  // State for button enable/disable only
  const [hasInput, setHasInput] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Focus input when form appears
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, []);


  // Keyword input action with Human-in-the-Loop
  useCopilotActionTyped({
    name: 'getResearchKeywords',
    description: 'Get keywords from user for blog research',
    parameters: [
      { name: 'prompt', type: 'string', description: 'Prompt to show user', required: false }
    ],
    renderAndWaitForResponse: ({ respond, args, status }: { respond?: (value: string) => void; args: { prompt?: string }; status: string }) => {
      if (status === 'complete') {
        return (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#f0f8ff', 
            borderRadius: '8px',
            border: '1px solid #1976d2'
          }}>
            <p style={{ margin: 0, color: '#1976d2', fontWeight: '500' }}>
              ✅ Research keywords received! Starting research...
            </p>
          </div>
        );
      }

      return (
        <form 
          key="keyword-input-form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
          style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            margin: '8px 0'
          }}
        >
          <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>
            🔍 Let's Research Your Blog Topic
          </h4>
          <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
            {args.prompt || 'Please provide the keywords or topic you want to research for your blog:'}
          </p>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Keywords or Topic *
              </label>
              <input
                ref={inputRef}
                type="text"
                defaultValue=""
                onChange={(e) => {
                  const value = e.target.value;
                  // Update state for button enable/disable
                  setHasInput(value.trim().length > 0);
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
                placeholder="e.g., artificial intelligence, machine learning, AI trends"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #1976d2',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
                autoFocus
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Blog Length (words)
              </label>
              <select
                ref={selectRef}
                defaultValue="1000"
                onChange={(e) => {
                  // No state update needed for select
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #1976d2',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="500">500 words (Short blog)</option>
                <option value="1000">1000 words (Medium blog)</option>
                <option value="1500">1500 words (Long blog)</option>
                <option value="2000">2000+ words (Comprehensive guide)</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const kw = (inputRef.current?.value || '').trim();
                const len = (selectRef.current?.value || '1000');
                if (kw) {
                  const formData = {
                    keywords: kw,
                    blogLength: len
                  };
                  
                  // Notify parent component if callback provided
                  onKeywordsReceived?.(formData);
                  
                  // Send to CopilotKit to trigger performResearch action
                  respond?.(JSON.stringify(formData));
                }
              }}
              disabled={!hasInput}
              style={{
                backgroundColor: hasInput ? '#1976d2' : '#f5f5f5',
                color: hasInput ? 'white' : '#999',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                cursor: hasInput ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500',
                flex: 1
              }}
            >
              🚀 Start Research
            </button>
            
            <button
              onClick={() => {
                respond?.('CANCEL');
              }}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      );
    }
  });

  // Research action that actually performs the research
  useCopilotActionTyped({
    name: 'performResearch',
    description: 'Perform research with collected keywords and blog length',
    parameters: [
      { name: 'formData', type: 'string', description: 'JSON string with keywords and blogLength', required: true }
    ],
    handler: async ({ formData }: { formData: string }) => {
      try {
        const data = JSON.parse(formData);
        const { keywords, blogLength } = data;
        
        // If keywords is a topic description, extract keywords from it
        const keywordList = keywords.includes(',') 
          ? keywords.split(',').map((k: string) => k.trim())
          : keywords.split(' ').filter((k: string) => k.length > 2).slice(0, 5);
        
        const payload: BlogResearchRequest = { 
          keywords: keywordList, 
          industry: 'General', 
          target_audience: 'General',
          word_count_target: parseInt(blogLength)
        };
        
        const res = await blogWriterApi.research(payload);
        
        // Notify parent component
        onResearchComplete?.(res);
        
        const sourcesCount = res.sources?.length || 0;
        const queriesCount = res.search_queries?.length || 0;
        const anglesCount = res.suggested_angles?.length || 0;
        
        return { 
          success: true, 
          message: `🔍 Research completed for "${keywords}"! Found ${sourcesCount} sources, ${queriesCount} search queries, and ${anglesCount} content angles. The research results are now displayed in the UI.`,
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
          message: `❌ Research failed: ${error}. Please try again with different keywords.` 
        };
      }
    },
    render: ({ status }: any) => {
      console.log('performResearch render called with status:', status);
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
              <p style={{ margin: '0 0 8px 0' }}>• Connecting to Google Search grounding...</p>
              <p style={{ margin: '0 0 8px 0' }}>• Analyzing keywords and search intent...</p>
              <p style={{ margin: '0 0 8px 0' }}>• Gathering relevant sources and statistics...</p>
              <p style={{ margin: '0' }}>• Generating content angles and search queries...</p>
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

export default KeywordInputForm;
