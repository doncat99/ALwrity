import React, { useState } from 'react';
import { BlogResearchResponse } from '../../services/blogWriterApi';

interface ResearchResultsProps {
  research: BlogResearchResponse;
}

export const ResearchResults: React.FC<ResearchResultsProps> = ({ research }) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'keywords' | 'angles' | 'queries'>('sources');
  const [showSearchWidget, setShowSearchWidget] = useState(false);

  const renderCredibilityScore = (score: number | undefined) => {
    const safeScore = score ?? 0.8; // Default to 0.8 if undefined
    const percentage = Math.round(safeScore * 100);
    const color = safeScore >= 0.8 ? '#4CAF50' : safeScore >= 0.6 ? '#FF9800' : '#F44336';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          width: '60px', 
          height: '8px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <span style={{ fontSize: '12px', color: '#666' }}>{percentage}%</span>
      </div>
    );
  };

  const renderSources = () => (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>🔍 Research Sources ({research.sources.length})</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {research.sources.map((source, index) => (
          <div key={index} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#333' }}>
                {source.title}
              </h4>
              {renderCredibilityScore(source.credibility_score)}
            </div>
            <p style={{ 
              margin: '0 0 8px 0', 
              fontSize: '12px', 
              color: '#666',
              lineHeight: '1.4'
            }}>
              {source.excerpt}
            </p>
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                fontSize: '12px', 
                color: '#1976d2', 
                textDecoration: 'none',
                wordBreak: 'break-all'
              }}
            >
              {source.url}
            </a>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              Published: {source.published_at}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKeywordAnalysis = () => (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>🎯 Keyword Analysis</h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1976d2' }}>Primary Keywords</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {research.keyword_analysis.primary?.map((keyword: string, index: number) => (
              <span key={index} style={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#388e3c' }}>Secondary Keywords</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {research.keyword_analysis.secondary?.map((keyword: string, index: number) => (
              <span key={index} style={{
                backgroundColor: '#e8f5e8',
                color: '#388e3c',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#f57c00' }}>Long-tail Keywords</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {research.keyword_analysis.long_tail?.map((keyword: string, index: number) => (
              <span key={index} style={{
                backgroundColor: '#fff3e0',
                color: '#f57c00',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>Search Intent</h4>
            <span style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {research.keyword_analysis.search_intent || 'Informational'}
            </span>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>Difficulty Score</h4>
            <span style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {research.keyword_analysis.difficulty || 'N/A'}/10
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentAngles = () => (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>💡 Content Angles ({research.suggested_angles.length})</h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {research.suggested_angles.map((angle, index) => (
          <div key={index} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#1976d2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fafafa';
            e.currentTarget.style.borderColor = '#e0e0e0';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                backgroundColor: '#1976d2',
                color: 'white',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {index + 1}
              </span>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#333' }}>
                {angle}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSearchQueries = () => {
    const queries = research.search_queries || [];
    return (
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>🔗 Search Queries ({queries.length})</h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {queries.map((query: string, index: number) => (
            <div key={index} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '12px',
              backgroundColor: '#fafafa',
              fontSize: '13px',
              color: '#333'
            }}>
              <span style={{ color: '#666', marginRight: '8px' }}>{index + 1}.</span>
              {query}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSearchWidget = () => {
    if (!research.search_widget) return null;
    
    return (
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>🎯 Interactive Search Widget</h3>
          <button
            onClick={() => setShowSearchWidget(!showSearchWidget)}
            style={{
              backgroundColor: showSearchWidget ? '#1976d2' : '#f5f5f5',
              color: showSearchWidget ? 'white' : '#333',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {showSearchWidget ? 'Hide Widget' : 'Show Widget'}
          </button>
        </div>
        
        {showSearchWidget && (
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#fafafa',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            <div dangerouslySetInnerHTML={{ __html: research.search_widget }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      border: '1px solid #e0e0e0',
      margin: '16px 0'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{ margin: 0, color: '#333', fontSize: '18px' }}>
          📊 Research Results
        </h2>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
          Google Search grounding analysis completed with {research.sources.length} sources and {research.search_queries?.length || 0} search queries
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        {[
          { id: 'sources', label: 'Sources', icon: '🔍' },
          { id: 'keywords', label: 'Keywords', icon: '🎯' },
          { id: 'angles', label: 'Angles', icon: '💡' },
          { id: 'queries', label: 'Queries', icon: '🔗' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#1976d2' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              borderBottom: activeTab === tab.id ? '2px solid #1976d2' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'sources' && renderSources()}
      {activeTab === 'keywords' && renderKeywordAnalysis()}
      {activeTab === 'angles' && renderContentAngles()}
      {activeTab === 'queries' && renderSearchQueries()}

      {/* Search Widget */}
      {renderSearchWidget()}
    </div>
  );
};

export default ResearchResults;
