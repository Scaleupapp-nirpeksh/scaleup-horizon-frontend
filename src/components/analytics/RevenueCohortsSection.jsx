// src/components/analytics/RevenueCohortsSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Tooltip, CircularProgress, 
  Card, CardHeader, CardContent, Avatar, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, alpha, useTheme, Grow, Stack, Divider, Fade, Skeleton,
  LinearProgress, Tab, Tabs, TextField, InputAdornment, Badge, Menu, MenuItem,
  ButtonGroup, ToggleButton, ToggleButtonGroup, Collapse, CardActions,
  List, ListItem, ListItemIcon, ListItemText, Switch, FormControlLabel, Select, FormControl, InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, ReferenceLine, Brush, PieChart, Pie, Cell,
  Treemap, ScatterChart, Scatter
} from 'recharts';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

import RevenueCohortForm from './RevenueCohortForm';
import { getRevenueCohorts, deleteRevenueCohort } from '../../services/api';
import AlertMessage from '../common/AlertMessage';

// Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
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

const CohortCard = styled(GlassCard)(({ theme, performance }) => ({
  background: performance === 'high' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
    : performance === 'medium'
    ? `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(
    performance === 'high' ? theme.palette.success.main : 
    performance === 'medium' ? theme.palette.warning.main : 
    theme.palette.error.main, 0.15
  )}`,
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: alpha(
      performance === 'high' ? theme.palette.success.main : 
      performance === 'medium' ? theme.palette.warning.main : 
      theme.palette.error.main, 0.08
    ),
    zIndex: 0,
  }
}));

const MetricBox = styled(Paper)(({ theme, colorType = 'primary' }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  background: alpha(theme.palette[colorType].main, 0.08),
  border: `1px solid ${alpha(theme.palette[colorType].main, 0.2)}`,
  textAlign: 'center',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    background: alpha(theme.palette[colorType].main, 0.12),
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  marginRight: theme.spacing(2),
  minHeight: 48,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  }
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.6),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  height: '100%',
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'active' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.dark,
    borderColor: theme.palette.success.main,
  }),
  ...(status === 'churned' && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.dark,
    borderColor: theme.palette.error.main,
  }),
  ...(status === 'at-risk' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.dark,
    borderColor: theme.palette.warning.main,
  }),
}));

// Chart Colors
const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  grey: '#94a3b8'
};

// Helper function to determine cohort performance
const getCohortPerformance = (retentionRate, ltv) => {
  if (retentionRate >= 80 && ltv >= 10000) return 'high';
  if (retentionRate >= 60 && ltv >= 5000) return 'medium';
  return 'low';
};

// Helper function to get cohort color
const getCohortColor = (value) => {
  if (value >= 90) return CHART_COLORS.success;
  if (value >= 80) return '#22c55e';
  if (value >= 70) return CHART_COLORS.warning;
  if (value >= 60) return '#fb923c';
  if (value >= 50) return '#f97316';
  return CHART_COLORS.error;
};

// Mock data generators
const generateRetentionData = () => {
  const months = 12;
  let retention = 100;
  
  return Array.from({ length: months }, (_, i) => {
    if (i > 0) {
      retention *= (0.85 + Math.random() * 0.1); // 85-95% retention per month
    }
    return {
      month: i,
      retention: Math.max(retention, 20),
      revenue: retention * (1 + i * 0.05) // Growing revenue per user
    };
  });
};

const generateCohortTableData = () => {
  const cohorts = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'];
  return cohorts.map(cohort => {
    const data = { cohort };
    let retention = 100;
    for (let i = 1; i <= 6; i++) {
      retention *= (0.8 + Math.random() * 0.15);
      data[`month${i}`] = Math.round(retention);
    }
    return data;
  });
};

const generateLTVData = () => {
  const segments = ['Enterprise', 'Pro', 'Basic', 'Free Trial'];
  return segments.map(segment => ({
    segment,
    ltv: Math.floor(Math.random() * 15000) + 5000,
    cac: Math.floor(Math.random() * 3000) + 500,
    ratio: 0,
    customers: Math.floor(Math.random() * 500) + 100
  })).map(item => ({
    ...item,
    ratio: parseFloat((item.ltv / item.cac).toFixed(1))
  }));
};

const RevenueCohortsSection = ({ embedded = false }) => {
  const theme = useTheme();
  const [cohorts, setCohorts] = useState([]);
  const [cohortToEdit, setCohortToEdit] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [cohortPeriod, setCohortPeriod] = useState('monthly');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCohortMenu, setSelectedCohortMenu] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);

  const fetchCohorts = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call when available
      // const response = await getRevenueCohorts();
      // Mock data for now
      const mockCohorts = [
        {
          _id: '1',
          cohortName: 'Jan 2025 Signups',
          cohortStartDate: '2025-01-01',
          cohortType: 'monthly',
          initialUsers: 250,
          acquisitionChannel: 'Organic',
          acquisitionCost: 25000,
          productType: 'Premium Plan',
          paymentFrequency: 'monthly',
          metrics: [
            { periodNumber: 0, activeUsers: 250, revenue: 125000 },
            { periodNumber: 1, activeUsers: 200, revenue: 100000 },
            { periodNumber: 2, activeUsers: 180, revenue: 90000 }
          ],
          performance: 'high',
          retentionRate: 72,
          avgLTV: 12500,
          avgCAC: 100,
          churnRate: 28,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          cohortName: 'Q4 2024 Enterprise',
          cohortStartDate: '2024-10-01',
          cohortType: 'quarterly',
          initialUsers: 50,
          acquisitionChannel: 'Sales',
          acquisitionCost: 50000,
          productType: 'Enterprise',
          paymentFrequency: 'annual',
          metrics: [
            { periodNumber: 0, activeUsers: 50, revenue: 500000 },
            { periodNumber: 1, activeUsers: 48, revenue: 480000 },
            { periodNumber: 2, activeUsers: 46, revenue: 460000 }
          ],
          performance: 'high',
          retentionRate: 92,
          avgLTV: 50000,
          avgCAC: 1000,
          churnRate: 8,
          createdAt: new Date().toISOString()
        }
      ];
      
      // Add mock chart data
      const cohortsWithMockData = mockCohorts.map(cohort => ({
        ...cohort,
        performance: getCohortPerformance(cohort.retentionRate, cohort.avgLTV),
        retentionCurve: generateRetentionData(),
        cohortTableData: generateCohortTableData(),
        ltvSegments: generateLTVData(),
        sparklineData: Array.from({ length: 12 }, (_, i) => 
          cohort.metrics[0]?.revenue * Math.pow(0.9, i)
        )
      }));
      
      setCohorts(cohortsWithMockData);
    } catch (error) {
      console.error("Error fetching revenue cohorts:", error);
      setMessage({ type: 'error', text: 'Could not load revenue cohorts.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  const handleCohortSaved = (savedCohort) => {
    fetchCohorts();
    setCohortToEdit(null);
    setShowFormDialog(false);
    setMessage({ type: 'success', text: `Cohort "${savedCohort.cohortName}" saved successfully!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleEditCohort = (cohort) => {
    setCohortToEdit(cohort);
    setShowFormDialog(true);
    setAnchorEl(null);
  };

  const handleOpenDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name });
    setAnchorEl(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  const handleDeleteCohort = async () => {
    if (!deleteDialog.id) return;
    try {
      // await deleteRevenueCohort(deleteDialog.id);
      setCohorts(prev => prev.filter(c => c._id !== deleteDialog.id));
      setMessage({ type: 'success', text: `Cohort "${deleteDialog.name}" deleted successfully.` });
    } catch (error) {
      console.error("Error deleting cohort:", error);
      setMessage({ type: 'error', text: 'Could not delete cohort.' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleToggleComparison = (cohortId) => {
    if (selectedForComparison.includes(cohortId)) {
      setSelectedForComparison(prev => prev.filter(id => id !== cohortId));
    } else if (selectedForComparison.length < 3) {
      setSelectedForComparison(prev => [...prev, cohortId]);
    } else {
      setMessage({ type: 'warning', text: 'You can compare up to 3 cohorts at once.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Filter cohorts
  const filteredCohorts = cohorts.filter(cohort => {
    const matchesSearch = cohort.cohortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cohort.productType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || cohort.cohortType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Get comparison data
  const comparisonData = selectedForComparison.length > 0 
    ? cohorts.filter(c => selectedForComparison.includes(c._id))
    : [];

  const renderCohortCard = (cohort, index) => {
    const isSelected = selectedCohort?._id === cohort._id;
    const isComparing = selectedForComparison.includes(cohort._id);
    
    return (
      <Grid item xs={12} sm={6} md={4} key={cohort._id}>
        <Grow in timeout={200 + index * 100}>
          <CohortCard 
            performance={cohort.performance}
            onClick={() => setSelectedCohort(cohort)}
            sx={{ 
              cursor: 'pointer',
              ...(isSelected && {
                borderColor: theme.palette.primary.main,
                boxShadow: theme.shadows[8],
              }),
              ...(isComparing && {
                borderColor: theme.palette.secondary.main,
                borderWidth: 2,
              })
            }}
          >
            <CardHeader
              avatar={
                <Badge
                  badgeContent={
                    cohort.performance === 'high' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> :
                    cohort.performance === 'medium' ? <WarningAmberIcon sx={{ fontSize: 14 }} /> :
                    <WarningAmberIcon sx={{ fontSize: 14 }} />
                  }
                  color={
                    cohort.performance === 'high' ? 'success' :
                    cohort.performance === 'medium' ? 'warning' : 'error'
                  }
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <Avatar sx={{ 
                    bgcolor: alpha(
                      cohort.performance === 'high' ? CHART_COLORS.success :
                      cohort.performance === 'medium' ? CHART_COLORS.warning :
                      CHART_COLORS.error, 0.15
                    ),
                    color: cohort.performance === 'high' ? CHART_COLORS.success :
                           cohort.performance === 'medium' ? CHART_COLORS.warning :
                           CHART_COLORS.error,
                    width: 48,
                    height: 48
                  }}>
                    <GroupAddIcon />
                  </Avatar>
                </Badge>
              }
              action={
                <Stack direction="row" spacing={0.5}>
                  {compareMode && (
                    <Tooltip title={isComparing ? "Remove from comparison" : "Add to comparison"}>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComparison(cohort._id);
                        }}
                        color={isComparing ? "secondary" : "default"}
                      >
                        <CompareArrowsIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnchorEl(e.currentTarget);
                      setSelectedCohortMenu(cohort._id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              }
              title={
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                  {cohort.cohortName}
                </Typography>
              }
              subheader={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={cohort.cohortType} 
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {cohort.initialUsers} users
                  </Typography>
                </Stack>
              }
              sx={{ pb: 1 }}
            />
            
            <CardContent sx={{ pt: 0 }}>
              {/* Cohort Info */}
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Started: {new Date(cohort.cohortStartDate).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MonetizationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {cohort.productType} • {cohort.paymentFrequency}
                  </Typography>
                </Stack>
              </Stack>

              {/* Mini Sparkline */}
              {cohort.sparklineData && (
                <Box sx={{ mb: 2, height: 60 }}>
                  <SparkLineChart
                    data={cohort.sparklineData}
                    height={60}
                    showTooltip
                    showHighlight
                    colors={[
                      cohort.performance === 'high' ? CHART_COLORS.success :
                      cohort.performance === 'medium' ? CHART_COLORS.warning :
                      CHART_COLORS.error
                    ]}
                  />
                </Box>
              )}

              {/* Key Metrics Grid */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <MetricBox 
                    colorType={cohort.retentionRate >= 70 ? 'success' : 'warning'}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {cohort.retentionRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Retention
                    </Typography>
                  </MetricBox>
                </Grid>
                <Grid item xs={6}>
                  <MetricBox colorType="primary">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      ₹{(cohort.avgLTV / 1000).toFixed(1)}K
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg LTV
                    </Typography>
                  </MetricBox>
                </Grid>
              </Grid>

              {/* Additional Metrics */}
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    LTV:CAC Ratio
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {(cohort.avgLTV / cohort.avgCAC).toFixed(1)}:1
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Channel
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {cohort.acquisitionChannel}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Churn Rate
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {cohort.churnRate}%
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button
                fullWidth
                variant={isSelected ? "contained" : "outlined"}
                startIcon={<VisibilityIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCohort(cohort);
                  setActiveTab(1);
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                View Analysis
              </Button>
            </CardActions>
          </CohortCard>
        </Grow>
      </Grid>
    );
  };

  return (
    <Box sx={{ mt: embedded ? 4 : 0 }}>
      {/* Header Section */}
      {!embedded && (
        <Box sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          borderRadius: 3,
          p: 3,
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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', mb: 1 }}>
                <GroupAddIcon sx={{ mr: 1.5, fontSize: '2.5rem', verticalAlign: 'middle' }} />
                Revenue Cohorts & Customer Analytics
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track customer retention, lifetime value, and revenue patterns by cohort
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={compareMode} 
                    onChange={(e) => {
                      setCompareMode(e.target.checked);
                      if (!e.target.checked) setSelectedForComparison([]);
                    }}
                  />
                }
                label="Compare Mode"
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  setCohortToEdit(null);
                  setShowFormDialog(true);
                }}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 4,
                  px: 3,
                  py: 1.5,
                  '&:hover': { boxShadow: 8 }
                }}
              >
                Define Cohort
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Alert Messages */}
      {message.text && (
        <Fade in>
          <Box sx={{ mb: 3 }}>
            <AlertMessage message={message.text} severity={message.type || 'info'} />
          </Box>
        </Fade>
      )}

      {/* Main Content Card */}
      <GlassCard sx={{ mb: 4 }}>
        <CardContent>
          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <StyledTab 
              label="All Cohorts" 
              icon={<DashboardIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start" 
            />
            <StyledTab 
              label="Cohort Analysis" 
              icon={<AssessmentIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start"
              disabled={!selectedCohort}
            />
            {compareMode && selectedForComparison.length > 1 && (
              <StyledTab 
                label={`Compare (${selectedForComparison.length})`}
                icon={<CompareArrowsIcon sx={{ fontSize: 20 }} />} 
                iconPosition="start" 
              />
            )}
          </Tabs>

          {/* All Cohorts Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Filters and Search */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
                <TextField
                  placeholder="Search cohorts..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ maxWidth: 300 }}
                />
                
                <ToggleButtonGroup
                  value={filterType}
                  exclusive
                  onChange={(e, v) => v && setFilterType(v)}
                  size="small"
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="weekly">Weekly</ToggleButton>
                  <ToggleButton value="monthly">Monthly</ToggleButton>
                  <ToggleButton value="quarterly">Quarterly</ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ flexGrow: 1 }} />

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, v) => v && setViewMode(v)}
                  size="small"
                >
                  <ToggleButton value="grid">Grid</ToggleButton>
                  <ToggleButton value="list">List</ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {/* Summary Metrics */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <MetricBox colorType="primary">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <GroupAddIcon />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {cohorts.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Cohorts
                        </Typography>
                      </Box>
                    </Stack>
                  </MetricBox>
                </Grid>
                <Grid item xs={12} md={3}>
                  <MetricBox colorType="success">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <PeopleIcon />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {cohorts.reduce((sum, c) => sum + c.initialUsers, 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Users
                        </Typography>
                      </Box>
                    </Stack>
                  </MetricBox>
                </Grid>
                <Grid item xs={12} md={3}>
                  <MetricBox colorType="info">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <MonetizationOnIcon />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          ₹{((cohorts.reduce((sum, c) => sum + (c.avgLTV || 0), 0) / cohorts.length || 0) / 1000).toFixed(1)}K
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Avg LTV
                        </Typography>
                      </Box>
                    </Stack>
                  </MetricBox>
                </Grid>
                <Grid item xs={12} md={3}>
                  <MetricBox colorType="warning">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <DataUsageIcon />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {Math.round(cohorts.reduce((sum, c) => sum + c.retentionRate, 0) / cohorts.length || 0)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Avg Retention
                        </Typography>
                      </Box>
                    </Stack>
                  </MetricBox>
                </Grid>
              </Grid>

              {/* Loading State */}
              {loading && (
                <Grid container spacing={3}>
                  {[...Array(6)].map((_, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Empty State */}
              {!loading && filteredCohorts.length === 0 && (
                <Paper elevation={0} sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.03)} 0%, ${alpha(theme.palette.grey[500], 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <GroupAddIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchQuery || filterType !== 'all' 
                      ? 'No cohorts found matching your criteria' 
                      : 'No revenue cohorts defined yet'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {searchQuery || filterType !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create your first cohort to start tracking customer behavior'}
                  </Typography>
                  {!searchQuery && filterType === 'all' && (
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<AddIcon />} 
                      onClick={() => setShowFormDialog(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      Define First Cohort
                    </Button>
                  )}
                </Paper>
              )}

              {/* Cohorts Grid */}
              {!loading && filteredCohorts.length > 0 && (
                <Grid container spacing={3}>
                  {filteredCohorts.map((cohort, index) => renderCohortCard(cohort, index))}
                </Grid>
              )}
            </Box>
          )}

          {/* Cohort Analysis Tab */}
          {activeTab === 1 && selectedCohort && (
            <Fade in>
              <Box>
                {/* Cohort Header */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(
                      selectedCohort.performance === 'high' ? theme.palette.success.main :
                      selectedCohort.performance === 'medium' ? theme.palette.warning.main :
                      theme.palette.error.main, 0.1
                    )} 0%, transparent 100%)`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {selectedCohort.cohortName}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip 
                          label={`${selectedCohort.cohortType} cohort`}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {selectedCohort.initialUsers} users • {selectedCohort.productType}
                        </Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Metric</InputLabel>
                        <Select
                          value={selectedMetric}
                          label="Metric"
                          onChange={(e) => setSelectedMetric(e.target.value)}
                        >
                          <MenuItem value="revenue">Revenue</MenuItem>
                          <MenuItem value="customers">Customers</MenuItem>
                          <MenuItem value="retention">Retention</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton onClick={() => handleEditCohort(selectedCohort)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton>
                        <ShareIcon />
                      </IconButton>
                      <IconButton>
                        <DownloadIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Key Metrics Dashboard */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={3}>
                    <MetricBox colorType="success">
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        ₹{(selectedCohort.avgLTV / 1000).toFixed(1)}K
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average LTV
                      </Typography>
                    </MetricBox>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MetricBox colorType="primary">
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        ₹{selectedCohort.avgCAC}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average CAC
                      </Typography>
                    </MetricBox>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MetricBox colorType="info">
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {(selectedCohort.avgLTV / selectedCohort.avgCAC).toFixed(1)}:1
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        LTV:CAC Ratio
                      </Typography>
                    </MetricBox>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MetricBox colorType={selectedCohort.retentionRate >= 70 ? 'warning' : 'error'}>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {selectedCohort.retentionRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overall Retention
                      </Typography>
                    </MetricBox>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  {/* Retention Curves */}
                  <Grid item xs={12} md={8}>
                    <ChartContainer>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Customer & Revenue Retention Curves
                      </Typography>
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart 
                          data={selectedCohort.retentionCurve}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                          <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
                          <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                          <RechartsTooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="retention"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={3}
                            name="Customer Retention"
                            dot={{ fill: CHART_COLORS.primary }}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke={CHART_COLORS.success}
                            strokeWidth={3}
                            name="Revenue Retention"
                            dot={{ fill: CHART_COLORS.success }}
                          />
                          <ReferenceLine 
                            y={80} 
                            stroke={theme.palette.warning.main} 
                            strokeDasharray="5 5"
                            label="Target"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </Grid>

                  {/* LTV Analysis */}
                  <Grid item xs={12} md={4}>
                    <ChartContainer>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        LTV Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                          <XAxis dataKey="cac" name="CAC" unit="₹" />
                          <YAxis dataKey="ltv" name="LTV" unit="₹" />
                          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter 
                            name="Customers" 
                            data={selectedCohort.ltvSegments.map(s => ({ 
                              ltv: s.ltv, 
                              cac: s.cac,
                              customers: s.customers 
                            }))} 
                            fill={CHART_COLORS.primary}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                        Bubble size represents customer count
                      </Typography>
                    </ChartContainer>
                  </Grid>

                  {/* Cohort Retention Table */}
                  <Grid item xs={12}>
                    <ChartContainer>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {selectedMetric === 'revenue' ? 'Revenue' : 'Customer'} Retention by Period
                      </Typography>
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ minWidth: 800, p: 2 }}>
                          <Grid container spacing={1}>
                            {/* Header */}
                            <Grid item xs={2}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Cohort
                              </Typography>
                            </Grid>
                            {[0, 1, 2, 3, 4, 5].map(month => (
                              <Grid item xs={1.6} key={month}>
                                <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', display: 'block' }}>
                                  Month {month}
                                </Typography>
                              </Grid>
                            ))}
                            
                            {/* Data Rows */}
                            {selectedCohort.cohortTableData.map((cohort, index) => (
                              <React.Fragment key={index}>
                                <Grid item xs={2}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {cohort.cohort}
                                  </Typography>
                                </Grid>
                                {[0, 1, 2, 3, 4, 5].map(month => {
                                  const value = month === 0 ? 100 : cohort[`month${month}`];
                                  return (
                                    <Grid item xs={1.6} key={month}>
                                      {value !== undefined ? (
                                        <Paper
                                          elevation={0}
                                          sx={{
                                            p: 1,
                                            textAlign: 'center',
                                            backgroundColor: alpha(getCohortColor(value), 0.1),
                                            border: `1px solid ${alpha(getCohortColor(value), 0.3)}`,
                                            borderRadius: 1,
                                          }}
                                        >
                                          <Typography variant="body2" sx={{ fontWeight: 600, color: getCohortColor(value) }}>
                                            {value}%
                                          </Typography>
                                        </Paper>
                                      ) : (
                                        <Box sx={{ p: 1, textAlign: 'center' }}>
                                          <Typography variant="body2" color="text.disabled">
                                            —
                                          </Typography>
                                        </Box>
                                      )}
                                    </Grid>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </Grid>
                        </Box>
                      </Box>
                    </ChartContainer>
                  </Grid>

                  {/* LTV by Segment */}
                  <Grid item xs={12}>
                    <ChartContainer>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        LTV:CAC Analysis by Segment
                      </Typography>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={selectedCohort.ltvSegments} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="segment" />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="ltv" fill={CHART_COLORS.success} name="LTV (₹)" />
                          <Bar dataKey="cac" fill={CHART_COLORS.error} name="CAC (₹)" />
                        </BarChart>
                      </ResponsiveContainer>
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        {selectedCohort.ltvSegments.map((segment, index) => (
                          <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 1.5,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                background: alpha(
                                  segment.ratio >= 5 ? theme.palette.success.main :
                                  segment.ratio >= 3 ? theme.palette.warning.main :
                                  theme.palette.error.main, 0.05
                                )
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {segment.segment}
                              </Typography>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Ratio
                                </Typography>
                                <Chip 
                                  label={`${segment.ratio}x`} 
                                  size="small" 
                                  color={segment.ratio >= 5 ? 'success' : segment.ratio >= 3 ? 'warning' : 'error'}
                                />
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {segment.customers} customers
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </ChartContainer>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {/* Comparison Tab */}
          {activeTab === 2 && compareMode && selectedForComparison.length > 1 && (
            <Fade in>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Cohort Comparison
                </Typography>
                
                {/* Comparison Chart */}
                <ChartContainer sx={{ mb: 3 }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                      <XAxis 
                        dataKey="month" 
                        label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }}
                      />
                      <YAxis 
                        label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }}
                      />
                      <RechartsTooltip />
                      <Legend />
                      {comparisonData.map((cohort, index) => (
                        <Line
                          key={cohort._id}
                          type="monotone"
                          data={cohort.retentionCurve}
                          dataKey="retention"
                          stroke={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                          strokeWidth={3}
                          name={cohort.cohortName}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Comparison Table */}
                <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Metric</th>
                          {comparisonData.map(cohort => (
                            <th key={cohort._id} style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                              {cohort.cohortName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            Initial Users
                          </td>
                          {comparisonData.map(cohort => (
                            <td key={cohort._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`
                            }}>
                              {cohort.initialUsers}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            Retention Rate
                          </td>
                          {comparisonData.map(cohort => (
                            <td key={cohort._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`,
                              fontWeight: 600,
                              color: cohort.retentionRate >= 70 
                                ? theme.palette.success.main 
                                : cohort.retentionRate >= 50
                                ? theme.palette.warning.main
                                : theme.palette.error.main
                            }}>
                              {cohort.retentionRate}%
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            Average LTV
                          </td>
                          {comparisonData.map(cohort => (
                            <td key={cohort._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`
                            }}>
                              ₹{(cohort.avgLTV / 1000).toFixed(1)}K
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            LTV:CAC Ratio
                          </td>
                          {comparisonData.map(cohort => (
                            <td key={cohort._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`,
                              fontWeight: 600,
                              color: (cohort.avgLTV / cohort.avgCAC) >= 3 
                                ? theme.palette.success.main 
                                : theme.palette.warning.main
                            }}>
                              {(cohort.avgLTV / cohort.avgCAC).toFixed(1)}:1
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            Acquisition Channel
                          </td>
                          {comparisonData.map(cohort => (
                            <td key={cohort._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`
                            }}>
                              {cohort.acquisitionChannel}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </Box>
                </Paper>
              </Box>
            </Fade>
          )}
        </CardContent>
      </GlassCard>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl && selectedCohortMenu)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedCohortMenu(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            minWidth: 180
          }
        }}
      >
        <MenuItem onClick={() => {
          const cohort = cohorts.find(c => c._id === selectedCohortMenu);
          if (cohort) handleEditCohort(cohort);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Cohort
        </MenuItem>
        <MenuItem onClick={() => {
          const cohort = cohorts.find(c => c._id === selectedCohortMenu);
          if (cohort) {
            setSelectedCohort(cohort);
            setActiveTab(1);
          }
          setAnchorEl(null);
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Analysis
        </MenuItem>
        <MenuItem>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            const cohort = cohorts.find(c => c._id === selectedCohortMenu);
            if (cohort) handleOpenDeleteDialog(cohort._id, cohort.cohortName);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Form Dialog */}
      <Dialog
        open={showFormDialog}
        onClose={() => { 
          setShowFormDialog(false); 
          setCohortToEdit(null); 
        }}
        maxWidth="md" 
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.95)
          } 
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          fontWeight: 700,
          fontSize: '1.5rem',
          borderBottom: `1px solid ${theme.palette.divider}` 
        }}>
          {cohortToEdit ? 'Edit Revenue Cohort' : 'Define New Revenue Cohort'}
        </DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <RevenueCohortForm 
            onCohortSaved={handleCohortSaved} 
            cohortToEdit={cohortToEdit}
            onCancelEdit={() => { 
              setShowFormDialog(false); 
              setCohortToEdit(null); 
            }}
            key={cohortToEdit?._id || 'new-revenue-cohort'} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the cohort "<strong>{deleteDialog.name}</strong>"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCohort} 
            color="error" 
            variant="contained" 
            autoFocus
            sx={{ borderRadius: 2 }}
          >
            Delete Cohort
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RevenueCohortsSection;   