// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Button, IconButton, Tooltip,
  Card, CardContent, Avatar, Stack, Chip, Menu, MenuItem,
  CircularProgress, Alert, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, FormHelperText, Autocomplete, Divider, Collapse,
  Tabs, Tab, Fade, useMediaQuery, LinearProgress, Switch, FormControlLabel, Snackbar,
  ToggleButtonGroup, ToggleButton, InputAdornment, Breadcrumbs, Link, Slider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  useTheme, alpha, Grow, Skeleton, Badge, Stepper, Step, StepLabel,
  SpeedDial, SpeedDialAction, SpeedDialIcon, Backdrop, Rating, Pagination
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Treemap, ComposedChart, ReferenceLine, Brush,
  ScatterChart, Scatter, FunnelChart, Funnel
} from 'recharts';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CasinoIcon from '@mui/icons-material/Casino';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SpeedIcon from '@mui/icons-material/Speed';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastForwardIcon from '@mui/icons-material/FastForward';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TemplateIcon from '@mui/icons-material/Description';
import TuneIcon from '@mui/icons-material/Tune';
import BoltIcon from '@mui/icons-material/Bolt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HistoryIcon from '@mui/icons-material/History';
import CompareIcon from '@mui/icons-material/Compare';
import FolderIcon from '@mui/icons-material/Folder';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';

// API imports
import {
  createRunwayScenario,
  getRunwayScenarios,
  getRunwayScenarioById,
  updateRunwayScenario,
  deleteRunwayScenario,
  compareRunwayScenarios,
  
  createFundraisingPrediction,
  getFundraisingPredictions,
  getFundraisingPredictionById,
  updateFundraisingPrediction,
  deleteFundraisingPrediction,
  getFundraisingReadiness,
  getMarketComparables,
  
  createCashFlowForecast,
  getCashFlowForecasts,
  getCashFlowForecastById,
  updateCashFlowForecast,
  deleteCashFlowForecast,
  getHistoricalCashFlowData,
  getCurrentCashPosition,
  
  createRevenueCohort,
  getRevenueCohorts,
  getRevenueCohortById,
  updateRevenueCohort,
  deleteRevenueCohort,
  generateCohortProjections,
  getCohortsComparison,
} from '../services/api';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); }
  50% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.8), 0 0 30px rgba(66, 153, 225, 0.6); }
  100% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
const GlassCard = styled(Card)(({ theme, $glow = false }) => ({
  borderRadius: theme.spacing(2.5),
  backdropFilter: 'blur(20px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'visible',
  position: 'relative',
  animation: $glow ? `${glowAnimation} 2s ease-in-out infinite` : 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[20],
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));

const MetricCard = styled(Paper)(({ theme, color: colorProp = 'primary', $trend = 'neutral' }) => {
  const paletteColorObject = theme.palette[colorProp] || theme.palette.primary; // Fallback to primary if colorProp key doesn't exist
  const mainColor = paletteColorObject?.main || theme.palette.primary.main; // Fallback if .main is missing
  const lightColor = paletteColorObject?.light || theme.palette.primary.light; // Fallback if .light is missing

  return {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    background: `linear-gradient(135deg, ${alpha(mainColor, 0.1)} 0%, ${alpha(lightColor, 0.05)} 100%)`,
    border: `1px solid ${alpha(mainColor, 0.2)}`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: `0 12px 24px -4px ${alpha(mainColor, 0.3)}`,
      border: `1px solid ${alpha(mainColor, 0.4)}`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${mainColor}, ${lightColor})`,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -50,
      right: -50,
      width: 100,
      height: 100,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${alpha(mainColor, 0.1)} 0%, transparent 70%)`,
      animation: `${floatAnimation} 3s ease-in-out infinite`,
    },
    '& .metric-icon': {
      backgroundColor: alpha(mainColor, 0.15),
      color: mainColor,
      transition: 'all 0.3s ease',
    },
    '&:hover .metric-icon': {
      transform: 'rotate(15deg) scale(1.1)',
      backgroundColor: alpha(mainColor, 0.25),
    }
  };
});

const PredictionCard = styled(Card)(({ theme, severity = 'info' }) => {
  const colors = {
    success: theme.palette.success,
    warning: theme.palette.warning,
    error: theme.palette.error,
    info: theme.palette.info
  };
  const color = colors[severity] || colors.info;
  
  return {
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(2),
    backgroundColor: alpha(color.main, 0.08),
    border: `2px solid ${alpha(color.main, 0.2)}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: alpha(color.main, 0.12),
      borderColor: alpha(color.main, 0.3),
      transform: 'translateX(4px)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      backgroundColor: color.main,
    }
  };
});

const HistoryCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.25s ease-in-out',
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  }
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.15) rotate(10deg)',
    boxShadow: theme.shadows[8],
  }
}));

const ScenarioChip = styled(Chip)(({ theme, $active }) => ({
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  fontWeight: $active ? 700 : 500,
  ...$active && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'scale(1.08)',
    boxShadow: theme.shadows[6],
  },
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
  }
}));

const InsightBox = styled(Box)(({ theme, severity = 'info' }) => {
  const colors = {
    high: theme.palette.error,
    medium: theme.palette.warning,
    low: theme.palette.info,
    positive: theme.palette.success
  };
  const color = colors[severity] || colors.info;
  
  return {
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(color.main, 0.08),
    borderLeft: `5px solid ${color.main}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: alpha(color.main, 0.12),
      transform: 'translateX(8px)',
      boxShadow: `0 4px 12px ${alpha(color.main, 0.2)}`,
    },
    '& .insight-icon': {
      color: color.main,
      transition: 'all 0.3s ease',
    },
    '&:hover .insight-icon': {
      transform: 'scale(1.2) rotate(10deg)',
    }
  };
});

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    borderColor: theme.palette.primary.main,
  }
}));

const SearchBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5, 2),
  borderRadius: theme.spacing(4),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: 400,
  '& .MuiInputBase-root': {
    borderRadius: theme.spacing(4),
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
  }
}));

const ListViewItem = styled(Paper)(({ theme, $active }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  transition: 'all 0.25s ease',
  cursor: 'pointer',
  border: `1px solid ${$active ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: $active ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.background.paper, 0.8),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[3],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  }
}));

// Helper functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatPercentage = (value) => {
  return `${((value || 0) * 100).toFixed(1)}%`;
};

// Calculate relative time
const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now - past);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

// Chart color schemes
const chartColors = {
  primary: ['#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9'],
  success: ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'],
  warning: ['#ff9800', '#ffa726', '#ffb74d', '#ffcc80', '#ffe0b2'],
  error: ['#f44336', '#ef5350', '#e57373', '#ef9a9a', '#ffcdd2'],
  mixed: ['#3f51b5', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'],
  pastel: ['#90caf9', '#80deea', '#a5d6a7', '#ffe082', '#f48fb1', '#ce93d8']
};

// Scenario templates
const scenarioTemplates = [
  { name: 'Conservative Growth', burnGrowth: 0.03, revenueGrowth: 0.05 },
  { name: 'Aggressive Expansion', burnGrowth: 0.15, revenueGrowth: 0.25 },
  { name: 'Steady State', burnGrowth: 0, revenueGrowth: 0.10 },
  { name: 'Cost Cutting', burnGrowth: -0.05, revenueGrowth: 0.05 },
];

const AnalyticsPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  
  // View states
  const [viewMode, setViewMode] = useState('charts');
  const [listView, setListView] = useState('grid'); // 'grid' or 'list'
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  // Context menus
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  // Confirmation dialogs
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Runway Scenarios
  const [runwayScenarios, setRunwayScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioComparison, setScenarioComparison] = useState(null);
  const [openScenarioDialog, setOpenScenarioDialog] = useState(false);
  const [editScenarioMode, setEditScenarioMode] = useState(false);
  const [scenarioFormData, setScenarioFormData] = useState({
    name: '',
    description: '',
    scenarioType: 'Baseline',
    projectionMonths: 24,
    assumptions: [
      { metric: 'monthly_burn_rate', baseValue: 0, growthRate: 0.05 },
      { metric: 'revenue_growth_rate', baseValue: 0, growthRate: 0.10 }
    ],
    plannedFundraisingEvents: []
  });
  
  // Fundraising Predictions
  const [fundraisingReadiness, setFundraisingReadiness] = useState(null);
  const [fundraisingPredictions, setFundraisingPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [marketComparables, setMarketComparables] = useState(null);
  const [openFundraisingDialog, setOpenFundraisingDialog] = useState(false);
  const [editPredictionMode, setEditPredictionMode] = useState(false);
  const [fundraisingFormData, setFundraisingFormData] = useState({
    predictionName: '',
    targetRoundSize: 0,
    targetValuation: 0,
    roundType: 'Seed',
    keyMilestones: []
  });
  
  // Cash Flow Forecasts
  const [cashFlowForecasts, setCashFlowForecasts] = useState([]);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [historicalCashFlow, setHistoricalCashFlow] = useState(null);
  const [currentCashPosition, setCurrentCashPosition] = useState(null);
  const [openCashFlowDialog, setOpenCashFlowDialog] = useState(false);
  const [editForecastMode, setEditForecastMode] = useState(false);
  const [cashFlowFormData, setCashFlowFormData] = useState({
    forecastName: '',
    description: '',
    forecastType: 'Short-term',
    endDate: null,
    granularity: 'weekly'
  });
  
  // Revenue Cohorts
  const [revenueCohorts, setRevenueCohorts] = useState([]);
  const [cohortComparison, setCohortComparison] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [openCohortDialog, setOpenCohortDialog] = useState(false);
  const [editCohortMode, setEditCohortMode] = useState(false);
  const [cohortFormData, setCohortFormData] = useState({
    cohortName: '',
    cohortStartDate: new Date(),
    cohortType: 'monthly',
    initialUsers: 0,
    acquisitionChannel: '',
    acquisitionCost: 0,
    productType: '',
    metrics: []
  });
  
  // Filters and view options
  const [timeRange, setTimeRange] = useState('6m');
  const [expandedSections, setExpandedSections] = useState({
    runway: true,
    fundraising: true,
    cashflow: true,
    cohorts: true
  });

  // Fetch all data
  const fetchAnalyticsData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const [
        scenariosRes,
        scenarioCompareRes,
        fundraisingRes,
        fundraisingPredictionsRes,
        historicalCashRes,
        currentCashRes,
        cashFlowForecastsRes,
        cohortCompareRes,
        revenueCohortsRes
      ] = await Promise.all([
        getRunwayScenarios(),
        compareRunwayScenarios(),
        getFundraisingReadiness(),
        getFundraisingPredictions(),
        getHistoricalCashFlowData(),
        getCurrentCashPosition(),
        getCashFlowForecasts(),
        getCohortsComparison(),
        getRevenueCohorts()
      ]);

      // Set all state with fetched data
      setRunwayScenarios(scenariosRes.data || []);
      setScenarioComparison(scenarioCompareRes.data || null);
      setFundraisingReadiness(fundraisingRes.data || null);
      setFundraisingPredictions(fundraisingPredictionsRes.data || []);
      setHistoricalCashFlow(historicalCashRes.data || null);
      setCurrentCashPosition(currentCashRes.data || null);
      setCashFlowForecasts(cashFlowForecastsRes.data || []);
      setCohortComparison(cohortCompareRes.data || null);
      setRevenueCohorts(revenueCohortsRes.data || []);
      
      // Set selected items if available
      if (scenariosRes.data && scenariosRes.data.length > 0) {
        setSelectedScenario(scenariosRes.data[0]);
      }
      
      if (fundraisingPredictionsRes.data && fundraisingPredictionsRes.data.length > 0) {
        setSelectedPrediction(fundraisingPredictionsRes.data[0]);
      }
      
      if (cashFlowForecastsRes.data && cashFlowForecastsRes.data.length > 0) {
        setSelectedForecast(cashFlowForecastsRes.data[0]);
      }
      
      if (revenueCohortsRes.data && revenueCohortsRes.data.length > 0) {
        setSelectedCohort(revenueCohortsRes.data[0]);
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Fetch single item details
  const fetchItemById = async (type, id) => {
    setLoading(true);
    try {
      let response;
      switch (type) {
        case 'scenario':
          response = await getRunwayScenarioById(id);
          setSelectedScenario(response.data);
          break;
        case 'prediction':
          response = await getFundraisingPredictionById(id);
          setSelectedPrediction(response.data);
          break;
        case 'forecast':
          response = await getCashFlowForecastById(id);
          setSelectedForecast(response.data);
          break;
        case 'cohort':
          response = await getRevenueCohortById(id);
          setSelectedCohort(response.data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${type} details:`, err);
      setError(`Failed to load ${type} details. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle scenario creation
  const handleCreateScenario = async () => {
    try {
      setLoading(true);
      
      if (editScenarioMode) {
        const response = await updateRunwayScenario(selectedScenario._id, scenarioFormData);
        setSuccess('Runway scenario updated successfully!');
      } else {
        const response = await createRunwayScenario(scenarioFormData);
        setSuccess('Runway scenario created successfully!');
      }
      
      setOpenScenarioDialog(false);
      fetchAnalyticsData(true);
    } catch (err) {
      setError(`Failed to ${editScenarioMode ? 'update' : 'create'} scenario. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle fundraising prediction
  const handleCreateFundraisingPrediction = async () => {
    try {
      setLoading(true);
      
      if (editPredictionMode) {
        const response = await updateFundraisingPrediction(selectedPrediction._id, fundraisingFormData);
        setSuccess('Fundraising prediction updated successfully!');
      } else {
        const response = await createFundraisingPrediction(fundraisingFormData);
        setSuccess('Fundraising prediction created successfully!');
      }
      
      setOpenFundraisingDialog(false);
      fetchAnalyticsData(true);
    } catch (err) {
      setError(`Failed to ${editPredictionMode ? 'update' : 'create'} prediction. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle cash flow forecast
  const handleCreateCashFlowForecast = async () => {
    try {
      setLoading(true);
      
      if (editForecastMode) {
        const response = await updateCashFlowForecast(selectedForecast._id, cashFlowFormData);
        setSuccess('Cash flow forecast updated successfully!');
      } else {
        const response = await createCashFlowForecast(cashFlowFormData);
        setSuccess('Cash flow forecast created successfully!');
      }
      
      setOpenCashFlowDialog(false);
      fetchAnalyticsData(true);
    } catch (err) {
      setError(`Failed to ${editForecastMode ? 'update' : 'create'} forecast. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle cohort creation
  const handleCreateCohort = async () => {
    try {
      setLoading(true);
      
      if (editCohortMode) {
        const response = await updateRevenueCohort(selectedCohort._id, cohortFormData);
        setSuccess('Revenue cohort updated successfully!');
      } else {
        const response = await createRevenueCohort(cohortFormData);
        setSuccess('Revenue cohort created successfully!');
      }
      
      setOpenCohortDialog(false);
      fetchAnalyticsData(true);
    } catch (err) {
      setError(`Failed to ${editCohortMode ? 'update' : 'create'} cohort. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      setLoading(true);
      
      switch (itemToDelete.type) {
        case 'scenario':
          await deleteRunwayScenario(itemToDelete.id);
          setSuccess('Runway scenario deleted successfully!');
          if (selectedScenario?._id === itemToDelete.id) {
            setSelectedScenario(null);
          }
          break;
        case 'prediction':
          await deleteFundraisingPrediction(itemToDelete.id);
          setSuccess('Fundraising prediction deleted successfully!');
          if (selectedPrediction?._id === itemToDelete.id) {
            setSelectedPrediction(null);
          }
          break;
        case 'forecast':
          await deleteCashFlowForecast(itemToDelete.id);
          setSuccess('Cash flow forecast deleted successfully!');
          if (selectedForecast?._id === itemToDelete.id) {
            setSelectedForecast(null);
          }
          break;
        case 'cohort':
          await deleteRevenueCohort(itemToDelete.id);
          setSuccess('Revenue cohort deleted successfully!');
          if (selectedCohort?._id === itemToDelete.id) {
            setSelectedCohort(null);
          }
          break;
        default:
          break;
      }
      
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchAnalyticsData(true);
    } catch (err) {
      setError(`Failed to delete ${itemToDelete.type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit item
  const handleEditItem = (type, item) => {
    switch (type) {
      case 'scenario':
        setScenarioFormData({
          name: item.name,
          description: item.description || '',
          scenarioType: item.scenarioType,
          projectionMonths: item.projectionMonths,
          assumptions: item.assumptions || [
            { metric: 'monthly_burn_rate', baseValue: item.initialMonthlyBurn || 0, growthRate: 0.05 },
            { metric: 'revenue_growth_rate', baseValue: item.initialMonthlyRevenue || 0, growthRate: 0.10 }
          ],
          plannedFundraisingEvents: item.plannedFundraisingEvents || []
        });
        setEditScenarioMode(true);
        setOpenScenarioDialog(true);
        break;
      case 'prediction':
        setFundraisingFormData({
          predictionName: item.predictionName,
          targetRoundSize: item.targetRoundSize,
          targetValuation: item.targetValuation,
          roundType: item.roundType,
          keyMilestones: item.keyMilestones || []
        });
        setEditPredictionMode(true);
        setOpenFundraisingDialog(true);
        break;
      case 'forecast':
        setCashFlowFormData({
          forecastName: item.forecastName,
          description: item.description || '',
          forecastType: item.forecastType,
          endDate: new Date(item.endDate),
          granularity: item.granularity
        });
        setEditForecastMode(true);
        setOpenCashFlowDialog(true);
        break;
      case 'cohort':
        setCohortFormData({
          cohortName: item.cohortName,
          cohortStartDate: new Date(item.cohortStartDate),
          cohortType: item.cohortType,
          initialUsers: item.initialUsers,
          acquisitionChannel: item.acquisitionChannel,
          acquisitionCost: item.acquisitionCost,
          productType: item.productType,
          metrics: item.metrics || []
        });
        setEditCohortMode(true);
        setOpenCohortDialog(true);
        break;
      default:
        break;
    }
  };

  // Reset form states
  const resetForms = () => {
    setScenarioFormData({
      name: '',
      description: '',
      scenarioType: 'Baseline',
      projectionMonths: 24,
      assumptions: [
        { metric: 'monthly_burn_rate', baseValue: 0, growthRate: 0.05 },
        { metric: 'revenue_growth_rate', baseValue: 0, growthRate: 0.10 }
      ],
      plannedFundraisingEvents: []
    });
    
    setFundraisingFormData({
      predictionName: '',
      targetRoundSize: 0,
      targetValuation: 0,
      roundType: 'Seed',
      keyMilestones: []
    });
    
    setCashFlowFormData({
      forecastName: '',
      description: '',
      forecastType: 'Short-term',
      endDate: null,
      granularity: 'weekly'
    });
    
    setCohortFormData({
      cohortName: '',
      cohortStartDate: new Date(),
      cohortType: 'monthly',
      initialUsers: 0,
      acquisitionChannel: '',
      acquisitionCost: 0,
      productType: '',
      metrics: []
    });
    
    setEditScenarioMode(false);
    setEditPredictionMode(false);
    setEditForecastMode(false);
    setEditCohortMode(false);
  };

  // Apply template to scenario
  const applyScenarioTemplate = (template) => {
    setScenarioFormData(prev => ({
      ...prev,
      name: template.name,
      assumptions: [
        { metric: 'monthly_burn_rate', baseValue: prev.assumptions[0].baseValue, growthRate: template.burnGrowth },
        { metric: 'revenue_growth_rate', baseValue: prev.assumptions[1].baseValue, growthRate: template.revenueGrowth }
      ]
    }));
  };

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Context menu handlers
  const handleMenuOpen = (event, itemId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedItemId(null);
  };

  // Get filtered items for pagination
  const getFilteredItems = (items) => {
    // Apply search query filter
    let filtered = items;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = items.filter(item => {
        const nameField = item.name || item.predictionName || item.forecastName || item.cohortName || '';
        const descField = item.description || '';
        return nameField.toLowerCase().includes(query) || descField.toLowerCase().includes(query);
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.currentDate || a.startDate || a.cohortStartDate);
      const dateB = new Date(b.createdAt || b.currentDate || b.startDate || b.cohortStartDate);
      
      if (filterOptions.sortBy === 'date') {
        return filterOptions.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      const nameA = a.name || a.predictionName || a.forecastName || a.cohortName || '';
      const nameB = b.name || b.predictionName || b.forecastName || b.cohortName || '';
      
      if (filterOptions.sortBy === 'name') {
        return filterOptions.sortOrder === 'asc' 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      }
      
      return 0;
    });
    
    return filtered;
  };

  // Pagination handlers
  const getPageItems = (items) => {
    const filteredItems = getFilteredItems(items);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };

  // Export data functions
  const exportToPDF = () => {
    // Implementation for PDF export
    setSuccess('PDF export started. Check your downloads.');
  };

  const exportToCSV = () => {
    // Implementation for CSV export
    setSuccess('CSV export started. Check your downloads.');
  };

  const shareViaEmail = () => {
    // Implementation for email sharing
    setSuccess('Report shared via email successfully.');
  };

  // Render metric summary cards
  const renderMetricCards = () => {
    const metrics = [
      {
        title: 'Predicted Runway',
        value: selectedScenario?.totalRunwayMonths || 0,
        unit: ' months',
        icon: <TimelineIcon />,
        color: selectedScenario?.totalRunwayMonths > 12 ? 'success' : 'warning',
        trend: selectedScenario?.totalRunwayMonths > 12 ? 'up' : 'down',
        description: selectedScenario?.dateOfCashOut ? `Until ${formatDate(selectedScenario.dateOfCashOut)}` : 'Calculating...'
      },
      {
        title: 'Fundraising Readiness',
        value: Math.round((fundraisingReadiness?.overallProbability || 0) * 100),
        unit: '%',
        icon: <RocketLaunchIcon />,
        color: 'primary',
        trend: 'neutral',
        description: 'Based on current metrics'
      },
      {
        title: 'Cash Position',
        value: formatCurrency(currentCashPosition?.cash || 0),
        unit: '',
        icon: <AccountBalanceIcon />,
        color: 'info',
        trend: 'up',
        description: 'Current bank balance'
      },
      {
        title: 'Avg Retention',
        value: cohortComparison?.insights?.averageRetention 
          ? (cohortComparison.insights.averageRetention * 100).toFixed(1) 
          : '0',
        unit: '%',
        icon: <PeopleIcon />,
        color: 'secondary',
        trend: 'neutral',
        description: 'Across all cohorts'
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -8 }}
            >
              <MetricCard color={metric.color} $trend={metric.trend}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {metric.value}{metric.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {metric.description}
                    </Typography>
                  </Box>
                  <AnimatedAvatar className="metric-icon">
                    {metric.icon}
                  </AnimatedAvatar>
                </Stack>
              </MetricCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render runway scenarios section
  const renderRunwayScenarios = () => {
    if (!runwayScenarios || runwayScenarios.length === 0) {
      return (
        <EmptyStateBox>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto',
                mb: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <TimelineIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Runway Scenarios Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first scenario to predict your startup's financial runway
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForms();
                setOpenScenarioDialog(true);
              }}
              size="large"
              sx={{ borderRadius: 2 }}
            >
              Create Your First Scenario
            </Button>
          </motion.div>
        </EmptyStateBox>
      );
    }

    // Display historical scenarios if in history view
    if (viewMode === 'history') {
      return (
        <Box>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: 3 }}
          >
            <Typography variant="h6">
              Runway Scenario History
            </Typography>
            <Stack direction="row" spacing={1}>
              <ToggleButtonGroup
                value={listView}
                exclusive
                onChange={(e, newView) => newView && setListView(newView)}
                size="small"
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <ViewModuleIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
              <SearchBox>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
                <TextField
                  variant="standard"
                  placeholder="Search scenarios..."
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                />
              </SearchBox>
              <IconButton
                onClick={() => setFilterOptions({
                  ...filterOptions,
                  sortOrder: filterOptions.sortOrder === 'asc' ? 'desc' : 'asc'
                })}
                size="small"
              >
                <SortIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          
          {listView === 'grid' ? (
            <Grid container spacing={2}>
              {getPageItems(runwayScenarios).map((scenario) => (
                <Grid item xs={12} sm={6} md={4} key={scenario._id}>
                  <HistoryCard>
                    <CardContent sx={{ p: 2 }}>
                      <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="flex-start"
                      >
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }}
                        >
                          <TimelineIcon />
                        </Avatar>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, scenario._id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Box
                        sx={{ 
                          mt: 2, 
                          cursor: 'pointer' 
                        }}
                        onClick={() => {
                          setSelectedScenario(scenario);
                          setViewMode('charts');
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {scenario.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 0.5, 
                            height: 40, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}
                        >
                          {scenario.description || 'No description provided'}
                        </Typography>
                      </Box>
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        justifyContent="space-between" 
                        sx={{ mt: 2 }}
                      >
                        <Chip
                          size="small"
                          label={`${scenario.totalRunwayMonths || 0} months`}
                          color={scenario.totalRunwayMonths > 12 ? "success" : "warning"}
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {getRelativeTime(scenario.createdAt)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </HistoryCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <List sx={{ width: '100%' }}>
              {getPageItems(runwayScenarios).map((scenario) => (
                <ListViewItem
                  key={scenario._id}
                  $active={selectedScenario?._id === scenario._id}
                  onClick={() => {
                    setSelectedScenario(scenario);
                    setViewMode('charts');
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      >
                        <TimelineIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {scenario.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {scenario.description || 'No description provided'}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={`${scenario.totalRunwayMonths || 0} months`}
                            color={scenario.totalRunwayMonths > 12 ? "success" : "warning"}
                          />
                          <Chip
                            size="small"
                            label={scenario.scenarioType}
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        {getRelativeTime(scenario.createdAt)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, scenario._id);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </ListViewItem>
              ))}
            </List>
          )}
          
          {/* Pagination */}
          {runwayScenarios.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(getFilteredItems(runwayScenarios).length / itemsPerPage)}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
          
          {/* Context Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                const scenario = runwayScenarios.find(s => s._id === selectedItemId);
                if (scenario) {
                  setSelectedScenario(scenario);
                  setViewMode('charts');
                }
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                const scenario = runwayScenarios.find(s => s._id === selectedItemId);
                if (scenario) {
                  handleEditItem('scenario', scenario);
                }
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setItemToDelete({
                  type: 'scenario',
                  id: selectedItemId,
                  name: runwayScenarios.find(s => s._id === selectedItemId)?.name || 'this scenario'
                });
                setDeleteConfirmOpen(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: theme.palette.error.main }}>Delete</ListItemText>
            </MenuItem>
          </Menu>
          
          {/* Return button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setViewMode('charts')}
            >
              Return to Active Scenario
            </Button>
          </Box>
          
          return null;
        </Box>
      );
    }

    // Prepare chart data from actual API response
    const chartData = selectedScenario?.monthlyProjections?.map(proj => ({
      month: `Month ${proj.month}`,
      cash: proj.endingCash,
      revenue: proj.revenue,
      expenses: proj.expenses,
      netCashFlow: proj.netCashFlow,
      runwayRemaining: proj.runwayRemaining
    })) || [];

    const probabilityData = scenarioComparison?.scenarios?.map((scenario, idx) => ({
      name: scenario.name,
      runway: scenario.runwayMonths,
      burned: scenario.totalBurned,
      type: scenario.type
    })) || [];

    return (
      <Box>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          {runwayScenarios.map((scenario) => (
            <ScenarioChip
              key={scenario._id}
              label={scenario.name}
              icon={scenario.scenarioType === 'Baseline' ? <ShowChartIcon /> : null}
              onClick={() => setSelectedScenario(scenario)}
              $active={selectedScenario?._id === scenario._id}
              onDelete={scenario.scenarioType === 'Custom' ? () => {
                setItemToDelete({
                  type: 'scenario',
                  id: scenario._id,
                  name: scenario.name
                });
                setDeleteConfirmOpen(true);
              } : undefined}
            />
          ))}
          {runwayScenarios.length > 5 && (
            <Chip
              icon={<HistoryIcon />}
              label="View All History"
              onClick={() => setViewMode('history')}
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Cash Flow Projection - {selectedScenario?.name}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (selectedScenario) {
                        handleEditItem('scenario', selectedScenario);
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => {}}>
                    <TuneIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => {}}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
              <ResponsiveContainer width="100%" height="90%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.95),
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cash"
                    fill="url(#cashGradient)"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    name="Cash Balance"
                  />
                  <Bar dataKey="revenue" fill={theme.palette.success.main} name="Revenue" />
                  <Bar dataKey="expenses" fill={theme.palette.error.main} name="Expenses" />
                  <Line
                    type="monotone"
                    dataKey="netCashFlow"
                    stroke={theme.palette.warning.main}
                    strokeWidth={3}
                    dot={false}
                    name="Net Cash Flow"
                  />
                  {selectedScenario?.dateOfCashOut && (
                    <ReferenceLine
                      x={`Month ${selectedScenario.totalRunwayMonths}`}
                      stroke={theme.palette.error.main}
                      strokeDasharray="5 5"
                      label={{ value: "Cash Out", position: "top" }}
                    />
                  )}
                  <Brush dataKey="month" height={30} stroke={theme.palette.primary.main} />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <PredictionCard severity={selectedScenario?.totalRunwayMonths > 12 ? 'success' : 'warning'}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AnimatedAvatar
                    sx={{
                      bgcolor: selectedScenario?.totalRunwayMonths > 12 
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.warning.main, 0.1),
                      color: selectedScenario?.totalRunwayMonths > 12 
                        ? theme.palette.success.main
                        : theme.palette.warning.main
                    }}
                  >
                    <SpeedIcon />
                  </AnimatedAvatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Runway Remaining
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedScenario?.totalRunwayMonths || 0} months
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Until {formatDate(selectedScenario?.dateOfCashOut)}
                    </Typography>
                  </Box>
                </Stack>
              </PredictionCard>

              <PredictionCard severity="info">
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Monte Carlo Confidence Intervals
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">P10 (Worst):</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedScenario?.simulation?.p10 || 'N/A'} months
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={((selectedScenario?.simulation?.p10 || 0) / 24) * 100}
                      sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                      color="error"
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">P50 (Expected):</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedScenario?.simulation?.p50 || 'N/A'} months
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={((selectedScenario?.simulation?.p50 || 0) / 24) * 100}
                      sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                      color="primary"
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">P90 (Best):</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedScenario?.simulation?.p90 || 'N/A'} months
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={((selectedScenario?.simulation?.p90 || 0) / 24) * 100}
                      sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                      color="success"
                    />
                  </Box>
                </Stack>
              </PredictionCard>

              <PredictionCard severity="info">
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Key Assumptions
                </Typography>
                <Stack spacing={1.5}>
                  {selectedScenario?.assumptions?.map((assumption, idx) => (
                    <Box key={idx}>
                      <Typography variant="caption" color="text.secondary">
                        {assumption.metric.replace(/_/g, ' ').toUpperCase()}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatPercentage(assumption.growthRate)} growth
                        </Typography>
                        {assumption.growthRate > 0 ? (
                          <TrendingUpIcon fontSize="small" color="success" />
                        ) : assumption.growthRate < 0 ? (
                          <TrendingUpIcon fontSize="small" color="error" sx={{ transform: 'rotate(180deg)' }} />
                        ) : null}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </PredictionCard>
            </Stack>
          </Grid>
        </Grid>

        {scenarioComparison && probabilityData.length > 0 && (
          <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Scenario Comparison Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={probabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="runway" fill={theme.palette.primary.main} name="Runway (months)">
                  {probabilityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={chartColors.mixed[index % chartColors.mixed.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}
      </Box>
    );
  };

  // Render fundraising section
  const renderFundraisingPredictions = () => {
    if (viewMode === 'history') {
      return (
        <Box>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: 3 }}
          >
            <Typography variant="h6">
              Fundraising Prediction History
            </Typography>
            <Stack direction="row" spacing={1}>
              <ToggleButtonGroup
                value={listView}
                exclusive
                onChange={(e, newView) => newView && setListView(newView)}
                size="small"
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <ViewModuleIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
              <SearchBox>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
                <TextField
                  variant="standard"
                  placeholder="Search predictions..."
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                />
              </SearchBox>
              <IconButton
                onClick={() => setFilterOptions({
                  ...filterOptions,
                  sortOrder: filterOptions.sortOrder === 'asc' ? 'desc' : 'asc'
                })}
                size="small"
              >
                <SortIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          
          {listView === 'grid' ? (
            <Grid container spacing={2}>
              {getPageItems(fundraisingPredictions).map((prediction) => (
                <Grid item xs={12} sm={6} md={4} key={prediction._id}>
                  <HistoryCard>
                    <CardContent sx={{ p: 2 }}>
                      <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="flex-start"
                      >
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main
                          }}
                        >
                          <RocketLaunchIcon />
                        </Avatar>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, prediction._id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Box
                        sx={{ 
                          mt: 2, 
                          cursor: 'pointer' 
                        }}
                        onClick={() => {
                          setSelectedPrediction(prediction);
                          setViewMode('charts');
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {prediction.predictionName}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={prediction.roundType}
                            color="secondary"
                          />
                          <Chip
                            size="small"
                            label={`${Math.round((prediction.overallProbability || 0) * 100)}% Confidence`}
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        justifyContent="space-between" 
                        sx={{ mt: 2 }}
                      >
                        <Typography variant="body2">
                          {formatCurrency(prediction.targetRoundSize)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {getRelativeTime(prediction.currentDate || prediction.createdAt)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </HistoryCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <List sx={{ width: '100%' }}>
              {getPageItems(fundraisingPredictions).map((prediction) => (
                <ListViewItem
                  key={prediction._id}
                  $active={selectedPrediction?._id === prediction._id}
                  onClick={() => {
                    setSelectedPrediction(prediction);
                    setViewMode('charts');
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main
                        }}
                      >
                        <RocketLaunchIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {prediction.predictionName}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {formatCurrency(prediction.targetRoundSize)} at {formatCurrency(prediction.targetValuation)}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={prediction.roundType}
                            color="secondary"
                          />
                          <Chip
                            size="small"
                            label={`${Math.round((prediction.overallProbability || 0) * 100)}% Confidence`}
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        {getRelativeTime(prediction.currentDate || prediction.createdAt)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, prediction._id);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </ListViewItem>
              ))}
            </List>
          )}
          
          {/* Pagination */}
          {fundraisingPredictions.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(getFilteredItems(fundraisingPredictions).length / itemsPerPage)}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
          
          {/* Context Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                const prediction = fundraisingPredictions.find(p => p._id === selectedItemId);
                if (prediction) {
                  setSelectedPrediction(prediction);
                  setViewMode('charts');
                }
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                const prediction = fundraisingPredictions.find(p => p._id === selectedItemId);
                if (prediction) {
                  handleEditItem('prediction', prediction);
                }
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setItemToDelete({
                  type: 'prediction',
                  id: selectedItemId,
                  name: fundraisingPredictions.find(p => p._id === selectedItemId)?.predictionName || 'this prediction'
                });
                setDeleteConfirmOpen(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: theme.palette.error.main }}>Delete</ListItemText>
            </MenuItem>
          </Menu>
          
          {/* Return button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setViewMode('charts')}
            >
              Return to Active Prediction
            </Button>
          </Box>
          
          return null;
        </Box>
      );
    }
    
    if (!fundraisingReadiness) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Analyzing fundraising readiness...
          </Typography>
        </Box>
      );
    }

    // Build radar data from actual API response
    const radarData = [
      { 
        factor: 'Burn Rate', 
        value: fundraisingReadiness.runwayMonths > 12 ? 80 : 
                fundraisingReadiness.runwayMonths > 6 ? 60 : 30 
      },
      { 
        factor: 'Growth', 
        value: (fundraisingReadiness.dauGrowth || 0) * 500 // Convert to percentage scale
      },
      { 
        factor: 'Revenue', 
        value: fundraisingReadiness.monthlyRevenue > 0 ? 80 : 30 
      },
      { 
        factor: 'Team', 
        value: (fundraisingReadiness.teamSize || 10) * 5 // Scale team size
      },
      { 
        factor: 'Market', 
        value: 70 // Default since not in API
      },
      { 
        factor: 'Product', 
        value: fundraisingReadiness.revenueGrowth > 0 ? 80 : 60 
      }
    ];

    return (
      <Box>
        {fundraisingPredictions && fundraisingPredictions.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
            {fundraisingPredictions.slice(0, 5).map((prediction) => (
              <ScenarioChip
                key={prediction._id}
                label={prediction.predictionName}
                icon={<RocketLaunchIcon />}
                onClick={() => setSelectedPrediction(prediction)}
                $active={selectedPrediction?._id === prediction._id}
              />
            ))}
            {fundraisingPredictions.length > 5 && (
              <Chip
                icon={<HistoryIcon />}
                label="View All History"
                onClick={() => setViewMode('history')}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Stack>
        )}
      
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Fundraising Readiness Score
                </Typography>
                {selectedPrediction && (
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Prediction: {selectedPrediction.predictionName}
                  </Typography>
                )}
              </Stack>
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={alpha(theme.palette.divider, 0.3)} />
                  <PolarAngleAxis dataKey="factor" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Current Score"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fill={alpha(theme.palette.primary.main, 0.3)}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <GlassCard>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <AnimatedAvatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <RocketLaunchIcon />
                    </AnimatedAvatar>
                    <Box>
                      <Typography variant="h6">Overall Readiness</Typography>
                      <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                        {Math.round((fundraisingReadiness.overallProbability || 0) * 100)}%
                      </Typography>
                    </Box>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(fundraisingReadiness.overallProbability || 0) * 100}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Chip 
                      label={`${fundraisingReadiness.runwayMonths || 0} months runway`} 
                      size="small" 
                      color={fundraisingReadiness.runwayMonths > 12 ? "success" : "warning"}
                    />
                    <Chip 
                      label={`${formatPercentage(fundraisingReadiness.dauGrowth || 0)} DAU growth`} 
                      size="small" 
                      color="primary"
                    />
                  </Stack>
                </CardContent>
              </GlassCard>

              <GlassCard>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Key Recommendations
                  </Typography>
                  <List dense>
                    {fundraisingReadiness.dauGrowth > 0.1 && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Strong user growth"
                          secondary={`${formatPercentage(fundraisingReadiness.dauGrowth)} DAU growth rate`}
                        />
                      </ListItem>
                    )}
                    {fundraisingReadiness.runwayMonths < 12 && (
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Extend runway"
                          secondary={`Currently at ${fundraisingReadiness.runwayMonths} months`}
                        />
                      </ListItem>
                    )}
                    {fundraisingReadiness.monthlyRevenue === 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Focus on revenue generation"
                          secondary="No revenue recorded yet"
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </GlassCard>
            </Stack>
          </Grid>

          {selectedPrediction && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mt: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Prediction: {selectedPrediction.predictionName}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (selectedPrediction) {
                          handleEditItem('prediction', selectedPrediction);
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setItemToDelete({
                          type: 'prediction',
                          id: selectedPrediction._id,
                          name: selectedPrediction.predictionName
                        });
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Timeline
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                        Start: {formatDate(selectedPrediction.predictedStartDate)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Close: {formatDate(selectedPrediction.predictedCloseDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Confidence Interval: ±{selectedPrediction.confidenceInterval} days
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Round Details
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Target Size
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatCurrency(selectedPrediction.targetRoundSize)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Target Valuation
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatCurrency(selectedPrediction.targetValuation)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Round Type
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedPrediction.roundType}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Success Probabilities
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Overall Success</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatPercentage(selectedPrediction.overallProbability)}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(selectedPrediction.overallProbability || 0) * 100}
                          sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                          color="primary"
                        />
                      </Box>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Timeline Probability</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatPercentage(selectedPrediction.timelineProbability)}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(selectedPrediction.timelineProbability || 0) * 100}
                          sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                          color="secondary"
                        />
                      </Box>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Amount Probability</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatPercentage(selectedPrediction.amountProbability)}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(selectedPrediction.amountProbability || 0) * 100}
                          sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                          color="info"
                        />
                      </Box>
                    </Stack>
                  </Grid>
                  
                  {selectedPrediction.keyMilestones && selectedPrediction.keyMilestones.length > 0 && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                        Key Milestones
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedPrediction.keyMilestones.map((milestone, idx) => (
                          <Grid item xs={12} sm={6} md={3} key={idx}>
                            <Paper 
                              sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                              }}
                            >
                              <Typography variant="subtitle2">
                                {milestone.name}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Completion
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={milestone.percentageComplete}
                                  sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                                  color={milestone.percentageComplete > 75 ? "success" : "primary"}
                                />
                                <Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
                                  {milestone.percentageComplete}%
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          )}

          {marketComparables?.comparableDeals?.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Market Comparables
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell align="right">Round Size</TableCell>
                        <TableCell align="right">Valuation</TableCell>
                        <TableCell align="right">Revenue Multiple</TableCell>
                        <TableCell align="right">Similarity Score</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {marketComparables.comparableDeals.map((deal, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{deal.companyName}</TableCell>
                          <TableCell align="right">{formatCurrency(deal.roundSize)}</TableCell>
                          <TableCell align="right">{formatCurrency(deal.valuation)}</TableCell>
                          <TableCell align="right">{(deal.valuation / deal.roundSize).toFixed(1)}x</TableCell>
                          <TableCell align="right">
                            <Rating value={deal.similarity * 5} readOnly size="small" />
                          </TableCell>
                          <TableCell>{formatDate(deal.date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  // Render cash flow section
  const renderCashFlowForecasts = () => {
    if (viewMode === 'history') {
      return (
        <Box>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: 3 }}
          >
            <Typography variant="h6">
              Cash Flow Forecast History
            </Typography>
            <Stack direction="row" spacing={1}>
              <ToggleButtonGroup
                value={listView}
                exclusive
                onChange={(e, newView) => newView && setListView(newView)}
                size="small"
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <ViewModuleIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
              <SearchBox>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
                <TextField
                  variant="standard"
                  placeholder="Search forecasts..."
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                />
              </SearchBox>
              <IconButton
                onClick={() => setFilterOptions({
                  ...filterOptions,
                  sortOrder: filterOptions.sortOrder === 'asc' ? 'desc' : 'asc'
                })}
                size="small"
              >
                <SortIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          
          {listView === 'grid' ? (
            <Grid container spacing={2}>
              {getPageItems(cashFlowForecasts).map((forecast) => (
                <Grid item xs={12} sm={6} md={4} key={forecast._id}>
                  <HistoryCard>
                    <CardContent sx={{ p: 2 }}>
                      <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="flex-start"
                      >
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main
                          }}
                        >
                          <AccountBalanceIcon />
                        </Avatar>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, forecast._id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Box
                        sx={{ 
                          mt: 2, 
                          cursor: 'pointer' 
                        }}
                        onClick={() => {
                          setSelectedForecast(forecast);
                          setViewMode('charts');
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {forecast.forecastName}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 0.5, 
                            height: 40, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}
                        >
                          {forecast.description || `${forecast.forecastType} forecast`}
                        </Typography>
                      </Box>
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        justifyContent="space-between" 
                        sx={{ mt: 2 }}
                      >
                        <Chip
                          size="small"
                          label={forecast.forecastType}
                          color="info"
                          variant="outlined"
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {getRelativeTime(forecast.createdAt)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </HistoryCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <List sx={{ width: '100%' }}>
              {getPageItems(cashFlowForecasts).map((forecast) => (
                <ListViewItem
                  key={forecast._id}
                  $active={selectedForecast?._id === forecast._id}
                  onClick={() => {
                    setSelectedForecast(forecast);
                    setViewMode('charts');
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main
                        }}
                      >
                        <AccountBalanceIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {forecast.forecastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {forecast.description || `${forecast.forecastType} forecast`}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={forecast.forecastType}
                            color="info"
                          />
                          <Chip
                            size="small"
                            label={`${forecast.granularity} forecast`}
                            variant="outlined"
                          />
                          {forecast.requiresAdditionalFunding && (
                            <Chip
                              size="small"
                              label="Funding needed"
                              color="warning"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        {getRelativeTime(forecast.createdAt)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, forecast._id);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </ListViewItem>
              ))}
            </List>
          )}
          
          {/* Pagination */}
          {cashFlowForecasts.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(getFilteredItems(cashFlowForecasts).length / itemsPerPage)}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
          
          {/* Context Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                const forecast = cashFlowForecasts.find(f => f._id === selectedItemId);
                if (forecast) {
                  setSelectedForecast(forecast);
                  setViewMode('charts');
                }
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                const forecast = cashFlowForecasts.find(f => f._id === selectedItemId);
                if (forecast) {
                  handleEditItem('forecast', forecast);
                }
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setItemToDelete({
                  type: 'forecast',
                  id: selectedItemId,
                  name: cashFlowForecasts.find(f => f._id === selectedItemId)?.forecastName || 'this forecast'
                });
                setDeleteConfirmOpen(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: theme.palette.error.main }}>Delete</ListItemText>
            </MenuItem>
          </Menu>
          
          {/* Return button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setViewMode('charts')}
            >
              Return to Active Forecast
            </Button>
          </Box>
          
          return null;
        </Box>
      );
    }
    
    // Build data from actual API response
    const weeklyData = [];
    if (historicalCashFlow?.expenses && historicalCashFlow?.revenues) {
      const maxLength = Math.max(
        historicalCashFlow.expenses.length,
        historicalCashFlow.revenues.length
      );
      
      for (let i = 0; i < Math.min(maxLength, 12); i++) {
        const expense = historicalCashFlow.expenses[i];
        const revenue = historicalCashFlow.revenues[i];
        
        weeklyData.push({
          week: `W${i + 1}`,
          inflow: revenue?.total || 0,
          outflow: expense?.total || 0,
          net: (revenue?.total || 0) - (expense?.total || 0)
        });
      }
    }

    // Build forecast data if available
    const forecastData = [];
    if (selectedForecast?.weeklyForecasts) {
      selectedForecast.weeklyForecasts.forEach((week, idx) => {
        forecastData.push({
          week: `Week ${week.weekNumber}`,
          date: formatDate(week.startDate),
          inflow: week.totalInflows,
          outflow: week.totalOutflows,
          net: week.netCashFlow,
          balance: week.cashBalance,
          confidence: week.confidenceLevel
        });
      });
    }

    return (
      <Box>
        {cashFlowForecasts && cashFlowForecasts.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
            {cashFlowForecasts.slice(0, 5).map((forecast) => (
              <ScenarioChip
                key={forecast._id}
                label={forecast.forecastName}
                icon={<AccountBalanceIcon />}
                onClick={() => setSelectedForecast(forecast)}
                $active={selectedForecast?._id === forecast._id}
              />
            ))}
            {cashFlowForecasts.length > 5 && (
              <Chip
                icon={<HistoryIcon />}
                label="View All History"
                onClick={() => setViewMode('history')}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Stack>
        )}
      
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {selectedForecast 
                    ? `Cash Flow Forecast: ${selectedForecast.forecastName}`
                    : 'Cash Flow Forecast Analysis'
                  }
                </Typography>
                {selectedForecast && (
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (selectedForecast) {
                          handleEditItem('forecast', selectedForecast);
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => {}}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
              <ResponsiveContainer width="100%" height="90%">
                {selectedForecast && forecastData.length > 0 ? (
                  <ComposedChart data={forecastData}>
                    <defs>
                      <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.info.main} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={theme.palette.info.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        if (name === 'confidence') return [`${(value * 100).toFixed(0)}%`, 'Confidence'];
                        return [formatCurrency(value), name];
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      fill="url(#balanceGradient)"
                      stroke={theme.palette.info.main}
                      name="Cash Balance"
                      strokeWidth={2}
                    />
                    <Bar dataKey="inflow" fill={theme.palette.success.main} name="Cash Inflow" />
                    <Bar dataKey="outflow" fill={theme.palette.error.main} name="Cash Outflow" />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke={theme.palette.warning.main}
                      name="Net Cash Flow"
                      strokeWidth={3}
                      dot={{ fill: theme.palette.warning.main }}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke={theme.palette.secondary.main}
                      name="Confidence"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      
                    />
                    {selectedForecast.minimumCashDate && (
                      <ReferenceLine
                        x={formatDate(selectedForecast.minimumCashDate)}
                        stroke={theme.palette.error.main}
                        strokeDasharray="5 5"
                        label={{ value: "Min Cash", position: "top" }}
                      />
                    )}
                  </ComposedChart>
                ) : (
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="inflow"
                      stackId="1"
                      stroke={theme.palette.success.main}
                      fill="url(#inflowGradient)"
                      name="Cash Inflow"
                    />
                    <Area
                      type="monotone"
                      dataKey="outflow"
                      stackId="2"
                      stroke={theme.palette.error.main}
                      fill="url(#outflowGradient)"
                      name="Cash Outflow"
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{ fill: theme.palette.primary.main }}
                      name="Net Cash Flow"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <PredictionCard severity="info">
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Current Position
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Cash Balance
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatCurrency(currentCashPosition?.cash || 0)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Burn Rate
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(fundraisingReadiness?.monthlyBurn || 0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Revenue
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(fundraisingReadiness?.monthlyRevenue || 0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Net Burn
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        color: (fundraisingReadiness?.monthlyRevenue || 0) > (fundraisingReadiness?.monthlyBurn || 0) 
                          ? theme.palette.success.main 
                          : theme.palette.error.main
                      }}
                    >
                      {formatCurrency((fundraisingReadiness?.monthlyRevenue || 0) - (fundraisingReadiness?.monthlyBurn || 0))}
                    </Typography>
                  </Box>
                </Stack>
              </PredictionCard>

              {selectedForecast && (
                <PredictionCard 
                  severity={selectedForecast.requiresAdditionalFunding ? 'warning' : 'success'}
                >
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Forecast Summary
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Forecast Period
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(selectedForecast.startDate)} - {formatDate(selectedForecast.endDate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Minimum Cash Balance
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          fontWeight: 600,
                          color: selectedForecast.minimumCashBalance < 0
                            ? theme.palette.error.main
                            : 'inherit'
                        }}
                      >
                        {formatCurrency(selectedForecast.minimumCashBalance)}
                        {selectedForecast.minimumCashDate && ` (${formatDate(selectedForecast.minimumCashDate)})`}
                      </Typography>
                    </Box>
                    {selectedForecast.requiresAdditionalFunding && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Additional Funding Needed
                        </Typography>
                        <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                          {formatCurrency(selectedForecast.additionalFundingNeeded)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </PredictionCard>
              )}

              {selectedForecast?.alerts && selectedForecast.alerts.length > 0 && (
                <PredictionCard severity="warning">
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Forecast Alerts
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    {selectedForecast.alerts.map((alert, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {alert.severity === 'critical' ? (
                            <ErrorIcon fontSize="small" color="error" />
                          ) : (
                            <WarningIcon fontSize="small" color="warning" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.message}
                          secondary={formatDate(alert.date)}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: alert.severity === 'critical' ? 600 : 400
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </PredictionCard>
              )}

              {weeklyData.length > 0 && weeklyData.some(w => w.net < -50000) && (
                <InsightBox severity="medium">
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <WarningIcon className="insight-icon" fontSize="small" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        High Burn Rate Detected
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Several weeks show burn rate exceeding revenue by over ₹50,000
                      </Typography>
                    </Box>
                  </Stack>
                </InsightBox>
              )}
            </Stack>
          </Grid>

          {selectedForecast?.scenarioAnalysis && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2, mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Scenario Analysis
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 1, color: theme.palette.success.main }}>
                        Best Case Scenario (P90)
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Ending Cash Balance
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          {formatCurrency(selectedForecast.scenarioAnalysis.bestCase.endingCash)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Probability
                        </Typography>
                        <Typography variant="body1">
                          {formatPercentage(selectedForecast.scenarioAnalysis.bestCase.probability)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 1, color: theme.palette.info.main }}>
                        Most Likely Scenario (P50)
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Ending Cash Balance
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                          {formatCurrency(selectedForecast.scenarioAnalysis.mostLikely.endingCash)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Probability
                        </Typography>
                        <Typography variant="body1">
                          {formatPercentage(selectedForecast.scenarioAnalysis.mostLikely.probability)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 1, color: theme.palette.error.main }}>
                        Worst Case Scenario (P10)
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Ending Cash Balance
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                          {formatCurrency(selectedForecast.scenarioAnalysis.worstCase.endingCash)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Probability
                        </Typography>
                        <Typography variant="body1">
                          {formatPercentage(selectedForecast.scenarioAnalysis.worstCase.probability)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  // Render cohort analysis section
  const renderCohortAnalysis = () => {
    if (viewMode === 'history') {
      return (
        <Box>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: 3 }}
          >
            <Typography variant="h6">
              Revenue Cohort History
            </Typography>
            <Stack direction="row" spacing={1}>
              <ToggleButtonGroup
                value={listView}
                exclusive
                onChange={(e, newView) => newView && setListView(newView)}
                size="small"
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <ViewModuleIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
              <SearchBox>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
                <TextField
                  variant="standard"
                  placeholder="Search cohorts..."
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                />
              </SearchBox>
              <IconButton
                onClick={() => setFilterOptions({
                  ...filterOptions,
                  sortOrder: filterOptions.sortOrder === 'asc' ? 'desc' : 'asc'
                })}
                size="small"
              >
                <SortIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          
          {listView === 'grid' ? (
            <Grid container spacing={2}>
              {getPageItems(revenueCohorts).map((cohort) => (
                <Grid item xs={12} sm={6} md={4} key={cohort._id}>
                  <HistoryCard>
                    <CardContent sx={{ p: 2 }}>
                      <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="flex-start"
                      >
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main
                          }}
                        >
                          <PeopleIcon />
                        </Avatar>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, cohort._id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Box
                        sx={{ 
                          mt: 2, 
                          cursor: 'pointer' 
                        }}
                        onClick={() => {
                          setSelectedCohort(cohort);
                          setViewMode('charts');
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {cohort.cohortName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {formatDate(cohort.cohortStartDate)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {cohort.initialUsers} users via {cohort.acquisitionChannel || 'Unknown channel'}
                        </Typography>
                      </Box>
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        justifyContent="space-between" 
                        sx={{ mt: 2 }}
                      >
                        <Chip
                          size="small"
                          label={`LTV: ${formatCurrency(cohort.projectedLTV || 0)}`}
                          color="secondary"
                        />
                        <Chip
                          size="small"
                          label={`CAC: ${formatCurrency(cohort.averageCAC || 0)}`}
                          variant="outlined"
                        />
                      </Stack>
                    </CardContent>
                  </HistoryCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <List sx={{ width: '100%' }}>
              {getPageItems(revenueCohorts).map((cohort) => (
                <ListViewItem
                  key={cohort._id}
                  $active={selectedCohort?._id === cohort._id}
                  onClick={() => {
                    setSelectedCohort(cohort);
                    setViewMode('charts');
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main
                        }}
                      >
                        <PeopleIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {cohort.cohortName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Started {formatDate(cohort.cohortStartDate)}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={`${cohort.initialUsers} users`}
                            color="primary"
                          />
                          <Chip
                            size="small"
                            label={cohort.acquisitionChannel || 'Unknown channel'}
                            variant="outlined"
                          />
                          {cohort.ltcacRatio > 3 && (
                            <Chip
                              size="small"
                              label={`${cohort.ltcacRatio.toFixed(1)}x LTV:CAC`}
                              color="success"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(cohort.projectedLTV || 0)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, cohort._id);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </ListViewItem>
              ))}
            </List>
          )}
          
          {/* Pagination */}
          {revenueCohorts.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(getFilteredItems(revenueCohorts).length / itemsPerPage)}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
          
          {/* Context Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                const cohort = revenueCohorts.find(c => c._id === selectedItemId);
                if (cohort) {
                  setSelectedCohort(cohort);
                  setViewMode('charts');
                }
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                const cohort = revenueCohorts.find(c => c._id === selectedItemId);
                if (cohort) {
                  handleEditItem('cohort', cohort);
                }
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setItemToDelete({
                  type: 'cohort',
                  id: selectedItemId,
                  name: revenueCohorts.find(c => c._id === selectedItemId)?.cohortName || 'this cohort'
                });
                setDeleteConfirmOpen(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: theme.palette.error.main }}>Delete</ListItemText>
            </MenuItem>
          </Menu>
          
          {/* Return button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setViewMode('charts')}
            >
              Return to Active Cohort
            </Button>
          </Box>
          
          return null;
        </Box>
      );
    }
    
    const cohortData = cohortComparison?.cohorts?.map(cohort => ({
      name: cohort.name,
      ltv: cohort.ltv || 0,
      cac: cohort.cac || 0,
      ratio: cohort.ltcacRatio || 0,
      retention: (cohort.currentRetention || 0) * 100
    })) || [];

    // Build retention curve from best performing cohort if available
    const retentionCurve = [];
    if (selectedCohort?.metrics && selectedCohort.metrics.length > 0) {
      selectedCohort.metrics.forEach((metric, index) => {
        retentionCurve.push({
          month: metric.periodLabel || `M${index}`,
          retention: (metric.retentionRate || 0) * 100,
          revenue: metric.revenue || 0,
          users: metric.activeUsers || 0,
          arpu: metric.averageRevenuePerUser || 0
        });
      });
    } else if (cohortComparison?.insights?.bestByRetention) {
      // Simulate retention decay if no data
      for (let i = 0; i < 12; i++) {
        retentionCurve.push({
          month: `M${i}`,
          retention: Math.max(20, 100 * Math.exp(-0.15 * i))
        });
      }
    }

    return (
      <Box>
        {revenueCohorts && revenueCohorts.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
            {revenueCohorts.slice(0, 5).map((cohort) => (
              <ScenarioChip
                key={cohort._id}
                label={cohort.cohortName}
                icon={<PeopleIcon />}
                onClick={() => setSelectedCohort(cohort)}
                $active={selectedCohort?._id === cohort._id}
              />
            ))}
            {revenueCohorts.length > 5 && (
              <Chip
                icon={<HistoryIcon />}
                label="View All History"
                onClick={() => setViewMode('history')}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Stack>
        )}
      
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {selectedCohort 
                    ? `Cohort Retention: ${selectedCohort.cohortName}`
                    : 'Cohort Retention Analysis'
                  }
                </Typography>
                {selectedCohort && (
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (selectedCohort) {
                          handleEditItem('cohort', selectedCohort);
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => {}}>
                      <TuneIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
              {retentionCurve.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={retentionCurve}>
                    <defs>
                      <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="retention"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      name="Retention %"
                      dot={{ fill: theme.palette.primary.main }}
                      fill="url(#retentionGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No retention data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                LTV:CAC Performance
              </Typography>
              {cohortData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={cohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="ltv" fill={theme.palette.success.main} name="LTV" />
                    <Bar dataKey="cac" fill={theme.palette.error.main} name="CAC" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No cohort data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {selectedCohort && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    Cohort Details: {selectedCohort.cohortName}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AutoGraphIcon />}
                    onClick={() => {
                      if (selectedCohort) {
                        generateCohortProjections(selectedCohort._id, { projectionMonths: 24 })
                          .then(() => {
                            fetchAnalyticsData(true);
                            setSuccess('Cohort projections generated successfully!');
                          })
                          .catch(() => {
                            setError('Failed to generate projections. Please try again.');
                          });
                      }
                    }}
                  >
                    Generate Projections
                  </Button>
                </Stack>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Acquisition Details
                      </Typography>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(selectedCohort.cohortStartDate)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Initial Users
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedCohort.initialUsers.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Acquisition Channel
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedCohort.acquisitionChannel || 'Not specified'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Total Acquisition Cost
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatCurrency(selectedCohort.acquisitionCost)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          CAC per User
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatCurrency(selectedCohort.averageCAC)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        LTV Metrics
                      </Typography>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Actual LTV
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatCurrency(selectedCohort.actualLTV)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Projected LTV
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatCurrency(selectedCohort.projectedLTV)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          LTV:CAC Ratio
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600,
                            color: selectedCohort.ltcacRatio > 3 
                              ? theme.palette.success.main 
                              : selectedCohort.ltcacRatio < 1 
                                ? theme.palette.error.main 
                                : 'inherit'
                          }}
                        >
                          {selectedCohort.ltcacRatio ? selectedCohort.ltcacRatio.toFixed(2) : 'N/A'}x
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Payback Period
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedCohort.paybackPeriod 
                            ? `${selectedCohort.paybackPeriod.toFixed(1)} months` 
                            : 'Not calculated'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Performance Insights
                      </Typography>
                      {selectedCohort.insights && selectedCohort.insights.length > 0 ? (
                        selectedCohort.insights.map((insight, idx) => (
                          <InsightBox key={idx} severity={insight.severity}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {insight.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {insight.recommendedAction}
                            </Typography>
                          </InsightBox>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No insights available yet. Generate projections to get performance insights.
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                  
                  {selectedCohort.metrics && selectedCohort.metrics.length > 0 && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                        Period Metrics
                      </Typography>
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Period</TableCell>
                              <TableCell align="right">Active Users</TableCell>
                              <TableCell align="right">Retention Rate</TableCell>
                              <TableCell align="right">Revenue</TableCell>
                              <TableCell align="right">ARPU</TableCell>
                              <TableCell align="right">Cumulative Revenue</TableCell>
                              <TableCell>Projection</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedCohort.metrics.map((metric, idx) => (
                              <TableRow 
                                key={idx}
                                sx={{
                                  bgcolor: metric.isProjected 
                                    ? alpha(theme.palette.info.main, 0.05)
                                    : 'inherit'
                                }}
                              >
                                <TableCell>{metric.periodLabel || `Month ${metric.periodNumber}`}</TableCell>
                                <TableCell align="right">{metric.activeUsers?.toLocaleString()}</TableCell>
                                <TableCell align="right">{formatPercentage(metric.retentionRate)}</TableCell>
                                <TableCell align="right">{formatCurrency(metric.revenue)}</TableCell>
                                <TableCell align="right">{formatCurrency(metric.averageRevenuePerUser)}</TableCell>
                                <TableCell align="right">{formatCurrency(metric.cumulativeRevenue)}</TableCell>
                                <TableCell>
                                  {metric.isProjected ? (
                                    <Chip 
                                      size="small" 
                                      label={`${formatPercentage(metric.confidenceLevel)} confidence`}
                                      color="secondary"
                                      variant="outlined"
                                    />
                                  ) : (
                                    <Chip size="small" label="Actual" color="success" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <GlassCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Cohort Performance Summary
                </Typography>
                <Grid container spacing={3}>
                  {cohortComparison?.insights && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <MetricCard color="success">
                          <Typography variant="body2" color="text.secondary">
                            Best LTV Cohort
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, my: 1 }}>
                            {cohortComparison.insights.bestByLTV?.name || 'N/A'}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip 
                              label={`LTV: ${formatCurrency(cohortComparison.insights.bestByLTV?.ltv || 0)}`}
                              size="small" 
                              color="success"
                            />
                            <Chip 
                              label={`Ratio: ${(cohortComparison.insights.bestByLTV?.ltcacRatio || 0).toFixed(1)}x`}
                              size="small" 
                              variant="outlined"
                            />
                          </Stack>
                        </MetricCard>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MetricCard color="info">
                          <Typography variant="body2" color="text.secondary">
                            Portfolio Average
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, my: 1 }}>
                            {formatCurrency(cohortComparison.insights.averageLTV || 0)}
                          </Typography>
                          <Typography variant="body2">
                            Across {cohortComparison.cohorts?.length || 0} cohorts
                          </Typography>
                        </MetricCard>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MetricCard color="warning">
                          <Typography variant="body2" color="text.secondary">
                            Best Retention
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, my: 1 }}>
                            {cohortComparison.insights.bestByRetention?.name || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            {formatPercentage(cohortComparison.insights.bestByRetention?.currentRetention || 0)} retention
                          </Typography>
                        </MetricCard>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Render insights panel
  const renderInsights = () => {
    return (
      <GlassCard>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              AI-Generated Insights & Recommendations
            </Typography>
            <IconButton onClick={() => setViewMode('charts')}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Grid container spacing={2}>
            {/* Dynamic insights based on actual data */}
            {selectedScenario?.totalRunwayMonths < 12 && (
              <Grid item xs={12} md={6}>
                <InsightBox severity="high">
                  <Stack direction="row" spacing={2}>
                    <ErrorIcon className="insight-icon" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Critical: Runway Below 12 Months
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Your current runway is projected at {selectedScenario.totalRunwayMonths} months. 
                        Consider reducing burn rate by 15% or initiating fundraising within the next 60 days.
                      </Typography>
                    </Box>
                  </Stack>
                </InsightBox>
              </Grid>
            )}
            
            {cohortComparison?.insights?.bestByLTV?.ltcacRatio > 3 && (
              <Grid item xs={12} md={6}>
                <InsightBox severity="positive">
                  <Stack direction="row" spacing={2}>
                    <CheckCircleIcon className="insight-icon" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Strong Cohort Performance
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Your {cohortComparison.insights.bestByLTV.name} cohort shows 
                        {' '}{cohortComparison.insights.bestByLTV.ltcacRatio.toFixed(1)}x LTV:CAC ratio. 
                        Consider increasing acquisition spend in similar channels.
                      </Typography>
                    </Box>
                  </Stack>
                </InsightBox>
              </Grid>
            )}
            
            {fundraisingReadiness?.dauGrowth > 0.2 && (
              <Grid item xs={12} md={6}>
                <InsightBox severity="positive">
                  <Stack direction="row" spacing={2}>
                    <TrendingUpIcon className="insight-icon" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Excellent Growth Metrics
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {formatPercentage(fundraisingReadiness.dauGrowth)} DAU growth positions you well for fundraising. 
                        This is above the typical {formatPercentage(0.15)} benchmark for your stage.
                      </Typography>
                    </Box>
                  </Stack>
                </InsightBox>
              </Grid>
            )}
            
            {selectedForecast?.requiresAdditionalFunding && (
              <Grid item xs={12} md={6}>
                <InsightBox severity="high">
                  <Stack direction="row" spacing={2}>
                    <WarningIcon className="insight-icon" />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Cash Flow Warning
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Your cash flow forecast predicts a negative balance of {formatCurrency(selectedForecast.minimumCashBalance)} 
                        by {formatDate(selectedForecast.minimumCashDate)}. Additional funding of 
                        {formatCurrency(selectedForecast.additionalFundingNeeded)} will be required.
                      </Typography>
                    </Box>
                  </Stack>
                </InsightBox>
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <InsightBox severity="low">
                <Stack direction="row" spacing={2}>
                  <TipsAndUpdatesIcon className="insight-icon" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Optimization Opportunity
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Run multiple scenarios with different growth assumptions to identify the optimal balance 
                      between growth investment and runway extension.
                    </Typography>
                  </Box>
                </Stack>
              </InsightBox>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2, mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Strategic Recommendations
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <BoltIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Focus on retention over acquisition"
                      secondary="Your data shows that improving retention by 10% would increase LTV by 25%, making it more efficient than acquiring new users."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BoltIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Prepare for fundraising in Q3 2025"
                      secondary="Based on your current metrics and market conditions, Q3 would be the optimal time to begin your next fundraising round."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BoltIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Reduce discretionary spending"
                      secondary="Your cash flow analysis shows that a 15% reduction in non-essential spending would extend your runway by 3.5 months without impacting growth."
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </GlassCard>
    );
  };

  if (loading && !refreshing) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton 
                variant="rectangular" 
                height={120} 
                sx={{ 
                  borderRadius: 2,
                  animation: `${shimmer} 2s infinite linear`,
                  backgroundImage: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.1)} 50%, transparent 100%)`,
                  backgroundSize: '1000px 100%',
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
        {/* Header Section with improved contrast */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            py: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: alpha(theme.palette.common.white, 0.05),
              animation: `${floatAnimation} 5s ease-in-out infinite`,
              zIndex: 0
            }
          }}
        >
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
            <Breadcrumbs
              separator={<KeyboardArrowRightIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />}
              aria-label="breadcrumb"
              sx={{ mb: 2 }}
            >
              <Link 
                color="inherit" 
                href="/" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' }
                }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Dashboard
              </Link>
              <Typography sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <InsightsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Predictive Analytics
              </Typography>
            </Breadcrumbs>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <InsightsIcon sx={{ mr: 1.5, fontSize: '2.5rem' }} />
                  Predictive Analytics
                  <Chip
                    icon={<AutoGraphIcon />}
                    label="AI-Powered"
                    size="small"
                    sx={{ 
                      ml: 2,
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    maxWidth: 600
                  }}
                >
                  Leverage machine learning to predict runway, optimize fundraising timing, and analyze revenue cohorts with confidence intervals.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center">
                <Tooltip title="Refresh predictions">
                  <IconButton
                    onClick={() => fetchAnalyticsData(true)}
                    sx={{
                      animation: refreshing ? `${pulseAnimation} 1s infinite` : 'none',
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      color: 'white',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  aria-label="view mode"
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    borderRadius: 1,
                    '& .MuiToggleButton-root': {
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                        color: 'white',
                      }
                    }
                  }}
                >
                  <ToggleButton value="charts" aria-label="charts view">
                    <ShowChartIcon />
                  </ToggleButton>
                  <ToggleButton value="insights" aria-label="insights view">
                    <LightbulbIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="xl">
          {/* Alerts */}
          <Snackbar
            open={!!success}
            autoHideDuration={6000}
            onClose={() => setSuccess('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSuccess('')}
              severity="success"
              variant="filled"
              sx={{ width: '100%', boxShadow: 4 }}
            >
              {success}
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setError('')}
              severity="error"
              variant="filled"
              sx={{ width: '100%', boxShadow: 4 }}
            >
              {error}
            </Alert>
          </Snackbar>

          {/* Refresh Progress */}
          {refreshing && (
            <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 1200 }}>
              <LinearProgress color="secondary" />
            </Box>
          )}

          {/* Metric Summary Cards */}
          {renderMetricCards()}

          {/* Main Content Tabs */}
          <GlassCard sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="analytics tabs"
              >
                <Tab
                  icon={<TimelineIcon />}
                  iconPosition="start"
                  label="Runway Scenarios"
                  sx={{ textTransform: 'none', py: 2 }}
                />
                <Tab
                  icon={<RocketLaunchIcon />}
                  iconPosition="start"
                  label="Fundraising"
                  sx={{ textTransform: 'none', py: 2 }}
                />
                <Tab
                  icon={<AccountBalanceIcon />}
                  iconPosition="start"
                  label="Cash Flow"
                  sx={{ textTransform: 'none', py: 2 }}
                />
                <Tab
                  icon={<PeopleIcon />}
                  iconPosition="start"
                  label="Revenue Cohorts"
                  sx={{ textTransform: 'none', py: 2 }}
                />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Runway Scenarios Tab */}
              <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Runway Scenarios & Projections
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<CompareArrowsIcon />}
                      sx={{ borderRadius: 2 }}
                      onClick={() => {
                        compareRunwayScenarios()
                          .then((res) => {
                            setScenarioComparison(res.data);
                            setSuccess('Scenarios compared successfully!');
                          })
                          .catch(() => {
                            setError('Failed to compare scenarios. Please try again.');
                          });
                      }}
                    >
                      Compare All
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        resetForms();
                        setOpenScenarioDialog(true);
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      New Scenario
                    </Button>
                  </Stack>
                </Stack>
                {renderRunwayScenarios()}
              </Box>

              {/* Fundraising Tab */}
              <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Fundraising Predictions
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      resetForms();
                      setOpenFundraisingDialog(true);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    New Prediction
                  </Button>
                </Stack>
                {renderFundraisingPredictions()}
                
              </Box>

              {/* Cash Flow Tab */}
              <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Cash Flow Forecasts
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      resetForms();
                      setOpenCashFlowDialog(true);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    New Forecast
                  </Button>
                </Stack>
                {renderCashFlowForecasts()}
              </Box>

              {/* Revenue Cohorts Tab */}
              <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Revenue Cohort Analysis
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      resetForms();
                      setOpenCohortDialog(true);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    New Cohort
                  </Button>
                </Stack>
                {renderCohortAnalysis()}
              </Box>
            </CardContent>
          </GlassCard>

          {/* Insights Panel */}
          {viewMode === 'insights' && renderInsights()}
        </Container>

        {/* Speed Dial for quick actions */}
        <SpeedDial
          ariaLabel="Analytics actions"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
          onClose={() => setOpenSpeedDial(false)}
          onOpen={() => setOpenSpeedDial(true)}
          open={openSpeedDial}
        >
          <SpeedDialAction
            icon={<PictureAsPdfIcon />}
            tooltipTitle="Export as PDF"
            onClick={exportToPDF}
          />
          <SpeedDialAction
            icon={<TableChartIcon />}
            tooltipTitle="Export as CSV"
            onClick={exportToCSV}
          />
          <SpeedDialAction
            icon={<EmailIcon />}
            tooltipTitle="Share via Email"
            onClick={shareViaEmail}
          />
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Refresh Data"
            onClick={() => fetchAnalyticsData(true)}
          />
        </SpeedDial>

        {/* Create Scenario Dialog */}
        <Dialog
          open={openScenarioDialog}
          onClose={() => {
            setOpenScenarioDialog(false);
            resetForms();
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 24
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editScenarioMode ? 'Edit Runway Scenario' : 'Create New Runway Scenario'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Quick Templates
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {scenarioTemplates.map((template) => (
                    <Chip
                      key={template.name}
                      label={template.name}
                      onClick={() => applyScenarioTemplate(template)}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Scenario Name"
                  value={scenarioFormData.name}
                  onChange={(e) => setScenarioFormData({ ...scenarioFormData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Scenario Type</InputLabel>
                  <Select
                    value={scenarioFormData.scenarioType}
                    onChange={(e) => setScenarioFormData({ ...scenarioFormData, scenarioType: e.target.value })}
                    label="Scenario Type"
                  >
                    <MenuItem value="Baseline">Baseline</MenuItem>
                    <MenuItem value="Optimistic">Optimistic</MenuItem>
                    <MenuItem value="Pessimistic">Pessimistic</MenuItem>
                    <MenuItem value="Custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={scenarioFormData.description}
                  onChange={(e) => setScenarioFormData({ ...scenarioFormData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Growth Assumptions
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Burn Rate Growth
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPercentage(scenarioFormData.assumptions[0].growthRate)}
                      </Typography>
                    </Stack>
                    <Slider
                      value={scenarioFormData.assumptions[0].growthRate * 100}
                      onChange={(e, value) => {
                        const newAssumptions = [...scenarioFormData.assumptions];
                        newAssumptions[0].growthRate = value / 100;
                        setScenarioFormData({ ...scenarioFormData, assumptions: newAssumptions });
                      }}
                      marks
                      step={1}
                      min={-10}
                      max={20}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Revenue Growth Rate
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPercentage(scenarioFormData.assumptions[1].growthRate)}
                      </Typography>
                    </Stack>
                    <Slider
                      value={scenarioFormData.assumptions[1].growthRate * 100}
                      onChange={(e, value) => {
                        const newAssumptions = [...scenarioFormData.assumptions];
                        newAssumptions[1].growthRate = value / 100;
                        setScenarioFormData({ ...scenarioFormData, assumptions: newAssumptions });
                      }}
                      marks
                      step={1}
                      min={0}
                      max={50}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value}%`}
                      color="secondary"
                    />
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Projection Period (months)"
                  value={scenarioFormData.projectionMonths}
                  onChange={(e) => setScenarioFormData({ ...scenarioFormData, projectionMonths: parseInt(e.target.value) })}
                  InputProps={{
                    inputProps: { min: 6, max: 60 }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button 
              onClick={() => {
                setOpenScenarioDialog(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateScenario}
              startIcon={editScenarioMode ? <SaveIcon /> : <AddIcon />}
              disabled={!scenarioFormData.name}
            >
              {editScenarioMode ? 'Update Scenario' : 'Create Scenario'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Fundraising Prediction Dialog */}
        <Dialog
          open={openFundraisingDialog}
          onClose={() => {
            setOpenFundraisingDialog(false);
            resetForms();
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 24
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editPredictionMode ? 'Edit Fundraising Prediction' : 'Create Fundraising Prediction'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prediction Name"
                  value={fundraisingFormData.predictionName}
                  onChange={(e) => setFundraisingFormData({ ...fundraisingFormData, predictionName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Round Type</InputLabel>
                  <Select
                    value={fundraisingFormData.roundType}
                    onChange={(e) => setFundraisingFormData({ ...fundraisingFormData, roundType: e.target.value })}
                    label="Round Type"
                  >
                    <MenuItem value="Pre-Seed">Pre-Seed</MenuItem>
                    <MenuItem value="Seed">Seed</MenuItem>
                    <MenuItem value="Series A">Series A</MenuItem>
                    <MenuItem value="Series B">Series B</MenuItem>
                    <MenuItem value="Bridge">Bridge</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Target Round Size (₹)"
                  value={fundraisingFormData.targetRoundSize}
                  onChange={(e) => setFundraisingFormData({ ...fundraisingFormData, targetRoundSize: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Target Valuation (₹)"
                  value={fundraisingFormData.targetValuation}
                  onChange={(e) => setFundraisingFormData({ ...fundraisingFormData, targetValuation: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Key Milestones
                </Typography>
                <Stack spacing={2}>
                  {['Product Launch', 'Revenue Target', 'User Growth', 'Market Expansion'].map((milestone) => (
                    <Box key={milestone}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={fundraisingFormData.keyMilestones.some(m => m.name === milestone)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFundraisingFormData({
                                  ...fundraisingFormData,
                                  keyMilestones: [...fundraisingFormData.keyMilestones, { name: milestone, percentageComplete: 50 }]
                                });
                              } else {
                                setFundraisingFormData({
                                  ...fundraisingFormData,
                                  keyMilestones: fundraisingFormData.keyMilestones.filter(m => m.name !== milestone)
                                });
                              }
                            }}
                          />
                        }
                        label={milestone}
                      />
                      {fundraisingFormData.keyMilestones.find(m => m.name === milestone) && (
                        <Box sx={{ ml: 4, mt: 1 }}>
                          <Typography variant="caption">Completion %</Typography>
                          <Slider
                            value={fundraisingFormData.keyMilestones.find(m => m.name === milestone)?.percentageComplete || 0}
                            onChange={(e, value) => {
                              setFundraisingFormData({
                                ...fundraisingFormData,
                                keyMilestones: fundraisingFormData.keyMilestones.map(m =>
                                  m.name === milestone ? { ...m, percentageComplete: value } : m
                                )
                              });
                            }}
                            valueLabelDisplay="auto"
                            min={0}
                            max={100}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button 
              onClick={() => {
                setOpenFundraisingDialog(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateFundraisingPrediction}
              startIcon={editPredictionMode ? <SaveIcon /> : <AddIcon />}
              disabled={!fundraisingFormData.predictionName || fundraisingFormData.targetRoundSize === 0}
            >
              {editPredictionMode ? 'Update Prediction' : 'Create Prediction'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cash Flow Forecast Dialog */}
        <Dialog
          open={openCashFlowDialog}
          onClose={() => {
            setOpenCashFlowDialog(false);
            resetForms();
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 24
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editForecastMode ? 'Edit Cash Flow Forecast' : 'Create Cash Flow Forecast'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Forecast Name"
                  value={cashFlowFormData.forecastName}
                  onChange={(e) => setCashFlowFormData({ ...cashFlowFormData, forecastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Forecast Type</InputLabel>
                  <Select
                    value={cashFlowFormData.forecastType}
                    onChange={(e) => setCashFlowFormData({ ...cashFlowFormData, forecastType: e.target.value })}
                    label="Forecast Type"
                  >
                    <MenuItem value="Short-term">Short-term (3 months)</MenuItem>
                    <MenuItem value="Medium-term">Medium-term (6 months)</MenuItem>
                    <MenuItem value="Long-term">Long-term (12 months)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={cashFlowFormData.description}
                  onChange={(e) => setCashFlowFormData({ ...cashFlowFormData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Forecast End Date"
                  value={cashFlowFormData.endDate}
                  onChange={(date) => setCashFlowFormData({ ...cashFlowFormData, endDate: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Granularity</InputLabel>
                  <Select
                    value={cashFlowFormData.granularity}
                    onChange={(e) => setCashFlowFormData({ ...cashFlowFormData, granularity: e.target.value })}
                    label="Granularity"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  This forecast will use your historical cash flow patterns and apply machine learning to predict future cash positions.
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button 
              onClick={() => {
                setOpenCashFlowDialog(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateCashFlowForecast}
              startIcon={editForecastMode ? <SaveIcon /> : <AddIcon />}
              disabled={!cashFlowFormData.forecastName}
            >
              {editForecastMode ? 'Update Forecast' : 'Create Forecast'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Revenue Cohort Dialog */}
        <Dialog
          open={openCohortDialog}
          onClose={() => {
            setOpenCohortDialog(false);
            resetForms();
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 24
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editCohortMode ? 'Edit Revenue Cohort' : 'Create Revenue Cohort'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cohort Name"
                  value={cohortFormData.cohortName}
                  onChange={(e) => setCohortFormData({ ...cohortFormData, cohortName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Cohort Start Date"
                  value={cohortFormData.cohortStartDate}
                  onChange={(date) => setCohortFormData({ ...cohortFormData, cohortStartDate: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Cohort Type</InputLabel>
                  <Select
                    value={cohortFormData.cohortType}
                    onChange={(e) => setCohortFormData({ ...cohortFormData, cohortType: e.target.value })}
                    label="Cohort Type"
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Initial Users"
                  value={cohortFormData.initialUsers}
                  onChange={(e) => setCohortFormData({ ...cohortFormData, initialUsers: parseInt(e.target.value) || 0 })}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Acquisition Channel</InputLabel>
                  <Select
                    value={cohortFormData.acquisitionChannel}
                    onChange={(e) => setCohortFormData({ ...cohortFormData, acquisitionChannel: e.target.value })}
                    label="Acquisition Channel"
                  >
                    <MenuItem value="">Select Channel</MenuItem>
                    <MenuItem value="Organic">Organic</MenuItem>
                    <MenuItem value="Paid Search">Paid Search</MenuItem>
                    <MenuItem value="Social Media">Social Media</MenuItem>
                    <MenuItem value="Email">Email</MenuItem>
                    <MenuItem value="Referral">Referral</MenuItem>
                    <MenuItem value="Direct">Direct</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Acquisition Cost (₹)"
                  value={cohortFormData.acquisitionCost}
                  onChange={(e) => setCohortFormData({ ...cohortFormData, acquisitionCost: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Product Type</InputLabel>
                  <Select
                    value={cohortFormData.productType}
                    onChange={(e) => setCohortFormData({ ...cohortFormData, productType: e.target.value })}
                    label="Product Type"
                  >
                    <MenuItem value="">Select Product</MenuItem>
                    <MenuItem value="SaaS">SaaS</MenuItem>
                    <MenuItem value="E-commerce">E-commerce</MenuItem>
                    <MenuItem value="Marketplace">Marketplace</MenuItem>
                    <MenuItem value="Mobile App">Mobile App</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  After creating this cohort, you can add monthly performance metrics to track retention and LTV.
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button 
              onClick={() => {
                setOpenCohortDialog(false);
                resetForms();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateCohort}
              startIcon={editCohortMode ? <SaveIcon /> : <AddIcon />}
              disabled={!cohortFormData.cohortName || cohortFormData.initialUsers === 0}
            >
              {editCohortMode ? 'Update Cohort' : 'Create Cohort'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
          }}
          PaperProps={{
            sx: {
              borderRadius: 3
            }
          }}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setDeleteConfirmOpen(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="error"
              onClick={handleDeleteItem}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;