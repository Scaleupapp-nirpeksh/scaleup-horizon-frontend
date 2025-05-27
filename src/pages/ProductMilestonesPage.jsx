// src/pages/ProductMilestonesPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Card, CardContent, Stack,
  Button, IconButton, Avatar, Chip, Divider, Tooltip, Badge, useTheme,
  alpha, Fade, Grow, Skeleton, LinearProgress, TextField, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, FormHelperText, Tab, Tabs, Autocomplete, InputAdornment, ListItem,
  ListItemAvatar, ListItemText, List, CircularProgress, Alert, AlertTitle,
  Checkbox, FormGroup, FormControlLabel, Zoom, Slide, ToggleButton,
  ToggleButtonGroup, Stepper, Step, StepLabel, StepContent, AvatarGroup
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate } from 'react-router-dom';

// Icons
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BugReportIcon from '@mui/icons-material/BugReport';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import FlagIcon from '@mui/icons-material/Flag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import ScienceIcon from '@mui/icons-material/Science';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import BlockIcon from '@mui/icons-material/Block';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// API
import {
  getProductMilestones,
  getProductMilestoneById,
  createProductMilestone,
  updateProductMilestone,
  deleteProductMilestone,
  addMilestoneTask,
  updateMilestoneTask,
  deleteMilestoneTask,
  getProductMilestoneStatistics,
  getInvestorRoadmap,
  getHeadcounts,
} from '../services/api';

// Magical Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(-5deg); }
  66% { transform: translateY(10px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.5),
                0 0 20px rgba(99, 102, 241, 0.3),
                0 0 40px rgba(99, 102, 241, 0.1);
  }
  50% { 
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.8),
                0 0 40px rgba(99, 102, 241, 0.5),
                0 0 60px rgba(99, 102, 241, 0.3);
  }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// Magical Styled Components
const MagicalBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: theme.palette.mode === 'dark'
    ? 'radial-gradient(ellipse at top left, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    : 'radial-gradient(ellipse at top right, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px)`,
    backgroundSize: '50px 50px',
    animation: `${float} 30s linear infinite`,
    opacity: 0.3,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: '400px',
    height: '400px',
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.2)} 0%, transparent 70%)`,
    filter: 'blur(60px)',
    animation: `${pulse} 8s ease-in-out infinite`,
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, 
        ${alpha('#6366f1', 0.2)} 0%, 
        ${alpha('#8b5cf6', 0.2)} 50%, 
        ${alpha('#ec4899', 0.2)} 100%)`
    : `linear-gradient(135deg, 
        ${alpha('#3b82f6', 0.15)} 0%, 
        ${alpha('#8b5cf6', 0.1)} 50%, 
        ${alpha('#ec4899', 0.05)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  backdropFilter: 'blur(20px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
    animation: `${float} 20s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-50px',
    left: '-50px',
    width: '300px',
    height: '300px',
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
    animation: `${float} 25s ease-in-out infinite reverse`,
  }
}));

const MagicalMetricCard = styled(Card)(({ theme, glowColor = 'primary' }) => ({
  borderRadius: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha('#1e293b', 0.9)} 0%, ${alpha('#334155', 0.9)} 100%)`
    : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8fafc', 0.95)} 100%)`,
  backdropFilter: 'blur(20px) saturate(180%)',
  border: `1px solid ${alpha(theme.palette[glowColor].main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: theme.spacing(3),
    padding: '2px',
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette[glowColor].main, 0.4)} 0%, 
      transparent 50%,
      ${alpha(theme.palette[glowColor].light, 0.3)} 100%)`,
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    opacity: 0,
    transition: 'opacity 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(theme.palette[glowColor].main, 0.3)}`,
    border: `1px solid ${alpha(theme.palette[glowColor].main, 0.4)}`,
    '&::before': {
      opacity: 1,
    },
    '& .metric-value': {
      transform: 'scale(1.05)',
    },
    '& .metric-icon': {
      transform: 'rotate(10deg) scale(1.1)',
    }
  }
}));

const MilestoneCard = styled(Card)(({ theme, status }) => {
  let statusColor;
  switch (status) {
    case 'Planning':
      statusColor = theme.palette.info.main;
      break;
    case 'In Development':
      statusColor = theme.palette.warning.main;
      break;
    case 'Testing':
      statusColor = theme.palette.secondary.main;
      break;
    case 'Completed':
      statusColor = theme.palette.success.main;
      break;
    case 'On Hold':
      statusColor = theme.palette.grey[500];
      break;
    case 'Cancelled':
      statusColor = theme.palette.error.main;
      break;
    default:
      statusColor = theme.palette.primary.main;
  }

  return {
    borderRadius: theme.spacing(2.5),
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha('#1e293b', 0.9)} 0%, ${alpha('#334155', 0.9)} 100%)`
      : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8fafc', 0.95)} 100%)`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.01)',
      boxShadow: `0 12px 24px ${alpha(statusColor, 0.2)}`,
      border: `1px solid ${alpha(statusColor, 0.3)}`,
      '&::before': {
        width: '8px',
        opacity: 1,
      },
      '& .milestone-title': {
        color: theme.palette.primary.main,
      }
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '5px',
      height: '100%',
      background: `linear-gradient(180deg, ${statusColor} 0%, ${alpha(statusColor, 0.6)} 100%)`,
      opacity: 0.8,
      transition: 'all 0.3s ease',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: `radial-gradient(circle, ${alpha(statusColor, 0.1)} 0%, transparent 70%)`,
      transform: 'translate(30px, -30px)',
    }
  };
});

const FloatingActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  backgroundSize: '200% 200%',
  animation: `${gradientShift} 3s ease infinite`,
  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
  }
}));

const AnimatedProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.grey[300], 0.2),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  }
}));

const TimelineBar = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 40,
  borderRadius: 20,
  background: theme.palette.mode === 'dark'
    ? alpha('#334155', 0.5)
    : alpha('#e2e8f0', 0.8),
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const AnimatedNumber = ({ value, duration = 1500, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const targetValue = parseFloat(value);
          
          if (isNaN(targetValue)) {
            setDisplayValue(value);
            return;
          }

          const startTime = Date.now();
          const startValue = 0;
          const endValue = targetValue;
          
          const updateNumber = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (endValue - startValue) * easeOutQuart;
            
            setDisplayValue(currentValue);
            
            if (progress < 1) {
              requestAnimationFrame(updateNumber);
            } else {
              setDisplayValue(endValue);
            }
          };
          
          requestAnimationFrame(updateNumber);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  if (isNaN(parseFloat(value))) {
    return <span ref={elementRef}>{prefix}{String(value)}{suffix}</span>;
  }

  return (
    <span ref={elementRef}>
      {prefix}{displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}{suffix}
    </span>
  );
};

// Helper Components
const StatusChip = ({ status }) => {
  let color, icon;
  switch (status) {
    case 'Planning':
      color = 'info';
      icon = <ScienceIcon fontSize="small" />;
      break;
    case 'In Development':
      color = 'warning';
      icon = <BuildIcon fontSize="small" />;
      break;
    case 'Testing':
      color = 'secondary';
      icon = <BugReportIcon fontSize="small" />;
      break;
    case 'Deploying':
      color = 'primary';
      icon = <RocketLaunchIcon fontSize="small" />;
      break;
    case 'Completed':
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      break;
    case 'On Hold':
      color = 'default';
      icon = <PauseCircleIcon fontSize="small" />;
      break;
    case 'Cancelled':
      color = 'error';
      icon = <CancelIcon fontSize="small" />;
      break;
    default:
      color = 'default';
      icon = <PendingIcon fontSize="small" />;
  }

  return (
    <Chip
      icon={icon}
      label={status}
      color={color}
      size="small"
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          animation: status === 'In Development' ? `${pulse} 2s ease-in-out infinite` : 'none'
        }
      }}
    />
  );
};

const PriorityChip = ({ priority }) => {
  let color;
  switch (priority) {
    case 'Critical':
      color = 'error';
      break;
    case 'High':
      color = 'warning';
      break;
    case 'Medium':
      color = 'info';
      break;
    case 'Low':
      color = 'default';
      break;
    default:
      color = 'default';
  }

  return (
    <Chip
      icon={<FlagIcon fontSize="small" />}
      label={priority}
      color={color}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};

const MilestoneTypeIcon = ({ type }) => {
  switch (type) {
    case 'Feature':
      return <AutoAwesomeIcon />;
    case 'Bug Fix':
      return <BugReportIcon />;
    case 'Performance Improvement':
      return <SpeedIcon />;
    case 'UX Enhancement':
      return <GroupsIcon />;
    case 'Infrastructure':
      return <BuildIcon />;
    case 'Security':
      return <SecurityIcon />;
    case 'Compliance':
      return <AssignmentIcon />;
    case 'Research':
      return <ScienceIcon />;
    default:
      return <RocketLaunchIcon />;
  }
};

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`milestone-tabpanel-${index}`}
    aria-labelledby={`milestone-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Fade in timeout={500}>
        <Box sx={{ py: 3, px: { xs: 0, sm: 1 } }}>{children}</Box>
      </Fade>
    )}
  </div>
);

// Utility Functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const calculateDaysRemaining = (endDate) => {
  if (!endDate) return null;
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Initial form data
const initialFormData = {
  name: '',
  description: '',
  milestoneType: 'Feature',
  status: 'Planning',
  completionPercentage: 0,
  plannedStartDate: new Date(),
  plannedEndDate: null,
  actualStartDate: null,
  actualEndDate: null,
  productOwner: null,
  teamMembers: [],
  businessImpact: {
    impactType: 'User Growth',
    projectedImpact: '',
    impactMetric: '',
    targetValue: '',
    confidenceLevel: 'Medium'
  },
  quarter: '',
  priority: 'Medium',
  visibleToInvestors: true,
  investorSummary: '',
  estimatedEffort: '',
  budget: '',
  tags: []
};

const initialTaskData = {
  taskName: '',
  description: '',
  assignee: null,
  status: 'Not Started',
  priority: 'Medium',
  dueDate: null,
  dependencies: []
};

// Main Component
const ProductMilestonesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list, timeline
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [sortBy, setSortBy] = useState('plannedEndDate');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [taskFormData, setTaskFormData] = useState(initialTaskData);
  const [formErrors, setFormErrors] = useState({});
  
  // Other states
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [availableTeamMembers, setAvailableTeamMembers] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMilestoneForMenu, setSelectedMilestoneForMenu] = useState(null);

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await getHeadcounts();
      setAvailableTeamMembers(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  }, []);

  // Fetch milestones
  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sortBy,
        sortDir: 'asc'
      };
      
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedType !== 'all') params.milestoneType = selectedType;
      if (selectedQuarter !== 'all') params.quarter = selectedQuarter;
      if (searchQuery) params.search = searchQuery;

      const response = await getProductMilestones(params);
      setMilestones(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setError('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedType, selectedQuarter, sortBy, searchQuery]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await getProductMilestoneStatistics();
      setStatistics(response.data?.data || null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, []);

  // Fetch single milestone
  const fetchMilestoneDetails = useCallback(async (id) => {
    try {
      const response = await getProductMilestoneById(id);
      setSelectedMilestone(response.data?.data || null);
    } catch (err) {
      console.error('Error fetching milestone details:', err);
      setError('Failed to load milestone details');
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
    fetchMilestones();
    fetchStatistics();
  }, [fetchTeamMembers, fetchMilestones, fetchStatistics]);

  // Form handlers
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.plannedStartDate) errors.plannedStartDate = 'Start date is required';
    if (!formData.plannedEndDate) errors.plannedEndDate = 'End date is required';
    
    if (formData.plannedEndDate && formData.plannedStartDate) {
      if (new Date(formData.plannedEndDate) < new Date(formData.plannedStartDate)) {
        errors.plannedEndDate = 'End date must be after start date';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        teamMembers: formData.teamMembers.map(tm => tm._id || tm),
        productOwner: formData.productOwner?._id || formData.productOwner
      };

      if (editingMilestoneId) {
        await updateProductMilestone(editingMilestoneId, payload);
        setSuccess('Milestone updated successfully!');
      } else {
        await createProductMilestone(payload);
        setSuccess('Milestone created successfully!');
      }
      
      setOpenDialog(false);
      setFormData(initialFormData);
      setEditingMilestoneId(null);
      fetchMilestones();
      fetchStatistics();
    } catch (err) {
      console.error('Error saving milestone:', err);
      setError('Failed to save milestone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (milestone) => {
    setEditingMilestoneId(milestone._id);
    setFormData({
      ...milestone,
      plannedStartDate: milestone.plannedStartDate ? new Date(milestone.plannedStartDate) : null,
      plannedEndDate: milestone.plannedEndDate ? new Date(milestone.plannedEndDate) : null,
      actualStartDate: milestone.actualStartDate ? new Date(milestone.actualStartDate) : null,
      actualEndDate: milestone.actualEndDate ? new Date(milestone.actualEndDate) : null,
      businessImpact: milestone.businessImpact || initialFormData.businessImpact
    });
    setOpenDialog(true);
    setMenuAnchor(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    
    try {
      await deleteProductMilestone(id);
      setSuccess('Milestone deleted successfully!');
      fetchMilestones();
      fetchStatistics();
      if (selectedMilestone?._id === id) {
        setSelectedMilestone(null);
      }
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError('Failed to delete milestone');
    } finally {
      setMenuAnchor(null);
    }
  };

  // Task handlers
  const handleAddTask = async () => {
    if (!taskFormData.taskName.trim()) {
      setError('Task name is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addMilestoneTask(selectedMilestone._id, {
        ...taskFormData,
        assignee: taskFormData.assignee?._id || taskFormData.assignee
      });
      setSuccess('Task added successfully!');
      setOpenTaskDialog(false);
      setTaskFormData(initialTaskData);
      fetchMilestoneDetails(selectedMilestone._id);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateMilestoneTask(selectedMilestone._id, taskId, { status: newStatus });
      fetchMilestoneDetails(selectedMilestone._id);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task status');
    }
  };

  // Calculate metrics
  const metrics = {
    total: milestones.length,
    planning: milestones.filter(m => m.status === 'Planning').length,
    inProgress: milestones.filter(m => ['In Development', 'Testing', 'Deploying'].includes(m.status)).length,
    completed: milestones.filter(m => m.status === 'Completed').length,
    onHold: milestones.filter(m => m.status === 'On Hold').length,
    avgCompletion: statistics?.completionStats?.avgCompletion || 0,
    delayedPercentage: statistics?.timelineStats?.delayedPercentage || 0
  };

  // Generate current quarter
  const getCurrentQuarter = () => {
    const now = new Date();
    const quarter = Math.floor((now.getMonth() / 3)) + 1;
    return `${now.getFullYear()}-Q${quarter}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        <MagicalBackground />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <HeroSection sx={{ py: { xs: 4, md: 5 }, mb: { xs: 3, md: 4 } }}>
            <Container maxWidth="xl">
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Fade in timeout={1000}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          width: 64, 
                          height: 64, 
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                          animation: `${glow} 3s ease-in-out infinite`
                        }}>
                          <RocketLaunchIcon sx={{ fontSize: 36 }} />
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              fontWeight: 800, 
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, 
                              WebkitBackgroundClip: 'text', 
                              WebkitTextFillColor: 'transparent', 
                              mb: 0.5 
                            }}
                          >
                            Product Roadmap
                          </Typography>
                          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                            Track milestones, manage features, and deliver excellence
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Fade>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Fade in timeout={1200}>
                    <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                      <FloatingActionButton 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => {
                          setEditingMilestoneId(null);
                          setFormData(initialFormData);
                          setFormErrors({});
                          setOpenDialog(true);
                        }}
                      >
                        New Milestone
                      </FloatingActionButton>
                      <Button 
                        variant="outlined" 
                        startIcon={<DashboardIcon />} 
                        onClick={() => navigate('/investor-roadmap')}
                        sx={{ 
                          borderRadius: 3,
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        Investor View
                      </Button>
                    </Stack>
                  </Fade>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {[
                    { 
                      label: 'Total Milestones', 
                      value: metrics.total, 
                      icon: <RocketLaunchIcon />, 
                      color: 'primary' 
                    },
                    { 
                      label: 'In Progress', 
                      value: metrics.inProgress, 
                      icon: <BuildIcon />, 
                      color: 'warning' 
                    },
                    { 
                      label: 'Completed', 
                      value: metrics.completed, 
                      icon: <CheckCircleIcon />, 
                      color: 'success' 
                    },
                    { 
                      label: 'Avg. Progress', 
                      value: metrics.avgCompletion, 
                      icon: <ShowChartIcon />, 
                      color: 'info',
                      suffix: '%',
                      decimals: 1
                    },
                    { 
                      label: 'On Time', 
                      value: 100 - metrics.delayedPercentage, 
                      icon: <TimelineIcon />, 
                      color: 'secondary',
                      suffix: '%',
                      decimals: 0
                    },
                  ].map((metric, index) => (
                    <Grid item xs={6} sm={4} md={2.4} key={metric.label}>
                      <Zoom in timeout={800 + index * 100}>
                        <MagicalMetricCard glowColor={metric.color}>
                          <CardContent sx={{ textAlign: 'center', p: 2.5 }}>
                            <Avatar 
                              className="metric-icon"
                              sx={{ 
                                bgcolor: alpha(theme.palette[metric.color].main, 0.1), 
                                color: theme.palette[metric.color].main, 
                                width: 56, 
                                height: 56, 
                                mx: 'auto', 
                                mb: 2,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {metric.icon}
                            </Avatar>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ 
                                fontWeight: 600, 
                                display: 'block',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                mb: 0.5
                              }}
                            >
                              {metric.label}
                            </Typography>
                            <Typography 
                              variant="h4" 
                              className="metric-value" 
                              sx={{ 
                                fontWeight: 700, 
                                color: theme.palette[metric.color].dark,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {loading ? (
                                <Skeleton width={60} sx={{ mx: 'auto' }} />
                              ) : (
                                <AnimatedNumber 
                                  value={metric.value} 
                                  suffix={metric.suffix}
                                  decimals={metric.decimals || 0}
                                />
                              )}
                            </Typography>
                          </CardContent>
                        </MagicalMetricCard>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Container>
          </HeroSection>

          <Container maxWidth="xl" sx={{ pb: 6 }}>
            {success && (
              <Grow in={!!success}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`
                  }} 
                  onClose={() => setSuccess('')}
                  icon={<CheckCircleIcon />}
                >
                  {success}
                </Alert>
              </Grow>
            )}
            {error && (
              <Grow in={!!error}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
                  }} 
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              </Grow>
            )}

            {/* Filters and View Controls */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                  ? alpha('#1e293b', 0.8)
                  : alpha('#ffffff', 0.95),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search milestones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="Planning">Planning</MenuItem>
                      <MenuItem value="In Development">In Development</MenuItem>
                      <MenuItem value="Testing">Testing</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="On Hold">On Hold</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="Feature">Feature</MenuItem>
                      <MenuItem value="Bug Fix">Bug Fix</MenuItem>
                      <MenuItem value="Performance Improvement">Performance</MenuItem>
                      <MenuItem value="UX Enhancement">UX Enhancement</MenuItem>
                      <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                      <MenuItem value="Security">Security</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Quarter</InputLabel>
                    <Select
                      value={selectedQuarter}
                      onChange={(e) => setSelectedQuarter(e.target.value)}
                      label="Quarter"
                    >
                      <MenuItem value="all">All Quarters</MenuItem>
                      <MenuItem value={getCurrentQuarter()}>Current Quarter</MenuItem>
                      <MenuItem value="2025-Q1">2025 Q1</MenuItem>
                      <MenuItem value="2025-Q2">2025 Q2</MenuItem>
                      <MenuItem value="2025-Q3">2025 Q3</MenuItem>
                      <MenuItem value="2025-Q4">2025 Q4</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => newMode && setViewMode(newMode)}
                      size="small"
                    >
                      <ToggleButton value="kanban">
                        <Tooltip title="Kanban View">
                          <ViewKanbanIcon />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="list">
                        <Tooltip title="List View">
                          <ViewListIcon />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="timeline">
                        <Tooltip title="Timeline View">
                          <TimelineIcon />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Main Content Area */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={60} thickness={2} />
              </Box>
            ) : (
              <>
                {viewMode === 'kanban' && (
                  <Grid container spacing={3}>
                    {['Planning', 'In Development', 'Testing', 'Completed'].map((status) => (
                      <Grid item xs={12} md={3} key={status}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            background: theme.palette.mode === 'dark'
                              ? alpha('#1e293b', 0.6)
                              : alpha('#ffffff', 0.9),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            minHeight: 500
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <StatusChip status={status} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {milestones.filter(m => m.status === status).length}
                            </Typography>
                          </Stack>
                          <Stack spacing={2}>
                            {milestones
                              .filter(m => m.status === status)
                              .map((milestone, index) => (
                                <Slide key={milestone._id} direction="up" in timeout={300 + index * 50}>
                                  <MilestoneCard
                                    status={milestone.status}
                                    onClick={() => {
                                      setSelectedMilestone(milestone);
                                      fetchMilestoneDetails(milestone._id);
                                    }}
                                  >
                                    <CardContent sx={{ p: 2 }}>
                                      <Stack spacing={1}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                                          <Box sx={{ flex: 1 }}>
                                            <Typography 
                                              variant="subtitle1" 
                                              className="milestone-title"
                                              sx={{ 
                                                fontWeight: 600,
                                                transition: 'color 0.3s ease'
                                              }}
                                            >
                                              {milestone.name}
                                            </Typography>
                                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                              <MilestoneTypeIcon type={milestone.milestoneType} />
                                              <Typography variant="caption" color="text.secondary">
                                                {milestone.milestoneType}
                                              </Typography>
                                            </Stack>
                                          </Box>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setMenuAnchor(e.currentTarget);
                                              setSelectedMilestoneForMenu(milestone);
                                            }}
                                          >
                                            <MoreVertIcon fontSize="small" />
                                          </IconButton>
                                        </Stack>
                                        
                                        <Box>
                                          <AnimatedProgress 
                                            variant="determinate" 
                                            value={milestone.completionPercentage || 0}
                                          />
                                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {milestone.completionPercentage || 0}% complete
                                          </Typography>
                                        </Box>
                                        
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                          <Typography variant="caption" color="text.secondary">
                                            Due: {formatDate(milestone.plannedEndDate)}
                                          </Typography>
                                          <PriorityChip priority={milestone.priority} />
                                        </Stack>
                                        
                                        {milestone.teamMembers?.length > 0 && (
                                          <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
                                            {milestone.teamMembers.map((member, idx) => (
                                              <Avatar
                                                key={idx}
                                                sx={{ 
                                                  width: 24, 
                                                  height: 24,
                                                  fontSize: '0.75rem',
                                                  bgcolor: theme.palette.primary.main
                                                }}
                                              >
                                                {member.name?.charAt(0).toUpperCase()}
                                              </Avatar>
                                            ))}
                                          </AvatarGroup>
                                        )}
                                      </Stack>
                                    </CardContent>
                                  </MilestoneCard>
                                </Slide>
                              ))}
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {viewMode === 'list' && (
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      background: theme.palette.mode === 'dark'
                        ? alpha('#1e293b', 0.8)
                        : alpha('#ffffff', 0.95),
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <Box sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        {milestones.map((milestone, index) => (
                          <Fade key={milestone._id} in timeout={300 + index * 50}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`
                                }
                              }}
                              onClick={() => {
                                setSelectedMilestone(milestone);
                                fetchMilestoneDetails(milestone._id);
                              }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                  <Stack spacing={1}>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {milestone.name}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <MilestoneTypeIcon type={milestone.milestoneType} />
                                      <Typography variant="body2" color="text.secondary">
                                        {milestone.milestoneType}
                                      </Typography>
                                      <StatusChip status={milestone.status} />
                                    </Stack>
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary">
                                      Progress
                                    </Typography>
                                    <AnimatedProgress 
                                      variant="determinate" 
                                      value={milestone.completionPercentage || 0}
                                    />
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary">
                                      Timeline
                                    </Typography>
                                    <Typography variant="body2">
                                      {formatDate(milestone.plannedStartDate)} - {formatDate(milestone.plannedEndDate)}
                                    </Typography>
                                    {calculateDaysRemaining(milestone.plannedEndDate) !== null && (
                                      <Typography 
                                        variant="caption" 
                                        color={calculateDaysRemaining(milestone.plannedEndDate) < 0 ? 'error' : 'text.secondary'}
                                      >
                                        {calculateDaysRemaining(milestone.plannedEndDate) < 0
                                          ? `${Math.abs(calculateDaysRemaining(milestone.plannedEndDate))} days overdue`
                                          : `${calculateDaysRemaining(milestone.plannedEndDate)} days remaining`
                                        }
                                      </Typography>
                                    )}
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <PriorityChip priority={milestone.priority} />
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuAnchor(e.currentTarget);
                                        setSelectedMilestoneForMenu(milestone);
                                      }}
                                    >
                                      <MoreVertIcon />
                                    </IconButton>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Fade>
                        ))}
                      </Stack>
                    </Box>
                  </Paper>
                )}

                {viewMode === 'timeline' && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? alpha('#1e293b', 0.8)
                        : alpha('#ffffff', 0.95),
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Timeline View
                    </Typography>
                    <Stack spacing={3}>
                      {statistics?.quarterlyBreakdown?.map((quarter) => (
                        <Box key={quarter._id}>
                          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            {quarter._id}
                          </Typography>
                          <Stack spacing={2}>
                            {milestones
                              .filter(m => m.quarter === quarter._id)
                              .map((milestone) => {
                                const progress = milestone.completionPercentage || 0;
                                const daysRemaining = calculateDaysRemaining(milestone.plannedEndDate);
                                
                                return (
                                  <TimelineBar
                                    key={milestone._id}
                                    onClick={() => {
                                      setSelectedMilestone(milestone);
                                      fetchMilestoneDetails(milestone._id);
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: `${progress}%`,
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                        borderRadius: 20,
                                        transition: 'width 0.5s ease'
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        position: 'relative',
                                        zIndex: 1,
                                        px: 2,
                                        py: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                      }}
                                    >
                                      <Stack direction="row" spacing={2} alignItems="center">
                                        <MilestoneTypeIcon type={milestone.milestoneType} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {milestone.name}
                                        </Typography>
                                        <StatusChip status={milestone.status} />
                                      </Stack>
                                      <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                          {progress}%
                                        </Typography>
                                        {daysRemaining !== null && (
                                          <Chip
                                            size="small"
                                            label={`${Math.abs(daysRemaining)}d ${daysRemaining < 0 ? 'overdue' : 'left'}`}
                                            color={daysRemaining < 0 ? 'error' : 'default'}
                                          />
                                        )}
                                      </Stack>
                                    </Box>
                                  </TimelineBar>
                                );
                              })}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </>
            )}

            {/* Milestone Details Drawer */}
            {selectedMilestone && (
              <Dialog
                open={!!selectedMilestone}
                onClose={() => setSelectedMilestone(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                      ? alpha('#1e293b', 0.95)
                      : alpha('#ffffff', 0.98),
                    backdropFilter: 'blur(20px)'
                  }
                }}
              >
                <DialogTitle sx={{ pb: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <MilestoneTypeIcon type={selectedMilestone.milestoneType} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {selectedMilestone.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StatusChip status={selectedMilestone.status} />
                          <PriorityChip priority={selectedMilestone.priority} />
                          {selectedMilestone.visibleToInvestors && (
                            <Chip
                              icon={<VisibilityIcon fontSize="small" />}
                              label="Investor Visible"
                              size="small"
                              color="info"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        size="small"
                        onClick={() => handleEdit(selectedMilestone)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={() => setOpenTaskDialog(true)}
                      >
                        Add Task
                      </Button>
                    </Stack>
                  </Stack>
                </DialogTitle>
                <DialogContent>
                  <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                    <Tab label="Overview" />
                    <Tab label="Tasks" />
                    <Tab label="Team" />
                    <Tab label="Impact" />
                  </Tabs>

                  <TabPanel value={activeTab} index={0}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Details
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Description</Typography>
                              <Typography>{selectedMilestone.description || 'No description provided'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Type</Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <MilestoneTypeIcon type={selectedMilestone.milestoneType} />
                                <Typography>{selectedMilestone.milestoneType}</Typography>
                              </Stack>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Quarter</Typography>
                              <Typography>{selectedMilestone.quarter || 'Not specified'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Progress</Typography>
                              <Box sx={{ mt: 1 }}>
                                <AnimatedProgress 
                                  variant="determinate" 
                                  value={selectedMilestone.completionPercentage || 0}
                                />
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {selectedMilestone.completionPercentage || 0}% complete
                                </Typography>
                              </Box>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Timeline
                          </Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Planned Start</Typography>
                              <Typography>{formatDate(selectedMilestone.plannedStartDate)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Planned End</Typography>
                              <Typography>{formatDate(selectedMilestone.plannedEndDate)}</Typography>
                            </Box>
                            {selectedMilestone.actualStartDate && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">Actual Start</Typography>
                                <Typography>{formatDate(selectedMilestone.actualStartDate)}</Typography>
                              </Box>
                            )}
                            {selectedMilestone.actualEndDate && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">Actual End</Typography>
                                <Typography>{formatDate(selectedMilestone.actualEndDate)}</Typography>
                              </Box>
                            )}
                            {calculateDaysRemaining(selectedMilestone.plannedEndDate) !== null && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Typography 
                                  color={calculateDaysRemaining(selectedMilestone.plannedEndDate) < 0 ? 'error' : 'success'}
                                  sx={{ fontWeight: 600 }}
                                >
                                  {calculateDaysRemaining(selectedMilestone.plannedEndDate) < 0
                                    ? `${Math.abs(calculateDaysRemaining(selectedMilestone.plannedEndDate))} days overdue`
                                    : `${calculateDaysRemaining(selectedMilestone.plannedEndDate)} days remaining`
                                  }
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      </Grid>
                      {selectedMilestone.investorSummary && (
                        <Grid item xs={12}>
                          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                              Investor Summary
                            </Typography>
                            <Typography>{selectedMilestone.investorSummary}</Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </TabPanel>

                  <TabPanel value={activeTab} index={1}>
                    <Stack spacing={2}>
                      {selectedMilestone.tasks?.length > 0 ? (
                        selectedMilestone.tasks.map((task) => (
                          <Paper
                            key={task._id}
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                              }
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={6}>
                                <Stack spacing={0.5}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {task.taskName}
                                  </Typography>
                                  {task.description && (
                                    <Typography variant="body2" color="text.secondary">
                                      {task.description}
                                    </Typography>
                                  )}
                                </Stack>
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <Stack spacing={0.5}>
                                  <Typography variant="caption" color="text.secondary">
                                    Assignee
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar sx={{ width: 24, height: 24 }}>
                                      {task.assignee?.name?.charAt(0) || '?'}
                                    </Avatar>
                                    <Typography variant="body2">
                                      {task.assignee?.name || 'Unassigned'}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                  <Select
                                    value={task.status}
                                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                  >
                                    <MenuItem value="Not Started">Not Started</MenuItem>
                                    <MenuItem value="In Progress">In Progress</MenuItem>
                                    <MenuItem value="Blocked">Blocked</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </Paper>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography color="text.secondary">No tasks added yet</Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenTaskDialog(true)}
                            sx={{ mt: 2 }}
                          >
                            Add First Task
                          </Button>
                        </Box>
                      )}
                    </Stack>
                  </TabPanel>

                  <TabPanel value={activeTab} index={2}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Product Owner
                          </Typography>
                          {selectedMilestone.productOwner ? (
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                {selectedMilestone.productOwner.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {selectedMilestone.productOwner.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {selectedMilestone.productOwner.title}
                                </Typography>
                              </Box>
                            </Stack>
                          ) : (
                            <Typography color="text.secondary">No product owner assigned</Typography>
                          )}
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Team Members ({selectedMilestone.teamMembers?.length || 0})
                          </Typography>
                          {selectedMilestone.teamMembers?.length > 0 ? (
                            <List dense>
                              {selectedMilestone.teamMembers.map((member, idx) => (
                                <ListItem key={idx}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                                      {member.name?.charAt(0)}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={member.name}
                                    secondary={member.title}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography color="text.secondary">No team members assigned</Typography>
                          )}
                        </Paper>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  <TabPanel value={activeTab} index={3}>
                    {selectedMilestone.businessImpact ? (
                      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          Business Impact Assessment
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Impact Type</Typography>
                                <Typography>{selectedMilestone.businessImpact.impactType}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Projected Impact</Typography>
                                <Typography>{selectedMilestone.businessImpact.projectedImpact}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Confidence Level</Typography>
                                <Chip 
                                  label={selectedMilestone.businessImpact.confidenceLevel}
                                  size="small"
                                  color={
                                    selectedMilestone.businessImpact.confidenceLevel === 'Very High' ? 'success' :
                                    selectedMilestone.businessImpact.confidenceLevel === 'High' ? 'info' :
                                    'default'
                                  }
                                />
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            {selectedMilestone.businessImpact.targetValue && (
                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Target Metric</Typography>
                                  <Typography>{selectedMilestone.businessImpact.impactMetric}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Target Value</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMilestone.businessImpact.targetValue}
                                  </Typography>
                                </Box>
                              </Stack>
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">No business impact assessment added</Typography>
                      </Box>
                    )}
                  </TabPanel>
                </DialogContent>
              </Dialog>
            )}

            {/* Create/Edit Milestone Dialog */}
            <Dialog
              open={openDialog}
              onClose={() => {
                setOpenDialog(false);
                setFormErrors({});
              }}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  background: theme.palette.mode === 'dark'
                    ? alpha('#1e293b', 0.95)
                    : alpha('#ffffff', 0.98),
                  backdropFilter: 'blur(20px)'
                }
              }}
            >
              <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <RocketLaunchIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {editingMilestoneId ? 'Edit Milestone' : 'Create New Milestone'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Define your product milestone and track progress
                    </Typography>
                  </Box>
                </Stack>
              </DialogTitle>
              
              <DialogContent sx={{ px: 3 }}>
                <Stack spacing={3}>
                  {/* Basic Information */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Basic Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Milestone Name"
                          value={formData.name}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                          error={!!formErrors.name}
                          helperText={formErrors.name}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={formData.description}
                          onChange={(e) => handleFormChange('description', e.target.value)}
                          multiline
                          rows={3}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={formData.milestoneType}
                            onChange={(e) => handleFormChange('milestoneType', e.target.value)}
                            label="Type"
                          >
                            <MenuItem value="Feature">Feature</MenuItem>
                            <MenuItem value="Bug Fix">Bug Fix</MenuItem>
                            <MenuItem value="Performance Improvement">Performance Improvement</MenuItem>
                            <MenuItem value="UX Enhancement">UX Enhancement</MenuItem>
                            <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                            <MenuItem value="Security">Security</MenuItem>
                            <MenuItem value="Compliance">Compliance</MenuItem>
                            <MenuItem value="Research">Research</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={formData.priority}
                            onChange={(e) => handleFormChange('priority', e.target.value)}
                            label="Priority"
                          >
                            <MenuItem value="Critical">Critical</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={formData.status}
                            onChange={(e) => handleFormChange('status', e.target.value)}
                            label="Status"
                          >
                            <MenuItem value="Planning">Planning</MenuItem>
                            <MenuItem value="In Development">In Development</MenuItem>
                            <MenuItem value="Testing">Testing</MenuItem>
                            <MenuItem value="Deploying">Deploying</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="On Hold">On Hold</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Timeline */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Timeline
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <DatePicker
                          label="Planned Start Date"
                          value={formData.plannedStartDate}
                          onChange={(date) => handleFormChange('plannedStartDate', date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!formErrors.plannedStartDate,
                              helperText: formErrors.plannedStartDate,
                              required: true
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <DatePicker
                          label="Planned End Date"
                          value={formData.plannedEndDate}
                          onChange={(date) => handleFormChange('plannedEndDate', date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!formErrors.plannedEndDate,
                              helperText: formErrors.plannedEndDate,
                              required: true
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Quarter"
                          value={formData.quarter}
                          onChange={(e) => handleFormChange('quarter', e.target.value)}
                          placeholder="2025-Q2"
                          helperText="Format: YYYY-QN"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Completion %"
                          type="number"
                          value={formData.completionPercentage}
                          onChange={(e) => handleFormChange('completionPercentage', parseInt(e.target.value) || 0)}
                          InputProps={{
                            inputProps: { min: 0, max: 100 }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Team Assignment */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Team Assignment
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          options={availableTeamMembers}
                          getOptionLabel={(option) => option.name || ''}
                          value={formData.productOwner}
                          onChange={(e, value) => handleFormChange('productOwner', value)}
                          renderInput={(params) => (
                            <TextField {...params} label="Product Owner" />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          multiple
                          options={availableTeamMembers}
                          getOptionLabel={(option) => option.name || ''}
                          value={formData.teamMembers}
                          onChange={(e, value) => handleFormChange('teamMembers', value)}
                          renderInput={(params) => (
                            <TextField {...params} label="Team Members" />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Business Impact */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Business Impact
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Impact Type</InputLabel>
                          <Select
                            value={formData.businessImpact.impactType}
                            onChange={(e) => handleFormChange('businessImpact.impactType', e.target.value)}
                            label="Impact Type"
                          >
                            <MenuItem value="User Growth">User Growth</MenuItem>
                            <MenuItem value="Revenue Increase">Revenue Increase</MenuItem>
                            <MenuItem value="Cost Reduction">Cost Reduction</MenuItem>
                            <MenuItem value="User Retention">User Retention</MenuItem>
                            <MenuItem value="Conversion Rate">Conversion Rate</MenuItem>
                            <MenuItem value="Customer Satisfaction">Customer Satisfaction</MenuItem>
                            <MenuItem value="Technical Debt">Technical Debt</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Confidence Level</InputLabel>
                          <Select
                            value={formData.businessImpact.confidenceLevel}
                            onChange={(e) => handleFormChange('businessImpact.confidenceLevel', e.target.value)}
                            label="Confidence Level"
                          >
                            <MenuItem value="Very High">Very High</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Very Low">Very Low</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Projected Impact"
                          value={formData.businessImpact.projectedImpact}
                          onChange={(e) => handleFormChange('businessImpact.projectedImpact', e.target.value)}
                          multiline
                          rows={2}
                          placeholder="Describe the expected impact..."
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Investor Visibility */}
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Investor Settings
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.visibleToInvestors}
                            onChange={(e) => handleFormChange('visibleToInvestors', e.target.checked)}
                          />
                        }
                        label="Visible to investors"
                      />
                      {formData.visibleToInvestors && (
                        <TextField
                          fullWidth
                          label="Investor Summary"
                          value={formData.investorSummary}
                          onChange={(e) => handleFormChange('investorSummary', e.target.value)}
                          multiline
                          rows={3}
                          placeholder="Brief summary for investor presentations..."
                        />
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              </DialogContent>
              
              <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                <Button onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                >
                  {editingMilestoneId ? 'Update Milestone' : 'Create Milestone'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Add Task Dialog */}
            <Dialog
              open={openTaskDialog}
              onClose={() => setOpenTaskDialog(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  background: theme.palette.mode === 'dark'
                    ? alpha('#1e293b', 0.95)
                    : alpha('#ffffff', 0.98),
                }
              }}
            >
              <DialogTitle>Add Task</DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Task Name"
                    value={taskFormData.taskName}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, taskName: e.target.value }))}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={taskFormData.description}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                    multiline
                    rows={2}
                  />
                  <Autocomplete
                    options={availableTeamMembers}
                    getOptionLabel={(option) => option.name || ''}
                    value={taskFormData.assignee}
                    onChange={(e, value) => setTaskFormData(prev => ({ ...prev, assignee: value }))}
                    renderInput={(params) => (
                      <TextField {...params} label="Assignee" />
                    )}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={taskFormData.priority}
                          onChange={(e) => setTaskFormData(prev => ({ ...prev, priority: e.target.value }))}
                          label="Priority"
                        >
                          <MenuItem value="Critical">Critical</MenuItem>
                          <MenuItem value="High">High</MenuItem>
                          <MenuItem value="Medium">Medium</MenuItem>
                          <MenuItem value="Low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Due Date"
                        value={taskFormData.dueDate}
                        onChange={(date) => setTaskFormData(prev => ({ ...prev, dueDate: date }))}
                        slotProps={{
                          textField: { fullWidth: true }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={handleAddTask}
                  disabled={isSubmitting}
                >
                  Add Task
                </Button>
              </DialogActions>
            </Dialog>

            {/* Action Menu */}
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => {
                setMenuAnchor(null);
                setSelectedMilestoneForMenu(null);
              }}
            >
              <MenuItem onClick={() => handleEdit(selectedMilestoneForMenu)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
              <MenuItem onClick={() => handleDelete(selectedMilestoneForMenu._id)}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
              </MenuItem>
            </Menu>
          </Container>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ProductMilestonesPage;