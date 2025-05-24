// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api, { getUpcomingRecurringTransactions } from '../services/api';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress, Alert,
  List, ListItem, ListItemText, Chip, Divider, Card, CardContent,
  CardHeader, Avatar, Stack, useTheme, alpha, Fade, Grow, Skeleton,
  LinearProgress, IconButton, Button, Tooltip, Badge, ButtonGroup,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

// Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const MetricCard = styled(Paper)(({ theme, colorType }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette[colorType].light, 0.15)} 0%, ${alpha(theme.palette[colorType].main, 0.08)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette[colorType].main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: theme.shadows[8],
    '& .metric-icon': {
      transform: 'rotate(5deg) scale(1.1)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: alpha(theme.palette[colorType].main, 0.1),
  }
}));

const AnimatedNumber = ({ value, duration = 1000, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const endValue = parseFloat(value) || 0;
    
    const updateNumber = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const currentValue = progress * endValue;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };
    
    updateNumber();
  }, [value, duration]);
  
  return (
    <span>
      {prefix}{displayValue.toLocaleString(undefined, { maximumFractionDigits: value % 1 !== 0 ? 1 : 0 })}{suffix}
    </span>
  );
};

const PulsingDot = styled(Box)(({ theme, color = 'primary' }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette[color].main,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: theme.palette[color].main,
    animation: 'pulse 2s ease-out infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2)',
      opacity: 0,
    },
  },
}));

const TransactionItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: 'translateX(8px)',
  }
}));

// Chart Colors
const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// Enhanced StatCard Component
const EnhancedStatCard = ({ title, value, icon, unit = '', color = 'primary', trend, loading = false }) => {
  const theme = useTheme();
  const isPositive = trend && trend > 0;
  
  return (
    <MetricCard colorType={color} elevation={0}>
      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="80%" height={36} />
        </Stack>
      ) : (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                {title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette[color].dark, mt: 0.5 }}>
                {value !== null && value !== undefined ? (
                  <AnimatedNumber value={value} prefix={unit === '₹' ? '₹' : ''} suffix={unit !== '₹' ? unit : ''} />
                ) : 'N/A'}
              </Typography>
              {trend !== undefined && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                  {isPositive ? (
                    <ArrowUpwardIcon fontSize="small" color="success" />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" color="error" />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: isPositive ? 'success.main' : 'error.main',
                      fontWeight: 600
                    }}
                  >
                    {Math.abs(trend)}% from last month
                  </Typography>
                </Stack>
              )}
            </Box>
            <Avatar
              className="metric-icon"
              sx={{
                bgcolor: alpha(theme.palette[color].main, 0.2),
                color: theme.palette[color].main,
                width: 48,
                height: 48,
                position: 'relative',
                zIndex: 1,
                transition: 'transform 0.3s ease'
              }}
            >
              {icon}
            </Avatar>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.random() * 100}
            sx={{
              mt: 2,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette[color].main, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.palette[color].main,
                borderRadius: 1.5,
              }
            }}
          />
        </>
      )}
    </MetricCard>
  );
};

// Alert Component
const AlertCard = ({ type = 'info', title, message, icon }) => {
  const theme = useTheme();
  const colors = {
    info: theme.palette.info,
    warning: theme.palette.warning,
    error: theme.palette.error,
    success: theme.palette.success
  };
  
  const icons = {
    info: <InfoIcon />,
    warning: <WarningAmberIcon />,
    error: <WarningAmberIcon />,
    success: <CheckCircleIcon />
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(colors[type].main, 0.3)}`,
        backgroundColor: alpha(colors[type].main, 0.05),
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateX(8px)',
          borderColor: colors[type].main,
          boxShadow: `0 4px 20px ${alpha(colors[type].main, 0.2)}`,
        }
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: alpha(colors[type].main, 0.1), color: colors[type].main }}>
          {icon || icons[type]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: colors[type].dark }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>
        <PulsingDot color={type} />
      </Stack>
    </Paper>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [overviewData, setOverviewData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [upcomingTransactions, setUpcomingTransactions] = useState(null);
  const [loading, setLoading] = useState({ overview: true, kpi: true, recurring: true });
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const fetchData = useCallback(async () => {
    setLoading(prev => ({ ...prev, overview: true, kpi: true, recurring: true }));
    setError('');
    try {
      const overviewPromise = api.get('/financials/overview').then(res => setOverviewData(res.data));
      const kpiPromise = api.get('/kpis/snapshots?limit=1').then(res => {
        if (res.data.snapshots && res.data.snapshots.length > 0) setKpiData(res.data.snapshots[0]);
        else setKpiData({});
      });
      const recurringPromise = getUpcomingRecurringTransactions({ days: 30 }).then(res => setUpcomingTransactions(res.data));

      await Promise.all([overviewPromise, kpiPromise, recurringPromise]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load some dashboard data. Please try refreshing.");
    } finally {
      setLoading({ overview: false, kpi: false, recurring: false });
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

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, users: 1200 },
    { month: 'Feb', revenue: 52000, expenses: 35000, users: 1500 },
    { month: 'Mar', revenue: 48000, expenses: 33000, users: 1800 },
    { month: 'Apr', revenue: 61000, expenses: 38000, users: 2200 },
    { month: 'May', revenue: 55000, expenses: 36000, users: 2600 },
    { month: 'Jun', revenue: 67000, expenses: 40000, users: 3100 },
  ];

  const engagementData = [
    { name: 'Highly Active', value: 35, color: CHART_COLORS.success },
    { name: 'Active', value: 45, color: CHART_COLORS.primary },
    { name: 'Occasional', value: 15, color: CHART_COLORS.warning },
    { name: 'Inactive', value: 5, color: CHART_COLORS.error }
  ];

  const isLoadingOverall = loading.overview || loading.kpi || loading.recurring;

  if (isLoadingOverall && !overviewData && !kpiData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      {/* Hero Section */}
      <Box sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        py: 4,
        mb: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.05),
        }
      }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', mb: 1 }}>
                Welcome back, {user?.name}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Here's what's happening with your business today
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <ButtonGroup variant="outlined" size="small">
                <Button 
                  onClick={() => setSelectedPeriod('week')}
                  variant={selectedPeriod === 'week' ? 'contained' : 'outlined'}
                >
                  Week
                </Button>
                <Button 
                  onClick={() => setSelectedPeriod('month')}
                  variant={selectedPeriod === 'month' ? 'contained' : 'outlined'}
                >
                  Month
                </Button>
                <Button 
                  onClick={() => setSelectedPeriod('year')}
                  variant={selectedPeriod === 'year' ? 'contained' : 'outlined'}
                >
                  Year
                </Button>
              </ButtonGroup>
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 }
                  }}
                >
                  <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          </Fade>
        )}

        {/* Key Metrics Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Financial Metrics */}
          <Grid item xs={12} lg={6}>
            <Grow in timeout={500}>
              <GlassCard>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                      <MonetizationOnIcon />
                    </Avatar>
                  }
                  title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Financial Health</Typography>}
                  subheader="Real-time financial metrics"
                  action={
                    <IconButton size="small">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  }
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <EnhancedStatCard
                        title="Total Bank Balance"
                        value={overviewData?.currentTotalBankBalance}
                        unit="₹"
                        icon={<AccountBalanceIcon />}
                        color="success"
                        trend={12}
                        loading={loading.overview}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <EnhancedStatCard
                        title="Monthly Burn Rate"
                        value={overviewData?.averageMonthlyBurnRate}
                        unit="₹"
                        icon={<TrendingDownIcon />}
                        color="error"
                        trend={-8}
                        loading={loading.overview}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <EnhancedStatCard
                        title="Runway"
                        value={overviewData?.estimatedRunwayMonths !== "N/A (No Burn or No Funds)" ? overviewData?.estimatedRunwayMonths : 0}
                        unit=" months"
                        icon={<HourglassTopIcon />}
                        color="warning"
                        loading={loading.overview}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <EnhancedStatCard
                        title="Total Funds Raised"
                        value={overviewData?.totalFundsReceivedFromRounds}
                        unit="₹"
                        icon={<TrendingUpIcon />}
                        color="info"
                        trend={25}
                        loading={loading.overview}
                      />
                    </Grid>
                  </Grid>

                  {/* Mini Chart */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Revenue vs Expenses Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height={150}>
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.error} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={CHART_COLORS.error} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                        <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: alpha(theme.palette.background.paper, 0.95),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            borderRadius: 8,
                            boxShadow: theme.shadows[4]
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke={CHART_COLORS.success}
                          fillOpacity={1}
                          fill="url(#revenueGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stroke={CHART_COLORS.error}
                          fillOpacity={1}
                          fill="url(#expenseGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </GlassCard>
            </Grow>
          </Grid>

          {/* User Metrics */}
          <Grid item xs={12} lg={6}>
            <Grow in timeout={700}>
              <GlassCard>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                      <ShowChartIcon />
                    </Avatar>
                  }
                  title={<Typography variant="h6" sx={{ fontWeight: 600 }}>User Analytics</Typography>}
                  subheader="Engagement and growth metrics"
                  action={
                    <Chip
                      label="Live"
                      size="small"
                      color="success"
                      icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />}
                    />
                  }
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <EnhancedStatCard
                        title="Total Users"
                        value={kpiData?.totalRegisteredUsers}
                        icon={<PeopleAltIcon />}
                        color="primary"
                        trend={15}
                        loading={loading.kpi}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <EnhancedStatCard
                        title="Daily Active Users"
                        value={kpiData?.dau}
                        icon={<GroupAddIcon />}
                        color="secondary"
                        trend={8}
                        loading={loading.kpi}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <EnhancedStatCard
                        title="Monthly Active Users"
                        value={kpiData?.mau}
                        icon={<PeopleAltIcon />}
                        color="info"
                        trend={12}
                        loading={loading.kpi}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <EnhancedStatCard
                        title="DAU/MAU Ratio"
                        value={kpiData?.mau && kpiData?.dau ? ((kpiData.dau / kpiData.mau) * 100).toFixed(1) : 0}
                        unit="%"
                        icon={<BarChartIcon />}
                        color="warning"
                        loading={loading.kpi}
                      />
                    </Grid>
                  </Grid>

                  {/* User Growth Chart */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      User Growth Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                        <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} />
                        <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: alpha(theme.palette.background.paper, 0.95),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            borderRadius: 8,
                            boxShadow: theme.shadows[4]
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke={CHART_COLORS.primary}
                          strokeWidth={3}
                          dot={{ fill: CHART_COLORS.primary, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </GlassCard>
            </Grow>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Grid container spacing={3}>
          {/* Upcoming Transactions */}
          <Grid item xs={12} lg={8}>
            <Grow in timeout={900}>
              <GlassCard>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                      <AutorenewIcon />
                    </Avatar>
                  }
                  title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Upcoming Recurring Transactions</Typography>}
                  subheader="Next 30 days"
                  action={
                    <Chip
                      label={upcomingTransactions?.upcoming?.length || 0}
                      size="small"
                      color="primary"
                    />
                  }
                />
                <CardContent sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {loading.recurring ? (
                    <Stack spacing={2}>
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                      ))}
                    </Stack>
                  ) : upcomingTransactions?.upcoming?.length > 0 ? (
                    <List disablePadding>
                      {upcomingTransactions.upcoming.map((day, dayIndex) => (
                        <Fade in timeout={dayIndex * 100} key={day.date}>
                          <Box sx={{ mb: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                              <CalendarMonthIcon fontSize="small" color="action" />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {new Date(day.date).toLocaleDateString('en-GB', {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </Typography>
                              <Chip
                                label={`${day.transactions.length} transactions`}
                                size="small"
                                variant="outlined"
                              />
                            </Stack>
                            <Stack spacing={1}>
                              {day.transactions.map((tx, txIndex) => (
                                <TransactionItem
                                  key={tx.recurringId}
                                  disableGutters
                                  sx={{
                                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    px: 2,
                                    py: 1.5
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                                    <Avatar
                                      sx={{
                                        bgcolor: alpha(tx.type === 'expense' ? theme.palette.error.main : theme.palette.success.main, 0.1),
                                        color: tx.type === 'expense' ? 'error.main' : 'success.main',
                                        width: 36,
                                        height: 36
                                      }}
                                    >
                                      {tx.type === 'expense' ? <TrendingDownIcon fontSize="small" /> : <TrendingUpIcon fontSize="small" />}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {tx.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {tx.type === 'expense' ? 'Expense' : 'Income'}
                                      </Typography>
                                    </Box>
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: 700,
                                        color: tx.type === 'expense' ? 'error.main' : 'success.main'
                                      }}
                                    >
                                      {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                    </Typography>
                                  </Stack>
                                </TransactionItem>
                              ))}
                            </Stack>
                          </Box>
                        </Fade>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <AutorenewIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">
                        No upcoming transactions in the next 30 days
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </GlassCard>
            </Grow>
          </Grid>

          {/* Alerts & Insights */}
          <Grid item xs={12} lg={4}>
            <Grow in timeout={1100}>
              <GlassCard>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                      <NotificationsNoneIcon />
                    </Avatar>
                  }
                  title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Alerts & Insights</Typography>}
                  subheader="Important notifications"
                  action={
                    <Badge badgeContent={3} color="error">
                      <IconButton size="small">
                        <NotificationsNoneIcon />
                      </IconButton>
                    </Badge>
                  }
                />
                <CardContent>
                  <Stack spacing={2}>
                    <AlertCard
                      type="warning"
                      title="Low Runway Alert"
                      message="Your current runway is below 6 months. Consider fundraising."
                    />
                    <AlertCard
                      type="success"
                      title="User Growth Milestone"
                      message="Congratulations! You've reached 3,000+ total users."
                    />
                    <AlertCard
                      type="info"
                      title="Expense Optimization"
                      message="Your burn rate decreased by 8% this month."
                    />
                  </Stack>

                  {/* Engagement Pie Chart */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      User Engagement Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={engagementData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: alpha(theme.palette.background.paper, 0.95),
                            border: 'none',
                            borderRadius: 8,
                            boxShadow: theme.shadows[4]
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </GlassCard>
            </Grow>
          </Grid>
        </Grid>
      </Container>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default DashboardPage;