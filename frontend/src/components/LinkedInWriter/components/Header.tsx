import React from 'react';
import { LinkedInPreferences } from '../utils/storageUtils';
// Temporary fix: use require for image import
const alwrityLogo = require('../../../assets/images/alwrity_logo.png');

interface HeaderProps {
  userPreferences: LinkedInPreferences;
  chatHistory: any[];
  showPreferencesModal: boolean;
  onPreferencesModalChange: (show: boolean) => void;
  onPreferencesChange: (prefs: Partial<LinkedInPreferences>) => void;
  onClearHistory: () => void;
  getHistoryLength: () => number;
}

export const Header: React.FC<HeaderProps> = ({
  userPreferences,
  chatHistory,
  showPreferencesModal,
  onPreferencesModalChange,
  onPreferencesChange,
  onClearHistory,
  getHistoryLength
}) => {
  const handlePreferenceChange = (key: keyof LinkedInPreferences, value: any) => {
    onPreferencesChange({ [key]: value });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a66c2 0%, #0056b3 100%)',
      color: 'white',
      padding: '20px 24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left Section - Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src={alwrityLogo} 
              alt="ALwrity Logo" 
              style={{ 
                height: '36px', 
                width: 'auto',
                filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }} 
            />
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '26px', 
                fontWeight: 700,
                letterSpacing: '-0.5px'
              }}>
                ALwrity LinkedIn Assistant
              </h1>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Preferences Button */}
            <div 
              style={{ 
                position: 'relative',
                cursor: 'pointer'
              }}
              onMouseEnter={() => onPreferencesModalChange(true)}
              onMouseLeave={() => onPreferencesModalChange(false)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{ fontSize: '14px', opacity: 0.9 }}>⚙️</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Preferences</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
              </div>
              
              {/* Preferences Modal */}
              {showPreferencesModal && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  width: '400px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e9ecef',
                  padding: '20px',
                  zIndex: 1000,
                  marginTop: '8px',
                  animation: 'slideIn 0.2s ease-out'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px', fontWeight: 600 }}>
                      Content Preferences & Persona
                    </h4>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
                      <strong>Current Settings:</strong> {userPreferences.tone} tone • {userPreferences.industry || 'Not set'} industry • {chatHistory.length} messages
                    </div>
                  </div>
                  
                  {/* Persona Section */}
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: '16px', 
                    marginBottom: '16px',
                    background: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h5 style={{ margin: 0, color: '#2d3748', fontSize: '14px', fontWeight: '600' }}>
                        Writing Persona
                      </h5>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4a5568' }}>
                          <input
                            type="radio"
                            name="personaEnabled"
                            defaultChecked={true}
                            style={{ margin: 0 }}
                          />
                          On
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4a5568' }}>
                          <input
                            type="radio"
                            name="personaEnabled"
                            style={{ margin: 0 }}
                          />
                          Off
                        </label>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ fontSize: '16px' }}>🎭</span>
                        <span style={{ fontSize: '16px' }}>🎯</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#2d3748', marginBottom: '2px' }}>
                          The Digital Strategist (The Insightful Guide)
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          88% accuracy | Platform: LinkedIn Optimized
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '11px', 
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      Hover over persona for detailed information
                    </div>
                  </div>
                  
                  {/* Preferences Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Tone</div>
                      <select
                        value={userPreferences.tone}
                        onChange={(e) => handlePreferenceChange('tone', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          background: '#f8f9fa',
                          fontSize: '12px'
                        }}
                      >
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Thought Leadership</option>
                        <option>Conversational</option>
                        <option>Technical</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Industry</div>
                      <input
                        value={userPreferences.industry}
                        onChange={(e) => handlePreferenceChange('industry', e.target.value)}
                        placeholder="e.g., Technology"
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          background: '#f8f9fa',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Target Audience</div>
                      <input
                        value={userPreferences.target_audience}
                        onChange={(e) => handlePreferenceChange('target_audience', e.target.value)}
                        placeholder="e.g., Product Managers"
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          background: '#f8f9fa',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Writing Style</div>
                      <select
                        value={userPreferences.writing_style}
                        onChange={(e) => handlePreferenceChange('writing_style', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          background: '#f8f9fa',
                          fontSize: '12px'
                        }}
                      >
                        <option>Clear and Concise</option>
                        <option>Storytelling</option>
                        <option>Analytical</option>
                        <option>Persuasive</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Checkboxes */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
                      <input
                        type="checkbox"
                        checked={userPreferences.hashtag_preferences}
                        onChange={(e) => handlePreferenceChange('hashtag_preferences', e.target.checked)}
                        style={{ margin: 0 }}
                      />
                      Include Hashtags
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
                      <input
                        type="checkbox"
                        checked={userPreferences.cta_preferences}
                        onChange={(e) => handlePreferenceChange('cta_preferences', e.target.checked)}
                        style={{ margin: 0 }}
                      />
                      Include Call-to-Action
                    </label>
                  </div>
                  
                  {/* Current Context Display */}
                  <div style={{ 
                    borderTop: '1px solid #e9ecef', 
                    paddingTop: '12px',
                    fontSize: '11px'
                  }}>
                    <div style={{ marginBottom: '8px', fontWeight: 600, color: '#333' }}>Current Context:</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {userPreferences.tone && (
                        <span style={{
                          background: '#e3f2fd',
                          color: '#1976d2',
                          padding: '2px 6px',
                          borderRadius: 8,
                          fontSize: '10px'
                        }}>
                          {userPreferences.tone}
                        </span>
                      )}
                      {userPreferences.industry && (
                        <span style={{
                          background: '#f3e5f5',
                          color: '#7b1fa2',
                          padding: '2px 6px',
                          borderRadius: 8,
                          fontSize: '10px'
                        }}>
                          {userPreferences.industry}
                        </span>
                      )}
                      {userPreferences.target_audience && (
                        <span style={{
                          background: '#e8f5e8',
                          color: '#388e3c',
                          padding: '2px 6px',
                          borderRadius: 8,
                          fontSize: '10px'
                        }}>
                          {userPreferences.target_audience}
                        </span>
                      )}
                      <span style={{
                        background: '#fff3e0',
                        color: '#f57c00',
                        padding: '2px 6px',
                        borderRadius: 8,
                        fontSize: '10px'
                      }}>
                        {chatHistory.length} messages
                      </span>
                    </div>
                  </div>
                  
                  <style>{`
                    @keyframes slideIn {
                      from { opacity: 0; transform: translateY(-10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>
                </div>
              )}
            </div>
            
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClearHistory}
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
            title={`Clear chat memory (${getHistoryLength()} messages)`}
          >
            Clear Memory ({getHistoryLength()})
          </button>
        </div>
      </div>
    </div>
  );
};
