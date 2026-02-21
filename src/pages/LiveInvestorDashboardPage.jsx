// src/pages/LiveInvestorDashboardPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Stack,
  CircularProgress, Alert, Chip, Divider, useTheme, alpha,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Fade, Grow, Zoom,
  Tooltip
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import GroupAddIcon         from '@mui/icons-material/GroupAdd';
import CheckCircleIcon      from '@mui/icons-material/CheckCircle';
import BarChartIcon         from '@mui/icons-material/BarChart';
import LinearProgress       from '@mui/material/LinearProgress';
// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { getLiveDashboardData } from '../services/api';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(-3deg); }
  66% { transform: translateY(5px) rotate(3deg); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 0.8; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(0.95); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
  50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 40px rgba(99, 102, 241, 0.4); }
`;

// Styled Components
const MagicalBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(ellipse at top left, #1a237e 0%, #000051 25%, #000 50%), radial-gradient(ellipse at bottom right, #4a148c 0%, #000 50%)'
    : 'radial-gradient(ellipse at top left, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%), radial-gradient(ellipse at bottom right, #f3e5f5 0%, #e1bee7 50%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cfilter id="glow"%3E%3CfegaussianBlur stdDeviation="3.5" result="coloredBlur"/%3E%3Cfmerge%3E%3Cfmergenode in="coloredBlur"/%3E%3Cfmergenode in="SourceGraphic"/%3E%3C/fmerge%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx="50" cy="50" r="2" fill="white" filter="url(%23glow)" opacity="0.3"/%3E%3C/svg%3E")',
    opacity: 0.4,
    animation: `${pulse} 4s ease-in-out infinite`,
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 0),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha('#673ab7', 0.2)} 0%, ${alpha('#3f51b5', 0.2)} 50%, ${alpha('#2196f3', 0.2)} 100%)`
    : `linear-gradient(135deg, ${alpha('#2196f3', 0.15)} 0%, ${alpha('#673ab7', 0.1)} 50%, ${alpha('#e91e63', 0.05)} 100%)`,
  backdropFilter: 'blur(20px) saturate(180%)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
    animation: `${float} 20s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
    animation: `${float} 25s ease-in-out infinite reverse`,
  }
}));

const MagicalDataCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(3),
  height: '100%',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha('#1e1e1e', 0.9)} 0%, ${alpha('#2d2d2d', 0.9)} 100%)`
    : `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f5f5f5', 0.9)} 100%)`,
  backdropFilter: 'blur(10px) saturate(150%)',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 40px 0 rgba(31, 38, 135, 0.5)'
      : '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
    '& .card-glow': {
      opacity: 1,
    },
    '& .sparkle-effect': {
      animation: `${sparkle} 0.6s ease-out`,
    }
  },
  '& .card-glow': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  }
}));

const MetricCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.5),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    background: alpha(theme.palette.background.paper, 0.7),
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const AnimatedNumber = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  backgroundSize: '200% 200%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: `${gradientShift} 3s ease infinite`,
  fontWeight: 800,
  letterSpacing: '-0.02em',
}));

const MagicalAvatar = styled(Avatar)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: -2,
    borderRadius: '50%',
    padding: 2,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  }
}));

const MagicalProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    backgroundSize: '200% 100%',
    animation: `${gradientShift} 3s ease infinite`,
  }
}));

const FloatingIcon = styled(Box)(({ index = 0 }) => ({
  position: 'absolute',
  animation: `${float} ${15 + index * 2}s ease-in-out infinite`,
  animationDelay: `${index * 0.5}s`,
  opacity: 0.1,
  pointerEvents: 'none',
}));

const SparkleIcon = styled(SparklesIcon)(({ theme }) => ({
  position: 'absolute',
  color: theme.palette.warning.main,
  fontSize: 20,
  opacity: 0,
  '&.sparkle-effect': {
    animation: `${sparkle} 0.6s ease-out`,
  }
}));

const TrendIndicator = styled(Box)(({ theme, trend }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  background: trend === 'up' 
    ? alpha(theme.palette.success.main, 0.1)
    : trend === 'down'
    ? alpha(theme.palette.error.main, 0.1)
    : alpha(theme.palette.grey[500], 0.1),
  color: trend === 'up' 
    ? theme.palette.success.main
    : trend === 'down'
    ? theme.palette.error.main
    : theme.palette.grey[500],
}));

// Enhanced KPI Component
const MagicalKpiItem = ({ label, value, unit = '', icon, color = 'primary', delay = 0, trend, secondaryValue, tooltip }) => {
  const theme = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      const duration = 2000;
      const steps = 60;
      const stepValue = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, isVisible]);

  const content = (
    <Grow in={isVisible} timeout={1000 + delay * 200}>
      <Box ref={itemRef} sx={{ textAlign: 'center', p: 2, position: 'relative' }}>
        <SparkleIcon className="sparkle-effect" sx={{ top: 10, right: 10 }} />
        <MagicalAvatar 
          sx={{ 
            bgcolor: alpha(theme.palette[color]?.main || theme.palette.grey[500], 0.15), 
            color: theme.palette[color]?.main || theme.palette.text.primary, 
            width: 56, 
            height: 56, 
            mx: 'auto', 
            mb: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1) rotate(5deg)',
              animation: `${glow} 1s ease-in-out infinite`,
            }
          }}
        >
          {icon || <TrendingUpIcon />}
        </MagicalAvatar>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          display="block" 
          sx={{ 
            fontWeight: 600, 
            minHeight: '2.5em',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontSize: '0.7rem'
          }}
        >
          {label}
        </Typography>
        <AnimatedNumber variant="h4" sx={{ fontWeight: 800 }}>
          {typeof displayValue === 'number' 
            ? `${Math.floor(displayValue).toLocaleString()}${unit}` 
            : displayValue || 'N/A'}
        </AnimatedNumber>
        {secondaryValue && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {secondaryValue}
          </Typography>
        )}
        {trend && (
          <Box sx={{ mt: 1 }}>
            <TrendIndicator trend={trend}>
              {trend === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {trend === 'up' ? 'Trending Up' : 'Trending Down'}
              </Typography>
            </TrendIndicator>
          </Box>
        )}
      </Box>
    </Grow>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow placement="top">
      {content}
    </Tooltip>
  ) : content;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value, noSymbol = false) => {
  if (value === null || value === undefined || !isFinite(value)) return 'N/A';
  const symbol = noSymbol ? '' : '₹';
  if (Math.abs(value) >= 10000000) { // Crores
    return `${symbol}${(value / 10000000).toFixed(2)}Cr`;
  } else if (Math.abs(value) >= 100000) { // Lakhs
    return `${symbol}${(value / 100000).toFixed(2)}L`;
  }
  return `${symbol}${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
};

const formatKpiValue = (value, format) => {
  if (value === null || value === undefined) return 'N/A';
  
  switch(format) {
    case 'percentage':
      return `${value}%`;
    case 'currency':
      return formatCurrency(value);
    case 'number':
      return value.toLocaleString();
    default:
      return value;
  }
};

const LiveInvestorDashboardPage = () => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getLiveDashboardData();
      if (response.data) {
        setDashboardData(response.data);
      } else {
        setError('Failed to fetch live dashboard data or data is not in expected format.');
      }
    } catch (err) {
      console.error('Error fetching live dashboard data:', err);
      setError(`Error: ${err.response?.data?.msg || err.message || 'Could not load dashboard data.'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Mouse move effect for cards
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.magical-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'radial-gradient(ellipse at center, #1a237e 0%, #000051 100%)'
      }}>
        <Stack alignItems="center" spacing={3}>
          <Box sx={{ position: 'relative' }}>
            <CircularProgress 
              size={80} 
              thickness={2}
              sx={{
                color: 'primary.main',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <AutoGraphIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </Box>
          <Typography 
            variant="h6" 
            sx={{
              background: 'linear-gradient(45deg, #fff 30%, #64b5f6 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600
            }}
          >
            Loading Live Dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return <Container sx={{py:4}}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!dashboardData) {
    return <Container sx={{py:4}}><Alert severity="warning">No dashboard data available at the moment.</Alert></Container>;
  }

  const {
    fundraisingSummary,
    financialSummary,
    kpiSnapshotSummary,
    customKpiSummary,
    fundUtilizationSummary,
    productMilestoneSummary,
    headcountSummary
  } = dashboardData;

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <MagicalBackground />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <HeroSection>
          <Container maxWidth="lg">
            <Fade in timeout={1000}>
              <Stack direction="row" alignItems="center" spacing={3}>
                <MagicalAvatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.2), 
                    color: theme.palette.primary.main, 
                    width: 64, 
                    height: 64,
                    boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}`
                  }}
                >
                  <DashboardIcon fontSize="large" />
                </MagicalAvatar>
                <Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Live Investor Dashboard
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                    Real-time insights into our startup's journey
                  </Typography>
                </Box>
              </Stack>
            </Fade>
          </Container>
        </HeroSection>

        <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
          {/* Key Metrics Overview */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Current MRR</Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(financialSummary?.currentMonthRevenue)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                    <AttachMoneyIcon />
                  </Avatar>
                </Stack>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">YTD Revenue</Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(financialSummary?.ytdRevenue)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Stack>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Active Headcount</Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {headcountSummary?.totalActive || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                    <BadgeIcon />
                  </Avatar>
                </Stack>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Open Positions</Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {headcountSummary?.openPositions || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                    <WorkIcon />
                  </Avatar>
                </Stack>
              </MetricCard>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Enhanced Financial Summary */}
            <Grid item xs={12} lg={8}>
              <MagicalDataCard className="magical-card">
                <Box className="card-glow" />
                <FloatingIcon index={0} sx={{ top: 20, right: 20 }}>
                  <MonetizationOnIcon sx={{ fontSize: 60, color: 'success.main' }} />
                </FloatingIcon>
                
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 3
                }}>
                  <MonetizationOnIcon sx={{ mr: 1, color: 'success.main' }} />
                  Financial Overview
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <MagicalKpiItem 
                      label="Bank Balance" 
                      value={financialSummary?.currentTotalBankBalance} 
                      unit="" 
                      icon={<AccountBalanceIcon />} 
                      color="success"
                      delay={0}
                      tooltip="Total funds across all bank accounts"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <MagicalKpiItem 
                      label="Monthly Burn" 
                      value={financialSummary?.averageMonthlyBurnRate} 
                      unit="" 
                      icon={<WhatshotIcon />} 
                      color="error"
                      delay={1}
                      secondaryValue={`Last Month: ${formatCurrency(financialSummary?.lastMonthExpenses)}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <MagicalKpiItem 
                      label="Runway" 
                      value={financialSummary?.estimatedRunwayMonths?.toFixed(1)} 
                      unit=" months" 
                      icon={<RocketLaunchIcon />} 
                      color="warning"
                      delay={2}
                      tooltip="Estimated months until funds depleted at current burn rate"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2, opacity: 0.1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MagicalKpiItem 
                      label="Last Month Revenue" 
                      value={financialSummary?.lastMonthRevenue} 
                      unit="" 
                      icon={<AttachMoneyIcon />} 
                      color="info"
                      delay={3}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MagicalKpiItem 
                      label="YTD Revenue" 
                      value={financialSummary?.ytdRevenue} 
                      unit="" 
                      icon={<CalendarMonthIcon />} 
                      color="info"
                      delay={4}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MagicalKpiItem 
                      label="Last Month Expenses" 
                      value={financialSummary?.lastMonthExpenses} 
                      unit="" 
                      icon={<ReceiptIcon />} 
                      color="error"
                      delay={5}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MagicalKpiItem 
                      label="YTD Expenses" 
                      value={financialSummary?.ytdExpenses} 
                      unit="" 
                      icon={<AccountTreeIcon />} 
                      color="error"
                      delay={6}
                    />
                  </Grid>
                </Grid>
              </MagicalDataCard>
            </Grid>

            {/* Enhanced Fundraising Summary */}
            <Grid item xs={12} lg={4}>
              <MagicalDataCard className="magical-card" sx={{ height: '100%' }}>
                <Box className="card-glow" />
                <FloatingIcon index={2} sx={{ top: 20, right: 20 }}>
                  <BusinessCenterIcon sx={{ fontSize: 60, color: 'secondary.main' }} />
                </FloatingIcon>
                
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 3
                }}>
                  <BusinessCenterIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  Fundraising
                </Typography>
                
                <Stack spacing={3}>
                  <Box>
                    <Chip 
                      label={fundraisingSummary?.roundName || 'No Active Round'} 
                      color="secondary"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Target Amount
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(fundraisingSummary?.targetAmount)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress: {fundraisingSummary?.percentageClosed}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fundraisingSummary?.numberOfInvestors || 0} investors
                      </Typography>
                    </Stack>
                    <MagicalProgress 
                      variant="determinate" 
                      value={parseFloat(fundraisingSummary?.percentageClosed) || 0}
                      sx={{ mb: 1 }}
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography variant="caption" color="text.secondary">Committed</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatCurrency(fundraisingSummary?.totalCommitted)}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary">Received</Typography>
                        <Typography variant="body1" fontWeight={600} color="success.main">
                          {formatCurrency(fundraisingSummary?.totalReceived)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Stack direction="row" spacing={2}>
                    <MagicalKpiItem 
                      label="Investors" 
                      value={fundraisingSummary?.numberOfInvestors || 0} 
                      icon={<HandshakeIcon />} 
                      color="secondary"
                      delay={0}
                    />
                  </Stack>
                </Stack>
              </MagicalDataCard>
            </Grid>

            {/* Enhanced User Metrics */}
            <Grid item xs={12} md={6}>
              <MagicalDataCard className="magical-card">
                <Box className="card-glow" />
                <FloatingIcon index={1} sx={{ top: 20, right: 20 }}>
                  <PeopleAltIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                </FloatingIcon>
                
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2
                }}>
                  <PeopleAltIcon sx={{ mr: 1, color: 'primary.main' }} />
                  User Engagement Metrics
                </Typography>
                
                <Chip 
                  label={`Updated: ${formatDate(kpiSnapshotSummary?.snapshotDate)}`}
                  size="small"
                  sx={{ 
                    mb: 3,
                    background: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <MagicalKpiItem 
                      label="Daily Active Users" 
                      value={kpiSnapshotSummary?.dau} 
                      icon={<TrendingUpIcon />} 
                      color="primary"
                      delay={0}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <MagicalKpiItem 
                      label="Monthly Active Users" 
                      value={kpiSnapshotSummary?.mau} 
                      icon={<TrendingUpIcon />} 
                      color="primary"
                      delay={1}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <MagicalKpiItem 
                      label="New Users Today" 
                      value={kpiSnapshotSummary?.newUsersToday || 0} 
                      icon={<PersonAddIcon />} 
                      color="success"
                      delay={2}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <MagicalKpiItem 
                      label="Total Users" 
                      value={kpiSnapshotSummary?.totalRegisteredUsers} 
                      icon={<GroupAddIcon />} 
                      color="info"
                      delay={3}
                    />
                  </Grid>
                  {kpiSnapshotSummary?.dauMauRatio && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        borderRadius: 2, 
                        background: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          DAU/MAU Ratio (Stickiness)
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {(kpiSnapshotSummary.dauMauRatio * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </MagicalDataCard>
            </Grid>

            {/* Team & Headcount */}
            <Grid item xs={12} md={6}>
              <MagicalDataCard className="magical-card">
                <Box className="card-glow" />
                <FloatingIcon index={3} sx={{ top: 20, right: 20 }}>
                  <BadgeIcon sx={{ fontSize: 60, color: 'info.main' }} />
                </FloatingIcon>
                
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 700, 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 3
                }}>
                  <BadgeIcon sx={{ mr: 1, color: 'info.main' }} />
                  Team & Headcount
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      background: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      textAlign: 'center'
                    }}>
                      <BadgeIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                      <Typography variant="h3" fontWeight={800} color="info.main">
                        {headcountSummary?.totalActive || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Team Members
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      background: alpha(theme.palette.warning.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      textAlign: 'center'
                    }}>
                      <WorkIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                      <Typography variant="h3" fontWeight={800} color="warning.main">
                        {headcountSummary?.openPositions || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Open Positions
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {headcountSummary?.openPositions > 0 && (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mt: 3,
                      background: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                    }}
                  >
                    We're actively hiring! Join our growing team.
                  </Alert>
                )}
              </MagicalDataCard>
            </Grid>

            {/* Enhanced Custom KPIs */}
            {customKpiSummary && customKpiSummary.length > 0 && (
              <Grid item xs={12}>
                <MagicalDataCard className="magical-card">
                  <Box className="card-glow" />
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <AutoGraphIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Key Performance Indicators
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {customKpiSummary.map((kpi, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <MagicalKpiItem 
                          label={kpi.name} 
                          value={formatKpiValue(kpi.value, kpi.displayFormat)} 
                          unit="" 
                          icon={<BarChartIcon />} 
                          color="primary"
                          delay={index}
                          trend={kpi.trend}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </MagicalDataCard>
              </Grid>
            )}

            {/* Product Milestones */}
            {productMilestoneSummary && (productMilestoneSummary.upcoming?.length > 0 || productMilestoneSummary.recentlyCompleted?.length > 0) && (
              <Grid item xs={12} md={6}>
                <MagicalDataCard className="magical-card">
                  <Box className="card-glow" />
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <AssignmentIcon sx={{ mr: 1, color: 'info.main' }} />
                    Product Roadmap
                  </Typography>
                  
                  {productMilestoneSummary.upcoming?.length > 0 && (
                    <Fade in timeout={1000}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 600, 
                          mt: 1, 
                          mb: 2,
                          color: 'info.main'
                        }}>
                          Upcoming Milestones
                        </Typography>
                        <List>
                          {productMilestoneSummary.upcoming.map((m, index) => (
                            <Zoom in timeout={800 + index * 200} key={m._id}>
                              <ListItem 
                                sx={{ 
                                  borderRadius: 2,
                                  mb: 1,
                                  background: alpha(theme.palette.info.main, 0.05),
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: alpha(theme.palette.info.main, 0.1),
                                    transform: 'translateX(8px)'
                                  }
                                }}
                              >
                                <ListItemAvatar>
                                  <MagicalAvatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.2) }}>
                                    <RocketLaunchIcon color="info" />
                                  </MagicalAvatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={m.name} 
                                  secondary={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography variant="caption">
                                        Due: {formatDate(m.plannedEndDate)}
                                      </Typography>
                                      <Chip 
                                        label={`${m.completionPercentage}%`} 
                                        size="small"
                                        sx={{ 
                                          height: 20,
                                          background: alpha(theme.palette.info.main, 0.2)
                                        }}
                                      />
                                      <Chip 
                                        label={m.status} 
                                        size="small"
                                        sx={{ 
                                          height: 20,
                                          background: alpha(theme.palette.warning.main, 0.2)
                                        }}
                                      />
                                    </Stack>
                                  } 
                                />
                              </ListItem>
                            </Zoom>
                          ))}
                        </List>
                      </Box>
                    </Fade>
                  )}
                  
                  {productMilestoneSummary.recentlyCompleted?.length > 0 && (
                    <Fade in timeout={1200}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 600, 
                          mt: 3, 
                          mb: 2,
                          color: 'success.main'
                        }}>
                          Recently Completed ✨
                        </Typography>
                        <List>
                          {productMilestoneSummary.recentlyCompleted.map((m, index) => (
                            <Zoom in timeout={1000 + index * 200} key={m._id}>
                              <ListItem 
                                sx={{ 
                                  borderRadius: 2,
                                  mb: 1,
                                  background: alpha(theme.palette.success.main, 0.05),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: alpha(theme.palette.success.main, 0.1),
                                    transform: 'translateX(8px)'
                                  }
                                }}
                              >
                                <ListItemAvatar>
                                  <MagicalAvatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.2) }}>
                                    <CheckCircleIcon color="success" />
                                  </MagicalAvatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={m.name} 
                                  secondary={`Completed: ${formatDate(m.actualEndDate)}`} 
                                />
                              </ListItem>
                            </Zoom>
                          ))}
                        </List>
                      </Box>
                    </Fade>
                  )}
                </MagicalDataCard>
              </Grid>
            )}

            {/* Enhanced Fund Utilization */}
            {fundUtilizationSummary && fundUtilizationSummary.topCategories?.length > 0 && (
              <Grid item xs={12} md={6}>
                <MagicalDataCard className="magical-card">
                  <Box className="card-glow" />
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <AccountBalanceIcon sx={{ mr: 1, color: 'warning.main' }} />
                    Fund Utilization Breakdown
                  </Typography>
                  
                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Chip 
                      label={fundUtilizationSummary.period}
                      sx={{ 
                        background: alpha(theme.palette.warning.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                      }}
                    />
                    <Chip 
                      label={`Total: ${formatCurrency(fundUtilizationSummary.totalSpentInPeriod)}`}
                      sx={{ 
                        background: alpha(theme.palette.error.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                      }}
                    />
                  </Stack>
                  
                  <Stack spacing={2}>
                    {fundUtilizationSummary.topCategories.map((cat, index) => (
                      <Fade in timeout={800 + index * 200} key={index}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {cat.category}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                {cat.percentage.toFixed(1)}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({formatCurrency(cat.totalSpent)})
                              </Typography>
                            </Stack>
                          </Stack>
                          <MagicalProgress 
                            variant="determinate" 
                            value={cat.percentage} 
                          />
                        </Box>
                      </Fade>
                    ))}
                  </Stack>
                  
                  <Box sx={{ 
                    mt: 3, 
                    p: 2, 
                    borderRadius: 2, 
                    background: alpha(theme.palette.warning.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      💡 Top spending categories help identify where resources are being allocated
                    </Typography>
                  </Box>
                </MagicalDataCard>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LiveInvestorDashboardPage;