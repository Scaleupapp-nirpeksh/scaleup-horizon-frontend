// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { getUpcomingRecurringTransactions, getRounds, getInvestors, getCapTableSummary, getEsopGrants } from '../services/api';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress, Alert,
  List, ListItem, ListItemText, Chip, Divider, Card, CardContent,
  CardHeader, Avatar, Stack, useTheme, alpha, Fade, Grow, Skeleton,
  LinearProgress, IconButton, Button, Tooltip, Badge, ButtonGroup,
  Zoom, useMediaQuery, Fab, SwipeableDrawer, Tab, Tabs, CardActionArea,
  ToggleButton, ToggleButtonGroup, Collapse, Menu, MenuItem, TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody, Link
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, Area, AreaChart, ComposedChart } from 'recharts';

// Icons
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EventNoteIcon from '@mui/icons-material/EventNote';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SpeedIcon from '@mui/icons-material/Speed';
import InsightsIcon from '@mui/icons-material/Insights';
import AddIcon from '@mui/icons-material/Add';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import WavesIcon from '@mui/icons-material/Waves';
import BoltIcon from '@mui/icons-material/Bolt';
import DiamondIcon from '@mui/icons-material/Diamond';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TimelineIcon from '@mui/icons-material/Timeline';
import HeadcountSummary from '../components/dashboard/HeadcountSummary';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.8); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6); }
`;

// Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' 
    ? '#0a0a0a'
    : `linear-gradient(180deg, 
        ${alpha(theme.palette.background.default, 0.95)} 0%, 
        ${alpha(theme.palette.grey[50], 0.95)} 50%,
        ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 50%),
                 radial-gradient(ellipse at bottom right, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 50%)`,
    pointerEvents: 'none',
    zIndex: 0,
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
    : `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.08)} 0%, 
        ${alpha(theme.palette.secondary.light, 0.05)} 50%,
        ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  backdropFilter: 'blur(20px)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-10%',
    width: '400px',
    height: '400px',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
    animation: `${float} 20s ease-in-out infinite`,
  }
}));

const MetricCard = styled(Card)(({ theme, glowColor = 'primary' }) => ({
  borderRadius: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.8)
    : `linear-gradient(135deg, 
        ${alpha(theme.palette.background.paper, 0.98)} 0%, 
        ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: theme.spacing(3),
    padding: '1px',
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette[glowColor].main, 0.2)} 0%, 
      transparent 50%,
      ${alpha(theme.palette[glowColor].light, 0.1)} 100%)`,
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.01)',
    boxShadow: `0 20px 40px ${alpha(theme.palette[glowColor].main, 0.15)}`,
    '&::before': {
      opacity: 1,
    },
    '& .metric-value': {
      transform: 'scale(1.05)',
    }
  }
}));

const PrimaryMetricCard = styled(MetricCard)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
    ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const LiveIndicator = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(3),
  background: alpha(theme.palette.success.main, 0.1),
  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  '& .dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
    animation: `${pulse} 1.5s ease-in-out infinite`,
    boxShadow: `0 0 10px ${theme.palette.success.main}`,
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.8)
    : alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.08)}`,
  }
}));

const QuickStatCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.98)} 0%, 
    ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateX(4px)',
    borderColor: theme.palette.primary.main,
    '& .arrow-icon': {
      transform: 'translateX(4px)',
    }
  }
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.grey[300], 0.4),
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
}));

const ProgressBar = styled(Box)(({ theme, value, color = 'primary' }) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: `${Math.max(0, Math.min(100, value))}%`,
  backgroundColor: theme.palette[color].main,
  borderRadius: 4,
  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const TransactionItem = styled(Box)(({ theme, type }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: alpha(
    type === 'expense'
      ? theme.palette.error.main
      : theme.palette.success.main,
    0.05
  ),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateX(4px)',
    borderColor: type === 'expense'
      ? theme.palette.error.main
      : theme.palette.success.main
  }
}));

const GlowingBorder = styled(Box)(({ theme, color = 'primary' }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: theme.spacing(3),
    padding: '2px',
    background: `linear-gradient(135deg, 
      ${theme.palette[color].main} 0%, 
      ${theme.palette[color].light} 50%,
      ${theme.palette[color].main} 100%)`,
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    animation: `${pulse} 2s ease-in-out infinite`,
  }
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

// Custom Hook for viewport animation
const useInViewport = (ref, rootMargin = '0px') => {
  const [isInViewport, setIsInViewport] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { rootMargin }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, rootMargin]);
  
  return isInViewport;
};

// Enhanced Animated Number Component
const AnimatedNumber = ({ value, duration = 2000, prefix = '', suffix = '', decimals = 0, format = true }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = 0;
    const endValue = parseFloat(value) || 0;
    
    const updateNumber = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setIsAnimating(false);
      }
    };
    
    updateNumber();
  }, [value, duration]);
  
  const formattedValue = format 
    ? displayValue.toLocaleString(undefined, { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
      })
    : displayValue.toFixed(decimals);
  
  return (
    <span style={{ 
      transition: 'color 0.3s ease',
      color: isAnimating ? 'inherit' : undefined 
    }}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

// Enhanced Metric Card Component
const MetricCardItem = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  subtitle, 
  loading = false, 
  index = 0, 
  trend = null,
  sparklineData = null,
  onClick = null 
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  const trendColor = trend?.value > 0 ? 'success.main' : 'error.main';
  const TrendIcon = trend?.value > 0 ? ArrowUpwardIcon : ArrowDownwardIcon;
  
  return (
    <Grow in={!loading} timeout={300 + index * 100}>
      <MetricCard 
        elevation={0} 
        glowColor={color}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        sx={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="circular" width={56} height={56} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mt: 2 }} />
            <Skeleton variant="text" width="80%" height={40} sx={{ my: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        ) : (
          <Box sx={{ p: 3, position: 'relative' }}>
            {/* Background decoration */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette[color].main, 0.1)} 0%, transparent 70%)`,
                filter: 'blur(20px)',
                transition: 'all 0.4s ease',
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              }}
            />
            
            <Stack spacing={2.5} sx={{ position: 'relative' }}>
              {/* Icon and Title */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette[color].main, 0.1),
                    color: theme.palette[color].main,
                    width: 56,
                    height: 56,
                    transition: 'all 0.4s ease',
                    transform: isHovered ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                    boxShadow: isHovered 
                      ? `0 8px 24px ${alpha(theme.palette[color].main, 0.3)}`
                      : 'none',
                  }}
                >
                  {icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontWeight: 600, 
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      fontSize: '0.7rem'
                    }}
                  >
                    {title}
                  </Typography>
                  {trend && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <TrendIcon sx={{ fontSize: 16, color: trendColor }} />
                      <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>
                        {trend.value > 0 ? '+' : ''}{trend.value}%
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Stack>
              
              {/* Value */}
              <Typography 
                className="metric-value"
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  color: theme.palette[color].dark,
                  transition: 'all 0.3s ease',
                  lineHeight: 1,
                }}
              >
                {value !== null && value !== undefined ? (
                  <AnimatedNumber
                    value={value}
                    prefix={title.includes('Balance') || title.includes('Burn') || title.includes('Funds') || title.includes('Revenue') || title.includes('Income') || title.includes('Valuation') ? '₹' : ''}
                    suffix={title.includes('Ratio') ? '%' : title.includes('Runway') ? ' mo' : ''}
                    decimals={title.includes('Ratio') || title.includes('Runway') ? 1 : 0}
                  />
                ) : (
                  'N/A'
                )}
              </Typography>
              
              {/* Subtitle or Sparkline */}
              {sparklineData ? (
                <Box sx={{ height: 40, mx: -1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={theme.palette[color].main}
                        fill={alpha(theme.palette[color].main, 0.1)}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              ) : subtitle && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    display: 'block',
                    fontWeight: 500
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Stack>
          </Box>
        )}
      </MetricCard>
    </Grow>
  );
};

// Status Badge Component
const StatusBadge = ({ status, size = 'medium' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      healthy: { color: 'success', icon: CheckCircleIcon, label: 'Healthy' },
      warning: { color: 'warning', icon: WarningIcon, label: 'Needs Attention' },
      critical: { color: 'error', icon: WarningIcon, label: 'Critical' },
      info: { color: 'info', icon: InfoIcon, label: 'Info' }
    };
    return configs[status] || configs.info;
  };
  
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Chip
      icon={<Icon />}
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 600 }}
    />
  );
};

// Month Progress Component
const MonthProgress = ({ title, current, previous, loading = false, color = 'primary' }) => {
  const theme = useTheme();
  const percentage = previous > 0 ? (current / previous) * 100 : 0;
  
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {loading ? <Skeleton width={60} /> : `₹${current.toLocaleString()}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {loading ? <Skeleton width={40} /> : `/ ₹${previous.toLocaleString()}`}
          </Typography>
        </Stack>
      </Stack>
      <ProgressContainer>
        {loading ? (
          <Box sx={{ 
            position: 'absolute', 
            left: 0, 
            top: 0, 
            bottom: 0, 
            width: '60%',
            bgcolor: alpha(theme.palette.grey[400], 0.3),
            animation: `${shimmer} 2s infinite linear`
          }} />
        ) : (
          <ProgressBar value={percentage > 100 ? 100 : percentage} color={color} />
        )}
      </ProgressContainer>
    </Box>
  );
};

// Revenue/Expense Comparison Chart
const FinancialTrendChart = ({ data, loading = false }) => {
  const theme = useTheme();
  
  // Format data for the chart
  const chartData = useMemo(() => {
    if (!data || !data.expenses || !data.revenue) return [];
    
    // Combine expense and revenue data by month
    const combinedData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Map both datasets using month as the key
    const expenseMap = new Map();
    data.expenses.forEach(item => {
      expenseMap.set(`${item.year}-${item.month}`, item.amount);
    });
    
    const revenueMap = new Map();
    data.revenue.forEach(item => {
      revenueMap.set(`${item.year}-${item.month}`, item.amount);
    });
    
    // Create combined dataset with all months
    const allKeys = new Set([...expenseMap.keys(), ...revenueMap.keys()]);
    Array.from(allKeys).sort().forEach(key => {
      const [year, month] = key.split('-');
      combinedData.push({
        name: `${months[parseInt(month) - 1]} ${year}`,
        expenses: expenseMap.get(key) || 0,
        revenue: revenueMap.get(key) || 0,
        netIncome: (revenueMap.get(key) || 0) - (expenseMap.get(key) || 0)
      });
    });
    
    return combinedData;
  }, [data]);
  
  if (loading) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ height: 300, mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#888', 0.1)} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis 
            tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
            tick={{ fontSize: 12 }}
          />
          <RechartsTooltip 
            formatter={(value, name) => [`₹${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
            labelFormatter={(label) => `${label}`}
          />
          <Legend />
          <Bar dataKey="expenses" name="Expenses" fill={alpha(theme.palette.error.main, 0.8)} radius={[4, 4, 0, 0]} />
          <Bar dataKey="revenue" name="Revenue" fill={alpha(theme.palette.success.main, 0.8)} radius={[4, 4, 0, 0]} />
          <Line 
            type="monotone" 
            dataKey="netIncome" 
            name="Net Income" 
            stroke={theme.palette.primary.main} 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Main Dashboard Component
const DashboardPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State Management
  const [overviewData, setOverviewData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [upcomingTransactions, setUpcomingTransactions] = useState(null);
  const [fundraisingData, setFundraisingData] = useState({
    rounds: [],
    investors: [],
    capTable: [],
    esopGrants: []
  });
  const [loading, setLoading] = useState({ 
    overview: true, 
    kpi: true, 
    recurring: true, 
    fundraising: true 
  });
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetricPeriod, setSelectedMetricPeriod] = useState('month');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [revenueActiveTab, setRevenueActiveTab] = useState(0);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);

  // Data Fetching
  const fetchData = useCallback(async () => {
    setLoading({ overview: true, kpi: true, recurring: true, fundraising: true });
    setError('');
    
    try {
      const [overviewRes, kpiRes, recurringRes, fundraisingRes] = await Promise.all([
        api.get('/financials/overview'),
        api.get('/kpis/snapshots?limit=1'),
        getUpcomingRecurringTransactions({ days: 30 }),
        Promise.all([
          getRounds(),
          getInvestors(),
          getCapTableSummary(),
          getEsopGrants()
        ])
      ]);
      
      setOverviewData(overviewRes.data);
      setKpiData(kpiRes.data.snapshots?.[0] || null);
      setUpcomingTransactions(recurringRes.data);
      setFundraisingData({
        rounds: fundraisingRes[0].data || [],
        investors: fundraisingRes[1].data || [],
        capTable: fundraisingRes[2].data || [],
        esopGrants: fundraisingRes[3].data || []
      });
      
      setLoading({ overview: false, kpi: false, recurring: false, fundraising: false });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load some dashboard data. Please try refreshing.");
      setLoading({ overview: false, kpi: false, recurring: false, fundraising: false });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculations
  const dauMauRatio = useMemo(() => 
    kpiData?.mau && kpiData?.dau ? (kpiData.dau / kpiData.mau) * 100 : null,
    [kpiData]
  );
  
  const transactionMetrics = useMemo(() => {
    if (!upcomingTransactions?.upcoming) return { total: 0, expenses: 0, income: 0 };
    
    return upcomingTransactions.upcoming.reduce((acc, day) => {
      const dayExpenses = day.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const dayIncome = day.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        total: acc.total + day.transactions.length,
        expenses: acc.expenses + dayExpenses,
        income: acc.income + dayIncome
      };
    }, { total: 0, expenses: 0, income: 0 });
  }, [upcomingTransactions]);

  const fundraisingMetrics = useMemo(() => ({
    activeRounds: fundraisingData.rounds.filter(r => r.status === 'Open').length,
    activeInvestors: fundraisingData.investors.filter(inv => inv.status === 'Invested').length,
    latestValuation: Math.max(...fundraisingData.rounds.map(r => r.currentValuationPreMoney || 0), 0),
    totalOptionsVested: fundraisingData.esopGrants.reduce((sum, grant) => sum + (grant.totalOptionsVested || 0), 0),
    shareholdersCount: new Set(fundraisingData.capTable.map(entry => entry.shareholderName)).size
  }), [fundraisingData]);

  // Health Score Calculation
  const healthScore = useMemo(() => {
    if (!overviewData) return null;
    
    const runway = parseFloat(overviewData.estimatedRunwayMonths) || 0;
    const burnRate = parseFloat(overviewData.averageMonthlyBurnRate) || 0;
    const balance = overviewData.currentTotalBankBalance || 0;
    
    let score = 'healthy';
    if (runway < 6 || (burnRate > 0 && balance / burnRate < 6)) score = 'warning';
    if (runway < 3 || (burnRate > 0 && balance / burnRate < 3)) score = 'critical';
    
    return score;
  }, [overviewData]);

  // Prepare Revenue Trend Data
  const revenueTrendData = useMemo(() => {
    if (!overviewData?.historicalData?.revenue) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return overviewData.historicalData.revenue.map(item => ({
      name: months[item.month - 1],
      value: item.amount
    }));
  }, [overviewData]);

  // Calculate Growth Rates
  const revenueGrowth = useMemo(() => {
    if (!overviewData?.historicalData?.revenue || overviewData.historicalData.revenue.length < 2) return 0;
    
    const sortedRevenue = [...overviewData.historicalData.revenue].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    if (sortedRevenue.length >= 2) {
      const current = sortedRevenue[sortedRevenue.length - 1].amount;
      const previous = sortedRevenue[sortedRevenue.length - 2].amount;
      
      if (previous > 0) {
        return ((current - previous) / previous) * 100;
      }
    }
    
    return 0;
  }, [overviewData]);

  // Cap Table Chart Data
  const capTableChartData = useMemo(() => {
    const totalShares = fundraisingData.capTable.reduce((sum, e) => sum + (e.numberOfShares || 0), 0);
    return fundraisingData.capTable
      .slice(0, 5)
      .map(entry => ({
        name: entry.shareholderName,
        value: totalShares > 0 ? (entry.numberOfShares / totalShares) * 100 : 0
      }))
      .filter(entry => entry.value > 0);
  }, [fundraisingData.capTable]);

  const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  // Initial Loading
  if (loading.overview && loading.kpi && loading.recurring && loading.fundraising && !overviewData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: theme.palette.background.default
      }}>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ position: 'relative' }}>
            <CircularProgress 
              size={80} 
              thickness={1} 
              sx={{ color: alpha(theme.palette.primary.main, 0.2) }} 
            />
            <CircularProgress 
              disableShrink
              size={80} 
              thickness={2}
              sx={{ 
                position: 'absolute',
                left: 0,
                animationDuration: '1s',
                color: theme.palette.primary.main
              }} 
            />
            <RocketLaunchIcon 
              sx={{ 
                fontSize: 32, 
                color: 'primary.main',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `${float} 2s ease-in-out infinite`
              }} 
            />
          </Box>
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 300 }}>
            Preparing your command center...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <DashboardContainer>
      {/* Hero Section */}
      <HeroSection sx={{ py: { xs: 3, md: 5 }, mb: { xs: 3, md: 4 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography 
                  variant={isMobile ? "h4" : "h3"} 
                  sx={{ 
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Welcome back, {user?.name?.split(' ')[0] || 'Founder'}!
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <LiveIndicator>
                    <Box className="dot" />
                    <Typography variant="caption" color="success.dark" sx={{ fontWeight: 600 }}>
                      REAL-TIME DATA
                    </Typography>
                  </LiveIndicator>
                  {healthScore && <StatusBadge status={healthScore} />}
                </Stack>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Filter
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon sx={{ 
                    animation: refreshing ? `${rotate} 0.8s linear infinite` : 'none' 
                  }} />}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {refreshing ? 'Updating...' : 'Refresh'}
                </Button>
                <IconButton
                  onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
                  sx={{ 
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>

          {/* Key Vitals Bar */}
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={2}>
              {[
                {
                  label: 'Bank Balance',
                  value: overviewData?.currentTotalBankBalance,
                  prefix: '₹',
                  color: 'success',
                  icon: <AccountBalanceIcon />,
                  loading: loading.overview
                },
                {
                  label: 'Monthly Burn',
                  value: overviewData?.averageMonthlyBurnRate,
                  prefix: '₹',
                  color: 'error',
                  icon: <WhatshotIcon />,
                  loading: loading.overview
                },
                {
                  label: 'Runway',
                  value: overviewData?.estimatedRunwayMonths !== "N/A (No Burn or No Funds)" 
                    ? overviewData?.estimatedRunwayMonths 
                    : null,
                  suffix: ' months',
                  color: 'warning',
                  icon: <AccessTimeIcon />,
                  loading: loading.overview
                },
                {
                  label: 'Monthly Revenue',
                  value: overviewData?.averageMonthlyRevenue,
                  prefix: '₹',
                  color: 'primary',
                  icon: <TrendingUpIcon />,
                  loading: loading.overview
                }
              ].map((vital, index) => (
                <Grid item xs={6} md={3} key={vital.label}>
                  <QuickStatCard>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: alpha(theme.palette[vital.color].main, 0.1),
                          color: theme.palette[vital.color].main,
                          width: 48,
                          height: 48
                        }}
                      >
                        {vital.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {vital.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette[vital.color].dark }}>
                          {vital.loading ? (
                            <Skeleton width={100} />
                          ) : vital.value !== null ? (
                            <AnimatedNumber 
                              value={vital.value} 
                              prefix={vital.prefix} 
                              suffix={vital.suffix}
                              decimals={vital.suffix === ' months' ? 1 : 0}
                            />
                          ) : (
                            'N/A'
                          )}
                        </Typography>
                      </Box>
                      <NavigateNextIcon className="arrow-icon" sx={{ transition: 'all 0.3s ease' }} />
                    </Stack>
                  </QuickStatCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pb: 4, position: 'relative', zIndex: 1 }}>
        {error && (
          <Zoom in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                background: alpha(theme.palette.error.main, 0.1),
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Zoom>
        )}

        {/* Main Dashboard Grid */}
        <Grid container spacing={4}>
          {/* Left Column - Key Metrics */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              {/* Financial Metrics */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    <MonetizationOnIcon sx={{ mr: 1.5 }} />
                    Financial Overview
                  </Typography>
                  <ToggleButtonGroup
                    value={selectedMetricPeriod}
                    exclusive
                    onChange={(e, newPeriod) => newPeriod && setSelectedMetricPeriod(newPeriod)}
                    size="small"
                  >
                    <ToggleButton value="week">Week</ToggleButton>
                    <ToggleButton value="month">Month</ToggleButton>
                    <ToggleButton value="quarter">Quarter</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCardItem
                      title="Total Balance"
                      value={overviewData?.currentTotalBankBalance}
                      icon={<AccountBalanceIcon />}
                      color="success"
                      subtitle="Across all accounts"
                      loading={loading.overview}
                      trend={{ value: 12.5 }}
                      index={0}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCardItem
                      title="Burn Rate"
                      value={overviewData?.averageMonthlyBurnRate}
                      icon={<LocalFireDepartmentIcon />}
                      color="error"
                      subtitle="Monthly average"
                      loading={loading.overview}
                      trend={{ value: -8.3 }}
                      index={1}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCardItem
                      title="Runway"
                      value={overviewData?.estimatedRunwayMonths !== "N/A (No Burn or No Funds)" 
                        ? overviewData?.estimatedRunwayMonths 
                        : null}
                      icon={<RocketLaunchIcon />}
                      color="warning"
                      subtitle="At current burn"
                      loading={loading.overview}
                      index={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCardItem
                      title="Total Raised"
                      value={overviewData?.totalFundsReceivedFromRounds}
                      icon={<TrendingUpIcon />}
                      color="info"
                      subtitle="All rounds"
                      loading={loading.overview}
                      trend={{ value: 45.2 }}
                      index={3}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Revenue Metrics */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon sx={{ mr: 1.5 }} />
                    Revenue Analysis
                  </Typography>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCardItem
                      title="Monthly Revenue"
                      value={overviewData?.averageMonthlyRevenue}
                      icon={<AttachMoneyIcon />}
                      color="success"
                      subtitle="3-month average"
                      loading={loading.overview}
                      trend={{ value: revenueGrowth ? parseFloat(revenueGrowth.toFixed(1)) : 0 }}
                      index={0}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCardItem
                      title="Net Income"
                      value={overviewData?.netMonthlyIncome}
                      icon={<CompareArrowsIcon />}
                      color={parseFloat(overviewData?.netMonthlyIncome) >= 0 ? "primary" : "error"}
                      subtitle="Revenue - Expenses"
                      loading={loading.overview}
                      index={1}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCardItem
                      title="YTD Revenue"
                      value={overviewData?.currentYear?.revenue || 0}
                      icon={<TimelineIcon />}
                      color="info"
                      subtitle="This year"
                      loading={loading.overview}
                      index={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MetricCardItem
                      title="MTD Revenue"
                      value={overviewData?.currentMonth?.revenue || 0}
                      icon={<EqualizerIcon />}
                      color="secondary"
                      subtitle="This month"
                      loading={loading.overview}
                      index={3}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Revenue/Expense Chart */}
              <StatsCard>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Revenue vs. Expenses
                </Typography>
                <FinancialTrendChart 
                  data={overviewData?.historicalData} 
                  loading={loading.overview} 
                />
              </StatsCard>

              {/* Month-to-Date Progress */}
              <StatsCard>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Current Month Progress
                  </Typography>
                  <Chip
                    label={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    color="primary"
                    size="small"
                  />
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.success.main, fontWeight: 600 }}>
                        Revenue
                      </Typography>
                      <MonthProgress
                        title="MTD Revenue"
                        current={overviewData?.currentMonth?.revenue || 0}
                        previous={parseFloat(overviewData?.averageMonthlyRevenue) || 0}
                        loading={loading.overview}
                        color="success"
                      />
                      <MonthProgress
                        title="YTD Revenue"
                        current={overviewData?.currentYear?.revenue || 0}
                        previous={(parseFloat(overviewData?.averageMonthlyRevenue) || 0) * 12}
                        loading={loading.overview}
                        color="success"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.error.main, fontWeight: 600 }}>
                        Expenses
                      </Typography>
                      <MonthProgress
                        title="MTD Expenses"
                        current={overviewData?.currentMonth?.expenses || 0}
                        previous={parseFloat(overviewData?.averageMonthlyBurnRate) || 0}
                        loading={loading.overview}
                        color="error"
                      />
                      <MonthProgress
                        title="YTD Expenses"
                        current={overviewData?.currentYear?.expenses || 0}
                        previous={(parseFloat(overviewData?.averageMonthlyBurnRate) || 0) * 12}
                        loading={loading.overview}
                        color="error"
                      />
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                  Net Income
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                          <CalendarMonthIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Current Month Net Income
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: (overviewData?.currentMonth?.netIncome || 0) >= 0 ? 'success.main' : 'error.main'
                          }}>
                            {loading.overview ? (
                              <Skeleton width={80} />
                            ) : (
                              `₹${(overviewData?.currentMonth?.netIncome || 0).toLocaleString()}`
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.02)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                    }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                          <BoltIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Year-to-Date Net Income
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: (overviewData?.currentYear?.netIncome || 0) >= 0 ? 'success.main' : 'error.main'
                          }}>
                            {loading.overview ? (
                              <Skeleton width={80} />
                            ) : (
                              `₹${(overviewData?.currentYear?.netIncome || 0).toLocaleString()}`
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </StatsCard>

              {/* Headcount Overview */}
              <Box>
                <HeadcountSummary />
              </Box>

              {/* Tabs for Different Sections */}
              <Box>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{ mb: 3 }}
                >
                  <Tab label="User Metrics" icon={<InsightsIcon />} iconPosition="start" />
                  <Tab label="Fundraising" icon={<BusinessCenterIcon />} iconPosition="start" />
                  <Tab label="Transactions" icon={<AutorenewIcon />} iconPosition="start" />
                </Tabs>

                {/* User Metrics Tab */}
                <TabPanel value={activeTab} index={0}>
                  {kpiData ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <MetricCardItem
                          title="Total Users"
                          value={kpiData.totalRegisteredUsers}
                          icon={<PeopleAltIcon />}
                          color="primary"
                          subtitle="All time"
                          loading={loading.kpi}
                          trend={{ value: 23.5 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <MetricCardItem
                          title="Daily Active"
                          value={kpiData.dau}
                          icon={<GroupAddIcon />}
                          color="secondary"
                          subtitle="Today"
                          loading={loading.kpi}
                          trend={{ value: 15.2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <MetricCardItem
                          title="Monthly Active"
                          value={kpiData.mau}
                          icon={<PeopleAltIcon />}
                          color="info"
                          subtitle="This month"
                          loading={loading.kpi}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <MetricCardItem
                          title="DAU/MAU Ratio"
                          value={dauMauRatio}
                          icon={<DataUsageIcon />}
                          color="warning"
                          subtitle="Engagement"
                          loading={loading.kpi}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <StatsCard sx={{ textAlign: 'center', py: 8 }}>
                      <AnalyticsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No KPI Data Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Start tracking your key performance indicators
                      </Typography>
                      <Button variant="outlined" startIcon={<AddIcon />}>
                        Add KPI Snapshot
                      </Button>
                    </StatsCard>
                  )}
                </TabPanel>

                {/* Fundraising Tab */}
                <TabPanel value={activeTab} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCardItem
                        title="Active Rounds"
                        value={fundraisingMetrics.activeRounds}
                        icon={<GroupWorkIcon />}
                        color="primary"
                        subtitle="Currently open"
                        loading={loading.fundraising}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCardItem
                        title="Investors"
                        value={fundraisingMetrics.activeInvestors}
                        icon={<PeopleAltIcon />}
                        color="secondary"
                        subtitle="Committed"
                        loading={loading.fundraising}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCardItem
                        title="Valuation"
                        value={fundraisingMetrics.latestValuation}
                        icon={<TrendingUpIcon />}
                        color="success"
                        subtitle="Pre-money"
                        loading={loading.fundraising}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCardItem
                        title="ESOP Vested"
                        value={fundraisingMetrics.totalOptionsVested}
                        icon={<EmojiEventsIcon />}
                        color="warning"
                        subtitle="Options"
                        loading={loading.fundraising}
                      />
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Transactions Tab */}
                <TabPanel value={activeTab} index={2}>
                  <StatsCard>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Upcoming Recurring (30 days)
                      </Typography>
                      <Chip 
                        label={`${transactionMetrics.total} transactions`}
                        color="primary"
                        size="small"
                      />
                    </Stack>

                    {loading.recurring ? (
                      <Stack spacing={2}>
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                        ))}
                      </Stack>
                    ) : upcomingTransactions?.upcoming?.length > 0 ? (
                      <>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12} sm={4}>
                            <Paper sx={{ 
                              p: 2.5, 
                              textAlign: 'center',
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                            }}>
                              <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
                                ₹{transactionMetrics.expenses.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total Expenses
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Paper sx={{ 
                              p: 2.5, 
                              textAlign: 'center',
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                            }}>
                              <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
                                ₹{transactionMetrics.income.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total Income
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Paper sx={{ 
                              p: 2.5, 
                              textAlign: 'center',
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                            }}>
                              <Typography variant="h5" color="info.main" sx={{ fontWeight: 700 }}>
                                ₹{(transactionMetrics.income - transactionMetrics.expenses).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Net Cash Flow
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>

                        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                          <Stack spacing={2}>
                            {upcomingTransactions.upcoming.slice(0, 7).map((day, index) => (
                              <Fade in timeout={index * 100} key={day.date}>
                                <Box>
                                  <Chip
                                    label={new Date(day.date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                    size="small"
                                    sx={{ mb: 1.5 }}
                                  />
                                  <Stack spacing={1}>
                                    {day.transactions.map((tx) => (
                                      <Paper
                                        key={tx.recurringId}
                                        sx={{
                                          p: 2,
                                          borderRadius: 2,
                                          background: alpha(
                                            tx.type === 'expense' 
                                              ? theme.palette.error.main 
                                              : theme.palette.success.main, 
                                            0.02
                                          ),
                                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                          transition: 'all 0.2s ease',
                                          '&:hover': {
                                            transform: 'translateX(4px)',
                                            borderColor: tx.type === 'expense' 
                                              ? theme.palette.error.main 
                                              : theme.palette.success.main
                                          }
                                        }}
                                      >
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                          <Avatar
                                            sx={{
                                              bgcolor: alpha(
                                                tx.type === 'expense' 
                                                  ? theme.palette.error.main 
                                                  : theme.palette.success.main, 
                                                0.1
                                              ),
                                              color: tx.type === 'expense' 
                                                ? 'error.main' 
                                                : 'success.main'
                                            }}
                                          >
                                            {tx.type === 'expense' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                                          </Avatar>
                                          <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                              {tx.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {tx.category || tx.type}
                                            </Typography>
                                          </Box>
                                          <Typography 
                                            variant="h6" 
                                            sx={{ 
                                              fontWeight: 700,
                                              color: tx.type === 'expense' ? 'error.main' : 'success.main'
                                            }}
                                          >
                                            {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                          </Typography>
                                        </Stack>
                                      </Paper>
                                    ))}
                                  </Stack>
                                </Box>
                              </Fade>
                            ))}
                          </Stack>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <EventNoteIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">
                          No upcoming recurring transactions
                        </Typography>
                      </Box>
                    )}
                  </StatsCard>
                </TabPanel>
              </Box>
            </Stack>
          </Grid>

          {/* Right Column - Charts and Insights */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              {/* Recent Revenue Transactions */}
              <StatsCard>
                <Box sx={{ mb: 2 }}>
                  <Tabs
                    value={revenueActiveTab}
                    onChange={(e, newValue) => setRevenueActiveTab(newValue)}
                    variant="fullWidth"
                    sx={{ mb: 2 }}
                  >
                    <Tab label="Revenue" />
                    <Tab label="Expenses" />
                  </Tabs>
                </Box>

                {revenueActiveTab === 0 ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Recent Revenue
                      </Typography>
                      <Chip
                        label={`${overviewData?.latestTransactions?.revenue?.length || 0} entries`}
                        color="success"
                        size="small"
                      />
                    </Box>

                    {loading.overview ? (
                      <Stack spacing={2}>
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                        ))}
                      </Stack>
                    ) : overviewData?.latestTransactions?.revenue?.length > 0 ? (
                      <Box sx={{ maxHeight: 450, overflowY: 'auto' }}>
                        <Stack spacing={2}>
                          {overviewData.latestTransactions.revenue.map((revenue, index) => (
                            <Fade in timeout={index * 100} key={revenue._id}>
                              <TransactionItem type="revenue">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar
                                    sx={{
                                      bgcolor: alpha(theme.palette.success.main, 0.1),
                                      color: 'success.main'
                                    }}
                                  >
                                    <TrendingUpIcon />
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {revenue.description}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography variant="caption" color="text.secondary">
                                        {new Date(revenue.date).toLocaleDateString()}
                                      </Typography>
                                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                                      <Chip 
                                        label={revenue.source} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.6rem' }}
                                      />
                                    </Stack>
                                  </Box>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 700,
                                      color: 'success.main'
                                    }}
                                  >
                                    +₹{revenue.amount.toLocaleString()}
                                  </Typography>
                                </Stack>
                              </TransactionItem>
                            </Fade>
                          ))}
                        </Stack>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <TrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">
                          No recent revenue transactions
                        </Typography>
                      </Box>
                    )}

                    {overviewData?.latestTransactions?.revenue?.length > 0 && (
                      <Button
                        fullWidth
                        variant="outlined"
                        endIcon={<ArrowForwardIcon />}
                        sx={{ mt: 2, borderRadius: 2 }}
                        onClick={() => navigate('/financials')}
                      >
                        View All Revenue
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Recent Expenses
                      </Typography>
                      <Chip
                        label={`${overviewData?.latestTransactions?.expenses?.length || 0} entries`}
                        color="error"
                        size="small"
                      />
                    </Box>

                    {loading.overview ? (
                      <Stack spacing={2}>
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                        ))}
                      </Stack>
                    ) : overviewData?.latestTransactions?.expenses?.length > 0 ? (
                      <Box sx={{ maxHeight: 450, overflowY: 'auto' }}>
                        <Stack spacing={2}>
                          {overviewData.latestTransactions.expenses.map((expense, index) => (
                            <Fade in timeout={index * 100} key={expense._id}>
                              <TransactionItem type="expense">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar
                                    sx={{
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      color: 'error.main'
                                    }}
                                  >
                                    <TrendingDownIcon />
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {expense.description}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography variant="caption" color="text.secondary">
                                        {new Date(expense.date).toLocaleDateString()}
                                      </Typography>
                                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                                      <Chip 
                                        label={expense.category} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.6rem' }}
                                      />
                                    </Stack>
                                  </Box>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 700,
                                      color: 'error.main'
                                    }}
                                  >
                                    -₹{expense.amount.toLocaleString()}
                                  </Typography>
                                </Stack>
                              </TransactionItem>
                            </Fade>
                          ))}
                        </Stack>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <TrendingDownIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">
                          No recent expense transactions
                        </Typography>
                      </Box>
                    )}

                    {overviewData?.latestTransactions?.expenses?.length > 0 && (
                      <Button
                        fullWidth
                        variant="outlined"
                        endIcon={<ArrowForwardIcon />}
                        sx={{ mt: 2, borderRadius: 2 }}
                        onClick={() => navigate('/financials')}
                      >
                        View All Expenses
                      </Button>
                    )}
                  </>
                )}
              </StatsCard>

              {/* Revenue Trend */}
              <StatsCard>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Monthly Revenue Trend
                </Typography>
                <Box sx={{ height: 200 }}>
                  {loading.overview ? (
                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress size={30} thickness={4} />
                    </Box>
                  ) : revenueTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueTrendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#888', 0.1)} />
                        <XAxis dataKey="name" />
                        <YAxis 
                          tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                        />
                        <RechartsTooltip 
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Bar 
                          dataKey="value" 
                          fill={theme.palette.success.main}
                          radius={[4, 4, 0, 0]}
                          name="Revenue"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No revenue trend data available
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {revenueTrendData.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      {revenueGrowth > 0 ? (
                        <Typography component="span" color="success.main" sx={{ fontWeight: 600 }}>
                          +{revenueGrowth.toFixed(1)}% growth
                        </Typography>
                      ) : (
                        <Typography component="span" color="error.main" sx={{ fontWeight: 600 }}>
                          {revenueGrowth.toFixed(1)}% change
                        </Typography>
                      )}
                      {' '}from previous month
                    </Typography>
                  </Box>
                )}
              </StatsCard>

              {/* Cap Table Visualization */}
              {capTableChartData.length > 0 && (
                <StatsCard>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Ownership Distribution
                  </Typography>
                  <Box sx={{ height: 200, mb: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={capTableChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {capTableChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Stack spacing={1}>
                    {capTableChartData.map((entry, index) => (
                      <Stack key={entry.name} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: CHART_COLORS[index % CHART_COLORS.length]
                            }}
                          />
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {entry.name}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entry.value.toFixed(1)}%
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </StatsCard>
              )}

              {/* Financial Health Score */}
              <StatsCard>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Financial Health Score
                </Typography>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={healthScore === 'healthy' ? 85 : healthScore === 'warning' ? 50 : 20}
                      size={120}
                      thickness={4}
                      sx={{ 
                        color: healthScore === 'healthy' 
                          ? theme.palette.success.main 
                          : healthScore === 'warning' 
                            ? theme.palette.warning.main 
                            : theme.palette.error.main
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
                      }}
                    >
                      <Stack alignItems="center">
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {healthScore === 'healthy' ? 'A+' : healthScore === 'warning' ? 'B' : 'C'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {healthScore?.toUpperCase()}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
                
                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Runway Status
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {overviewData?.estimatedRunwayMonths !== "N/A (No Burn or No Funds)" 
                          ? `${overviewData?.estimatedRunwayMonths} months`
                          : 'N/A'}
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((parseFloat(overviewData?.estimatedRunwayMonths) || 0) / 12 * 100, 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={parseFloat(overviewData?.estimatedRunwayMonths) > 6 ? 'success' : 'warning'}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Revenue to Expense Ratio
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {loading.overview ? <Skeleton width={40} /> : (
                          overviewData?.averageMonthlyBurnRate > 0 
                            ? `${((parseFloat(overviewData?.averageMonthlyRevenue) / parseFloat(overviewData?.averageMonthlyBurnRate)) * 100).toFixed(1)}%`
                            : 'N/A'
                        )}
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(
                        (parseFloat(overviewData?.averageMonthlyRevenue) / parseFloat(overviewData?.averageMonthlyBurnRate)) * 100 || 0, 
                        100
                      )}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={parseFloat(overviewData?.averageMonthlyRevenue) > parseFloat(overviewData?.averageMonthlyBurnRate) 
                        ? 'success' 
                        : 'warning'
                      }
                    />
                  </Box>
                </Stack>
              </StatsCard>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* More Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
      >
        <MenuItem onClick={() => setMoreMenuAnchor(null)}>
          <PrintIcon sx={{ mr: 2 }} /> Print Dashboard
        </MenuItem>
        <MenuItem onClick={() => setMoreMenuAnchor(null)}>
          <DownloadIcon sx={{ mr: 2 }} /> Export PDF
        </MenuItem>
        <MenuItem onClick={() => setMoreMenuAnchor(null)}>
          <ShareIcon sx={{ mr: 2 }} /> Share Dashboard
        </MenuItem>
      </Menu>
    </DashboardContainer>
  );
};

export default DashboardPage;