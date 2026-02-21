// src/pages/OverviewDashboard.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container, Grid, Paper, Typography, Box, Stack, useTheme, alpha,
  Fade, Grow, Skeleton, Button, Chip, Avatar,
  Card, CardContent, Divider,
  CardActionArea
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Line,
  ComposedChart
} from 'recharts';

// Icons
import CircularProgress from '@mui/material/CircularProgress';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RefreshIcon from '@mui/icons-material/Refresh';
import FolderIcon from '@mui/icons-material/Folder';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';

// API imports
import api, {
  // Financial APIs
  getBudgets,
  getBankAccounts,
  getRecurringTransactions,
  
  // Fundraising APIs
  getRounds,
  getInvestors,
  getCapTableSummary,
  getEsopGrants,
  
  // KPI APIs
  getManualKpiSnapshots,
  getProductMilestoneStatistics,
  getDauMauHistory,
  
  // Headcount APIs
  getHeadcountSummary,
  getHeadcounts,
  
  // Product APIs
  getProductMilestones,
  
  // Document APIs
  getDocuments
} from '../services/api';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

// Styled Components
const ExecutiveDashboard = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)'
    : 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
  paddingBottom: theme.spacing(6)
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.05)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.03)} 50%,
    ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
    background: alpha(theme.palette.primary.main, 0.08),
    filter: 'blur(80px)'
  }
}));

const SectionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.primary.main, 0.2)
  }
}));

const MetricCard = styled(Paper)(({ theme, variant = 'default' }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: variant === 'primary' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`
    : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const AlertCard = styled(Paper)(({ theme, severity = 'info' }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette[severity].main, 0.3)}`,
  background: alpha(theme.palette[severity].main, 0.05),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette[severity].main,
    background: alpha(theme.palette[severity].main, 0.1),
    transform: 'translateX(4px)'
  }
}));

const LiveBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.success.main, 0.1),
  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  '& .dot': {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
    animation: `${pulse} 1.5s ease-in-out infinite`
  }
}));

// Utility functions
const formatCurrency = (value) => {
  if (!value && value !== 0) return '₹0';
  const absValue = Math.abs(value);
  if (absValue >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (absValue >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString()}`;
};

const formatNumber = (value) => {
  if (!value && value !== 0) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(1);
};

// Health Score Calculator
const calculateHealthScore = (metrics) => {
  let score = 100;
  const factors = [];
  
  // Runway (40% weight)
  if (metrics.runway < 3) {
    score -= 40;
    factors.push({ issue: 'Critical runway', severity: 'error' });
  } else if (metrics.runway < 6) {
    score -= 20;
    factors.push({ issue: 'Low runway', severity: 'warning' });
  } else if (metrics.runway < 12) {
    score -= 10;
    factors.push({ issue: 'Moderate runway', severity: 'info' });
  }
  
  // Revenue vs Burn (30% weight)
  const burnCoverage = metrics.monthlyRevenue / metrics.burnRate;
  if (burnCoverage < 0.2) {
    score -= 30;
    factors.push({ issue: 'High burn rate', severity: 'error' });
  } else if (burnCoverage < 0.5) {
    score -= 20;
    factors.push({ issue: 'Moderate burn rate', severity: 'warning' });
  } else if (burnCoverage < 0.8) {
    score -= 10;
    factors.push({ issue: 'Approaching sustainability', severity: 'info' });
  }
  
  // Growth (20% weight)
  if (metrics.userGrowth < 0) {
    score -= 20;
    factors.push({ issue: 'Negative growth', severity: 'error' });
  } else if (metrics.userGrowth < 5) {
    score -= 10;
    factors.push({ issue: 'Slow growth', severity: 'warning' });
  }
  
  // Budget adherence (10% weight)
  if (metrics.budgetVariance > 20) {
    score -= 10;
    factors.push({ issue: 'Over budget', severity: 'warning' });
  }
  
  return {
    score: Math.max(0, score),
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    status: score >= 80 ? 'healthy' : score >= 60 ? 'good' : score >= 40 ? 'warning' : 'critical',
    factors
  };
};

// Main Component
const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [loading, setLoading] = useState({
    financial: true,
    fundraising: true,
    kpis: true,
    team: true,
    product: true
  });
  
  const [data, setData] = useState({
    financial: {},
    fundraising: {},
    kpis: {},
    team: {},
    product: {},
    documents: {}
  });
  
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      // Financial data
      const fetchFinancialData = async () => {
        setLoading(prev => ({ ...prev, financial: true }));
        try {
          const [budgetsRes, bankAccountsRes, financialOverviewRes, recurringRes] = await Promise.all([
            getBudgets(),
            getBankAccounts(),
            api.get('/financials/overview'),
            getRecurringTransactions()
          ]);
          
          const budgets = budgetsRes.data || [];
          const bankAccounts = bankAccountsRes.data || [];
          const overview = financialOverviewRes.data || {};
          const recurring = recurringRes.data || [];
          
          // Calculate budget metrics
          const totalBudgeted = budgets.reduce((sum, b) => sum + b.totalBudgetedAmount, 0);
          const totalSpent = budgets.reduce((sum, b) => sum + (b.totalActualSpent || 0), 0);
          const overBudgetCount = budgets.filter(b => b.status === 'overbudget').length;
          
          // Calculate total balance
          const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
          
          setData(prev => ({
            ...prev,
            financial: {
              totalBalance: overview.currentTotalBankBalance || totalBalance,
              burnRate: overview.averageMonthlyBurnRate || 0,
              runway: overview.estimatedRunwayMonths !== "Infinite" ? overview.estimatedRunwayMonths : 999,
              monthlyRevenue: overview.averageMonthlyRevenue || 0,
              totalBudgeted,
              totalSpent,
              budgetVariance: totalBudgeted > 0 ? ((totalSpent - totalBudgeted) / totalBudgeted * 100) : 0,
              overBudgetCount,
              bankAccounts: bankAccounts.length,
              recurringExpenses: recurring.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
              recurringIncome: recurring.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
              historicalData: overview.historicalMonthlyData || { expenses: [], revenue: [] }
            }
          }));
        } catch (error) {
          console.error('Error fetching financial data:', error);
        } finally {
          setLoading(prev => ({ ...prev, financial: false }));
        }
      };

      // Fundraising data
      const fetchFundraisingData = async () => {
        setLoading(prev => ({ ...prev, fundraising: true }));
        try {
          const [roundsRes, investorsRes, capTableRes, esopRes] = await Promise.all([
            getRounds(),
            getInvestors(),
            getCapTableSummary(),
            getEsopGrants()
          ]);
          
          const rounds = roundsRes.data || [];
          const investors = investorsRes.data || [];
          const capTable = capTableRes.data || [];
          const esopGrants = esopRes.data || [];
          
          const latestRound = rounds.sort((a, b) => new Date(b.dateStarted) - new Date(a.dateStarted))[0];
          const totalRaised = rounds.reduce((sum, r) => sum + (r.totalFundsReceived || 0), 0);
          const activeInvestors = investors.filter(inv => inv.status === 'Invested' || inv.status === 'Hard Committed').length;
          const currentValuation = latestRound?.currentValuationPreMoney || 0;
          const totalOptionsVested = esopGrants.reduce((sum, grant) => sum + (grant.totalOptionsVested || 0), 0);
          
          setData(prev => ({
            ...prev,
            fundraising: {
              totalRaised,
              activeInvestors,
              currentValuation,
              latestRound,
              totalOptionsVested,
              capTableEntries: capTable.length,
              rounds: rounds.length,
              employeeOwnership: esopGrants.reduce((sum, grant) => sum + (grant.equityPercentage || 0), 0)
            }
          }));
        } catch (error) {
          console.error('Error fetching fundraising data:', error);
        } finally {
          setLoading(prev => ({ ...prev, fundraising: false }));
        }
      };

      // KPIs and user metrics
      const fetchKpiData = async () => {
        setLoading(prev => ({ ...prev, kpis: true }));
        try {
          const [kpiRes, dauMauRes] = await Promise.all([
            getManualKpiSnapshots({ limit: 2, sort: '-snapshotDate' }),
            getDauMauHistory({ days: 30 })
          ]);
          
          const snapshots = kpiRes.data?.snapshots || [];
          const dauMauHistory = dauMauRes.data?.history || [];
          
          const latestKpi = snapshots[0];
          const previousKpi = snapshots[1];
          
          const userGrowth = previousKpi && latestKpi 
            ? calculateGrowth(latestKpi.totalRegisteredUsers, previousKpi.totalRegisteredUsers) 
            : 0;
          
          setData(prev => ({
            ...prev,
            kpis: {
              totalUsers: latestKpi?.totalRegisteredUsers || 0,
              dau: latestKpi?.dau || 0,
              mau: latestKpi?.mau || 0,
              dauMauRatio: latestKpi?.mau > 0 ? (latestKpi.dau / latestKpi.mau * 100) : 0,
              userGrowth: parseFloat(userGrowth),
              dauMauHistory,
              previousTotalUsers: previousKpi?.totalRegisteredUsers || 0
            }
          }));
        } catch (error) {
          console.error('Error fetching KPI data:', error);
        } finally {
          setLoading(prev => ({ ...prev, kpis: false }));
        }
      };

      // Team data
      const fetchTeamData = async () => {
        setLoading(prev => ({ ...prev, team: true }));
        try {
          const [summaryRes, headcountsRes] = await Promise.all([
            getHeadcountSummary(),
            getHeadcounts({ limit: 100 })
          ]);
          
          const summary = summaryRes.data?.data || {};
          const headcounts = headcountsRes.data?.data || [];
          
          const departmentBreakdown = headcounts.reduce((acc, emp) => {
            if (emp.status === 'Active') {
              acc[emp.department] = (acc[emp.department] || 0) + 1;
            }
            return acc;
          }, {});
          
          setData(prev => ({
            ...prev,
            team: {
              totalHeadcount: summary.totalHeadcount || 0,
              openPositions: summary.openPositions || 0,
              annualCost: summary.annualCost || 0,
              departmentBreakdown,
              recentHires: headcounts
                .filter(h => h.status === 'Active' && h.startDate)
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                .slice(0, 5),
              averageSalary: summary.totalHeadcount > 0 
                ? Math.round(summary.annualCost / summary.totalHeadcount / 12) 
                : 0
            }
          }));
        } catch (error) {
          console.error('Error fetching team data:', error);
        } finally {
          setLoading(prev => ({ ...prev, team: false }));
        }
      };

      // Product data
      const fetchProductData = async () => {
        setLoading(prev => ({ ...prev, product: true }));
        try {
          const [milestonesRes, statsRes, documentsRes] = await Promise.all([
            getProductMilestones({ limit: 100 }),
            getProductMilestoneStatistics(),
            getDocuments({ limit: 100 })
          ]);
          
          const milestones = milestonesRes.data?.data || [];
          const stats = statsRes.data?.data || {};
          const documents = documentsRes.data || [];
          
          const activeMilestones = milestones.filter(m => 
            ['Planning', 'In Development', 'Testing'].includes(m.status)
          );
          
          const completedMilestones = milestones.filter(m => m.status === 'Completed');
          
          const avgCompletion = activeMilestones.length > 0
            ? activeMilestones.reduce((sum, m) => sum + (m.completionPercentage || 0), 0) / activeMilestones.length
            : 0;
          
          setData(prev => ({
            ...prev,
            product: {
              activeMilestones: activeMilestones.length,
              completedMilestones: completedMilestones.length,
              avgCompletion,
              upcomingReleases: activeMilestones
                .filter(m => m.plannedEndDate)
                .sort((a, b) => new Date(a.plannedEndDate) - new Date(b.plannedEndDate))
                .slice(0, 3),
              delayedMilestones: stats.timelineStats?.delayedCount || 0,
              milestonesByType: stats.typeDistribution || {}
            },
            documents: {
              total: documents.length,
              recentlyAdded: documents.filter(doc => {
                const daysDiff = (Date.now() - new Date(doc.createdAt)) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7;
              }).length
            }
          }));
        } catch (error) {
          console.error('Error fetching product data:', error);
        } finally {
          setLoading(prev => ({ ...prev, product: false }));
        }
      };

      // Execute all fetches
      await Promise.all([
        fetchFinancialData(),
        fetchFundraisingData(),
        fetchKpiData(),
        fetchTeamData(),
        fetchProductData()
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Generate alerts based on data
  useEffect(() => {
    const newAlerts = [];
    
    // Financial alerts
    if (data.financial.runway && data.financial.runway < 6) {
      newAlerts.push({
        id: 'runway',
        severity: data.financial.runway < 3 ? 'error' : 'warning',
        title: `Runway: ${data.financial.runway} months`,
        message: 'Consider fundraising or reducing burn rate',
        action: '/financials'
      });
    }
    
    if (data.financial.overBudgetCount > 0) {
      newAlerts.push({
        id: 'budget',
        severity: 'warning',
        title: `${data.financial.overBudgetCount} budgets exceeded`,
        message: 'Review and adjust budget allocations',
        action: '/budgets'
      });
    }
    
    // Product alerts
    if (data.product.delayedMilestones > 0) {
      newAlerts.push({
        id: 'milestones',
        severity: 'info',
        title: `${data.product.delayedMilestones} delayed milestones`,
        message: 'Review product timeline and resources',
        action: '/product-milestones'
      });
    }
    
    // Team alerts
    if (data.team.openPositions > 5) {
      newAlerts.push({
        id: 'hiring',
        severity: 'info',
        title: `${data.team.openPositions} open positions`,
        message: 'Accelerate hiring to meet growth targets',
        action: '/headcount'
      });
    }
    
    setAlerts(newAlerts);
  }, [data]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculate health metrics
  const healthMetrics = useMemo(() => {
    return calculateHealthScore({
      runway: data.financial.runway || 0,
      monthlyRevenue: data.financial.monthlyRevenue || 0,
      burnRate: data.financial.burnRate || 1,
      userGrowth: data.kpis.userGrowth || 0,
      budgetVariance: data.financial.budgetVariance || 0
    });
  }, [data]);

  // Chart data
  const revenueExpenseData = useMemo(() => {
    if (!data.financial.historicalData?.expenses || !data.financial.historicalData?.revenue) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const combined = [];
    
    // Get last 6 months
    const expenseData = data.financial.historicalData.expenses.slice(-6);
    const revenueData = data.financial.historicalData.revenue.slice(-6);
    
    expenseData.forEach((expense, index) => {
      const revenue = revenueData.find(r => r.month === expense.month && r.year === expense.year);
      combined.push({
        name: months[expense.month - 1],
        revenue: revenue?.amount || 0,
        expense: expense.amount || 0,
        profit: (revenue?.amount || 0) - (expense.amount || 0)
      });
    });
    
    return combined;
  }, [data.financial.historicalData]);

  const userGrowthData = useMemo(() => {
    if (!data.kpis.dauMauHistory) return [];
    
    return data.kpis.dauMauHistory.slice(-14).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dau: item.dau,
      mau: item.mau
    }));
  }, [data.kpis.dauMauHistory]);

  const departmentData = useMemo(() => {
    if (!data.team.departmentBreakdown) return [];
    
    return Object.entries(data.team.departmentBreakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data.team.departmentBreakdown]);

  return (
    <ExecutiveDashboard>
      {/* Hero Section */}
      <HeroSection sx={{ py: { xs: 3, md: 4 }, mb: 4 }}>
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} flexWrap="wrap" spacing={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center' }}>
                <DashboardIcon sx={{ mr: 1.5, fontSize: 32 }} />
                Executive Overview
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <LiveBadge>
                  <Box className="dot" />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    LIVE DATA
                  </Typography>
                </LiveBadge>
                <Typography variant="body2" color="text.secondary">
                  Welcome back, {user?.name?.split(' ')[0] || 'Founder'}
                </Typography>
              </Stack>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<NotificationsIcon />}
                sx={{ borderRadius: 2 }}
              >
                {alerts.length} Alerts
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Container>
      </HeroSection>

      <Container maxWidth="xl">
        {/* Health Score Card */}
        <Fade in timeout={500}>
          <Card sx={{ mb: 4, borderRadius: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: `conic-gradient(
                            ${theme.palette[healthMetrics.status === 'healthy' ? 'success' : healthMetrics.status === 'warning' ? 'warning' : 'error'].main} ${healthMetrics.score * 3.6}deg,
                            ${alpha(theme.palette.grey[300], 0.2)} ${healthMetrics.score * 3.6}deg
                          )`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: 8,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.background.paper
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            {healthMetrics.grade}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            HEALTH
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={9}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Company Health Score: {healthMetrics.score}/100
                    </Typography>
                    <Grid container spacing={2}>
                      {healthMetrics.factors.map((factor, index) => (
                        <Grid item key={index}>
                          <Chip
                            icon={factor.severity === 'error' ? <ErrorIcon /> : factor.severity === 'warning' ? <WarningIcon /> : <InfoIcon />}
                            label={factor.issue}
                            color={factor.severity}
                            size="small"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Key Metrics Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Financial Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={600}>
              <SectionCard>
                <CardActionArea onClick={() => navigate('/financials')} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                            FINANCES
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            {loading.financial ? <Skeleton width={100} /> : formatCurrency(data.financial.totalBalance)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Balance
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                          <AccountBalanceIcon />
                        </Avatar>
                      </Stack>
                      
                      <Divider />
                      
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Burn Rate</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.financial ? <Skeleton width={60} /> : formatCurrency(data.financial.burnRate)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Runway</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: data.financial.runway < 6 ? 'error.main' : 'text.primary' }}>
                            {loading.financial ? <Skeleton width={60} /> : `${data.financial.runway} months`}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Revenue</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.financial ? <Skeleton width={60} /> : formatCurrency(data.financial.monthlyRevenue)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </SectionCard>
            </Grow>
          </Grid>

          {/* Growth Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={700}>
              <SectionCard>
                <CardActionArea onClick={() => navigate('/kpis')} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                            GROWTH
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            {loading.kpis ? <Skeleton width={100} /> : formatNumber(data.kpis.totalUsers)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Users
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                          <GroupsIcon />
                        </Avatar>
                      </Stack>
                      
                      <Divider />
                      
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">DAU</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.kpis ? <Skeleton width={60} /> : formatNumber(data.kpis.dau)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">MAU</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.kpis ? <Skeleton width={60} /> : formatNumber(data.kpis.mau)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Growth</Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {data.kpis.userGrowth > 0 ? <TrendingUpIcon fontSize="small" color="success" /> : <TrendingDownIcon fontSize="small" color="error" />}
                            <Typography variant="body2" sx={{ fontWeight: 600, color: data.kpis.userGrowth > 0 ? 'success.main' : 'error.main' }}>
                              {loading.kpis ? <Skeleton width={40} /> : `${data.kpis.userGrowth}%`}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </SectionCard>
            </Grow>
          </Grid>

          {/* Fundraising Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={800}>
              <SectionCard>
                <CardActionArea onClick={() => navigate('/fundraising')} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                            FUNDRAISING
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            {loading.fundraising ? <Skeleton width={100} /> : formatCurrency(data.fundraising.currentValuation)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Valuation
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                          <BusinessCenterIcon />
                        </Avatar>
                      </Stack>
                      
                      <Divider />
                      
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Total Raised</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.fundraising ? <Skeleton width={60} /> : formatCurrency(data.fundraising.totalRaised)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Investors</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.fundraising ? <Skeleton width={40} /> : data.fundraising.activeInvestors}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">ESOP Pool</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.fundraising ? <Skeleton width={50} /> : `${data.fundraising.employeeOwnership?.toFixed(1) || 0}%`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </SectionCard>
            </Grow>
          </Grid>

          {/* Team Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={900}>
              <SectionCard>
                <CardActionArea onClick={() => navigate('/headcount')} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                            TEAM
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            {loading.team ? <Skeleton width={60} /> : data.team.totalHeadcount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Employees
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                          <PeopleIcon />
                        </Avatar>
                      </Stack>
                      
                      <Divider />
                      
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Open Roles</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.team ? <Skeleton width={30} /> : data.team.openPositions}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Annual Cost</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.team ? <Skeleton width={60} /> : formatCurrency(data.team.annualCost)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Avg Salary</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loading.team ? <Skeleton width={60} /> : formatCurrency(data.team.averageSalary)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </SectionCard>
            </Grow>
          </Grid>
        </Grid>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Fade in timeout={1000}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Action Items
              </Typography>
              <Grid container spacing={2}>
                {alerts.map((alert) => (
                  <Grid item xs={12} sm={6} md={3} key={alert.id}>
                    <AlertCard severity={alert.severity} onClick={() => navigate(alert.action)}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {alert.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.message}
                          </Typography>
                        </Box>
                        <NavigateNextIcon sx={{ opacity: 0.5 }} />
                      </Stack>
                    </AlertCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        )}

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue & Expense Trend */}
          <Grid item xs={12} md={8}>
            <SectionCard>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Revenue & Expense Trend
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<NavigateNextIcon />}
                    onClick={() => navigate('/financials')}
                  >
                    View Details
                  </Button>
                </Stack>
                
                <Box sx={{ height: { xs: 250, md: 350 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={revenueExpenseData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`} />
                      <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Bar dataKey="revenue" fill="url(#revenueGradient)" name="Revenue" />
                      <Bar dataKey="expense" fill="url(#expenseGradient)" name="Expenses" />
                      <Line type="monotone" dataKey="profit" stroke={theme.palette.primary.main} name="Net Income" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </SectionCard>
          </Grid>

          {/* Product Status */}
          <Grid item xs={12} md={4}>
            <SectionCard>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Product Status
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<NavigateNextIcon />}
                    onClick={() => navigate('/product-milestones')}
                  >
                    View All
                  </Button>
                </Stack>
                
                <Stack spacing={3}>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={120}
                        thickness={4}
                        sx={{ color: alpha(theme.palette.grey[300], 0.2) }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={data.product.avgCompletion || 0}
                        size={120}
                        thickness={4}
                        sx={{ position: 'absolute', left: 0, color: theme.palette.primary.main }}
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
                        <Stack>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {loading.product ? <Skeleton width={60} /> : `${Math.round(data.product.avgCompletion || 0)}%`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Stack spacing={2}>
                    <MetricCard>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {loading.product ? <Skeleton width={30} /> : data.product.activeMilestones}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active Milestones
                          </Typography>
                        </Box>
                        <RocketLaunchIcon color="primary" />
                      </Stack>
                    </MetricCard>
                    
                    <MetricCard>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {loading.product ? <Skeleton width={30} /> : data.product.completedMilestones}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Completed
                          </Typography>
                        </Box>
                        <CheckCircleIcon color="success" />
                      </Stack>
                    </MetricCard>
                  </Stack>
                </Stack>
              </CardContent>
            </SectionCard>
          </Grid>
        </Grid>

        {/* Bottom Row */}
        <Grid container spacing={3}>
          {/* User Growth */}
          <Grid item xs={12} md={4}>
            <SectionCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  User Growth
                </Typography>
                <Box sx={{ height: { xs: 200, md: 250 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="dau" stroke={theme.palette.primary.main} fill="url(#dauGradient)" name="DAU" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </SectionCard>
          </Grid>

          {/* Team Distribution */}
          <Grid item xs={12} md={4}>
            <SectionCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Team Distribution
                </Typography>
                <Box sx={{ height: { xs: 200, md: 250 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={theme.palette[index % 2 === 0 ? 'primary' : 'secondary'].main} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {departmentData.slice(0, 3).map((dept, index) => (
                    <Stack key={dept.name} direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 1,
                            bgcolor: theme.palette[index % 2 === 0 ? 'primary' : 'secondary'].main
                          }}
                        />
                        <Typography variant="body2">{dept.name}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{dept.value}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </SectionCard>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <SectionCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => navigate('/financials')}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Add Transaction
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/headcount')}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Manage Team
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RocketLaunchIcon />}
                    onClick={() => navigate('/product-milestones')}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Update Milestones
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate('/kpis')}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Add KPI Snapshot
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FolderIcon />}
                    onClick={() => navigate('/documents')}
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Upload Document
                  </Button>
                </Stack>
              </CardContent>
            </SectionCard>
          </Grid>
        </Grid>
      </Container>
    </ExecutiveDashboard>
  );
};

export default DashboardPage;