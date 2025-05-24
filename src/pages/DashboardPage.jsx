// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api, { getUpcomingRecurringTransactions } from '../services/api';
import {
  Container, Grid, Paper, Typography, Box, CircularProgress, Alert,
  List, ListItem, ListItemText, Chip, Divider, Card, CardContent,
  CardHeader, Avatar, Stack, useTheme, alpha, Fade, Grow, Skeleton,
  LinearProgress, IconButton, Button, Tooltip, Badge, ButtonGroup,
  Zoom, useMediaQuery
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
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
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AnalyticsIcon from '@mui/icons-material/Analytics';

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

// Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 50%)`,
    pointerEvents: 'none',
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 50%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
}));

const MetricCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
    '& .metric-icon': {
      transform: 'rotate(10deg) scale(1.1)',
    }
  }
}));

const LiveIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '& .dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
    animation: `${pulse} 1.5s ease-in-out infinite`,
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

// Custom Components
const AnimatedNumber = ({ value, duration = 2000, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;
    const endValue = parseFloat(value) || 0;
    
    const updateNumber = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = startValue + (endValue - startValue) * easeOutExpo;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };
    
    updateNumber();
  }, [value, duration]);
  
  return (
    <span>
      {prefix}{displayValue.toLocaleString(undefined, { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
      })}{suffix}
    </span>
  );
};

const MetricCardItem = ({ title, value, icon, color = 'primary', subtitle, loading = false, index = 0 }) => {
  const theme = useTheme();
  
  return (
    <Grow in timeout={300 + index * 100}>
      <MetricCard elevation={0}>
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="80%" height={40} sx={{ my: 1 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        ) : (
          <Box sx={{ p: 3, position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette[color].main, 0.1)} 0%, transparent 70%)`,
              }}
            />
            
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.75rem' }}>
                  {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette[color].dark, my: 1 }}>
                  {value !== null && value !== undefined ? (
                    <AnimatedNumber
                      value={value}
                      prefix={title.includes('Balance') || title.includes('Burn') || title.includes('Funds') ? '₹' : ''}
                      suffix={title.includes('Ratio') ? '%' : title.includes('Runway') ? ' mo' : ''}
                      decimals={title.includes('Ratio') || title.includes('Runway') ? 1 : 0}
                    />
                  ) : (
                    'N/A'
                  )}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <Avatar
                className="metric-icon"
                sx={{
                  bgcolor: alpha(theme.palette[color].main, 0.1),
                  color: theme.palette[color].main,
                  width: 56,
                  height: 56,
                  transition: 'transform 0.5s ease',
                }}
              >
                {icon}
              </Avatar>
            </Stack>
          </Box>
        )}
      </MetricCard>
    </Grow>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
      // Fetch financial overview
      const overviewPromise = api.get('/financials/overview').then(res => {
        setOverviewData(res.data);
        setLoading(prev => ({ ...prev, overview: false }));
      });
      
      // Fetch KPI data
      const kpiPromise = api.get('/kpis/snapshots?limit=1').then(res => {
        if (res.data.snapshots && res.data.snapshots.length > 0) {
          setKpiData(res.data.snapshots[0]);
        } else {
          setKpiData(null);
        }
        setLoading(prev => ({ ...prev, kpi: false }));
      });
      
      // Fetch upcoming transactions
      const recurringPromise = getUpcomingRecurringTransactions({ days: 30 }).then(res => {
        setUpcomingTransactions(res.data);
        setLoading(prev => ({ ...prev, recurring: false }));
      });

      await Promise.all([overviewPromise, kpiPromise, recurringPromise]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load some dashboard data. Please try refreshing.");
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

  const isLoadingOverall = loading.overview || loading.kpi || loading.recurring;

  if (isLoadingOverall && !overviewData && !kpiData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ position: 'relative' }}>
            <CircularProgress size={80} thickness={2} />
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <RocketLaunchIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>
          </Box>
          <Typography variant="h5" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Calculate real metrics from data
  const dauMauRatio = kpiData?.mau && kpiData?.dau ? ((kpiData.dau / kpiData.mau) * 100) : null;
  const totalTransactions = upcomingTransactions?.upcoming?.reduce((acc, day) => acc + day.transactions.length, 0) || 0;
  const totalUpcomingExpenses = upcomingTransactions?.upcoming?.reduce((acc, day) => 
    acc + day.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), 0
  ) || 0;
  const totalUpcomingIncome = upcomingTransactions?.upcoming?.reduce((acc, day) => 
    acc + day.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), 0
  ) || 0;

  return (
    <DashboardContainer>
      {/* Hero Section */}
      <HeroSection sx={{ py: 4, mb: 3 }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', mb: 1 }}>
                Welcome back, {user?.name}!
              </Typography>
              <Stack direction="row" spacing={3} alignItems="center">
                <Typography variant="body1" color="text.secondary">
                  Your financial dashboard
                </Typography>
                <LiveIndicator>
                  <Box className="dot" />
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    LIVE DATA
                  </Typography>
                </LiveIndicator>
              </Stack>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon sx={{ animation: refreshing ? `${rotate} 1s linear infinite` : 'none' }} />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ borderRadius: 2 }}
              >
                {refreshing ? 'Updating...' : 'Refresh'}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </HeroSection>

      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {error && (
          <Zoom in>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Zoom>
        )}

        {/* Financial Metrics */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
            <MonetizationOnIcon sx={{ mr: 1 }} />
            Financial Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCardItem
                title="Total Bank Balance"
                value={overviewData?.currentTotalBankBalance}
                icon={<AccountBalanceIcon />}
                color="success"
                subtitle="All accounts"
                loading={loading.overview}
                index={0}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCardItem
                title="Monthly Burn Rate"
                value={overviewData?.averageMonthlyBurnRate}
                icon={<LocalFireDepartmentIcon />}
                color="error"
                subtitle="3-month average"
                loading={loading.overview}
                index={1}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCardItem
                title="Estimated Runway"
                value={overviewData?.estimatedRunwayMonths !== "N/A (No Burn or No Funds)" ? overviewData?.estimatedRunwayMonths : null}
                icon={<RocketLaunchIcon />}
                color="warning"
                subtitle="Based on current burn"
                loading={loading.overview}
                index={2}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCardItem
                title="Total Funds Raised"
                value={overviewData?.totalFundsReceivedFromRounds}
                icon={<TrendingUpIcon />}
                color="info"
                subtitle="From all rounds"
                loading={loading.overview}
                index={3}
              />
            </Grid>
          </Grid>
        </Box>

        {/* User Metrics */}
        {kpiData && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
              <ShowChartIcon sx={{ mr: 1 }} />
              User Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCardItem
                  title="Total Users"
                  value={kpiData.totalRegisteredUsers}
                  icon={<PeopleAltIcon />}
                  color="primary"
                  subtitle="Registered users"
                  loading={loading.kpi}
                  index={0}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCardItem
                  title="Daily Active Users"
                  value={kpiData.dau}
                  icon={<GroupAddIcon />}
                  color="secondary"
                  subtitle="Active today"
                  loading={loading.kpi}
                  index={1}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCardItem
                  title="Monthly Active Users"
                  value={kpiData.mau}
                  icon={<PeopleAltIcon />}
                  color="info"
                  subtitle="Active this month"
                  loading={loading.kpi}
                  index={2}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCardItem
                  title="DAU/MAU Ratio"
                  value={dauMauRatio}
                  icon={<DataUsageIcon />}
                  color="warning"
                  subtitle="Engagement rate"
                  loading={loading.kpi}
                  index={3}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* KPI Not Available Message */}
        {!loading.kpi && !kpiData && (
          <StatsCard sx={{ mb: 4, textAlign: 'center', py: 6 }}>
            <AnalyticsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No KPI Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add a KPI snapshot to see user metrics and engagement data
            </Typography>
          </StatsCard>
        )}

        {/* Upcoming Transactions Summary */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <StatsCard>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                  <AutorenewIcon sx={{ mr: 1 }} />
                  Upcoming Recurring Transactions
                </Typography>
                <Chip 
                  label={`${totalTransactions} total`} 
                  size="small" 
                  color="primary"
                />
              </Stack>

              {loading.recurring ? (
                <Stack spacing={2}>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                  ))}
                </Stack>
              ) : upcomingTransactions?.upcoming?.length > 0 ? (
                <>
                  {/* Summary Cards */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2 }}>
                        <Typography variant="h6" color="error.main">
                          ₹{totalUpcomingExpenses.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Upcoming Expenses
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                        <Typography variant="h6" color="success.main">
                          ₹{totalUpcomingIncome.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Upcoming Income
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                        <Typography variant="h6" color="info.main">
                          ₹{(totalUpcomingIncome - totalUpcomingExpenses).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Net Expected
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Transaction List */}
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Stack spacing={3}>
                      {upcomingTransactions.upcoming.slice(0, 7).map((day, dayIndex) => (
                        <Fade in timeout={dayIndex * 100} key={day.date}>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                              <Chip
                                icon={<CalendarMonthIcon />}
                                label={new Date(day.date).toLocaleDateString('en-GB', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {day.transactions.length} transaction{day.transactions.length > 1 ? 's' : ''}
                              </Typography>
                            </Stack>
                            
                            <Stack spacing={1}>
                              {day.transactions.map((tx) => (
                                <Paper
                                  key={tx.recurringId}
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    borderRadius: 1,
                                    border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    background: theme => alpha(tx.type === 'expense' ? theme.palette.error.main : theme.palette.success.main, 0.02),
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar
                                      sx={{
                                        bgcolor: alpha(tx.type === 'expense' ? theme.palette.error.main : theme.palette.success.main, 0.1),
                                        color: tx.type === 'expense' ? 'error.main' : 'success.main',
                                        width: 40,
                                        height: 40,
                                      }}
                                    >
                                      {tx.type === 'expense' ? <TrendingDownIcon /> : <TrendingUpIcon />}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {tx.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {tx.type === 'expense' ? 'Expense' : 'Income'}
                                      </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: tx.type === 'expense' ? 'error.main' : 'success.main' }}>
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
                  <AutorenewIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    No upcoming recurring transactions in the next 30 days
                  </Typography>
                </Box>
              )}
            </StatsCard>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Financial Health Score */}
              <StatsCard>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Financial Health
                </Typography>
                {overviewData ? (
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Current Balance
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₹{overviewData.currentTotalBankBalance?.toLocaleString() || 0}
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((overviewData.currentTotalBankBalance / (overviewData.totalFundsReceivedFromRounds || 1)) * 100, 100)} 
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        color="success"
                      />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Burn Rate
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₹{overviewData.averageMonthlyBurnRate?.toLocaleString() || 0}/mo
                        </Typography>
                      </Stack>
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Runway
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {overviewData.estimatedRunwayMonths !== "N/A (No Burn or No Funds)" 
                            ? `${overviewData.estimatedRunwayMonths} months` 
                            : 'N/A'}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                ) : (
                  <Stack spacing={1}>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={30} />
                  </Stack>
                )}
              </StatsCard>

              {/* User Engagement */}
              {kpiData && (
                <StatsCard>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    User Engagement
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Total Users
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {kpiData.totalRegisteredUsers?.toLocaleString() || 0}
                        </Typography>
                      </Stack>
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          DAU/MAU Ratio
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {dauMauRatio ? `${dauMauRatio.toFixed(1)}%` : 'N/A'}
                        </Typography>
                      </Stack>
                      {dauMauRatio && (
                        <LinearProgress 
                          variant="determinate" 
                          value={dauMauRatio} 
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          color={dauMauRatio > 30 ? "success" : dauMauRatio > 20 ? "warning" : "error"}
                        />
                      )}
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Active Users Today
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {kpiData.dau?.toLocaleString() || 0}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </StatsCard>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </DashboardContainer>
  );
};

export default DashboardPage;