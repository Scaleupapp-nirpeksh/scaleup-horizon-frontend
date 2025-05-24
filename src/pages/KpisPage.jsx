// src/pages/KpisPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Paper, Box, Grid, List, ListItem, Divider,
  ListItemText, IconButton, Tooltip, Card, CardContent, Avatar,
  Stack, useTheme, alpha, Fade, Grow, Skeleton, Chip, Button,
  LinearProgress, Tab, Tabs, TextField, InputAdornment, Badge,
  Menu, MenuItem, ButtonGroup, ToggleButton, ToggleButtonGroup,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ManualKpiSnapshotForm from '../components/kpis/ManualKpiSnapshotForm';
import { 
  getManualKpiSnapshots, 
  deleteManualKpiSnapshot,
  getDauMauHistory,
  getUserGrowthMetrics 
} from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InsightsIcon from '@mui/icons-material/Insights';
import SpeedIcon from '@mui/icons-material/Speed';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AddchartIcon from '@mui/icons-material/Addchart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette[colorType].light, 0.15)} 0%, ${alpha(theme.palette[colorType].main, 0.08)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette[colorType].main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
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

const SnapshotCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    borderColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'scale(1.02)',
  }
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.6),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  height: '100%',
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

// Components
const KpiMetric = ({ title, value, icon, change, color, loading, prefix = '', suffix = '' }) => {
  const theme = useTheme();
  const isPositive = change >= 0;
  
  return (
    <MetricCard colorType={color} elevation={0}>
      {loading ? (
        <Skeleton variant="rectangular" height={140} />
      ) : (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette[color].dark, mb: 1 }}>
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
              </Typography>
              {change !== undefined && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {isPositive ? (
                    <ArrowUpwardIcon fontSize="small" color="success" />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" color="error" />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: isPositive ? 'success.main' : 'error.main',
                      fontWeight: 600
                    }}
                  >
                    {Math.abs(change)}% from last period
                  </Typography>
                </Stack>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette[color].main, 0.2),
                color: theme.palette[color].main,
                width: 56,
                height: 56,
                position: 'relative',
                zIndex: 1
              }}
            >
              {icon}
            </Avatar>
          </Stack>
          {change !== undefined && (
            <LinearProgress
              variant="determinate"
              value={Math.min(Math.abs(change), 100)}
              sx={{
                mt: 2,
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette[color].main, 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.palette[color].main,
                  borderRadius: 2,
                }
              }}
            />
          )}
        </>
      )}
    </MetricCard>
  );
};

const KpisPage = () => {
  const theme = useTheme();
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotToEdit, setSnapshotToEdit] = useState(null);
  const [loading, setLoading] = useState({ snapshots: false, metrics: false, charts: false });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [growthMetrics, setGrowthMetrics] = useState(null);
  const [dauMauHistory, setDauMauHistory] = useState([]);

  const fetchSnapshots = useCallback(async () => {
    setLoading(prev => ({ ...prev, snapshots: true }));
    try {
      const response = await getManualKpiSnapshots({ page: 1, limit: 20, sort: '-snapshotDate' });
      setSnapshots(response.data.snapshots || []);
    } catch (error) {
      console.error("Error fetching KPI snapshots:", error);
      setMessage({ type: 'error', text: 'Could not load KPI snapshots.' });
    } finally {
      setLoading(prev => ({ ...prev, snapshots: false }));
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    setLoading(prev => ({ ...prev, metrics: true, charts: true }));
    try {
      const [growthResponse, dauMauResponse] = await Promise.all([
        getUserGrowthMetrics(),
        getDauMauHistory({ days: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90 })
      ]);
      setGrowthMetrics(growthResponse.data);
      setDauMauHistory(dauMauResponse.data.history || []);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(prev => ({ ...prev, metrics: false, charts: false }));
    }
  }, [timeRange]);

  useEffect(() => {
    fetchSnapshots();
    fetchMetrics();
  }, [fetchSnapshots, fetchMetrics]);

  const handleSnapshotSaved = (savedSnapshot) => {
    fetchSnapshots();
    fetchMetrics();
    setSnapshotToEdit(null);
    setShowFormDialog(false);
    setMessage({ type: 'success', text: `Snapshot for ${new Date(savedSnapshot.snapshotDate).toLocaleDateString()} saved.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleEditSnapshot = (snapshot) => {
    setSnapshotToEdit(snapshot);
    setShowFormDialog(true);
  };
  
  const handleDeleteSnapshot = async (id) => {
    if (window.confirm('Are you sure you want to delete this snapshot?')) {
      try {
        await deleteManualKpiSnapshot(id);
        setMessage({ type: 'success', text: 'Snapshot deleted.' });
        fetchSnapshots();
        fetchMetrics();
      } catch (error) {
        console.error("Error deleting snapshot:", error);
        setMessage({ type: 'error', text: 'Could not delete snapshot.' });
      }
    }
  };

  // Calculate current metrics from latest snapshot
  const latestSnapshot = snapshots[0];
  const previousSnapshot = snapshots[1];
  
  const calculateChange = (current, previous) => {
    if (!current || !previous) return undefined;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Filter snapshots based on search
  const filteredSnapshots = snapshots.filter(snap => {
    const dateStr = new Date(snap.snapshotDate).toLocaleDateString().toLowerCase();
    return dateStr.includes(searchQuery.toLowerCase());
  });

  // Generate chart data
  const chartData = dauMauHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dau: item.dau,
    mau: item.mau,
    ratio: item.mau > 0 ? (item.dau / item.mau * 100).toFixed(1) : 0
  }));

  // Calculate actual metrics from data
  const avgDau = chartData.length > 0 ? Math.round(chartData.reduce((sum, d) => sum + d.dau, 0) / chartData.length) : 0;
  const avgMau = chartData.length > 0 ? Math.round(chartData.reduce((sum, d) => sum + d.mau, 0) / chartData.length) : 0;
  const avgEngagementRate = chartData.length > 0 ? Math.round(chartData.reduce((sum, d) => sum + parseFloat(d.ratio), 0) / chartData.length) : 0;

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
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', mb: 1, display: 'flex', alignItems: 'center' }}>
                <BarChartIcon sx={{ mr: 1.5, fontSize: '2.5rem' }} />
                Key Performance Indicators
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor your business metrics and growth trends
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <ToggleButtonGroup
                value={timeRange}
                exclusive
                onChange={(e, v) => v && setTimeRange(v)}
                size="small"
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 2
                }}
              >
                <ToggleButton value="7d">7 Days</ToggleButton>
                <ToggleButton value="30d">30 Days</ToggleButton>
                <ToggleButton value="90d">90 Days</ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="contained"
                startIcon={<AddchartIcon />}
                onClick={() => {
                  setSnapshotToEdit(null);
                  setShowFormDialog(true);
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 4,
                  '&:hover': { boxShadow: 8 }
                }}
              >
                Add Snapshot
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {message.text && (
          <Fade in>
            <Box sx={{ mb: 3 }}>
              <AlertMessage message={message.text} severity={message.type} />
            </Box>
          </Fade>
        )}

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={500}>
              <Box>
                <KpiMetric
                  title="Daily Active Users"
                  value={latestSnapshot?.dau || 0}
                  icon={<GroupIcon />}
                  change={calculateChange(latestSnapshot?.dau, previousSnapshot?.dau)}
                  color="primary"
                  loading={loading.snapshots}
                />
              </Box>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={700}>
              <Box>
                <KpiMetric
                  title="Monthly Active Users"
                  value={latestSnapshot?.mau || 0}
                  icon={<TimelineIcon />}
                  change={calculateChange(latestSnapshot?.mau, previousSnapshot?.mau)}
                  color="success"
                  loading={loading.snapshots}
                />
              </Box>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={900}>
              <Box>
                <KpiMetric
                  title="Total Users"
                  value={latestSnapshot?.totalRegisteredUsers || 0}
                  icon={<PersonAddIcon />}
                  change={calculateChange(latestSnapshot?.totalRegisteredUsers, previousSnapshot?.totalRegisteredUsers)}
                  color="info"
                  loading={loading.snapshots}
                />
              </Box>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={1100}>
              <Box>
                <KpiMetric
                  title="DAU/MAU Ratio"
                  value={latestSnapshot?.mau > 0 ? ((latestSnapshot.dau / latestSnapshot.mau) * 100).toFixed(1) : 0}
                  icon={<SpeedIcon />}
                  change={growthMetrics?.dauMauGrowth}
                  color="warning"
                  suffix="%"
                  loading={loading.snapshots}
                />
              </Box>
            </Grow>
          </Grid>
        </Grid>

        {/* Tabs */}
        <GlassCard sx={{ mb: 4 }}>
          <CardContent>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
              <StyledTab label="Analytics Dashboard" icon={<AnalyticsIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
              <StyledTab label="Snapshot History" icon={<CalendarTodayIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
              <StyledTab label="Insights & Trends" icon={<InsightsIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
            </Tabs>

            {/* Analytics Dashboard Tab */}
            {activeTab === 0 && (
              <Fade in>
                <Box>
                  {/* Main Chart */}
                  <ChartContainer sx={{ mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        User Activity Overview
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Chip
                          icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: CHART_COLORS.primary }} />}
                          label="DAU"
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: CHART_COLORS.success }} />}
                          label="MAU"
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>
                    {loading.charts ? (
                      <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                          <XAxis 
                            dataKey="date" 
                            stroke={theme.palette.text.secondary}
                            style={{ fontSize: '0.875rem' }}
                          />
                          <YAxis 
                            stroke={theme.palette.text.secondary}
                            style={{ fontSize: '0.875rem' }}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: alpha(theme.palette.background.paper, 0.98),
                              border: 'none',
                              borderRadius: 12,
                              boxShadow: theme.shadows[8],
                              padding: '12px 16px'
                            }}
                            labelStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '10px' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="dau"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={3}
                            dot={{ fill: CHART_COLORS.primary, r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Daily Active Users"
                          />
                          <Line
                            type="monotone"
                            dataKey="mau"
                            stroke={CHART_COLORS.success}
                            strokeWidth={3}
                            dot={{ fill: CHART_COLORS.success, r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Monthly Active Users"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </ChartContainer>

                  {/* Summary Stats */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Average DAU
                          </Typography>
                          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                            {avgDau.toLocaleString()}
                          </Typography>
                          {growthMetrics?.dauGrowth !== undefined && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              {growthMetrics.dauGrowth >= 0 ? (
                                <TrendingUpIcon fontSize="small" color="success" />
                              ) : (
                                <TrendingDownIcon fontSize="small" color="error" />
                              )}
                              <Typography variant="caption" color={growthMetrics.dauGrowth >= 0 ? "success.main" : "error.main"}>
                                {Math.abs(growthMetrics.dauGrowth)}% from last period
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, transparent 100%)`,
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Average MAU
                          </Typography>
                          <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                            {avgMau.toLocaleString()}
                          </Typography>
                          {growthMetrics?.mauGrowth !== undefined && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              {growthMetrics.mauGrowth >= 0 ? (
                                <TrendingUpIcon fontSize="small" color="success" />
                              ) : (
                                <TrendingDownIcon fontSize="small" color="error" />
                              )}
                              <Typography variant="caption" color={growthMetrics.mauGrowth >= 0 ? "success.main" : "error.main"}>
                                {Math.abs(growthMetrics.mauGrowth)}% from last period
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, transparent 100%)`,
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Engagement Rate
                          </Typography>
                          <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                            {avgEngagementRate}%
                          </Typography>
                          {growthMetrics?.dauMauGrowth !== undefined && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              {growthMetrics.dauMauGrowth >= 0 ? (
                                <TrendingUpIcon fontSize="small" color="success" />
                              ) : (
                                <TrendingDownIcon fontSize="small" color="error" />
                              )}
                              <Typography variant="caption" color={growthMetrics.dauMauGrowth >= 0 ? "success.main" : "error.main"}>
                                {Math.abs(growthMetrics.dauMauGrowth)}% from last period
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}

            {/* Snapshot History Tab */}
            {activeTab === 1 && (
              <Fade in>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <TextField
                      placeholder="Search by date..."
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
                    <Chip
                      label={`${filteredSnapshots.length} snapshots`}
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  {loading.snapshots ? (
                    <Grid container spacing={2}>
                      {[...Array(6)].map((_, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : filteredSnapshots.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <BarChartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No snapshots found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 'Try a different search term' : 'Start by adding your first KPI snapshot'}
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {filteredSnapshots.map((snap, index) => (
                        <Grid item xs={12} sm={6} md={4} key={snap._id}>
                          <Grow in timeout={index * 100}>
                            <SnapshotCard
                              onClick={() => setSelectedSnapshot(snap)}
                              onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
                              onMouseLeave={() => setAnchorEl(null)}
                            >
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar
                                      sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        width: 36,
                                        height: 36
                                      }}
                                    >
                                      <CalendarTodayIcon fontSize="small" />
                                    </Avatar>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {new Date(snap.snapshotDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" spacing={0.5}>
                                    <IconButton size="small" onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSnapshot(snap);
                                    }}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSnapshot(snap._id);
                                    }}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </Stack>
                                <Divider />
                                <Grid container spacing={1}>
                                  <Grid item xs={4}>
                                    <Box textAlign="center">
                                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                        {snap.dau?.toLocaleString() || 'N/A'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        DAU
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Box textAlign="center">
                                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                                        {snap.mau?.toLocaleString() || 'N/A'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        MAU
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Box textAlign="center">
                                      <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
                                        {snap.totalRegisteredUsers?.toLocaleString() || 'N/A'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Total
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Stack>
                            </SnapshotCard>
                          </Grow>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Fade>
            )}

            {/* Insights Tab */}
            {activeTab === 2 && (
              <Fade in>
                <Box>
                  {/* Empty state for insights when no data is available */}
                  {snapshots.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <InsightsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No insights available yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add more snapshots to see trends and insights
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Metrics Overview
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Based on your {snapshots.length} snapshot{snapshots.length > 1 ? 's' : ''}, 
                        you have {latestSnapshot?.totalRegisteredUsers || 0} total users 
                        with {latestSnapshot?.dau || 0} daily active users 
                        and {latestSnapshot?.mau || 0} monthly active users.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Fade>
            )}
          </CardContent>
        </GlassCard>

        {/* Form Dialog */}
        <Dialog
          open={showFormDialog}
          onClose={() => {
            setShowFormDialog(false);
            setSnapshotToEdit(null);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            {snapshotToEdit ? 'Edit KPI Snapshot' : 'Add New KPI Snapshot'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <ManualKpiSnapshotForm
                onSnapshotSaved={handleSnapshotSaved}
                snapshotToEdit={snapshotToEdit}
                key={snapshotToEdit?._id || 'new'}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default KpisPage;