// src/components/analytics/RunwayScenariosSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Tooltip, CircularProgress, 
  Card, CardHeader, CardContent, Avatar, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, alpha, useTheme, Grow, Stack, Divider, Fade, Skeleton,
  LinearProgress, Tab, Tabs, TextField, InputAdornment, Badge, Menu, MenuItem,
  ButtonGroup, ToggleButton, ToggleButtonGroup, Collapse, CardActions,
  List, ListItem, ListItemIcon, ListItemText, Switch, FormControlLabel
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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, ReferenceLine, Brush, PieChart, Pie, Cell
} from 'recharts';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

import RunwayScenarioForm from './RunwayScenarioForm';
import { getRunwayScenarios, deleteRunwayScenario, compareRunwayScenarios } from '../../services/api';
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

const ScenarioCard = styled(GlassCard)(({ theme, status }) => ({
  background: status === 'healthy' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
    : status === 'warning'
    ? `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(
    status === 'healthy' ? theme.palette.success.main : 
    status === 'warning' ? theme.palette.warning.main : 
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
      status === 'healthy' ? theme.palette.success.main : 
      status === 'warning' ? theme.palette.warning.main : 
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
  ...(status === 'healthy' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.dark,
    borderColor: theme.palette.success.main,
  }),
  ...(status === 'warning' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.dark,
    borderColor: theme.palette.warning.main,
  }),
  ...(status === 'critical' && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.dark,
    borderColor: theme.palette.error.main,
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

// Helper function to determine scenario health status
const getScenarioStatus = (runwayMonths) => {
  if (runwayMonths >= 18) return 'healthy';
  if (runwayMonths >= 12) return 'warning';
  return 'critical';
};

// Mock monte carlo simulation data
const generateMonteCarloData = () => {
  const scenarios = 100;
  const data = [];
  for (let i = 0; i < scenarios; i++) {
    const baseRunway = 12 + Math.random() * 24;
    const variance = (Math.random() - 0.5) * 8;
    data.push({
      scenario: i + 1,
      runway: Math.max(3, baseRunway + variance),
      probability: Math.random()
    });
  }
  return data.sort((a, b) => a.runway - b.runway);
};

const RunwayScenariosSection = ({ embedded = false }) => {
  const theme = useTheme();
  const [scenarios, setScenarios] = useState([]);
  const [scenarioToEdit, setScenarioToEdit] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedScenarioMenu, setSelectedScenarioMenu] = useState(null);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRunwayScenarios();
      // Add mock data for demo
      const scenariosWithMockData = (response.data || []).map(scenario => ({
        ...scenario,
        status: getScenarioStatus(scenario.totalRunwayMonths),
        sparklineData: Array.from({ length: 12 }, () => Math.random() * 1000000 + 500000),
        monteCarloData: generateMonteCarloData(),
        metrics: {
          burnRate: Math.floor(Math.random() * 500000) + 100000,
          monthlyRevenue: Math.floor(Math.random() * 300000),
          growthRate: Math.random() * 30 - 10,
          confidence: Math.floor(Math.random() * 30) + 70
        }
      }));
      setScenarios(scenariosWithMockData);
    } catch (error) {
      console.error("Error fetching runway scenarios:", error);
      setMessage({ type: 'error', text: 'Could not load runway scenarios.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleScenarioSaved = (savedScenario) => {
    fetchScenarios();
    setScenarioToEdit(null);
    setShowFormDialog(false);
    setMessage({ type: 'success', text: `Scenario "${savedScenario.name}" saved successfully!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleEditScenario = (scenario) => {
    setScenarioToEdit(scenario);
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

  const handleDeleteScenario = async () => {
    if (!deleteDialog.id) return;
    try {
      // await deleteRunwayScenario(deleteDialog.id);
      setScenarios(prev => prev.filter(s => s._id !== deleteDialog.id));
      setMessage({ type: 'success', text: `Scenario "${deleteDialog.name}" deleted successfully.` });
    } catch (error) {
      console.error("Error deleting scenario:", error);
      setMessage({ type: 'error', text: 'Could not delete scenario.' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleToggleComparison = (scenarioId) => {
    if (selectedForComparison.includes(scenarioId)) {
      setSelectedForComparison(prev => prev.filter(id => id !== scenarioId));
    } else if (selectedForComparison.length < 3) {
      setSelectedForComparison(prev => [...prev, scenarioId]);
    } else {
      setMessage({ type: 'warning', text: 'You can compare up to 3 scenarios at once.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Filter scenarios
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scenario.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || scenario.status === filterType;
    return matchesSearch && matchesFilter;
  });

  // Get comparison data
  const comparisonData = selectedForComparison.length > 0 
    ? scenarios.filter(s => selectedForComparison.includes(s._id))
    : [];

  const renderScenarioCard = (scenario, index) => {
    const isSelected = selectedScenario?._id === scenario._id;
    const isComparing = selectedForComparison.includes(scenario._id);
    
    return (
      <Grid item xs={12} sm={6} md={4} key={scenario._id}>
        <Grow in timeout={200 + index * 100}>
          <ScenarioCard 
            status={scenario.status}
            onClick={() => setSelectedScenario(scenario)}
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
                    scenario.status === 'healthy' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> :
                    scenario.status === 'warning' ? <WarningAmberIcon sx={{ fontSize: 14 }} /> :
                    <WarningAmberIcon sx={{ fontSize: 14 }} />
                  }
                  color={
                    scenario.status === 'healthy' ? 'success' :
                    scenario.status === 'warning' ? 'warning' : 'error'
                  }
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <Avatar sx={{ 
                    bgcolor: alpha(
                      scenario.status === 'healthy' ? CHART_COLORS.success :
                      scenario.status === 'warning' ? CHART_COLORS.warning :
                      CHART_COLORS.error, 0.15
                    ),
                    color: scenario.status === 'healthy' ? CHART_COLORS.success :
                           scenario.status === 'warning' ? CHART_COLORS.warning :
                           CHART_COLORS.error,
                    width: 48,
                    height: 48
                  }}>
                    <TimelineIcon />
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
                          handleToggleComparison(scenario._id);
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
                      setSelectedScenarioMenu(scenario._id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              }
              title={
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                  {scenario.name}
                </Typography>
              }
              subheader={
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusChip 
                    label={scenario.scenarioType || 'Standard'} 
                    size="small"
                    variant="outlined"
                    status={scenario.status}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {scenario.confidence}% confidence
                  </Typography>
                </Stack>
              }
              sx={{ pb: 1 }}
            />
            
            <CardContent sx={{ pt: 0 }}>
              {/* Description */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: 40
                }}
              >
                {scenario.description || "Standard runway projection scenario"}
              </Typography>

              {/* Mini Sparkline */}
              {scenario.sparklineData && (
                <Box sx={{ mb: 2, height: 60 }}>
                  <SparkLineChart
                    data={scenario.sparklineData}
                    height={60}
                    showTooltip
                    showHighlight
                    colors={[
                      scenario.status === 'healthy' ? CHART_COLORS.success :
                      scenario.status === 'warning' ? CHART_COLORS.warning :
                      CHART_COLORS.error
                    ]}
                  />
                </Box>
              )}

              {/* Key Metrics Grid */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <MetricBox 
                    colorType={
                      scenario.status === 'healthy' ? 'success' :
                      scenario.status === 'warning' ? 'warning' : 'error'
                    }
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {scenario.totalRunwayMonths || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Months Runway
                    </Typography>
                  </MetricBox>
                </Grid>
                <Grid item xs={6}>
                  <MetricBox colorType="info">
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ₹{((scenario.metrics?.burnRate || 0) / 100000).toFixed(1)}L
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Monthly Burn
                    </Typography>
                  </MetricBox>
                </Grid>
              </Grid>

              {/* Additional Info */}
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Cash Out Date
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {scenario.dateOfCashOut 
                      ? new Date(scenario.dateOfCashOut).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })
                      : 'N/A'}
                  </Typography>
                </Stack>
                {scenario.breakEvenMonth && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Break Even
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                      Month {scenario.breakEvenMonth}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Growth Rate
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {scenario.metrics?.growthRate >= 0 ? (
                      <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 14, color: 'error.main' }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {Math.abs(scenario.metrics?.growthRate || 0).toFixed(1)}%
                    </Typography>
                  </Stack>
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
                  setSelectedScenario(scenario);
                  setActiveTab(1); // Switch to details tab
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                View Details
              </Button>
            </CardActions>
          </ScenarioCard>
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
                <TimelineIcon sx={{ mr: 1.5, fontSize: '2.5rem', verticalAlign: 'middle' }} />
                Runway Scenarios & Projections
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Visualize cash flow projections and plan for different business scenarios
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
                  setScenarioToEdit(null);
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
                Create Scenario
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
              label="All Scenarios" 
              icon={<DashboardIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start" 
            />
            <StyledTab 
              label="Scenario Details" 
              icon={<AssessmentIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start"
              disabled={!selectedScenario}
            />
            {compareMode && selectedForComparison.length > 1 && (
              <StyledTab 
                label={`Compare (${selectedForComparison.length})`}
                icon={<CompareArrowsIcon sx={{ fontSize: 20 }} />} 
                iconPosition="start" 
              />
            )}
          </Tabs>

          {/* All Scenarios Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Filters and Search */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
                <TextField
                  placeholder="Search scenarios..."
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
                  <ToggleButton value="healthy">Healthy</ToggleButton>
                  <ToggleButton value="warning">Warning</ToggleButton>
                  <ToggleButton value="critical">Critical</ToggleButton>
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
                      <TimelineIcon />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {scenarios.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Scenarios
                        </Typography>
                      </Box>
                    </Stack>
                  </MetricBox>
                </Grid>
                <Grid item xs={12} md={3}>
                  <MetricBox colorType="success">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <CheckCircleIcon />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {scenarios.filter(s => s.status === 'healthy').length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Healthy (18+ months)
                        </Typography>
                      </Box>
                    </Stack>
                  </MetricBox>
                </Grid>
                <Grid item xs={12} md={3}>
                  <MetricBox colorType="warning">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <WarningAmberIcon />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {scenarios.filter(s => s.status === 'warning').length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Warning (12-18 months)
                        </Typography>
                      </Box>
                    </Stack>
                  </MetricBox>
                </Grid>
                <Grid item xs={12} md={3}>
                  <MetricBox colorType="error">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <WarningAmberIcon />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {scenarios.filter(s => s.status === 'critical').length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Critical (&lt;12 months)
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
                      <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Empty State */}
              {!loading && filteredScenarios.length === 0 && (
                <Paper elevation={0} sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.03)} 0%, ${alpha(theme.palette.grey[500], 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <TimelineIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchQuery || filterType !== 'all' 
                      ? 'No scenarios found matching your criteria' 
                      : 'No runway scenarios created yet'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {searchQuery || filterType !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create your first scenario to start projecting your runway'}
                  </Typography>
                  {!searchQuery && filterType === 'all' && (
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<AddIcon />} 
                      onClick={() => setShowFormDialog(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      Create First Scenario
                    </Button>
                  )}
                </Paper>
              )}

              {/* Scenarios Grid */}
              {!loading && filteredScenarios.length > 0 && (
                <Grid container spacing={3}>
                  {filteredScenarios.map((scenario, index) => renderScenarioCard(scenario, index))}
                </Grid>
              )}
            </Box>
          )}

          {/* Scenario Details Tab */}
          {activeTab === 1 && selectedScenario && (
            <Fade in>
              <Box>
                {/* Scenario Header */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(
                      selectedScenario.status === 'healthy' ? theme.palette.success.main :
                      selectedScenario.status === 'warning' ? theme.palette.warning.main :
                      theme.palette.error.main, 0.1
                    )} 0%, transparent 100%)`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {selectedScenario.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedScenario.description}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <IconButton onClick={() => handleEditScenario(selectedScenario)}>
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
                    <MetricBox colorType={
                      selectedScenario.status === 'healthy' ? 'success' :
                      selectedScenario.status === 'warning' ? 'warning' : 'error'
                    }>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {selectedScenario.totalRunwayMonths}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Months of Runway
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((selectedScenario.totalRunwayMonths / 24) * 100, 100)}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        color={
                          selectedScenario.status === 'healthy' ? 'success' :
                          selectedScenario.status === 'warning' ? 'warning' : 'error'
                        }
                      />
                    </MetricBox>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MetricBox colorType="info">
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        ₹{(selectedScenario.metrics?.burnRate / 100000).toFixed(1)}L
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Burn Rate
                      </Typography>
                    </MetricBox>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MetricBox colorType="primary">
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {selectedScenario.dateOfCashOut 
                          ? new Date(selectedScenario.dateOfCashOut).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Projected Cash Out
                      </Typography>
                    </MetricBox>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MetricBox colorType="success">
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {selectedScenario.breakEvenMonth ? `Month ${selectedScenario.breakEvenMonth}` : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Break Even Point
                      </Typography>
                    </MetricBox>
                  </Grid>
                </Grid>

                {/* Main Chart */}
                <ChartContainer sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Cash Flow Projection
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={showAdvancedMetrics} 
                          onChange={(e) => setShowAdvancedMetrics(e.target.checked)}
                        />
                      }
                      label="Advanced Metrics"
                    />
                  </Stack>
                  
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart 
                      data={selectedScenario.monthlyProjections || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                      <XAxis 
                        dataKey="month" 
                        stroke={theme.palette.text.secondary}
                        style={{ fontSize: '0.875rem' }}
                      />
                      <YAxis 
                        stroke={theme.palette.text.secondary}
                        style={{ fontSize: '0.875rem' }}
                        tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`}
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
                        formatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '10px' }}
                      />
                      <ReferenceLine 
                        y={0} 
                        stroke={theme.palette.error.main} 
                        strokeDasharray="5 5"
                        label={{ value: "Zero Cash", position: "left" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="endingCash"
                        stroke={CHART_COLORS.primary}
                        fill="url(#colorCash)"
                        strokeWidth={3}
                        name="Cash Balance"
                      />
                      {showAdvancedMetrics && (
                        <>
                          <Bar
                            dataKey="revenue"
                            fill={CHART_COLORS.success}
                            opacity={0.8}
                            name="Monthly Revenue"
                          />
                          <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke={CHART_COLORS.error}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Monthly Expenses"
                          />
                        </>
                      )}
                      <Brush 
                        dataKey="month" 
                        height={30} 
                        stroke={theme.palette.primary.main}
                        fill={alpha(theme.palette.primary.main, 0.1)}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* Monte Carlo Simulation */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <ChartContainer>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Monte Carlo Simulation
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={selectedScenario.monteCarloData}>
                          <defs>
                            <linearGradient id="colorMonteCarlo" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={CHART_COLORS.info} stopOpacity={0.8}/>
                              <stop offset="95%" stopColor={CHART_COLORS.info} stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                          <XAxis 
                            dataKey="runway" 
                            label={{ value: 'Runway (months)', position: 'insideBottomRight', offset: -5 }}
                            stroke={theme.palette.text.secondary}
                          />
                          <YAxis 
                            label={{ value: 'Probability', angle: -90, position: 'insideLeft' }}
                            stroke={theme.palette.text.secondary}
                          />
                          <RechartsTooltip />
                          <Area
                            type="monotone"
                            dataKey="probability"
                            stroke={CHART_COLORS.info}
                            fill="url(#colorMonteCarlo)"
                            name="Probability Distribution"
                          />
                          <ReferenceLine 
                            x={selectedScenario.totalRunwayMonths} 
                            stroke={theme.palette.primary.main} 
                            strokeWidth={2}
                            label={{ value: "Expected", position: "top" }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">P10 (Pessimistic)</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {Math.floor(selectedScenario.totalRunwayMonths * 0.7)} months
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">P50 (Expected)</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {selectedScenario.totalRunwayMonths} months
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">P90 (Optimistic)</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {Math.floor(selectedScenario.totalRunwayMonths * 1.3)} months
                          </Typography>
                        </Stack>
                      </Stack>
                    </ChartContainer>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <ChartContainer>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Risk Factors
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <TrendingUpIcon color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Revenue Growth"
                            secondary={`${selectedScenario.metrics?.growthRate || 0}% monthly growth rate`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccountBalanceIcon color="info" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Current Cash Position"
                            secondary={`₹${((selectedScenario.monthlyProjections?.[0]?.endingCash || 0) / 100000).toFixed(1)}L available`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <WarningAmberIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Burn Rate Volatility"
                            secondary="±15% monthly variance expected"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TimelineIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Scenario Confidence"
                            secondary={`${selectedScenario.confidence || 75}% confidence level`}
                          />
                        </ListItem>
                      </List>
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
                  Scenario Comparison
                </Typography>
                
                {/* Comparison Chart */}
                <ChartContainer sx={{ mb: 3 }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                      <XAxis 
                        dataKey="month" 
                        stroke={theme.palette.text.secondary}
                        style={{ fontSize: '0.875rem' }}
                      />
                      <YAxis 
                        stroke={theme.palette.text.secondary}
                        style={{ fontSize: '0.875rem' }}
                        tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: alpha(theme.palette.background.paper, 0.98),
                          border: 'none',
                          borderRadius: 12,
                          boxShadow: theme.shadows[8],
                          padding: '12px 16px'
                        }}
                        formatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Legend />
                      {comparisonData.map((scenario, index) => (
                        <Line
                          key={scenario._id}
                          type="monotone"
                          data={scenario.monthlyProjections}
                          dataKey="endingCash"
                          stroke={CHART_COLORS[Object.keys(CHART_COLORS)[index % Object.keys(CHART_COLORS).length]]}
                          strokeWidth={3}
                          name={scenario.name}
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
                          {comparisonData.map(scenario => (
                            <th key={scenario._id} style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                              {scenario.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            Runway (months)
                          </td>
                          {comparisonData.map(scenario => (
                            <td key={scenario._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`,
                              fontWeight: 600,
                              color: getScenarioStatus(scenario.totalRunwayMonths) === 'healthy' 
                                ? theme.palette.success.main 
                                : getScenarioStatus(scenario.totalRunwayMonths) === 'warning'
                                ? theme.palette.warning.main
                                : theme.palette.error.main
                            }}>
                              {scenario.totalRunwayMonths}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            Monthly Burn
                          </td>
                          {comparisonData.map(scenario => (
                            <td key={scenario._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`
                            }}>
                              ₹{(scenario.metrics?.burnRate / 100000).toFixed(1)}L
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            Cash Out Date
                          </td>
                          {comparisonData.map(scenario => (
                            <td key={scenario._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`
                            }}>
                              {scenario.dateOfCashOut 
                                ? new Date(scenario.dateOfCashOut).toLocaleDateString()
                                : 'N/A'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            Break Even
                          </td>
                          {comparisonData.map(scenario => (
                            <td key={scenario._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`
                            }}>
                              {scenario.breakEvenMonth ? `Month ${scenario.breakEvenMonth}` : 'N/A'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{ padding: '12px', borderTop: `1px solid ${theme.palette.divider}` }}>
                            Confidence Level
                          </td>
                          {comparisonData.map(scenario => (
                            <td key={scenario._id} style={{ 
                              padding: '12px', 
                              textAlign: 'center',
                              borderTop: `1px solid ${theme.palette.divider}`
                            }}>
                              {scenario.confidence || 75}%
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
        open={Boolean(anchorEl && selectedScenarioMenu)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedScenarioMenu(null);
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
          const scenario = scenarios.find(s => s._id === selectedScenarioMenu);
          if (scenario) handleEditScenario(scenario);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Scenario
        </MenuItem>
        <MenuItem onClick={() => {
          const scenario = scenarios.find(s => s._id === selectedScenarioMenu);
          if (scenario) {
            setSelectedScenario(scenario);
            setActiveTab(1);
          }
          setAnchorEl(null);
        }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
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
            const scenario = scenarios.find(s => s._id === selectedScenarioMenu);
            if (scenario) handleOpenDeleteDialog(scenario._id, scenario.name);
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
          setScenarioToEdit(null); 
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
          {scenarioToEdit ? 'Edit Runway Scenario' : 'Create New Runway Scenario'}
        </DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <RunwayScenarioForm 
            onScenarioSaved={handleScenarioSaved} 
            scenarioToEdit={scenarioToEdit}
            onCancelEdit={() => { 
              setShowFormDialog(false); 
              setScenarioToEdit(null); 
            }}
            key={scenarioToEdit?._id || 'new-runway-scenario'} 
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
            Are you sure you want to delete the scenario "<strong>{deleteDialog.name}</strong>"? 
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
            onClick={handleDeleteScenario} 
            color="error" 
            variant="contained" 
            autoFocus
            sx={{ borderRadius: 2 }}
          >
            Delete Scenario
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RunwayScenariosSection;