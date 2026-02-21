// src/pages/InvestorPresentationPage.jsx
// Enhanced version with backend data only, better alignment, and larger graphs

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Paper, Card, CardContent, Stack,
  Button, IconButton, Avatar, Chip, Tooltip, LinearProgress,
  Alert, useTheme, alpha, CircularProgress
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { PieChart, Pie, Cell, ResponsiveContainer, Bar, XAxis, YAxis,
         CartesianGrid, Tooltip as RechartsTooltip, ComposedChart } from 'recharts';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// Import icons
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import GroupsIcon from '@mui/icons-material/Groups';
import FlagIcon from '@mui/icons-material/Flag';
import InsightsIcon from '@mui/icons-material/Insights';
import HandshakeIcon from '@mui/icons-material/Handshake';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DiamondIcon from '@mui/icons-material/Diamond';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FlareIcon from '@mui/icons-material/Flare';

// Import API functions
import {
  getInvestorMeetingById,
  prepareInvestorMeeting
} from '../services/api';

// Enhanced animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  33% { transform: translateY(-20px) scale(1.05); }
  66% { transform: translateY(10px) scale(0.95); }
`;

const pulse = keyframes`
  0%, 100% { 
    opacity: 1; 
    transform: scale(1); 
  }
  50% { 
    opacity: 0.8; 
    transform: scale(1.05); 
  }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(79, 172, 254, 0.6),
                0 0 40px rgba(79, 172, 254, 0.4),
                0 0 60px rgba(79, 172, 254, 0.2);
  }
  50% { 
    box-shadow: 0 0 30px rgba(79, 172, 254, 0.8),
                0 0 60px rgba(79, 172, 254, 0.6),
                0 0 90px rgba(79, 172, 254, 0.4);
  }
`;

const sparkle = keyframes`
  0% { 
    transform: scale(0) rotate(0deg); 
    opacity: 0; 
  }
  50% { 
    transform: scale(1) rotate(180deg); 
    opacity: 1; 
  }
  100% { 
    transform: scale(0) rotate(360deg); 
    opacity: 0; 
  }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const morphing = keyframes`
  0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
  25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
  50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
  75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(40px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

// Styled Components
const PresentationContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  background: '#0a0a0a',
  color: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 80%, ${alpha('#4facfe', 0.05)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, ${alpha('#00f2fe', 0.05)} 0%, transparent 50%)`,
    animation: `${morphing} 40s ease-in-out infinite`,
    pointerEvents: 'none',
  }
}));

const SlideContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: theme.spacing(6),
  overflow: 'hidden',
  textAlign: 'center',
}));

const MagicalCard = styled(Card)(({ theme, glowColor = '#4facfe' }) => ({
  position: 'relative',
  background: `linear-gradient(135deg, ${alpha('#1a1a1a', 0.95)} 0%, ${alpha('#0f0f0f', 0.95)} 100%)`,
  backdropFilter: 'blur(20px) saturate(180%)',
  border: `1px solid ${alpha(glowColor, 0.3)}`,
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: -100,
    right: 0,
    bottom: 0,
    background: `linear-gradient(90deg, transparent 30%, ${alpha(glowColor, 0.1)} 50%, transparent 70%)`,
    animation: `${shimmer} 5s infinite`,
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(glowColor, 0.3)}`,
    border: `1px solid ${alpha(glowColor, 0.5)}`,
  }
}));

const GlowingMetricCard = styled(Box)(({ theme, color }) => ({
  position: 'relative',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, 
    ${alpha('#0a0a0a', 0.9)} 0%, 
    ${alpha('#1a1a1a', 0.9)} 100%)`,
  border: `2px solid ${alpha(theme.palette[color].main, 0.5)}`,
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  textAlign: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: theme.palette[color].main,
    borderRadius: '50%',
    filter: 'blur(60px)',
    opacity: 0.1,
    animation: `${float} 6s ease-in-out infinite`,
  },
  '&:hover': {
    transform: 'translateY(-5px) scale(1.03)',
    boxShadow: `0 15px 30px ${alpha(theme.palette[color].main, 0.3)}`,
    border: `2px solid ${theme.palette[color].main}`,
  }
}));

const NavigationDots = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2, 3),
  background: `linear-gradient(135deg, ${alpha('#0a0a0a', 0.95)} 0%, ${alpha('#1a1a1a', 0.95)} 100%)`,
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(4),
  border: `1px solid ${alpha('#4facfe', 0.3)}`,
  boxShadow: `0 10px 30px ${alpha('#000', 0.5)}`,
  zIndex: 1000,
}));

const Dot = styled(Box)(({ theme, active }) => ({
  width: active ? 32 : 10,
  height: 10,
  borderRadius: 20,
  background: active 
    ? 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
    : 'rgba(255, 255, 255, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&::after': active ? {
    content: '""',
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    border: `2px solid ${alpha('#4facfe', 0.5)}`,
    borderRadius: 20,
    animation: `${pulse} 2s ease-in-out infinite`,
  } : {},
  '&:hover': {
    transform: 'scale(1.3)',
    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
  }
}));

// Particle configuration
const particlesConfig = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 1200
      }
    },
    color: {
      value: ["#4facfe", "#00f2fe"]
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.2,
      random: true,
      anim: {
        enable: true,
        speed: 0.5,
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 2,
      random: true,
      anim: {
        enable: false
      }
    },
    line_linked: {
      enable: false
    },
    move: {
      enable: true,
      speed: 0.5,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: false
      },
      onclick: {
        enable: false
      },
      resize: true
    }
  },
  retina_detect: true
};

// 3D Card Component
const Card3D = ({ children, ...props }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <Box
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      sx={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Enhanced Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Paper sx={{ 
          p: 2, 
          background: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha('#4facfe', 0.3)}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          textAlign: 'center'
        }}>
          <Typography variant="subtitle2" sx={{ color: '#4facfe', mb: 1, fontWeight: 600 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: ₹{entry.value?.toLocaleString('en-IN')}
            </Typography>
          ))}
        </Paper>
      </motion.div>
    );
  }
  return null;
};

// Main Component
const InvestorPresentationPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  // State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showNavigation, setShowNavigation] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  
  // Data state
  const [meetingData, setMeetingData] = useState(null);
  const [presentationData, setPresentationData] = useState(null);
  const [availableSlides, setAvailableSlides] = useState([]);

  // Particles initialization
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!meetingId) {
      setError('No meeting ID provided.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const meetingResponse = await getInvestorMeetingById(meetingId);
      const meeting = meetingResponse.data?.data || meetingResponse.data;
      
      if (!meeting) {
        throw new Error('Meeting not found');
      }
      
      setMeetingData(meeting);
      
      // Check if meeting has been prepared
      if (!meeting.financialSnapshot && 
          !meeting.userMetricsSnapshot && 
          !meeting.teamUpdates && 
          !meeting.highlightedMilestones?.length && 
          !meeting.highlightedKpis?.length) {
        
        // Try to prepare the meeting
        try {
          const prepareResponse = await prepareInvestorMeeting(meetingId, {
            sections: ['all'],
            format: 'detailed'
          });
          
          const preparedData = prepareResponse.data?.data || prepareResponse.data;
          setMeetingData(preparedData);
          setPresentationData(preparedData);
        } catch (prepError) {
          console.error('Error preparing meeting:', prepError);
          setPresentationData(meeting);
        }
      } else {
        setPresentationData(meeting);
      }
      
      setDataFetched(true);
      
    } catch (err) {
      console.error('Error fetching presentation data:', err);
      setError(`Error loading presentation: ${err.message || 'Please try again later'}`);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Define all possible slides
  const allSlides = [
    {
      id: 'hero',
      component: HeroSlide,
      title: 'Welcome',
      checkData: (data) => true
    },
    {
      id: 'overview',
      component: OverviewSlide,
      title: 'Executive Summary',
      checkData: (data) => data?.financialSnapshot || data?.userMetricsSnapshot
    },
    {
      id: 'financials',
      component: FinancialsSlide,
      title: 'Financial Performance',
      checkData: (data) => data?.financialSnapshot
    },
    {
      id: 'metrics',
      component: MetricsSlide,
      title: 'Growth Metrics',
      checkData: (data) => data?.userMetricsSnapshot || data?.highlightedKpis?.length > 0
    },
    {
      id: 'customers',
      component: CustomerInsightsSlide,
      title: 'Customer Insights',
      checkData: (data) => data?.userMetricsSnapshot || data?.talkingPoints?.some(p => 
        p.content?.toLowerCase().includes('customer') || 
        p.content?.toLowerCase().includes('user'))
    },
    {
      id: 'team',
      component: TeamSlide,
      title: 'Team Update',
      checkData: (data) => data?.teamUpdates
    },
    {
      id: 'product',
      component: ProductSlide,
      title: 'Product Progress',
      checkData: (data) => data?.highlightedMilestones?.length > 0
    },
    {
      id: 'challenges',
      component: ChallengesSlide,
      title: 'Challenges & Opportunities',
      checkData: (data) => data?.talkingPoints?.length > 0
    },
    {
      id: 'asks',
      component: AsksSlide,
      title: 'How You Can Help',
      checkData: (data) => data?.talkingPoints?.some(p => 
        p.category === 'Request' || 
        p.title?.toLowerCase().includes('help') || 
        p.title?.toLowerCase().includes('need')) || 
        data?.actionItems?.length > 0
    },
    {
      id: 'closing',
      component: ClosingSlide,
      title: 'Thank You',
      checkData: (data) => true
    }
  ];

  // Filter slides based on available data
  useEffect(() => {
    if (presentationData) {
      const slides = allSlides.filter(slide => slide.checkData(presentationData));
      setAvailableSlides(slides);

      if (currentSlide >= slides.length) {
        setCurrentSlide(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentationData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'p') {
        setIsAutoPlay(!isAutoPlay);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, isAutoPlay, availableSlides.length]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && dataFetched && availableSlides.length > 0) {
      const timer = setInterval(() => {
        handleNextSlide();
      }, 10000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlay, currentSlide, dataFetched, availableSlides.length]);

  // Hide navigation on inactivity
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowNavigation(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowNavigation(false), 3000);
    };

    if (isFullscreen) {
      window.addEventListener('mousemove', handleMouseMove);
      handleMouseMove();
    } else {
      setShowNavigation(true);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  const handleNextSlide = () => {
    if (currentSlide < availableSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={fetchData} />;
  }

  if (!dataFetched || !presentationData || availableSlides.length === 0) {
    return <ErrorScreen error="No presentation data available" onRetry={fetchData} />;
  }

  const CurrentSlideComponent = availableSlides[currentSlide].component;
  const progress = ((currentSlide + 1) / availableSlides.length) * 100;

  return (
    <PresentationContainer ref={containerRef}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesConfig}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}
      />
      
      {/* Progress Bar */}
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 4,
          zIndex: 1001,
          background: 'rgba(79, 172, 254, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
            boxShadow: '0 0 10px rgba(79, 172, 254, 0.5)',
          }
        }}
      />

      {/* Header Controls */}
      <AnimatePresence>
        {showNavigation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 1000,
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, transparent 100%)',
              backdropFilter: 'blur(10px)',
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton 
                  onClick={() => navigate(-1)} 
                  sx={{ 
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                  {meetingData?.title || 'Investor Update'}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={`${currentSlide + 1} / ${availableSlides.length}`} 
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    background: 'rgba(79, 172, 254, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '1px solid rgba(79, 172, 254, 0.3)'
                  }}
                />
                <IconButton 
                  onClick={() => setIsAutoPlay(!isAutoPlay)} 
                  size="small"
                  sx={{ color: 'white' }}
                >
                  {isAutoPlay ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton 
                  onClick={toggleFullscreen} 
                  size="small"
                  sx={{ color: 'white' }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Stack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.43, 0.13, 0.23, 0.96] 
          }}
          style={{ width: '100%', height: '100vh' }}
        >
          <SlideContainer>
            <CurrentSlideComponent 
              data={presentationData}
            />
          </SlideContainer>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <AnimatePresence>
        {showNavigation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <NavigationDots>
              <IconButton 
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                size="large"
                sx={{ color: 'white' }}
              >
                <NavigateBeforeIcon />
              </IconButton>
              
              {availableSlides.map((slide, index) => (
                <Tooltip key={slide.id} title={slide.title} placement="top">
                  <Dot
                    active={index === currentSlide}
                    onClick={() => setCurrentSlide(index)}
                  />
                </Tooltip>
              ))}
              
              <IconButton 
                onClick={handleNextSlide}
                disabled={currentSlide === availableSlides.length - 1}
                size="large"
                sx={{ color: 'white' }}
              >
                <NavigateNextIcon />
              </IconButton>
            </NavigationDots>
          </motion.div>
        )}
      </AnimatePresence>
    </PresentationContainer>
  );
};

// Slide Components
const HeroSlide = ({ data }) => {
  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Stack spacing={6} alignItems="center" textAlign="center">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 220,
                  height: 220,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  boxShadow: '0 20px 40px rgba(79, 172, 254, 0.4)',
                  mb: 4,
                  animation: `${glow} 3s ease-in-out infinite`,
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <BusinessIcon sx={{ fontSize: 110, color: 'white' }} />
              </Avatar>
              {[...Array(6)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    background: 'linear-gradient(135deg, #f093fb, #fa709a)',
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 60}deg) translateY(-140px)`,
                    animation: `${sparkle} 3s ease-in-out ${i * 0.5}s infinite`,
                  }}
                />
              ))}
            </Box>
          </motion.div>
          
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 900,
              fontSize: '7rem',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 25%, #f093fb 50%, #fa709a 75%, #4facfe 100%)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: `${gradientShift} 8s ease infinite`,
              textShadow: '0 0 80px rgba(79, 172, 254, 0.5)',
              mb: 2
            }}
          >
            {data?.title || 'Investor Update'}
          </Typography>
          
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 300,
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}
          >
            {new Date(data?.meetingDate || new Date()).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Typography>
          
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            {data?.investors?.map((investor, index) => (
              <motion.div
                key={investor._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Chip
                  avatar={
                    <Avatar sx={{ 
                      background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                      color: 'white !important'
                    }}>
                      {investor.name?.[0] || '?'}
                    </Avatar>
                  }
                  label={investor.name}
                  sx={{
                    fontSize: '1.2rem',
                    py: 3.5,
                    px: 2.5,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                    }
                  }}
                />
              </motion.div>
            ))}
          </Stack>
          
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <KeyboardArrowDownIcon 
              sx={{ 
                fontSize: 56, 
                color: 'rgba(255, 255, 255, 0.5)',
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
              }} 
            />
          </motion.div>
        </Stack>
      </motion.div>
    </Container>
  );
};

const OverviewSlide = ({ data }) => {
  const theme = useTheme();
  const financials = data?.financialSnapshot;
  const userMetrics = data?.userMetricsSnapshot;
  
  const highlights = [
    {
      label: 'Runway',
      value: financials?.runway || 0,
      suffix: ' months',
      color: financials?.runway > 12 ? 'success' : financials?.runway > 6 ? 'warning' : 'error',
      icon: <RocketLaunchIcon sx={{ fontSize: 60 }} />,
      gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
    },
    {
      label: 'Monthly Burn',
      value: financials?.monthlyBurn || 0,
      prefix: '₹',
      color: 'warning',
      icon: <LocalFireDepartmentIcon sx={{ fontSize: 60 }} />,
      gradient: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)'
    },
    {
      label: 'Total Users',
      value: userMetrics?.totalRegisteredUsers || 0,
      color: 'primary',
      icon: <PeopleAltIcon sx={{ fontSize: 60 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      label: 'MRR',
      value: financials?.mrr || 0,
      prefix: '₹',
      color: 'success',
      icon: <MonetizationOnIcon sx={{ fontSize: 60 }} />,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    }
  ];
  
  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            animation: `${fadeInUp} 1s ease-out`,
            fontSize: '4rem'
          }}
        >
          The Story So Far
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {highlights.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={item.label}>
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
              >
                <Card3D>
                  <MagicalCard glowColor={theme.palette[item.color].main}>
                    <CardContent sx={{ textAlign: 'center', position: 'relative', zIndex: 1, p: 4 }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          margin: '0 auto 24px',
                          borderRadius: '50%',
                          background: item.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 10px 30px ${alpha(theme.palette[item.color].main, 0.4)}`,
                          animation: `${float} 3s ease-in-out infinite`,
                          '& svg': {
                            color: 'white',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                          }
                        }}
                      >
                        {item.icon}
                      </Box>
                      
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 800, 
                          mb: 1,
                          background: item.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontSize: '3.5rem'
                        }}
                      >
                        {item.prefix}
                        <CountUp
                          start={0}
                          end={item.value}
                          duration={2.5}
                          separator=","
                          decimals={item.suffix === '%' ? 1 : 0}
                        />
                        {item.suffix}
                      </Typography>
                      
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        {item.label}
                      </Typography>
                    </CardContent>
                  </MagicalCard>
                </Card3D>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Key Highlights */}
        {data?.talkingPoints?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Box sx={{ mt: 10 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 6, 
                  fontWeight: 700,
                  color: 'white'
                }}
              >
                Key Highlights
              </Typography>
              <Grid container spacing={4} justifyContent="center">
                {data.talkingPoints.slice(0, 3).map((point, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <MagicalCard glowColor="#4facfe">
                        <CardContent sx={{ p: 4 }}>
                          <Stack direction="row" spacing={3} alignItems="flex-start">
                            <Avatar sx={{ 
                              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                              boxShadow: '0 8px 20px rgba(79, 172, 254, 0.4)',
                              width: 56,
                              height: 56
                            }}>
                              <CheckCircleIcon sx={{ fontSize: 30 }} />
                            </Avatar>
                            <Box>
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: 'white',
                                  mb: 1.5
                                }}
                              >
                                {point.title}
                              </Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  lineHeight: 1.8
                                }}
                              >
                                {point.content}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </MagicalCard>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
};

const FinancialsSlide = ({ data }) => {
  const financials = data?.financialSnapshot;
  
  if (!financials) return null;
  
  // Only use real data from backend
  const cashFlowData = [
    { name: 'Revenue', value: financials.mrr || 0, color: '#38ef7d' },
    { name: 'Expenses', value: financials.monthlyBurn || 0, color: '#eb5757' },
    { name: 'Net', value: (financials.mrr || 0) - (financials.monthlyBurn || 0), color: '#4facfe' }
  ];
  
  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontSize: '4rem'
          }}
        >
          Financial Health
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {/* Cash Flow Visualization */}
          <Grid item xs={12} md={8}>
            <MagicalCard glowColor="#38ef7d">
              <CardContent sx={{ p: 5 }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'white', textAlign: 'center' }}>
                  Monthly Cash Flow
                </Typography>
                <ResponsiveContainer width="100%" height={500}>
                  <ComposedChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38ef7d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#38ef7d" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eb5757" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#eb5757" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 16 }} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 16 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill="url(#colorRevenue)"
                      radius={[15, 15, 0, 0]}
                      animationDuration={1500}
                      barSize={120}
                    >
                      {cashFlowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </MagicalCard>
          </Grid>
          
          {/* Key Metrics */}
          <Grid item xs={12}>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={4}>
                <GlowingMetricCard color="primary">
                  <Stack spacing={3} alignItems="center">
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={(financials.runway / 24) * 100}
                        size={200}
                        thickness={5}
                        sx={{
                          color: financials.runway > 12 ? '#38ef7d' : financials.runway > 6 ? '#f2994a' : '#eb5757',
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}
                      >
                        <Typography variant="h1" sx={{ fontWeight: 800, color: financials.runway > 12 ? '#38ef7d' : financials.runway > 6 ? '#f2994a' : '#eb5757' }}>
                          {financials.runway}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          months
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                      Runway
                    </Typography>
                  </Stack>
                </GlowingMetricCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <GlowingMetricCard color="info">
                  <Stack spacing={3} alignItems="center">
                    <Avatar sx={{
                      width: 140,
                      height: 140,
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      animation: `${pulse} 2s ease-in-out infinite`
                    }}>
                      <AccountBalanceIcon sx={{ fontSize: 70 }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                      ₹<CountUp end={financials.cashBalance || 0} duration={2} separator="," />
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Cash Balance
                    </Typography>
                  </Stack>
                </GlowingMetricCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <GlowingMetricCard color="secondary">
                  <Stack spacing={3} alignItems="center">
                    <Avatar sx={{
                      width: 140,
                      height: 140,
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      animation: `${pulse} 2s ease-in-out infinite`
                    }}>
                      <DiamondIcon sx={{ fontSize: 70 }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                      ₹<CountUp end={financials.totalFundsRaised || 0} duration={2} separator="," />
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Total Raised
                    </Typography>
                  </Stack>
                </GlowingMetricCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

const MetricsSlide = ({ data }) => {
  const userMetrics = data?.userMetricsSnapshot;
  const kpis = data?.highlightedKpis;
  
  if (!userMetrics && (!kpis || kpis.length === 0)) return null;
  
  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontSize: '4rem'
          }}
        >
          Growth Trajectory
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {/* User Metrics */}
          {userMetrics && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} md={4}>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <MagicalCard glowColor="#4facfe">
                        <CardContent sx={{ p: 5 }}>
                          <Typography variant="h2" sx={{ fontWeight: 800, color: '#4facfe', mb: 2 }}>
                            <CountUp end={userMetrics.dau || 0} duration={2} separator="," />
                          </Typography>
                          <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Daily Active Users
                          </Typography>
                        </CardContent>
                      </MagicalCard>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <MagicalCard glowColor="#00f2fe">
                        <CardContent sx={{ p: 5 }}>
                          <Typography variant="h2" sx={{ fontWeight: 800, color: '#00f2fe', mb: 2 }}>
                            <CountUp end={userMetrics.mau || 0} duration={2} separator="," />
                          </Typography>
                          <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Monthly Active Users
                          </Typography>
                        </CardContent>
                      </MagicalCard>
                    </motion.div>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      <MagicalCard glowColor="#f093fb">
                        <CardContent sx={{ p: 5 }}>
                          <Typography variant="h2" sx={{ fontWeight: 800, color: '#f093fb', mb: 2 }}>
                            {(parseFloat(userMetrics.dauMauRatio) * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            DAU/MAU Ratio
                          </Typography>
                        </CardContent>
                      </MagicalCard>
                    </motion.div>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
          
          {/* KPIs */}
          {kpis && kpis.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h3" sx={{ textAlign: 'center', mb: 4, fontWeight: 700, color: 'white' }}>
                Key Performance Indicators
              </Typography>
              <Grid container spacing={3} justifyContent="center">
                {kpis.map((kpi, index) => (
                  <Grid item xs={12} sm={6} md={3} key={kpi.kpiId}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <MagicalCard glowColor="#fa709a">
                        <CardContent sx={{ p: 4, textAlign: 'center' }}>
                          <Stack spacing={2} alignItems="center">
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
                              {kpi.kpiName}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: '#fa709a' }}>
                              {kpi.formattedValue || kpi.value || 'N/A'}
                            </Typography>
                            {kpi.trend !== null && kpi.trend !== undefined && (
                              <Avatar sx={{
                                width: 60,
                                height: 60,
                                background: kpi.trend > 0 
                                  ? 'linear-gradient(135deg, #11998e, #38ef7d)'
                                  : kpi.trend < 0 
                                  ? 'linear-gradient(135deg, #eb5757, #f2994a)'
                                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                                animation: `${pulse} 2s ease-in-out infinite`
                              }}>
                                {kpi.trend > 0 ? <TrendingUpIcon sx={{ fontSize: 35 }} /> : 
                                 kpi.trend < 0 ? <TrendingDownIcon sx={{ fontSize: 35 }} /> : 
                                 <TrendingFlatIcon sx={{ fontSize: 35 }} />}
                              </Avatar>
                            )}
                          </Stack>
                        </CardContent>
                      </MagicalCard>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Container>
  );
};

const CustomerInsightsSlide = ({ data }) => {
  const userMetrics = data?.userMetricsSnapshot;
  
  const customerInsights = data?.talkingPoints?.filter(point => 
    point.content?.toLowerCase().includes('customer') || 
    point.content?.toLowerCase().includes('user') ||
    point.title?.toLowerCase().includes('customer') ||
    point.title?.toLowerCase().includes('user')
  ) || [];
  
  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontSize: '4rem'
          }}
        >
          Customer Journey
        </Typography>
        
        {customerInsights.length > 0 ? (
          <Grid container spacing={4} justifyContent="center">
            {customerInsights.map((insight, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <MagicalCard glowColor="#fa709a">
                    <CardContent sx={{ p: 5 }}>
                      <Stack direction="row" spacing={3} alignItems="flex-start">
                        <Avatar sx={{
                          background: 'linear-gradient(135deg, #f093fb 0%, #fa709a 100%)',
                          animation: `${pulse} 2s ease-in-out infinite`,
                          width: 70,
                          height: 70
                        }}>
                          <LightbulbIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'white' }}>
                            {insight.title}
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                            {insight.content}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </MagicalCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : userMetrics ? (
          <Box sx={{ textAlign: 'center' }}>
            <MagicalCard glowColor="#fa709a">
              <CardContent sx={{ p: 8 }}>
                <Stack spacing={4} alignItems="center">
                  <PsychologyIcon sx={{ fontSize: 100, color: '#fa709a' }} />
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    User Base Overview
                  </Typography>
                  <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="h2" sx={{ fontWeight: 800, color: '#f093fb' }}>
                        <CountUp end={userMetrics.totalRegisteredUsers || 0} duration={2} separator="," />
                      </Typography>
                      <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                        Total Users
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="h2" sx={{ fontWeight: 800, color: '#fa709a' }}>
                        <CountUp end={userMetrics.newUsersThisMonth || 0} duration={2} separator="," />
                      </Typography>
                      <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                        New This Month
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="h2" sx={{ fontWeight: 800, color: '#f5576c' }}>
                        <CountUp end={userMetrics.churnedUsers || 0} duration={2} separator="," />
                      </Typography>
                      <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                        Churned Users
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </MagicalCard>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <MagicalCard glowColor="#fa709a">
              <CardContent sx={{ p: 8 }}>
                <Stack spacing={3} alignItems="center">
                  <PsychologyIcon sx={{ fontSize: 100, color: '#fa709a' }} />
                  <Typography variant="h3" sx={{ color: 'white' }}>
                    Customer insights data not available
                  </Typography>
                </Stack>
              </CardContent>
            </MagicalCard>
          </Box>
        )}
      </motion.div>
    </Container>
  );
};

const TeamSlide = ({ data }) => {
  const teamData = data?.teamUpdates;
  
  if (!teamData) return null;
  
  const departmentData = teamData.departmentBreakdown?.map((dept, index) => ({
    name: dept.department,
    value: dept.count,
    fill: ['#667eea', '#764ba2', '#f093fb', '#fa709a', '#f5576c'][index % 5]
  })) || [];
  
  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontSize: '4rem'
          }}
        >
          Our Growing Team
        </Typography>
        
        <Grid container spacing={6} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={5}>
            <Stack spacing={4} alignItems="center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Avatar sx={{
                  width: 250,
                  height: 250,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  boxShadow: '0 20px 40px rgba(118, 75, 162, 0.4)',
                  mb: 2,
                  animation: `${glow} 3s ease-in-out infinite`
                }}>
                  <GroupsIcon sx={{ fontSize: 130, color: 'white' }} />
                </Avatar>
              </motion.div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <Typography variant="h1" sx={{ fontWeight: 800, color: 'white', fontSize: '5rem' }}>
                  <CountUp end={teamData.currentHeadcount || 0} duration={2} />
                </Typography>
              </motion.div>
              <Typography variant="h4" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Total Team Members
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Card3D>
                    <GlowingMetricCard color="success">
                      <Stack spacing={1} alignItems="center">
                        <ElectricBoltIcon sx={{ fontSize: 50, color: '#38ef7d' }} />
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                          +<CountUp end={teamData.newHires?.length || 0} duration={2} />
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          New Hires
                        </Typography>
                      </Stack>
                    </GlowingMetricCard>
                  </Card3D>
                </Grid>
                <Grid item xs={6}>
                  <Card3D>
                    <GlowingMetricCard color="warning">
                      <Stack spacing={1} alignItems="center">
                        <FlareIcon sx={{ fontSize: 50, color: '#f2994a' }} />
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>
                          <CountUp end={teamData.openPositions || 0} duration={2} />
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Open Positions
                        </Typography>
                      </Stack>
                    </GlowingMetricCard>
                  </Card3D>
                </Grid>
              </Grid>
            </Stack>
          </Grid>
          
          {departmentData.length > 0 && (
            <Grid item xs={12} md={7}>
              <MagicalCard glowColor="#764ba2">
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'white', textAlign: 'center' }}>
                    Department Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={500}>
                    <PieChart>
                      <defs>
                        {departmentData.map((entry, index) => (
                          <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={entry.fill} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={entry.fill} stopOpacity={0.4}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={180}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradient${index})`} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </MagicalCard>
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Container>
  );
};

const ProductSlide = ({ data }) => {
  const milestones = data?.highlightedMilestones;
  
  if (!milestones || milestones.length === 0) return null;
  
  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontSize: '4rem'
          }}
        >
          Building the Future
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {milestones.map((milestone, index) => (
            <Grid item xs={12} md={6} key={milestone.milestoneId || index}>
              <motion.div
                initial={{ opacity: 0, y: 40, rotateX: -30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                whileHover={{ scale: 1.03, rotateY: 5 }}
                style={{ height: '100%' }}
              >
                <Card3D>
                  <MagicalCard 
                    glowColor={milestone.status === 'Completed' ? '#38ef7d' : '#4facfe'}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ p: 5 }}>
                      <Stack spacing={4}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>
                              {milestone.milestoneName}
                            </Typography>
                            {milestone.investorSummary && (
                              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                                {milestone.investorSummary}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            label={milestone.status}
                            sx={{
                              ml: 2,
                              background: milestone.status === 'Completed' 
                                ? 'linear-gradient(135deg, #11998e, #38ef7d)'
                                : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '1rem',
                              py: 3,
                              px: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                          />
                        </Stack>
                        
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              Progress
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                              {milestone.completionPercentage || 0}%
                            </Typography>
                          </Stack>
                          <Box sx={{ position: 'relative' }}>
                            <LinearProgress
                              variant="determinate"
                              value={0}
                              sx={{
                                height: 16,
                                borderRadius: 8,
                                bgcolor: 'rgba(255,255,255,0.1)',
                              }}
                            />
                            <LinearProgress
                              variant="determinate"
                              value={milestone.completionPercentage || 0}
                              sx={{
                                height: 16,
                                borderRadius: 8,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                background: 'transparent',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 8,
                                  background: milestone.status === 'Completed'
                                    ? 'linear-gradient(90deg, #11998e, #38ef7d)'
                                    : 'linear-gradient(90deg, #4facfe, #00f2fe)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                  transition: 'transform 1.5s ease-out',
                                }
                              }}
                            />
                          </Box>
                        </Box>
                        
                        <Stack direction="row" spacing={2}>
                          <Chip
                            icon={<FlagIcon />}
                            label={`Due: ${new Date(milestone.plannedEndDate).toLocaleDateString()}`}
                            size="large"
                            sx={{
                              background: 'rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '1rem',
                              py: 3,
                              '& .MuiChip-icon': {
                                color: 'rgba(255,255,255,0.6)'
                              }
                            }}
                          />
                          {milestone.priority && (
                            <Chip
                              label={milestone.priority}
                              size="large"
                              sx={{
                                background: milestone.priority === 'High' 
                                  ? 'linear-gradient(135deg, #eb5757, #f2994a)'
                                  : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1rem',
                                py: 3
                              }}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </MagicalCard>
                </Card3D>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

const ChallengesSlide = ({ data }) => {
  const challenges = data?.talkingPoints?.filter(point => 
    point.category === 'Challenge' || point.category === 'Request'
  ) || [];
  
  const opportunities = data?.talkingPoints?.filter(point => 
    point.category === 'Win' || point.category === 'Strategic'
  ) || [];
  
  if (challenges.length === 0 && opportunities.length === 0) return null;
  
  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontSize: '4rem'
          }}
        >
          The Road Ahead
        </Typography>
        
        <Grid container spacing={6} justifyContent="center">
          {/* Challenges */}
          {challenges.length > 0 && (
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ mb: 4, fontWeight: 700, color: 'white', textAlign: 'center' }}>
                Current Challenges
              </Typography>
              <Stack spacing={3}>
                {challenges.map((challenge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ x: 10 }}
                  >
                    <MagicalCard glowColor="#eb5757">
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" spacing={3} alignItems="flex-start">
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #eb5757, #f2994a)',
                            boxShadow: '0 8px 20px rgba(235, 87, 87, 0.4)',
                            animation: `${pulse} 2s ease-in-out infinite`,
                            width: 60,
                            height: 60
                          }}>
                            <WarningIcon sx={{ fontSize: 35 }} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
                              {challenge.title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                              {challenge.content}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </MagicalCard>
                  </motion.div>
                ))}
              </Stack>
            </Grid>
          )}
          
          {/* Opportunities */}
          {opportunities.length > 0 && (
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ mb: 4, fontWeight: 700, color: 'white', textAlign: 'center' }}>
                Key Opportunities
              </Typography>
              <Stack spacing={3}>
                {opportunities.map((opportunity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ x: -10 }}
                  >
                    <MagicalCard glowColor="#38ef7d">
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" spacing={3} alignItems="flex-start">
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                            boxShadow: '0 8px 20px rgba(56, 239, 125, 0.4)',
                            animation: `${pulse} 2s ease-in-out infinite`,
                            width: 60,
                            height: 60
                          }}>
                            <StarIcon sx={{ fontSize: 35 }} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
                              {opportunity.title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                              {opportunity.content}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </MagicalCard>
                  </motion.div>
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Container>
  );
};

const AsksSlide = ({ data }) => {
  const asks = data?.talkingPoints?.filter(point => 
    point.category === 'Request' || point.title?.toLowerCase().includes('help') || point.title?.toLowerCase().includes('need')
  ) || [];
  
  const actionItems = data?.actionItems || [];
  
  if (asks.length === 0 && actionItems.length === 0) return null;
  
  const askCategories = [
    {
      icon: <InsightsIcon sx={{ fontSize: 80 }} />,
      title: 'Strategic Guidance',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      items: asks.filter(a => a.content?.toLowerCase().includes('strategy') || a.content?.toLowerCase().includes('guidance'))
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 80 }} />,
      title: 'Network & Connections',
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      items: asks.filter(a => a.content?.toLowerCase().includes('introduction') || a.content?.toLowerCase().includes('connect'))
    },
    {
      icon: <HandshakeIcon sx={{ fontSize: 80 }} />,
      title: 'General Support',
      gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
      items: asks.filter(a => !a.content?.toLowerCase().includes('strategy') && !a.content?.toLowerCase().includes('introduction'))
    }
  ];
  
  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 800,
            textAlign: 'center',
            mb: 8,
            color: 'white',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            fontSize: '4rem'
          }}
        >
          How You Can Help
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {askCategories.map((category, index) => {
            const hasItems = category.items.length > 0 || (index === 0 && actionItems.length > 0);
            if (!hasItems) return null;
            
            return (
              <Grid item xs={12} md={4} key={category.title}>
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  whileHover={{ y: -10 }}
                  style={{ height: '100%' }}
                >
                  <Card3D>
                    <MagicalCard glowColor="#764ba2" sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center', p: 5 }}>
                        <Box
                          sx={{
                            width: 150,
                            height: 150,
                            margin: '0 auto 32px',
                            borderRadius: '50%',
                            background: category.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                            animation: `${float} 3s ease-in-out infinite`,
                          }}
                        >
                          {React.cloneElement(category.icon, { sx: { fontSize: 80, color: 'white' } })}
                        </Box>
                        
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 4 }}>
                          {category.title}
                        </Typography>
                        
                        {category.items.length > 0 ? (
                          <Stack spacing={2}>
                            {category.items.map((item, idx) => (
                              <Box key={idx} sx={{ textAlign: 'left' }}>
                                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                  • {item.title}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        ) : actionItems.length > 0 && index === 0 ? (
                          <Stack spacing={2}>
                            {actionItems.slice(0, 3).map((item, idx) => (
                              <Box key={idx} sx={{ textAlign: 'left' }}>
                                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                  • {item.action}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        ) : null}
                      </CardContent>
                    </MagicalCard>
                  </Card3D>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </motion.div>
    </Container>
  );
};

const ClosingSlide = ({ data }) => {
  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <Stack spacing={6} alignItems="center" textAlign="center">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ position: 'relative' }}
          >
            <EmojiEventsIcon 
              sx={{ 
                fontSize: 220, 
                color: 'white',
                filter: 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))',
                background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }} 
            />
            {[...Array(8)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-120px)`,
                  animation: `${sparkle} 2s ease-in-out ${i * 0.25}s infinite`,
                }}
              />
            ))}
          </motion.div>
          
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 900,
              fontSize: '7rem',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #f093fb 50%, #fa709a 75%, #ffd700 100%)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: `${gradientShift} 6s ease infinite`,
              textShadow: '0 0 60px rgba(255, 215, 0, 0.5)',
            }}
          >
            Thank You!
          </Typography>
          
          <Typography 
            variant="h3" 
            sx={{ 
              maxWidth: 800, 
              fontWeight: 300,
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}
          >
            We appreciate your continued support and guidance
          </Typography>
          
          {data?.actionItems && data.actionItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <MagicalCard glowColor="#ffd700" sx={{ mt: 4 }}>
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'white' }}>
                    Next Steps
                  </Typography>
                  <Stack spacing={3} alignItems="flex-start">
                    {data.actionItems.slice(0, 3).map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <Stack direction="row" spacing={3} alignItems="center">
                          <Avatar sx={{
                            background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                            width: 50,
                            height: 50
                          }}>
                            <CheckCircleIcon sx={{ fontSize: 30 }} />
                          </Avatar>
                          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            {item.action}
                          </Typography>
                        </Stack>
                      </motion.div>
                    ))}
                  </Stack>
                </CardContent>
              </MagicalCard>
            </motion.div>
          )}
          
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', mt: 4 }}>
            Next update: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Typography>
        </Stack>
      </motion.div>
    </Container>
  );
};

// Helper Components
const LoadingScreen = () => {
  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0a',
        textAlign: 'center'
      }}
    >
      <Stack spacing={3} alignItems="center">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 100, color: 'white' }} />
        </motion.div>
        <Typography variant="h4" sx={{ color: 'white' }}>
          Preparing your magical presentation...
        </Typography>
        <Box sx={{ width: 400 }}>
          <LinearProgress 
            sx={{ 
              height: 10,
              borderRadius: 5,
              background: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
              }
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

const ErrorScreen = ({ error, onRetry }) => (
  <Box 
    sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0a0a0a',
      p: 3,
      textAlign: 'center'
    }}
  >
    <Stack spacing={4} alignItems="center" maxWidth={700}>
      <ErrorOutlineIcon sx={{ fontSize: 100, color: '#eb5757' }} />
      <Typography variant="h3" sx={{ color: 'white' }}>
        Oops! Something went wrong
      </Typography>
      <Alert 
        severity="error" 
        sx={{ 
          width: '100%',
          background: 'rgba(235, 87, 87, 0.1)',
          color: 'white',
          fontSize: '1.1rem',
          '& .MuiAlert-icon': {
            color: '#eb5757'
          }
        }}
      >
        {error}
      </Alert>
      <Button 
        variant="contained" 
        onClick={onRetry}
        startIcon={<RefreshIcon />}
        size="large"
        sx={{
          fontSize: '1.2rem',
          py: 2,
          px: 4,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          boxShadow: '0 8px 20px rgba(79, 172, 254, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
          }
        }}
      >
        Try Again
      </Button>
    </Stack>
  </Box>
);

export default InvestorPresentationPage;