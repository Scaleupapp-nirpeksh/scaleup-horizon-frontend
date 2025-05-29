import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Sparkles,
  Rocket,
  DollarSign,
  Users,
  BarChart3,
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Globe,
  Activity,
  Briefcase,
  LineChart,
  PieChart,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Cpu,
  ArrowRight,
  Play,
  Pause,
  Star,
  Timer,
  Lock,
  Eye,
  Building2,
  TrendingDown,
  Database,
  Cloud,
  Gift,
  Trophy
} from 'lucide-react';

const OnboardingExperience = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const containerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Enhanced mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced auto-advance with progress tracking
  useEffect(() => {
    if (!isPaused) {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (currentSlide < 3) {
              handleNext();
            }
            return 0;
          }
          return prev + 0.5;
        });
      }, 75);
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentSlide, isPaused]);

  const handleNext = () => {
    if (!isTransitioning && currentSlide < 3) {
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsTransitioning(false);
        if (currentSlide === 2) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }, 300);
    } else if (currentSlide === 3) {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (!isTransitioning && currentSlide > 0) {
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') handleSkip();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(!isPaused);
      }
      if (e.key >= '1' && e.key <= '4') {
        goToSlide(parseInt(e.key) - 1);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isTransitioning, isPaused]);

  // Dynamic gradient backgrounds with enhanced colors
  const backgroundGradients = [
    'radial-gradient(ellipse at top left, #667eea 0%, #764ba2 20%, #f093fb 40%, #4facfe 70%, #00f2fe 100%)',
    'radial-gradient(ellipse at bottom right, #fa709a 0%, #fee140 30%, #fa709a 60%, #f093fb 100%)',
    'radial-gradient(ellipse at center, #4facfe 0%, #00f2fe 30%, #43e97b 60%, #38f9d7 100%)',
    'radial-gradient(ellipse at top right, #fa709a 0%, #fee140 25%, #4facfe 50%, #43e97b 75%, #38f9d7 100%)'
  ];

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: backgroundGradients[currentSlide],
      backgroundSize: '300% 300%',
      animation: 'gradientShift 20s ease infinite',
      overflow: 'hidden',
      zIndex: 50,
      transition: 'background 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, transparent 0%, rgba(0,0,0,0.3) 100%)`,
      pointerEvents: 'none',
      transition: 'background 0.3s ease',
    },
    skipButton: {
      position: 'absolute',
      top: '32px',
      right: '32px',
      padding: '14px 28px',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '9999px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 100,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    progressBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'rgba(255, 255, 255, 0.1)',
      zIndex: 100,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      transition: 'width 0.1s linear',
      width: `${((currentSlide + progress / 100) / 4) * 100}%`,
      boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
      position: 'relative',
    },
    progressGlow: {
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '100px',
      height: '20px',
      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, transparent 70%)',
      filter: 'blur(10px)',
    },
    content: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      position: 'relative',
      zIndex: 10,
    },
    slideContent: {
      maxWidth: '1400px',
      width: '100%',
      textAlign: 'center',
      transform: isTransitioning 
        ? `scale(0.9) translateX(${isTransitioning ? '100px' : '0'})` 
        : `scale(1) translateX(0)`,
      opacity: isTransitioning ? 0 : 1,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      perspective: '1000px',
    },
    title: {
      fontSize: 'clamp(56px, 9vw, 112px)',
      fontWeight: '900',
      color: 'white',
      marginBottom: '32px',
      lineHeight: '0.95',
      textShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      letterSpacing: '-0.03em',
      transform: `translateY(${mousePosition.y * 10}px)`,
      transition: 'transform 0.3s ease',
    },
    subtitle: {
      fontSize: 'clamp(22px, 3.5vw, 32px)',
      color: 'rgba(255, 255, 255, 0.95)',
      marginBottom: '56px',
      maxWidth: '800px',
      margin: '0 auto 56px',
      lineHeight: '1.5',
      textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      fontWeight: '300',
      transform: `translateY(${mousePosition.y * 5}px)`,
      transition: 'transform 0.3s ease',
    },
    icon: {
      width: '140px',
      height: '140px',
      color: 'white',
      margin: '0 auto 48px',
      filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))',
      animation: 'float 4s ease-in-out infinite',
      transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
      transition: 'transform 0.3s ease',
    },
    dotsContainer: {
      position: 'absolute',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '16px',
      zIndex: 100,
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '9999px',
      backdropFilter: 'blur(20px)',
    },
    dot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.3)',
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
    },
    activeDot: {
      width: '40px',
      borderRadius: '6px',
      background: 'white',
      boxShadow: '0 0 30px rgba(255, 255, 255, 0.8)',
      border: '2px solid rgba(255, 255, 255, 0.5)',
    },
    nextButton: {
      position: 'absolute',
      bottom: '120px',
      right: '48px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '20px 40px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
      color: '#1a1a1a',
      border: 'none',
      borderRadius: '9999px',
      fontSize: '17px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
      zIndex: 100,
      overflow: 'hidden',
      position: 'relative',
    },
    nextButtonHover: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      opacity: 0,
      transition: 'opacity 0.4s ease',
    },
    pauseButton: {
      position: 'absolute',
      bottom: '40px',
      right: '200px',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '28px',
      marginTop: '72px',
      perspective: '1000px',
    },
    featureCard: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      backdropFilter: 'blur(20px)',
      padding: '40px',
      borderRadius: '32px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      transformStyle: 'preserve-3d',
    },
    featureIcon: {
      width: '64px',
      height: '64px',
      marginBottom: '24px',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    featureTitle: {
      fontSize: '24px',
      fontWeight: '800',
      color: 'white',
      marginBottom: '16px',
      transition: 'all 0.3s ease',
    },
    featureDesc: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: '17px',
      lineHeight: '1.6',
      transition: 'all 0.3s ease',
    },
    glowEffect: {
      position: 'absolute',
      top: '-100%',
      left: '-100%',
      width: '300%',
      height: '300%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)',
      opacity: 0,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none',
    },
    floatingElements: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
    },
    floatingIcon: {
      position: 'absolute',
      opacity: 0.1,
      animation: 'floatDiagonal 20s linear infinite',
      color: 'white',
    },
    metricCard: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
      backdropFilter: 'blur(30px)',
      padding: '32px',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    metricValue: {
      fontSize: '40px',
      fontWeight: '800',
      color: 'white',
      letterSpacing: '-0.02em',
    },
    metricLabel: {
      fontSize: '18px',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '8px',
      fontWeight: '500',
    },
    badge: {
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '9999px',
      fontSize: '15px',
      fontWeight: '700',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backdropFilter: 'blur(10px)',
    },
    ctaContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32px',
      marginTop: '64px',
    },
    primaryCta: {
      padding: '24px 64px',
      background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '9999px',
      fontSize: '20px',
      fontWeight: '800',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      position: 'relative',
      overflow: 'hidden',
    },
    secondaryCta: {
      padding: '16px 40px',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '9999px',
      fontSize: '17px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(20px)',
    },
    confetti: {
      position: 'absolute',
      width: '10px',
      height: '10px',
      background: 'white',
      animation: 'confettiFall 3s linear forwards',
    },
    pulseRing: {
      position: 'absolute',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      animation: 'pulseRing 2s ease-out infinite',
    },
  };

  // Enhanced CSS Keyframes
  const styleSheet = `
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-30px) rotate(5deg); }
    }
    @keyframes floatDiagonal {
      0% { 
        transform: translate(-100px, 100vh) rotate(0deg);
        opacity: 0;
      }
      10% { opacity: 0.1; }
      90% { opacity: 0.1; }
      100% { 
        transform: translate(calc(100vw + 100px), -100px) rotate(360deg);
        opacity: 0;
      }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-100px) rotateY(-10deg); opacity: 0; }
      to { transform: translateX(0) rotateY(0); opacity: 1; }
    }
    @keyframes slideInRight {
      from { transform: translateX(100px) rotateY(10deg); opacity: 0; }
      to { transform: translateX(0) rotateY(0); opacity: 1; }
    }
    @keyframes slideInUp {
      from { transform: translateY(50px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    @keyframes confettiFall {
      0% { 
        transform: translateY(-100px) rotate(0deg);
        opacity: 1;
      }
      100% { 
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
    @keyframes pulseRing {
      0% {
        transform: scale(0.5);
        opacity: 1;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
      50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.6); }
    }
  `;

  // Add styles to document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = styleSheet;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Enhanced floating elements
  const floatingIcons = [
    DollarSign, Brain, BarChart3, Target, TrendingUp, Shield, Zap, Globe,
    Rocket, Users, Activity, Briefcase, LineChart, PieChart, Calendar,
    Cpu, Lock, Eye, Cloud, Database, Gift, Trophy, Star
  ];

  const floatingElements = Array.from({ length: 15 }, (_, i) => {
    const Icon = floatingIcons[i % floatingIcons.length];
    return (
      <Icon
        key={i}
        size={Math.random() * 30 + 20}
        style={{
          ...styles.floatingIcon,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 20}s`,
          animationDuration: `${20 + Math.random() * 10}s`,
        }}
      />
    );
  });

  // Confetti elements
  const confettiElements = showConfetti ? Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      style={{
        ...styles.confetti,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        background: ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
      }}
    />
  )) : null;

  const features = [
    { 
      icon: DollarSign, 
      title: 'Smart Finance AI', 
      desc: 'Bank sync, AI categorization, and CFO-level insights in seconds', 
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    { 
      icon: Users, 
      title: 'Team Hub', 
      desc: 'Scale your team with smart org charts and performance tracking', 
      color: '#a855f7',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
    },
    { 
      icon: BarChart3, 
      title: 'Deep Analytics', 
      desc: 'Real-time metrics that reveal growth opportunities instantly', 
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    { 
      icon: Brain, 
      title: 'AI Co-Founder', 
      desc: 'Your 24/7 strategic advisor powered by advanced ML', 
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
  ];

  const metrics = [
    { label: 'Burn Rate', value: '$125K', change: '-8%', positive: true, icon: TrendingDown },
    { label: 'Runway', value: '18 months', change: '+2mo', positive: true, icon: Timer },
    { label: 'ARR Growth', value: '+147%', change: 'YoY', positive: true, icon: TrendingUp },
    { label: 'Team Efficiency', value: '94%', change: '+12%', positive: true, icon: Zap }
  ];

  const aiFeatures = [
    {
      icon: Target,
      title: 'Predictive Scenarios',
      desc: 'Model your future with ML-powered projections',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)'
    },
    {
      icon: Shield,
      title: 'Risk Detection',
      desc: 'Spot problems before they impact your runway',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
    },
    {
      icon: Cpu,
      title: 'Smart Automation',
      desc: 'AI handles the busy work, you handle the vision',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)'
    }
  ];

  return (
    <div ref={containerRef} style={styles.container}>
      {/* Dynamic background overlay */}
      <div style={styles.overlay} />
      
      {/* Floating elements layer */}
      <div style={styles.floatingElements}>
        {floatingElements}
      </div>

      {/* Confetti */}
      {confettiElements}

      {/* Skip button with enhanced hover */}
      <button
        onClick={handleSkip}
        style={styles.skipButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        }}
      >
        Skip Intro
        <Sparkles size={18} style={{ animation: 'pulse 2s ease-in-out infinite' }} />
      </button>

      {/* Enhanced progress bar */}
      <div style={styles.progressBar}>
        <div style={styles.progressFill}>
          <div style={styles.progressGlow} />
        </div>
      </div>

      {/* Pause/Play button */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        style={styles.pauseButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isPaused ? <Play size={24} /> : <Pause size={24} />}
      </button>

      {/* Main content */}
      <div style={styles.content}>
        <div style={styles.slideContent}>
          {/* Slide 1: Welcome with interactive features */}
          {currentSlide === 0 && (
            <div style={{ animation: 'slideInUp 1s ease-out' }}>
              <Rocket style={styles.icon} />
              <h1 style={styles.title}>
                Welcome to<br />
                <span style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>
                  ScaleUp Horizon
                </span>
              </h1>
              <p style={styles.subtitle}>
                The AI-powered command center that transforms how startups 
                scale, impress investors, and conquer markets
              </p>
              <div style={styles.featureGrid}>
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    style={{
                      ...styles.featureCard,
                      animation: `slideInUp 1s ease-out ${index * 0.1}s`,
                      animationFillMode: 'backwards',
                      transform: hoveredFeature === index ? 'translateY(-15px) rotateX(-5deg) scale(1.05)' : 'translateY(0) rotateX(0) scale(1)',
                      boxShadow: hoveredFeature === index ? '0 30px 60px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className="glow" style={{
                      ...styles.glowEffect,
                      opacity: hoveredFeature === index ? 1 : 0,
                      transform: hoveredFeature === index ? 'scale(1)' : 'scale(0.8)',
                    }} />
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: feature.gradient,
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '24px',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: hoveredFeature === index ? 'rotate(-10deg) scale(1.1)' : 'rotate(0) scale(1)',
                      boxShadow: hoveredFeature === index ? '0 20px 40px rgba(0, 0, 0, 0.2)' : '0 10px 20px rgba(0, 0, 0, 0.1)',
                    }}>
                      <feature.icon style={{...styles.featureIcon, width: '40px', height: '40px', marginBottom: 0}} />
                    </div>
                    <h3 style={styles.featureTitle}>{feature.title}</h3>
                    <p style={styles.featureDesc}>{feature.desc}</p>
                    {hoveredFeature === index && (
                      <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        color: 'white',
                        opacity: 0.8,
                        animation: 'bounce 1s ease-in-out infinite',
                      }}>
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 2: Financial Intelligence with interactive metrics */}
          {currentSlide === 1 && (
            <div style={{ animation: 'slideInUp 1s ease-out' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <DollarSign style={{...styles.icon, animation: 'pulse 2s ease-in-out infinite'}} />
                <div style={{
                  ...styles.pulseRing,
                  width: '140px',
                  height: '140px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }} />
              </div>
              <h2 style={styles.title}>
                Financial Intelligence<br />
                <span style={{
                  fontSize: '0.8em',
                  opacity: 0.9,
                  fontWeight: '300',
                }}>Like Never Before</span>
              </h2>
              <p style={styles.subtitle}>
                Connect your banks, categorize with AI, and get CFO-level insights 
                in seconds, not spreadsheets
              </p>
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{
                  ...styles.featureCard,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  marginBottom: '32px',
                  animation: 'slideInLeft 1s ease-out',
                  padding: '48px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'glow 2s ease-in-out infinite',
                    }}>
                      <Activity style={{ width: '56px', height: '56px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h3 style={{ fontSize: '32px', color: 'white', marginBottom: '12px', fontWeight: '800' }}>
                        Real-time Cash Flow
                      </h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px' }}>
                        Watch your money move with live updates from 12,000+ banks worldwide
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '20px',
                }}>
                  {[
                    { value: '0.1s', label: 'Transaction Sync', icon: Zap },
                    { value: '99.9%', label: 'AI Accuracy', icon: Brain },
                    { value: '50+', label: 'Bank Integrations', icon: Building2 }
                  ].map((stat, index) => (
                    <div 
                      key={index}
                      style={{
                        ...styles.featureCard,
                        animation: `slideInUp 1s ease-out ${index * 0.1 + 0.3}s`,
                        animationFillMode: 'backwards',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)';
                      }}
                    >
                      <stat.icon size={40} style={{ color: 'white', marginBottom: '16px' }} />
                      <div style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Slide 3: Investor Relations with live metrics */}
          {currentSlide === 2 && (
            <div style={{ animation: 'slideInUp 1s ease-out' }}>
              <Briefcase style={styles.icon} />
              <h2 style={styles.title}>
                Impress Investors<br />
                <span style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>Every Single Time</span>
              </h2>
              <p style={styles.subtitle}>
                Generate board decks in minutes, share live dashboards, 
                and never scramble before a meeting again
              </p>
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                {metrics.map((metric, index) => (
                  <div 
                    key={index}
                    style={{
                      ...styles.metricCard,
                      animation: `slideInRight 1s ease-out ${index * 0.1}s`,
                      animationFillMode: 'backwards',
                      background: selectedMetric === index 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      transform: selectedMetric === index ? 'scale(1.02)' : 'scale(1)',
                    }}
                    onClick={() => setSelectedMetric(selectedMetric === index ? null : index)}
                    onMouseEnter={(e) => {
                      if (selectedMetric !== index) {
                        e.currentTarget.style.transform = 'translateX(-10px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMetric !== index) {
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <metric.icon size={40} style={{ color: 'white', opacity: 0.8 }} />
                      <div>
                        <div style={styles.metricLabel}>{metric.label}</div>
                        <div style={styles.metricValue}>{metric.value}</div>
                      </div>
                    </div>
                    <div style={{
                      ...styles.badge,
                      background: metric.positive 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%)' 
                        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)',
                      color: 'white',
                      border: `2px solid ${metric.positive ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
                    }}>
                      <ArrowUpRight size={18} style={{ display: 'inline', marginRight: '4px' }} />
                      {metric.change}
                    </div>
                  </div>
                ))}
                <button style={{
                  ...styles.primaryCta,
                  width: '100%',
                  marginTop: '40px',
                  fontSize: '18px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 30px 80px rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.4)';
                }}>
                  <Calendar size={24} />
                  Schedule Live Investor Update
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-100%',
                    width: '300%',
                    height: '200%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    transform: 'rotate(45deg)',
                    animation: 'shimmer 3s ease-in-out infinite',
                  }} />
                </button>
              </div>
            </div>
          )}

          {/* Slide 4: Get Started - Final CTA */}
          {currentSlide === 3 && (
            <div style={{ animation: 'slideInUp 1s ease-out' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Globe style={{...styles.icon, animation: 'pulse 2s ease-in-out infinite'}} />
                {[1, 2, 3].map((ring) => (
                  <div
                    key={ring}
                    style={{
                      ...styles.pulseRing,
                      width: `${140 + ring * 60}px`,
                      height: `${140 + ring * 60}px`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      animationDelay: `${ring * 0.5}s`,
                    }}
                  />
                ))}
              </div>
              <h2 style={styles.title}>
                Ready to Scale<br />
                <span style={{
                  fontSize: '0.9em',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>Like Never Before?</span>
              </h2>
              <p style={styles.subtitle}>
                Join the future of startup success with AI-powered insights, 
                automated workflows, and intelligent growth strategies
              </p>
              <div style={{ 
                maxWidth: '1000px', 
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '48px'
              }}>
                {aiFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    style={{
                      ...styles.featureCard,
                      background: feature.gradient,
                      animation: `slideInUp 1s ease-out ${index * 0.15}s`,
                      animationFillMode: 'backwards',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-15px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <feature.icon style={{ ...styles.featureIcon, width: '56px', height: '56px' }} />
                    <h3 style={{ ...styles.featureTitle, fontSize: '22px' }}>{feature.title}</h3>
                    <p style={{ ...styles.featureDesc, fontSize: '16px' }}>{feature.desc}</p>
                  </div>
                ))}
              </div>
              <div style={styles.ctaContainer}>
                <button 
                  style={styles.primaryCta}
                  onClick={onComplete}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 30px 80px rgba(16, 185, 129, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                  
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <CheckCircle2 size={24} style={{ color: '#10b981' }} />
                    
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced navigation dots */}
      <div style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              ...styles.dot,
              ...(index === currentSlide ? styles.activeDot : {}),
              position: 'relative',
            }}
            aria-label={`Go to slide ${index + 1}`}
            onMouseEnter={(e) => {
              if (index !== currentSlide) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.transform = 'scale(1.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (index !== currentSlide) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {index === currentSlide && (
              <div style={{
                position: 'absolute',
                inset: '-4px',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: index === currentSlide ? '8px' : '50%',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Enhanced navigation buttons */}
      {currentSlide > 0 && (
        <button
          onClick={handlePrev}
          style={{
            ...styles.nextButton,
            left: '48px',
            right: 'auto',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) translateX(-5px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateX(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          Previous
        </button>
      )}
      
      {currentSlide < 3 && (
        <button
          onClick={handleNext}
          style={styles.nextButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) translateX(5px)';
            e.currentTarget.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.3)';
            e.currentTarget.querySelector('.hover-bg').style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateX(0)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.2)';
            e.currentTarget.querySelector('.hover-bg').style.opacity = '0';
          }}
        >
          <div className="hover-bg" style={styles.nextButtonHover} />
          <span style={{ position: 'relative', zIndex: 1 }}>Continue</span>
          <ChevronRight size={20} style={{ position: 'relative', zIndex: 1 }} />
        </button>
      )}

      {/* Keyboard shortcuts hint */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px',
        display: 'flex',
        gap: '20px',
        zIndex: 50,
      }}>
        <span>← → Navigate</span>
        <span>Space Pause</span>
        <span>ESC Skip</span>
      </div>
    </div>
  );
};

export default OnboardingExperience;