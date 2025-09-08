import React, { useState } from 'react';

interface WelcomeMessageProps {
  draft: string;
  isGenerating: boolean;
}

interface FeatureCard {
  title: string;
  desc: string;
  icon: string;
  image?: string;
  onClick?: () => void;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  draft,
  isGenerating
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [showAssistiveModal, setShowAssistiveModal] = useState(false);
  const [showFactCheckModal, setShowFactCheckModal] = useState(false);

  if (draft || isGenerating) return null;

  const featureCards: FeatureCard[] = [
    {
      title: 'Check Facts',
      desc: 'Select text and verify claims with web-backed evidence.',
      icon: '🔍',
      image: '/Alwrity-fact-check.png',
      onClick: () => setShowFactCheckModal(true)
    },
    {
      title: 'Google-Grounded Search',
      desc: 'Use native Google grounding to inform content with current sources.',
      icon: '🌐'
    },
    {
      title: 'Persona-Aware Writing',
      desc: 'Generate content tailored to your writing persona and audience.',
      icon: '👤'
    },
    {
      title: 'Assistive Writing',
      desc: 'Inline, contextual suggestions as you type with citations.',
      icon: '✍️',
      image: '/ALwrity-assistive-writing.png'
    },
    {
      title: 'ALwrity Copilot',
      desc: 'Advanced AI assistant for comprehensive content creation and editing.',
      icon: '🤖',
      image: '/Alwrity-copilot1.png',
      onClick: () => setShowCopilotModal(true)
    },
    {
      title: 'Multimodal Generation',
      desc: 'Create content with images, videos, and interactive elements.',
      icon: '🎨'
    }
  ];

  const nextCard = () => {
    setCurrentCardIndex((prev) => {
      const maxIndex = Math.max(0, featureCards.length - 3);
      return prev >= maxIndex ? 0 : prev + 3;
    });
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => {
      const maxIndex = Math.max(0, featureCards.length - 3);
      return prev <= 0 ? maxIndex : prev - 3;
    });
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '24px',
      color: '#666',
      overflowY: 'auto',
      maxHeight: '100vh'
    }}>
      {/* Enhanced Feature Carousel */}
      <div style={{
        marginBottom: 20,
        width: '100%',
        maxWidth: 1200,
        position: 'relative',
        padding: '10px 0'
      }}>
        {/* Carousel Container with Enhanced Styling */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '12px',
          boxShadow: `
            0 20px 60px rgba(0,0,0,0.15),
            0 8px 32px rgba(102, 126, 234, 0.1),
            inset 0 1px 0 rgba(255,255,255,0.2)
          `,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Glow Effect */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
            animation: 'rotate 20s linear infinite',
            zIndex: 0
          }} />

          {/* Compact Navigation - Positioned on the sides */}
          <button
            onClick={prevCard}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              zIndex: 3
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6), 0 3px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            ‹
          </button>

          <button
            onClick={nextCard}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              zIndex: 3
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6), 0 3px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4), 0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            ›
          </button>

          {/* Features Grid - 3 at a time */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            zIndex: 2,
            position: 'relative'
          }}>
            {featureCards.slice(currentCardIndex, currentCardIndex + 3).map((card, index) => (
              <div
                key={currentCardIndex + index}
                onClick={card.onClick}
                title={card.desc}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: `
                    0 12px 40px rgba(0,0,0,0.1),
                    0 4px 20px rgba(102, 126, 234, 0.1),
                    inset 0 1px 0 rgba(255,255,255,0.3)
                  `,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  minHeight: '140px',
                  cursor: card.onClick ? 'pointer' : 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `
                    0 20px 60px rgba(0,0,0,0.15),
                    0 8px 30px rgba(102, 126, 234, 0.2),
                    inset 0 1px 0 rgba(255,255,255,0.4)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `
                    0 12px 40px rgba(0,0,0,0.1),
                    0 4px 20px rgba(102, 126, 234, 0.1),
                    inset 0 1px 0 rgba(255,255,255,0.3)
                  `;
                }}
              >
                {/* Card Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, 
                    rgba(102, 126, 234, ${0.1 + index * 0.05}) 0%, 
                    rgba(118, 75, 162, ${0.1 + index * 0.05}) 100%)`,
                  opacity: 0.4
                }} />
                
                {/* Icon/Image - Much Larger */}
                <div style={{
                  fontSize: '48px',
                  marginBottom: '8px',
                  zIndex: 1,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100px',
                  flex: '1'
                }}>
                  {card.image ? (
                    <img 
                      src={card.image} 
                      alt={card.title}
                      style={{
                        width: '95%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '64px' }}>
                      {card.icon}
                    </div>
                  )}
                </div>
                
                {/* Title Only - Description moved to tooltip */}
                <h4 style={{
                  margin: '0',
                  color: '#1a202c',
                  fontSize: '14px',
                  fontWeight: '700',
                  zIndex: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  padding: '0 4px'
                }}>
                  {card.title}
                </h4>
              </div>
            ))}
          </div>

          {/* Enhanced Dots Indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '12px',
            zIndex: 2,
            position: 'relative'
          }}>
            {Array.from({ length: Math.ceil(featureCards.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCardIndex(index * 3)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: 'none',
                  background: Math.floor(currentCardIndex / 3) === index 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: Math.floor(currentCardIndex / 3) === index 
                    ? '0 3px 12px rgba(102, 126, 234, 0.4)' 
                    : '0 2px 6px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = Math.floor(currentCardIndex / 3) === index 
                    ? '0 3px 12px rgba(102, 126, 234, 0.4)' 
                    : '0 2px 6px rgba(0,0,0,0.1)';
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Icon and Buttons Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Chat/Write with ALwrity Copilot Button with Help Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => {
              // Find and click the Copilot sidebar button
              const copilotButton = document.querySelector('.copilotkit-open-button') ||
                                   document.querySelector('[data-copilot-open]') ||
                                   document.querySelector('button[aria-label*="Open"]') ||
                                   document.querySelector('.alwrity-copilot-sidebar button');
              
              if (copilotButton) {
                (copilotButton as HTMLElement).click();
              } else {
                // Fallback: scroll to bottom right where the button should be
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 28px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4), 0 4px 15px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              minWidth: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5), 0 6px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4), 0 4px 15px rgba(0,0,0,0.1)';
            }}
            title="Open ALwrity Copilot for comprehensive AI assistance with content creation, editing, and research"
          >
            {/* Play Icon */}
            <div style={{
              width: '16px',
              height: '16px',
              background: 'white',
              clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
              marginRight: '8px'
            }} />
            <span>Chat/Write with ALwrity Copilot</span>
          </button>
          
          {/* Help Icon */}
          <button
            onClick={() => setShowCopilotModal(true)}
            style={{
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#667eea',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Learn more about ALwrity Copilot"
          >
            ?
          </button>
        </div>

        {/* ALwrity Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'float 3s ease-in-out infinite'
        }}>
          <img 
            src="/AskAlwrity-min.ico" 
            alt="ALwrity" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.8
            }}
          />
        </div>

        {/* Write with Assistive Research Button */}
        <button 
          onClick={() => setShowAssistiveModal(true)}
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 28px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(240, 147, 251, 0.4), 0 4px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            minWidth: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(240, 147, 251, 0.5), 0 6px 20px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.4), 0 4px 15px rgba(0,0,0,0.1)';
          }}
          title="Enable real-time AI writing assistance with contextual suggestions and research-backed content"
        >
          {/* Play Icon */}
          <div style={{
            width: '16px',
            height: '16px',
            background: 'white',
            clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
            marginRight: '8px'
          }} />
          <span>Write with Assistive Research</span>
        </button>
      </div>

      <p style={{
        margin: '0 0 24px 0',
        color: '#666', 
        fontSize: '16px',
        lineHeight: '1.6',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        Choose your preferred AI assistance mode to get started with content creation.
      </p>

      {/* Copilot Modal */}
      {showCopilotModal && (
      <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', 
        alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCopilotModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#666'
              }}
            >
              ×
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 16px 0', color: '#1a202c', fontSize: '24px', fontWeight: '700' }}>
                ALwrity Copilot
              </h2>
              <p style={{ margin: '0 0 20px 0', color: '#4a5568', fontSize: '16px' }}>
                Your comprehensive AI writing assistant
              </p>
              
              {/* Screenshot Images */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px', 
                marginBottom: '20px' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src="/Alwrity-copilot1.png" 
                    alt="ALwrity Copilot Interface"
                    style={{
                      width: '100%',
                      maxWidth: '250px',
                      height: 'auto',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontSize: '12px', 
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    Main Interface
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src="/Alwrity-copilot2.png" 
                    alt="ALwrity Copilot Features"
                    style={{
                      width: '100%',
                      maxWidth: '250px',
                      height: 'auto',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontSize: '12px', 
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    Advanced Features
                  </p>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                What is ALwrity Copilot?
              </h3>
              <p style={{ color: '#4a5568', lineHeight: '1.6', marginBottom: '20px' }}>
                ALwrity Copilot is an advanced AI assistant that provides comprehensive support for all your content creation needs. 
                It combines multiple AI capabilities to help you create, edit, and optimize content across various formats.
              </p>

              <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                Key Features:
              </h3>
              <ul style={{ color: '#4a5568', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '20px' }}>
                <li>Generate LinkedIn posts, articles, carousels, and video scripts</li>
                <li>Real-time content editing and optimization suggestions</li>
                <li>Research-backed content with source citations</li>
                <li>Persona-aware writing tailored to your audience</li>
                <li>Fact-checking and verification capabilities</li>
                <li>Multi-format content creation (text, images, videos)</li>
              </ul>

              <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                How to Use:
              </h3>
              <p style={{ color: '#4a5568', lineHeight: '1.6', marginBottom: '20px' }}>
                Click the ALwrity Copilot icon in the bottom-right corner of your screen to open the chat interface. 
                You can then ask for help with any content creation task, and the AI will guide you through the process.
              </p>

              <button
                onClick={() => {
                  setShowCopilotModal(false);
                  // Find and click the Copilot sidebar button
                  const copilotButton = document.querySelector('.copilotkit-open-button') ||
                                       document.querySelector('[data-copilot-open]') ||
                                       document.querySelector('button[aria-label*="Open"]') ||
                                       document.querySelector('.alwrity-copilot-sidebar button');
                  
                  if (copilotButton) {
                    (copilotButton as HTMLElement).click();
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Open ALwrity Copilot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assistive Research Modal */}
      {showAssistiveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowAssistiveModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.1)',
                border: 'none',
          borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#666'
              }}
            >
              ×
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔬</div>
              <h2 style={{ margin: '0 0 8px 0', color: '#1a202c', fontSize: '24px', fontWeight: '700' }}>
                Assistive Research Writing
              </h2>
              <p style={{ margin: 0, color: '#4a5568', fontSize: '16px' }}>
                Real-time AI writing assistance with research-backed suggestions
              </p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                What is Assistive Research Writing?
              </h3>
              <p style={{ color: '#4a5568', lineHeight: '1.6', marginBottom: '20px' }}>
                Assistive Research Writing provides real-time, contextual writing suggestions as you type. 
                It combines AI-powered content generation with web research to provide accurate, up-to-date information 
                and suggestions that enhance your writing quality and credibility.
              </p>

              <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                Key Features:
              </h3>
              <ul style={{ color: '#4a5568', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '20px' }}>
                <li>Real-time writing suggestions as you type</li>
                <li>Research-backed content with source citations</li>
                <li>Contextual continuation of your thoughts</li>
                <li>Fact-checking and verification of claims</li>
                <li>Smart gating to prevent excessive API usage</li>
                <li>Seamless integration with your writing flow</li>
              </ul>

              <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                How to Use:
              </h3>
              <p style={{ color: '#4a5568', lineHeight: '1.6', marginBottom: '20px' }}>
                Enable Assistive Writing in the editor settings. Once enabled, start typing your content. 
                After typing 5+ words and pausing for 5 seconds, you'll receive contextual writing suggestions. 
                You can accept, dismiss, or request more suggestions as needed.
              </p>

              <button
                onClick={() => setShowAssistiveModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Got it, let's start writing!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fact Check Modal */}
      {showFactCheckModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowFactCheckModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#666'
              }}
            >
              ×
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h2 style={{ margin: '0 0 8px 0', color: '#1a202c', fontSize: '24px', fontWeight: '700' }}>
                Check Facts Feature
              </h2>
              <p style={{ margin: 0, color: '#4a5568', fontSize: '16px' }}>
                Verify claims with web-backed evidence and AI-powered analysis
              </p>
            </div>

            {/* Images Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <img 
                  src="/Alwrity-fact-check.png" 
                  alt="ALwrity Fact Check Interface"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    marginBottom: '12px'
                  }}
                />
                <h4 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '16px', fontWeight: '600' }}>
                  ALwrity Fact Check Interface
                </h4>
                <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>
                  Select any text in your content to verify claims
                </p>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <img 
                  src="/Fact-check1.png" 
                  alt="Fact Check Results"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    marginBottom: '12px'
                  }}
                />
                <h4 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '16px', fontWeight: '600' }}>
                  Detailed Fact Check Results
                </h4>
                <p style={{ margin: 0, color: '#4a5568', fontSize: '14px' }}>
                  Get comprehensive analysis with source citations
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                How Fact Checking Works:
              </h3>
              <ol style={{ color: '#4a5568', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '20px' }}>
                <li><strong>Select Text:</strong> Highlight any claim or statement in your content</li>
                <li><strong>AI Analysis:</strong> Our AI extracts key claims and identifies fact-checkable statements</li>
                <li><strong>Web Search:</strong> Search for evidence using Exa.ai and Google Search</li>
                <li><strong>Verification:</strong> Compare claims against reliable sources and evidence</li>
                <li><strong>Results:</strong> Get detailed analysis with confidence scores and source citations</li>
              </ol>

              <h3 style={{ color: '#2d3748', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                Key Benefits:
              </h3>
              <ul style={{ color: '#4a5568', lineHeight: '1.6', paddingLeft: '20px', marginBottom: '20px' }}>
                <li>Verify claims before publishing to maintain credibility</li>
                <li>Get source citations for better content transparency</li>
                <li>Identify potentially misleading or false information</li>
                <li>Enhance content quality with evidence-based writing</li>
                <li>Build trust with your audience through verified content</li>
              </ul>

              <button
                onClick={() => setShowFactCheckModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Got it, let's start fact-checking!
              </button>
            </div>
          </div>
        </div>
      )}

        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
          }
        `}</style>
    </div>
  );
};
