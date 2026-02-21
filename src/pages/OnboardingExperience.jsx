import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Rocket,
  DollarSign,
  Users,
  BarChart3,
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Activity,
  Briefcase,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Cpu,
  Building2,
  Globe,
  TrendingDown,
  Timer
} from 'lucide-react';

const OnboardingExperience = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    if (!isTransitioning && currentSlide < 3) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsTransitioning(false);
      }, 250);
    } else if (currentSlide === 3) {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (!isTransitioning && currentSlide > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsTransitioning(false);
      }, 250);
    }
  };

  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 250);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onComplete();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isTransitioning]);

  const features = [
    { icon: DollarSign, title: 'Smart Finance AI', desc: 'Bank sync, AI categorization, and CFO-level insights in seconds', color: '#3b82f6' },
    { icon: Users, title: 'Team Hub', desc: 'Scale your team with smart org charts and performance tracking', color: '#a855f7' },
    { icon: BarChart3, title: 'Deep Analytics', desc: 'Real-time metrics that reveal growth opportunities instantly', color: '#10b981' },
    { icon: Brain, title: 'AI Co-Founder', desc: 'Your 24/7 strategic advisor powered by advanced ML', color: '#f59e0b' },
  ];

  const metrics = [
    { label: 'Burn Rate', value: '$125K', change: '-8%', icon: TrendingDown },
    { label: 'Runway', value: '18 months', change: '+2mo', icon: Timer },
    { label: 'ARR Growth', value: '+147%', change: 'YoY', icon: TrendingUp },
    { label: 'Team Efficiency', value: '94%', change: '+12%', icon: Zap },
  ];

  const aiFeatures = [
    { icon: Target, title: 'Predictive Scenarios', desc: 'Model your future with ML-powered projections', color: '#3b82f6' },
    { icon: Shield, title: 'Risk Detection', desc: 'Spot problems before they impact your runway', color: '#10b981' },
    { icon: Cpu, title: 'Smart Automation', desc: 'AI handles the busy work, you handle the vision', color: '#f59e0b' },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0f172a',
      overflow: 'hidden',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Progress bar */}
      <div style={{
        height: 3,
        background: 'rgba(255,255,255,0.08)',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${((currentSlide + 1) / 4) * 100}%`,
          background: '#3b82f6',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 32px',
        flexShrink: 0,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 500 }}>
          {currentSlide + 1} / 4
        </span>
        <button
          onClick={onComplete}
          style={{
            padding: '8px 20px',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        overflow: 'auto',
      }}>
        <div style={{
          maxWidth: 960,
          width: '100%',
          textAlign: 'center',
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}>

          {/* Slide 1: Welcome */}
          {currentSlide === 0 && (
            <div>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
              }}>
                <Rocket size={36} style={{ color: 'white' }} />
              </div>
              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 800,
                color: 'white',
                margin: '0 0 16px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}>
                Welcome to ScaleUp Horizon
              </h1>
              <p style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                color: 'rgba(255,255,255,0.6)',
                margin: '0 auto 48px',
                maxWidth: 560,
                lineHeight: 1.6,
              }}>
                The AI-powered command center that transforms how startups
                scale, impress investors, and conquer markets.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                textAlign: 'left',
              }}>
                {features.map((f, i) => (
                  <div key={i} style={{
                    padding: 24,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'background 0.2s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${f.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}>
                      <f.icon size={22} style={{ color: f.color }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', margin: '0 0 6px' }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 2: Financial Intelligence */}
          {currentSlide === 1 && (
            <div>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
              }}>
                <DollarSign size={36} style={{ color: 'white' }} />
              </div>
              <h2 style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 800,
                color: 'white',
                margin: '0 0 16px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}>
                Financial Intelligence
              </h2>
              <p style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                color: 'rgba(255,255,255,0.6)',
                margin: '0 auto 40px',
                maxWidth: 520,
                lineHeight: 1.6,
              }}>
                Connect your banks, categorize with AI, and get CFO-level insights
                in seconds — not spreadsheets.
              </p>
              <div style={{
                maxWidth: 640,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <div style={{
                  padding: 24,
                  borderRadius: 16,
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  textAlign: 'left',
                }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Activity size={28} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Real-time Cash Flow</h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Live updates from 12,000+ banks worldwide</p>
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                }}>
                  {[
                    { value: '0.1s', label: 'Transaction Sync', icon: Zap },
                    { value: '99.9%', label: 'AI Accuracy', icon: Brain },
                    { value: '50+', label: 'Bank Integrations', icon: Building2 },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      padding: 20,
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      textAlign: 'center',
                    }}>
                      <stat.icon size={22} style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 10 }} />
                      <div style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 4 }}>{stat.value}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Slide 3: Investor Relations */}
          {currentSlide === 2 && (
            <div>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
              }}>
                <Briefcase size={36} style={{ color: 'white' }} />
              </div>
              <h2 style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 800,
                color: 'white',
                margin: '0 0 16px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}>
                Impress Investors Every Time
              </h2>
              <p style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                color: 'rgba(255,255,255,0.6)',
                margin: '0 auto 40px',
                maxWidth: 520,
                lineHeight: 1.6,
              }}>
                Generate board decks in minutes, share live dashboards,
                and never scramble before a meeting again.
              </p>
              <div style={{
                maxWidth: 560,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                {metrics.map((m, i) => (
                  <div key={i} style={{
                    padding: '16px 24px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <m.icon size={22} style={{ color: 'rgba(255,255,255,0.4)' }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{m.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{m.value}</div>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#34d399',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <ArrowUpRight size={14} />
                      {m.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 4: Get Started */}
          {currentSlide === 3 && (
            <div>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
              }}>
                <Globe size={36} style={{ color: 'white' }} />
              </div>
              <h2 style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: 800,
                color: 'white',
                margin: '0 0 16px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}>
                Ready to Scale?
              </h2>
              <p style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                color: 'rgba(255,255,255,0.6)',
                margin: '0 auto 40px',
                maxWidth: 520,
                lineHeight: 1.6,
              }}>
                Join the future of startup success with AI-powered insights,
                automated workflows, and intelligent growth strategies.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14,
                maxWidth: 720,
                margin: '0 auto 48px',
                textAlign: 'left',
              }}>
                {aiFeatures.map((f, i) => (
                  <div key={i} style={{
                    padding: 22,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${f.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 14,
                    }}>
                      <f.icon size={20} style={{ color: f.color }} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>{f.title}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={onComplete}
                style={{
                  padding: '14px 40px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
              >
                <Rocket size={20} />
                Get Started
              </button>
              <div style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Free to get started</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 32px',
        flexShrink: 0,
      }}>
        {/* Previous button */}
        <div style={{ width: 100 }}>
          {currentSlide > 0 && (
            <button
              onClick={handlePrev}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }}
            >
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
              Back
            </button>
          )}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === currentSlide ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === currentSlide ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Next button */}
        <div style={{ width: 100, display: 'flex', justifyContent: 'flex-end' }}>
          {currentSlide < 3 ? (
            <button
              onClick={handleNext}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <div style={{ width: 100 }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingExperience;
