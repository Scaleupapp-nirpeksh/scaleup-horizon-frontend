// src/pages/InvestorMeetingsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Card, CardContent, Stack,
  Button, IconButton, Avatar, Chip, Divider, Tooltip, Badge, useTheme,
  alpha, Fade, Grow, Skeleton, LinearProgress, TextField, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, FormHelperText, Tab, Tabs, Autocomplete, InputAdornment, ListItem,
  ListItemAvatar, ListItemText, List, CircularProgress, Alert, AlertTitle, 
  Checkbox, FormGroup, FormControlLabel, Zoom, Slide
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';

// Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import GroupIcon from '@mui/icons-material/Group';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LinkIcon from '@mui/icons-material/Link';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import MailIcon from '@mui/icons-material/Mail';
import CategoryIcon from '@mui/icons-material/Category';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import NotesIcon from '@mui/icons-material/Notes';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import ArticleIcon from '@mui/icons-material/Article';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';

// API
import {
  getInvestorMeetings,
  getInvestorMeetingById,
  createInvestorMeeting,
  updateInvestorMeeting,
  deleteInvestorMeeting,
  addMeetingTalkingPoint,
  addMeetingActionItem,
  updateMeetingActionItem,
  getInvestorMeetingStatistics,
  getInvestors as getAvailableInvestorsFromAPI,
  getHeadcounts as getAvailableTeamMembersFromAPI,
  prepareInvestorMeeting,
  completeInvestorMeeting,
  addMeetingFeedback,
} from '../services/api';

// Magical Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(-5deg); }
  66% { transform: translateY(10px) rotate(5deg); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
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

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
    left: '10%',
    width: '300px',
    height: '300px',
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.2)} 0%, transparent 70%)`,
    filter: 'blur(40px)',
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

const MagicalMeetingCard = styled(Card)(({ theme, status, selected }) => {
  let statusColor;
  const lowerStatus = status?.toLowerCase();
  switch (lowerStatus) {
    case 'scheduled':
    case 'preparation':
      statusColor = theme.palette.warning.main;
      break;
    case 'completed':
      statusColor = theme.palette.success.main;
      break;
    case 'cancelled':
      statusColor = theme.palette.error.main;
      break;
    case 'rescheduled':
      statusColor = theme.palette.info.main;
      break;
    default:
      statusColor = theme.palette.grey[500];
  }

  return {
    borderRadius: theme.spacing(2.5),
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha('#1e293b', 0.9)} 0%, ${alpha('#334155', 0.9)} 100%)`
      : `linear-gradient(135deg, ${alpha('#ffffff', 0.95)} 0%, ${alpha('#f8fafc', 0.95)} 100%)`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${selected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
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
      '& .meeting-title': {
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

const MagicalDetailCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha('#1e293b', 0.9)} 0%, ${alpha('#334155', 0.9)} 100%)`
    : `linear-gradient(135deg, ${alpha('#ffffff', 0.98)} 0%, ${alpha('#f8fafc', 0.98)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  padding: theme.spacing(2.5),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const AnimatedTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minHeight: 48,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    '& .MuiSvgIcon-root': {
      transform: 'scale(1.2) rotate(5deg)',
    }
  },
  '&.Mui-selected': {
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    }
  },
  '& .MuiSvgIcon-root': {
    transition: 'all 0.3s ease',
  }
}));

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

const StatusChip = ({ status }) => {
  let color, icon, label;
  const lowerStatus = status?.toLowerCase();
  switch (lowerStatus) {
    case 'scheduled': color = 'warning'; icon = <ScheduleIcon />; label = 'Scheduled'; break;
    case 'preparation': color = 'info'; icon = <PendingIcon />; label = 'Preparation'; break;
    case 'completed': color = 'success'; icon = <CheckCircleIcon />; label = 'Completed'; break;
    case 'cancelled': color = 'error'; icon = <CancelIcon />; label = 'Cancelled'; break;
    case 'rescheduled': color = 'secondary'; icon = <EventNoteIcon />; label = 'Rescheduled'; break;
    default: color = 'default'; icon = <HourglassEmptyIcon />; label = status || 'Unknown';
  }
  
  return (
    <Chip 
      icon={icon} 
      label={label} 
      color={color} 
      size="small" 
      sx={{ 
        fontWeight: 600,
        '& .MuiChip-icon': {
          animation: lowerStatus === 'scheduled' ? `${pulse} 2s ease-in-out infinite` : 'none'
        }
      }} 
    />
  );
};

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

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`meeting-tabpanel-${index}`}
    aria-labelledby={`meeting-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Fade in timeout={500}>
        <Box sx={{ py: 3, px: {xs: 0, sm: 1} }}>{children}</Box>
      </Fade>
    )}
  </div>
);

// Utility Functions
const formatCurrency = (value, locale = 'en-US', currency = 'USD') => {
  if (value == null || isNaN(value)) return '-';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }
  return date.toLocaleDateString('en-US', options);
};

const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

// Initial Data Structures
const initialInvestorData = {
  investorId: null,
  name: '',
  company: '',
  contactName: '',
  contactEmail: '',
  role: '',
  investorType: 'VC',
  investmentStage: 'Seed',
  attended: true,
};

const initialInternalParticipantData = {
  userId: null,
  name: '',
  role: '',
};

const initialFormData = {
  title: '',
  meetingDate: new Date(),
  duration: 60,
  meetingType: 'Regular Update',
  investors: [JSON.parse(JSON.stringify(initialInvestorData))],
  internalParticipants: [JSON.parse(JSON.stringify(initialInternalParticipantData))],
  location: 'Virtual (Zoom)',
  meetingLink: '',
  agenda: '',
  meetingSections: {
    financialSnapshot: true, teamUpdates: true, productMilestones: true, kpis: true,
    userMetrics: true, runwayScenario: true, fundraisingPrediction: true,
    budgetSummary: true, talkingPoints: true, suggestedDocuments: true
  }
};

const initialSectionsForPrep = {
  financialSnapshot: true, teamUpdates: true, productMilestones: true, kpis: true,
  userMetrics: true, runwayScenario: true, fundraisingPrediction: true,
  budgetSummary: true, talkingPoints: true, suggestedDocuments: true
};

// Main Component
const InvestorMeetingsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [metrics, setMetrics] = useState({ 
    totalMeetings: 0, completedMeetings: 0, avgEffectiveness: 0, 
    avgSentiment: 0, upcomingCount: 0, cancelledCount: 0 
  });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPrepareDialog, setOpenPrepareDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(initialFormData)));
  const [formErrors, setFormErrors] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMeetingIdForMenu, setSelectedMeetingIdForMenu] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState(0);
  const [talkingPointForm, setTalkingPointForm] = useState({ 
    title: '', content: '', category: 'Update', priority: 3 
  });
  const [followUpForm, setFollowUpForm] = useState({ 
    action: '', assignee: '', dueDate: null, notes: '', status: 'Not Started' 
  });
  const [availableInvestors, setAvailableInvestors] = useState([]);
  const [availableTeamMembers, setAvailableTeamMembers] = useState([]);
  const [isFetchingDropdownData, setIsFetchingDropdownData] = useState(false);
  const [sectionsToIncludeForPrep, setSectionsToIncludeForPrep] = useState(
    JSON.parse(JSON.stringify(initialSectionsForPrep))
  );

  const fetchDropdownData = useCallback(async () => {
    setIsFetchingDropdownData(true);
    try {
      const [investorsRes, teamRes] = await Promise.all([
        getAvailableInvestorsFromAPI(),
        getAvailableTeamMembersFromAPI()
      ]);
      setAvailableInvestors(investorsRes.data?.data || investorsRes.data || []);
      setAvailableTeamMembers(teamRes.data?.data || teamRes.data || []);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      setError("Could not load selection data for investors/team.");
    } finally {
      setIsFetchingDropdownData(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getInvestorMeetings();
      const fetchedMeetingsArray = response.data?.data || response.data || [];
      setMeetings(fetchedMeetingsArray);
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        upcomingCount: fetchedMeetingsArray.filter(m => 
          m.status === 'Scheduled' || m.status === 'Preparation'
        ).length,
        cancelledCount: fetchedMeetingsArray.filter(m => 
          m.status === 'Cancelled'
        ).length,
      }));
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(`Failed to load meetings: ${err.response?.data?.msg || err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeetingStatistics = useCallback(async () => {
    try {
      const response = await getInvestorMeetingStatistics();
      if (response.data && response.data.success && response.data.data.meetingStats) {
        const stats = response.data.data.meetingStats;
        setMetrics(prevMetrics => ({
          ...prevMetrics,
          totalMeetings: stats.totalMeetings || 0,
          completedMeetings: stats.completedMeetings || 0,
          avgEffectiveness: parseFloat(stats.avgEffectiveness?.toFixed(1)) || 0,
          avgSentiment: parseFloat(stats.avgSentiment?.toFixed(1)) || 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching meeting statistics:', err);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
    fetchMeetingStatistics();
  }, [fetchMeetings, fetchMeetingStatistics]);

  const fetchFullMeetingDetails = useCallback(async (meetingId, forceRefresh = false) => {
    if (!meetingId) return;
    setIsDetailLoading(true);
    try {
      const response = await getInvestorMeetingById(meetingId);
      if (response.data && response.data.success) {
        setSelectedMeeting(response.data.data);
        if (response.data.data.meetingSections) {
          setSectionsToIncludeForPrep(response.data.data.meetingSections);
        } else {
          setSectionsToIncludeForPrep(JSON.parse(JSON.stringify(initialSectionsForPrep)));
        }
      } else {
        setError(response.data?.msg || 'Failed to load full meeting details.');
        setSelectedMeeting(null);
      }
    } catch (err) {
      console.error('Error fetching full meeting details:', err);
      setError(`Failed to load meeting details: ${err.response?.data?.msg || err.message}`);
      setSelectedMeeting(null);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const handleFormChange = (field, value, index, parentField) => {
    setFormData(prev => {
      const newFormData = JSON.parse(JSON.stringify(prev));
      if (parentField && typeof index === 'number') {
        if (!newFormData[parentField]) newFormData[parentField] = [];
        if (!newFormData[parentField][index]) {
          newFormData[parentField][index] = JSON.parse(JSON.stringify(
            parentField === 'investors' ? initialInvestorData : initialInternalParticipantData
          ));
        }
        newFormData[parentField][index][field] = value;
      } else {
        newFormData[field] = value;
      }
      return newFormData;
    });
    const errorKey = parentField ? `${parentField}.${index}.${field}` : field;
    if (formErrors[errorKey]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleInvestorAutocompleteChange = (index, newValue) => {
    setFormData(prev => {
      const newFormData = JSON.parse(JSON.stringify(prev));
      if (newValue && typeof newValue === 'object' && newValue._id) {
        newFormData.investors[index] = {
          investorId: newValue._id, 
          name: newValue.name || '', 
          company: newValue.entityName || newValue.name || '',
          contactName: newValue.contactPerson || '', 
          contactEmail: newValue.email || '',
          role: newValue.role || '', 
          investorType: newValue.investorType || 'VC',
          investmentStage: newValue.investmentStage || 'Seed', 
          attended: prev.investors[index]?.attended ?? true,
        };
      } else if (typeof newValue === 'string') {
        newFormData.investors[index] = { 
          ...initialInvestorData, 
          name: newValue, 
          attended: prev.investors[index]?.attended ?? true 
        };
      } else {
        newFormData.investors[index] = JSON.parse(JSON.stringify(initialInvestorData));
      }
      return newFormData;
    });
  };

  const handleInternalParticipantAutocompleteChange = (index, newValue) => {
    setFormData(prev => {
      const newFormData = JSON.parse(JSON.stringify(prev));
      if (newValue && typeof newValue === 'object' && newValue._id) {
        newFormData.internalParticipants[index] = {
          userId: newValue._id, 
          name: newValue.name || '',
          role: newFormData.internalParticipants[index]?.role || newValue.title || '',
        };
      } else if (typeof newValue === 'string') {
        newFormData.internalParticipants[index] = { 
          ...initialInternalParticipantData, 
          name: newValue, 
          role: newFormData.internalParticipants[index]?.role || '' 
        };
      } else {
        newFormData.internalParticipants[index] = JSON.parse(JSON.stringify(initialInternalParticipantData));
      }
      return newFormData;
    });
  };

  const addInvestorToForm = () => {
    setFormData(prev => ({ 
      ...prev, 
      investors: [...prev.investors, JSON.parse(JSON.stringify(initialInvestorData))] 
    }));
  };

  const removeInvestorFromForm = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      investors: prev.investors.filter((_, i) => i !== index) 
    }));
  };

  const addInternalParticipantToForm = () => {
    setFormData(prev => ({ 
      ...prev, 
      internalParticipants: [...prev.internalParticipants, JSON.parse(JSON.stringify(initialInternalParticipantData))] 
    }));
  };

  const removeInternalParticipantFromForm = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      internalParticipants: prev.internalParticipants.filter((_, i) => i !== index) 
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.meetingDate) errors.meetingDate = 'Meeting date is required';
    if (!formData.meetingType) errors.meetingType = 'Meeting type is required';
    formData.investors?.forEach((investor, index) => {
      if (!investor.name?.trim()) {
        errors[`investors.${index}.name`] = `Investor ${index + 1} firm name is required`;
      }
    });
    formData.internalParticipants?.forEach((participant, index) => {
      if (!participant.name?.trim()) {
        errors[`internalParticipants.${index}.name`] = `Participant ${index + 1} name is required`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const meetingPayload = {
      ...formData,
      meetingDate: new Date(formData.meetingDate).toISOString(),
    };

    try {
      if (selectedMeetingIdForMenu) {
        await updateInvestorMeeting(selectedMeetingIdForMenu, meetingPayload);
        setSuccess('Meeting updated successfully!');
      } else {
        await createInvestorMeeting(meetingPayload);
        setSuccess('Meeting created successfully!');
      }
      setOpenDialog(false);
      fetchMeetings();
      fetchMeetingStatistics();
      setFormData(JSON.parse(JSON.stringify(initialFormData)));
      setSelectedMeetingIdForMenu(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving meeting:', err);
      setError(`Failed to save meeting: ${err.response?.data?.msg || err.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMeetingClick = (meeting) => {
    fetchFullMeetingDetails(meeting._id);
    setActiveDetailTab(0);
  };

  const handleEditMeeting = (meetingToEdit) => {
    setSelectedMeetingIdForMenu(meetingToEdit._id);
    const investorsForForm = meetingToEdit.investors?.map(inv => ({
      investorId: inv.investorId || inv._id || null, 
      name: inv.name || '', 
      company: inv.company || '',
      contactName: inv.contactName || '', 
      contactEmail: inv.email || '', 
      role: inv.role || '',
      investorType: inv.investorType || 'VC', 
      investmentStage: inv.investmentStage || 'Seed',
      attended: typeof inv.attended === 'boolean' ? inv.attended : true,
    })) || [JSON.parse(JSON.stringify(initialInvestorData))];

    const internalParticipantsForForm = meetingToEdit.internalParticipants?.map(par => ({
      userId: par.userId || par._id || null, 
      name: par.name || '', 
      role: par.role || '',
    })) || [JSON.parse(JSON.stringify(initialInternalParticipantData))];

    setFormData({
      title: meetingToEdit.title || '',
      meetingDate: meetingToEdit.meetingDate ? new Date(meetingToEdit.meetingDate) : new Date(),
      duration: meetingToEdit.duration || 60,
      meetingType: meetingToEdit.meetingType || 'Regular Update',
      investors: investorsForForm.length > 0 ? investorsForForm : [JSON.parse(JSON.stringify(initialInvestorData))],
      internalParticipants: internalParticipantsForForm.length > 0 ? internalParticipantsForForm : [JSON.parse(JSON.stringify(initialInternalParticipantData))],
      location: meetingToEdit.location || 'Virtual (Zoom)',
      meetingLink: meetingToEdit.meetingLink || '',
      agenda: meetingToEdit.agenda || '',
      meetingSections: meetingToEdit.meetingSections || JSON.parse(JSON.stringify(initialSectionsForPrep))
    });
    setOpenDialog(true);
    setMenuAnchor(null);
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!meetingId) return;
    setIsSubmitting(true);
    try {
      await deleteInvestorMeeting(meetingId);
      setSuccess('Meeting deleted successfully!');
      fetchMeetings();
      fetchMeetingStatistics();
      if (selectedMeeting?._id === meetingId) setSelectedMeeting(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError(`Failed to delete meeting: ${err.response?.data?.msg || err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setMenuAnchor(null);
      setSelectedMeetingIdForMenu(null);
      setIsSubmitting(false);
    }
  };

  const handleAddTalkingPoint = async () => {
    if (!selectedMeeting?._id || !talkingPointForm.title?.trim() || !talkingPointForm.content?.trim()) {
      setError('Title and content are required for talking points.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setIsSubmitting(true);
    try {
      await addMeetingTalkingPoint(selectedMeeting._id, talkingPointForm);
      setSuccess('Talking point added!');
      fetchFullMeetingDetails(selectedMeeting._id, true);
      setTalkingPointForm({ title: '', content: '', category: 'Update', priority: 3 });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding talking point:', err);
      setError(`Failed to add talking point: ${err.response?.data?.msg || err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTalkingPointFormChange = (field, value) => {
    setTalkingPointForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFollowUp = async () => {
    if (!selectedMeeting?._id || !followUpForm.action?.trim()) {
      setError('Action description is required for follow-ups.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { 
        ...followUpForm, 
        dueDate: followUpForm.dueDate ? new Date(followUpForm.dueDate).toISOString() : null 
      };
      await addMeetingActionItem(selectedMeeting._id, payload);
      setSuccess('Follow-up added!');
      fetchFullMeetingDetails(selectedMeeting._id, true);
      setFollowUpForm({ action: '', assignee: '', dueDate: null, notes: '', status: 'Not Started' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding follow-up:', err);
      setError(`Failed to add follow-up: ${err.response?.data?.msg || err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpFormChange = (field, value) => {
    setFollowUpForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateFollowUpStatus = async (followUpId, newStatus, currentNotes) => {
    if (!selectedMeeting?._id || !followUpId) return;
    setIsSubmitting(true);
    try {
      await updateMeetingActionItem(selectedMeeting._id, followUpId, { status: newStatus, notes: currentNotes });
      setSuccess('Follow-up status updated!');
      fetchFullMeetingDetails(selectedMeeting._id, true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating follow-up status:', err);
      setError(`Failed to update follow-up: ${err.response?.data?.msg || err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrepareMeeting = async () => {
    if (!selectedMeeting?._id) return;
    setIsSubmitting(true);
    try {
      const response = await prepareInvestorMeeting(selectedMeeting._id, { 
        sectionsToInclude: sectionsToIncludeForPrep 
      });
      if (response.data && response.data.success) {
        setSelectedMeeting(response.data.data);
        setSuccess('Meeting prepared successfully for investor view!');
        setActiveDetailTab(4);
      } else {
        setError(response.data?.msg || 'Failed to prepare meeting.');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error preparing meeting:', err);
      setError(`Failed to prepare meeting: ${err.response?.data?.msg || err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
      setOpenPrepareDialog(false);
    }
  };

  const handlePrepareSectionsChange = (event) => {
    setSectionsToIncludeForPrep(prev => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (activeTab === 0) return true;
    const lowerStatus = meeting.status?.toLowerCase();
    if (activeTab === 1) return lowerStatus === 'scheduled' || lowerStatus === 'preparation';
    if (activeTab === 2) return lowerStatus === 'completed';
    if (activeTab === 3) return lowerStatus === 'cancelled';
    return true;
  });

  const meetingTypeOptions = [
    'Regular Update', 'Board Meeting', 'Fundraising', 
    'Due Diligence', 'Strategic Discussion', 'Other'
  ];

  const prepSectionsConfig = [
    { key: 'financialSnapshot', label: 'Financial Snapshot', icon: <MonetizationOnIcon /> },
    { key: 'userMetrics', label: 'User Metrics (DAU/MAU)', icon: <AssessmentIcon /> },
    { key: 'teamUpdates', label: 'Team Updates', icon: <GroupIcon /> },
    { key: 'productMilestones', label: 'Product Milestones', icon: <AssignmentIcon /> },
    { key: 'kpis', label: 'Key Custom KPIs', icon: <BarChartIcon /> },
    { key: 'runwayScenario', label: 'Runway Scenario', icon: <AccountTreeIcon /> },
    { key: 'fundraisingPrediction', label: 'Fundraising Prediction', icon: <OnlinePredictionIcon /> },
    { key: 'budgetSummary', label: 'Budget Summary', icon: <MonetizationOnIcon /> },
    { key: 'talkingPoints', label: 'Auto-Talking Points', icon: <FormatListBulletedIcon /> },
    { key: 'suggestedDocuments', label: 'Suggested Documents', icon: <ArticleIcon /> },
  ];

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
                          <PeopleAltIcon sx={{ fontSize: 36 }} />
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
                            Investor Meetings
                          </Typography>
                          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                            Manage relationships, prepare meetings, track follow-ups
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
                          setSelectedMeetingIdForMenu(null); 
                          setFormData(JSON.parse(JSON.stringify(initialFormData))); 
                          setFormErrors({}); 
                          setOpenDialog(true); 
                        }}
                      >
                        New Meeting
                      </FloatingActionButton>
                      <Button 
                        variant="outlined" 
                        startIcon={<DashboardIcon />} 
                        onClick={() => navigate('/investor-dashboard')}
                        sx={{ 
                          borderRadius: 3,
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            background: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        Live Dashboard
                      </Button>
                    </Stack>
                  </Fade>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Grid container spacing={2}>
                  {[
                    { 
                      label: 'Total Meetings', 
                      value: metrics.totalMeetings, 
                      icon: <EventNoteIcon />, 
                      color: 'primary' 
                    },
                    { 
                      label: 'Upcoming', 
                      value: metrics.upcomingCount, 
                      icon: <ScheduleIcon />, 
                      color: 'warning' 
                    },
                    { 
                      label: 'Completed', 
                      value: metrics.completedMeetings, 
                      icon: <CheckCircleIcon />, 
                      color: 'success' 
                    },
                    { 
                      label: 'Avg. Effectiveness', 
                      value: metrics.avgEffectiveness, 
                      icon: <TrendingUpIcon />, 
                      color: 'info',
                      suffix: '/5',
                      decimals: 1
                    },
                    { 
                      label: 'Cancelled', 
                      value: metrics.cancelledCount, 
                      icon: <CancelIcon />, 
                      color: 'error' 
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

            <Grid container spacing={4}>
              {/* Meetings List */}
              <Grid item xs={12} md={5} lg={4}>
                <Card sx={{ 
                  borderRadius: theme.spacing(3), 
                  overflow: 'hidden', 
                  height: '100%', 
                  boxShadow: theme.shadows[8],
                  background: theme.palette.mode === 'dark'
                    ? alpha('#1e293b', 0.9)
                    : alpha('#ffffff', 0.95),
                  backdropFilter: 'blur(20px)'
                }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tabs 
                      value={activeTab} 
                      onChange={(e, newValue) => setActiveTab(newValue)} 
                      variant="scrollable" 
                      scrollButtons="auto" 
                      aria-label="Meeting filter tabs"
                      sx={{
                        '& .MuiTab-root': {
                          minHeight: 56,
                          fontWeight: 600,
                        }
                      }}
                    >
                      <Tab label="All" />
                      <Tab label="Upcoming" />
                      <Tab label="Completed" />
                      <Tab label="Cancelled" />
                    </Tabs>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {filteredMeetings.length} meetings
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Filter">
                        <IconButton 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.grey[500], 0.08),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <FilterAltIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sort">
                        <IconButton 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.grey[500], 0.08),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <SortIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ 
                    height: { xs: 'auto', md: 'calc(100vh - 520px)' }, 
                    overflowY: 'auto', 
                    p: 2,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: alpha(theme.palette.grey[200], 0.5),
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: alpha(theme.palette.primary.main, 0.3),
                      borderRadius: '4px',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.5),
                      }
                    }
                  }}>
                    {loading && meetings.length === 0 ? (
                      <Stack spacing={2}>
                        {[...Array(4)].map((_, i) => (
                          <Skeleton 
                            key={i} 
                            variant="rectangular" 
                            height={140} 
                            sx={{ borderRadius: 2.5 }} 
                          />
                        ))}
                      </Stack>
                    ) : filteredMeetings.length > 0 ? (
                      <Stack spacing={2}>
                        {filteredMeetings.map((meeting, index) => (
                          <Slide 
                            key={meeting._id} 
                            direction="right" 
                            in 
                            timeout={300 + index * 50}
                          >
                            <MagicalMeetingCard 
                              status={meeting.status}
                              selected={selectedMeeting?._id === meeting._id}
                              onClick={() => handleMeetingClick(meeting)}
                            >
                              <CardContent sx={{ p: 2.5 }}>
                                <Stack spacing={1.5}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box sx={{ maxWidth: 'calc(100% - 40px)' }}>
                                      <Typography 
                                        variant="h6" 
                                        className="meeting-title"
                                        sx={{ 
                                          fontWeight: 700, 
                                          mb: 0.5, 
                                          whiteSpace: 'nowrap', 
                                          overflow: 'hidden', 
                                          textOverflow: 'ellipsis',
                                          transition: 'color 0.3s ease'
                                        }}
                                      >
                                        {meeting.title}
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ 
                                          whiteSpace: 'nowrap', 
                                          overflow: 'hidden', 
                                          textOverflow: 'ellipsis' 
                                        }}
                                      >
                                        {meeting.investors?.map(inv => inv.name).join(', ') || 'No Investors'}
                                      </Typography>
                                    </Box>
                                    <IconButton 
                                      size="small" 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setMenuAnchor(e.currentTarget); 
                                        setSelectedMeetingIdForMenu(meeting._id); 
                                      }}
                                      sx={{
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                                        }
                                      }}
                                    >
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                  
                                  <Stack direction="row" spacing={2}>
                                    <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                                      <CalendarMonthIcon fontSize="small" />
                                      <Typography variant="body2">{formatDate(meeting.meetingDate)}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                                      <AccessTimeIcon fontSize="small" />
                                      <Typography variant="body2">{formatTime(meeting.meetingDate)}</Typography>
                                    </Stack>
                                  </Stack>
                                  
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                    <Chip 
                                      label={meeting.meetingType} 
                                      size="small" 
                                      sx={{ 
                                        borderRadius: '8px', 
                                        bgcolor: alpha(theme.palette.grey[500], 0.1), 
                                        color: 'text.primary', 
                                        fontWeight: 600
                                      }}
                                    />
                                    <StatusChip status={meeting.status} />
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </MagicalMeetingCard>
                          </Slide>
                        ))}
                      </Stack>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        py: 8, 
                        textAlign: 'center' 
                      }}>
                        <EventNoteIcon sx={{ 
                          fontSize: 64, 
                          color: alpha(theme.palette.primary.main, 0.2), 
                          mb: 2 
                        }} />
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                          No meetings found for this filter.
                        </Typography>
                        <Button 
                          variant="outlined" 
                          startIcon={<AddIcon />} 
                          onClick={() => { 
                            setSelectedMeetingIdForMenu(null); 
                            setFormData(JSON.parse(JSON.stringify(initialFormData))); 
                            setFormErrors({}); 
                            setOpenDialog(true); 
                          }} 
                          sx={{ borderRadius: 2 }}
                        >
                          Create Meeting
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Grid>

              {/* Meeting Details */}
              <Grid item xs={12} md={7} lg={8}>
                {isDetailLoading ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%' 
                  }}>
                    <CircularProgress size={60} thickness={2} />
                  </Box>
                ) : selectedMeeting ? (
                  <Card sx={{ 
                    borderRadius: theme.spacing(3), 
                    overflow: 'hidden', 
                    height: '100%', 
                    boxShadow: theme.shadows[8],
                    background: theme.palette.mode === 'dark'
                      ? alpha('#1e293b', 0.9)
                      : alpha('#ffffff', 0.95),
                    backdropFilter: 'blur(20px)'
                  }}>
                    <Box sx={{ 
                      p: 3, 
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha('#334155', 0.5)} 0%, ${alpha('#1e293b', 0.5)} 100%)`
                        : `linear-gradient(135deg, ${alpha('#f8fafc', 0.9)} 0%, ${alpha('#ffffff', 0.9)} 100%)`,
                    }}>
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        justifyContent="space-between" 
                        alignItems={{ xs: 'flex-start', sm: 'center' }} 
                        spacing={{ xs: 2, sm: 1 }}
                      >
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {selectedMeeting.title}
                          </Typography>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <StatusChip status={selectedMeeting.status} />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(selectedMeeting.meetingDate)} at {formatTime(selectedMeeting.meetingDate)}
                            </Typography>
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={1} alignSelf={{ xs: 'flex-start', sm: 'center' }}>
                          <Button 
                            variant="contained" 
                            startIcon={<ModelTrainingIcon />} 
                            size="small" 
                            onClick={() => setOpenPrepareDialog(true)} 
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                              }
                            }}
                          >
                            Prepare
                          </Button>
                          <Button 
                            variant="outlined" 
                            startIcon={<EditIcon />} 
                            size="small" 
                            onClick={() => handleEditMeeting(selectedMeeting)}
                          >
                            Edit
                          </Button>
                          {selectedMeeting.meetingLink && (
                            <Button 
                              variant="contained" 
                              startIcon={<VideoCallIcon />} 
                              color="primary" 
                              size="small" 
                              href={selectedMeeting.meetingLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Join
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                    
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 2 } }}>
                      <Tabs 
                        value={activeDetailTab} 
                        onChange={(e, newValue) => setActiveDetailTab(newValue)} 
                        variant="scrollable" 
                        scrollButtons="auto" 
                        aria-label="Meeting details tabs"
                        sx={{
                          '& .MuiTabs-indicator': {
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                          }
                        }}
                      >
                        <AnimatedTab icon={<DescriptionIcon />} label="Details" iconPosition="start" />
                        <AnimatedTab icon={<FormatListBulletedIcon />} label="Talking Points" iconPosition="start" />
                        <AnimatedTab icon={<GroupIcon />} label="Attendees" iconPosition="start" />
                        <AnimatedTab icon={<AssignmentIcon />} label="Follow-ups" iconPosition="start" />
                        <AnimatedTab 
                          icon={<VisibilityIcon />} 
                          label="Prepared View" 
                          iconPosition="start"
                          sx={{
                            '& .MuiTab-iconWrapper': {
                              color: theme.palette.warning.main
                            }
                          }}
                        />
                      </Tabs>
                    </Box>
                    
                    <Box sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      height: { xs: 'auto', md: 'calc(100vh - 500px)' }, 
                      overflowY: 'auto',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: alpha(theme.palette.grey[200], 0.5),
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: alpha(theme.palette.primary.main, 0.3),
                        borderRadius: '4px',
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.5),
                        }
                      }
                    }}>
                      <TabPanel value={activeDetailTab} index={0}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <MagicalDetailCard>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Meeting Information
                              </Typography>
                              <Stack spacing={2}>
                                <Stack direction="row" spacing={1}>
                                  <BusinessCenterIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Type</Typography>
                                    <Typography>{selectedMeeting.meetingType}</Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                  <AccessTimeIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                                    <Typography>{selectedMeeting.duration} minutes</Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                  <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Location</Typography>
                                    <Typography>{selectedMeeting.location}</Typography>
                                  </Box>
                                </Stack>
                                {selectedMeeting.meetingLink && (
                                  <Stack direction="row" spacing={1}>
                                    <VideocamIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">Meeting Link</Typography>
                                      <Link 
                                        href={selectedMeeting.meetingLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                      >
                                        Join Meeting <LinkIcon fontSize="inherit" />
                                      </Link>
                                    </Box>
                                  </Stack>
                                )}
                              </Stack>
                            </MagicalDetailCard>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <MagicalDetailCard>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Preparation Status
                              </Typography>
                              <Stack spacing={1.5}>
                                <Typography variant="body2">
                                  Status:{' '}
                                  <Chip 
                                    label={selectedMeeting.preparation?.status || 'Not Started'} 
                                    size="small" 
                                    color={selectedMeeting.preparation?.status === 'Ready' ? 'success' : 'default'} 
                                  />
                                </Typography>
                                <Typography variant="body2">
                                  Assigned To: {selectedMeeting.preparation?.assignedTo?.name || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                  Data Collection: {selectedMeeting.preparation?.dataCollectionComplete ? 'Complete' : 'Pending'}
                                </Typography>
                                <Typography variant="body2">
                                  Presentation Ready: {selectedMeeting.preparation?.presentationReady ? 'Yes' : 'No'}
                                </Typography>
                                {selectedMeeting.preparation?.preparationNotes && (
                                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    Notes: {selectedMeeting.preparation.preparationNotes}
                                  </Typography>
                                )}
                              </Stack>
                            </MagicalDetailCard>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <MagicalDetailCard>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                                Agenda
                              </Typography>
                              {selectedMeeting.agenda ? (
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                  {selectedMeeting.agenda}
                                </Typography>
                              ) : (
                                <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  No agenda specified.
                                </Typography>
                              )}
                            </MagicalDetailCard>
                          </Grid>
                          
                          {selectedMeeting.notes && (
                            <Grid item xs={12}>
                              <MagicalDetailCard>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                                  Meeting Notes
                                </Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                  {selectedMeeting.notes}
                                </Typography>
                              </MagicalDetailCard>
                            </Grid>
                          )}
                          
                          {selectedMeeting.summary && (
                            <Grid item xs={12}>
                              <MagicalDetailCard>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                                  Meeting Summary
                                </Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                  {selectedMeeting.summary}
                                </Typography>
                              </MagicalDetailCard>
                            </Grid>
                          )}
                        </Grid>
                      </TabPanel>
                      
                      <TabPanel value={activeDetailTab} index={1}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <MagicalDetailCard>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Add Talking Point
                              </Typography>
                              <Stack spacing={2}>
                                <TextField 
                                  label="Title" 
                                  fullWidth 
                                  value={talkingPointForm.title} 
                                  onChange={(e) => handleTalkingPointFormChange('title', e.target.value)} 
                                  error={!talkingPointForm.title && error.includes('Title')} 
                                  helperText={!talkingPointForm.title && error.includes('Title') ? 'Title is required' : ''}
                                />
                                <TextField 
                                  label="Content" 
                                  fullWidth 
                                  multiline 
                                  rows={3} 
                                  value={talkingPointForm.content} 
                                  onChange={(e) => handleTalkingPointFormChange('content', e.target.value)} 
                                  placeholder="Use new lines for bullets." 
                                  error={!talkingPointForm.content && error.includes('Content')} 
                                  helperText={!talkingPointForm.content && error.includes('Content') ? 'Content is required' : ''}
                                />
                                <FormControl fullWidth>
                                  <InputLabel>Category</InputLabel>
                                  <Select 
                                    value={talkingPointForm.category} 
                                    label="Category" 
                                    onChange={(e) => handleTalkingPointFormChange('category', e.target.value)}
                                  >
                                    <MenuItem value="Win">Win</MenuItem>
                                    <MenuItem value="Challenge">Challenge</MenuItem>
                                    <MenuItem value="Request">Request</MenuItem>
                                    <MenuItem value="Update">Update</MenuItem>
                                    <MenuItem value="Question">Question</MenuItem>
                                    <MenuItem value="Strategic">Strategic</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                  </Select>
                                </FormControl>
                                <Button 
                                  variant="contained" 
                                  startIcon={<AddIcon />} 
                                  onClick={handleAddTalkingPoint} 
                                  disabled={isSubmitting || !talkingPointForm.title || !talkingPointForm.content}
                                >
                                  Add Talking Point
                                </Button>
                              </Stack>
                            </MagicalDetailCard>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <MagicalDetailCard sx={{ maxHeight: 500, overflowY: 'auto' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Talking Points ({selectedMeeting.talkingPoints?.length || 0})
                              </Typography>
                              {selectedMeeting.talkingPoints?.length > 0 ? (
                                <Stack spacing={2.5}>
                                  {selectedMeeting.talkingPoints.map((point, index) => (
                                    <Paper 
                                      key={point._id || index} 
                                      variant="outlined" 
                                      sx={{ 
                                        p: 2, 
                                        borderRadius: 2, 
                                        bgcolor: alpha(theme.palette.background.default, 0.3),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          transform: 'translateY(-2px)',
                                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                                        }
                                      }}
                                    >
                                      <Stack spacing={1}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {point.title}
                                          </Typography>
                                          <Chip 
                                            label={point.category || 'Update'} 
                                            size="small" 
                                            sx={{ borderRadius: '6px' }} 
                                          />
                                        </Stack>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                          {point.content}
                                        </Typography>
                                      </Stack>
                                    </Paper>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                                  No talking points added yet.
                                </Typography>
                              )}
                            </MagicalDetailCard>
                          </Grid>
                        </Grid>
                      </TabPanel>
                      
                      <TabPanel value={activeDetailTab} index={2}>
                        <MagicalDetailCard>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Investors Attending ({selectedMeeting.investors?.length || 0})
                          </Typography>
                          {selectedMeeting.investors?.length > 0 ? (
                            <List dense>
                              {selectedMeeting.investors.map((att, idx) => (
                                <ListItem 
                                  key={`inv-${idx}`} 
                                  secondaryAction={
                                    <Chip 
                                      label={att.attended ? "Attended" : "Did not attend"} 
                                      size="small" 
                                      color={att.attended ? "success" : "default"}
                                    />
                                  }
                                  sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                                    }
                                  }}
                                >
                                  <ListItemAvatar>
                                    <Avatar sx={{ 
                                      bgcolor: theme.palette.primary.light,
                                      background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                                    }}>
                                      {att.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText 
                                    primary={`${att.name} (${att.company || 'N/A'})`} 
                                    secondary={
                                      <>
                                        {att.contactName && `${att.contactName} • `}
                                        {att.email}
                                      </>
                                    } 
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography color="text.secondary">
                              No investors listed for this meeting.
                            </Typography>
                          )}
                          
                          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
                            Internal Participants ({selectedMeeting.internalParticipants?.length || 0})
                          </Typography>
                          {selectedMeeting.internalParticipants?.length > 0 ? (
                            <List dense>
                              {selectedMeeting.internalParticipants.map((att, idx) => (
                                <ListItem 
                                  key={`int-${idx}`}
                                  sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.secondary.main, 0.05)
                                    }
                                  }}
                                >
                                  <ListItemAvatar>
                                    <Avatar sx={{ 
                                      bgcolor: theme.palette.secondary.light,
                                      background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`
                                    }}>
                                      {att.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText primary={att.name} secondary={att.role} />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography color="text.secondary">
                              No internal participants listed.
                            </Typography>
                          )}
                        </MagicalDetailCard>
                      </TabPanel>
                      
                      <TabPanel value={activeDetailTab} index={3}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <MagicalDetailCard>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Add Follow-up Action
                              </Typography>
                              <Stack spacing={2}>
                                <TextField 
                                  label="Action Description" 
                                  fullWidth 
                                  value={followUpForm.action} 
                                  onChange={(e) => handleFollowUpFormChange('action', e.target.value)} 
                                  error={!followUpForm.action && error.includes('Action')} 
                                  helperText={!followUpForm.action && error.includes('Action') ? 'Action is required' : ''} 
                                />
                                <TextField 
                                  label="Assignee (Name or ID)" 
                                  fullWidth 
                                  value={followUpForm.assignee} 
                                  onChange={(e) => handleFollowUpFormChange('assignee', e.target.value)} 
                                />
                                <DatePicker 
                                  label="Due Date" 
                                  value={followUpForm.dueDate} 
                                  onChange={(newDate) => handleFollowUpFormChange('dueDate', newDate)} 
                                  slotProps={{ 
                                    textField: { 
                                      fullWidth: true, 
                                      helperText: 'Optional' 
                                    } 
                                  }} 
                                />
                                <TextField 
                                  label="Notes" 
                                  fullWidth 
                                  multiline 
                                  rows={2} 
                                  value={followUpForm.notes} 
                                  onChange={(e) => handleFollowUpFormChange('notes', e.target.value)} 
                                />
                                <Button 
                                  variant="contained" 
                                  startIcon={<AddIcon />} 
                                  onClick={handleAddFollowUp} 
                                  disabled={isSubmitting || !followUpForm.action}
                                >
                                  Add Follow-up
                                </Button>
                              </Stack>
                            </MagicalDetailCard>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <MagicalDetailCard sx={{ maxHeight: 500, overflowY: 'auto' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Follow-up Actions ({selectedMeeting.actionItems?.length || 0})
                              </Typography>
                              {selectedMeeting.actionItems?.length > 0 ? (
                                <Stack spacing={2.5}>
                                  {selectedMeeting.actionItems.map((item, index) => (
                                    <Paper 
                                      key={item._id || index} 
                                      variant="outlined" 
                                      sx={{ 
                                        p: 2, 
                                        borderRadius: 2,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          transform: 'translateY(-2px)',
                                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                                        }
                                      }}
                                    >
                                      <Stack spacing={1}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                          {item.action}
                                        </Typography>
                                        {item.assigneeName && (
                                          <Typography variant="body2" color="text.secondary">
                                            Assignee: {item.assigneeName}
                                          </Typography>
                                        )}
                                        {item.assignee && !item.assigneeName && (
                                          <Typography variant="body2" color="text.secondary">
                                            Assignee ID: {item.assignee}
                                          </Typography>
                                        )}
                                        {item.dueDate && (
                                          <Typography variant="body2" color="text.secondary">
                                            Due: {formatDate(item.dueDate)}
                                          </Typography>
                                        )}
                                        {item.notes && (
                                          <Typography variant="body2" sx={{ fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                                            {item.notes}
                                          </Typography>
                                        )}
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                          <Select 
                                            value={item.status || 'Not Started'} 
                                            size="small" 
                                            onChange={(e) => handleUpdateFollowUpStatus(item._id, e.target.value, item.notes)}
                                            sx={{ 
                                              fontWeight: 500, 
                                              borderRadius: '8px', 
                                              '.MuiSelect-select': { py: 0.8, px: 1.5 }, 
                                              '.MuiOutlinedInput-notchedOutline': { 
                                                borderColor: alpha(theme.palette.divider, 0.7) 
                                              }
                                            }}
                                          >
                                            <MenuItem value="Not Started">Not Started</MenuItem>
                                            <MenuItem value="In Progress">In Progress</MenuItem>
                                            <MenuItem value="Completed">Completed</MenuItem>
                                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                                          </Select>
                                        </Stack>
                                      </Stack>
                                    </Paper>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                                  No follow-up actions added yet.
                                </Typography>
                              )}
                            </MagicalDetailCard>
                          </Grid>
                        </Grid>
                      </TabPanel>
                      
                      <TabPanel value={activeDetailTab} index={4}>
                        <Stack spacing={3}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            mb: 2
                          }}>
                            <Avatar sx={{ 
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.main
                            }}>
                              <AutoAwesomeIcon />
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                              Investor Prepared View
                            </Typography>
                          </Box>
                          
                          {!selectedMeeting.financialSnapshot && 
                           !selectedMeeting.userMetricsSnapshot && 
                           !selectedMeeting.teamUpdates && 
                           !selectedMeeting.highlightedMilestones?.length && 
                           !selectedMeeting.highlightedKpis?.length ? (
                            <Alert 
                              severity="info" 
                              sx={{ 
                                mb: 2,
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                  color: theme.palette.info.main
                                }
                              }}
                            >
                              This meeting has not been "prepared" yet, or no sections were selected. 
                              Click "Prepare" to generate the curated data.
                            </Alert>
                          ) : null}

                          {selectedMeeting.meetingSections?.financialSnapshot && selectedMeeting.financialSnapshot && (
                            <MagicalDetailCard>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <MonetizationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Financial Snapshot
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Cash Balance:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatCurrency(selectedMeeting.financialSnapshot.cashBalance)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Monthly Burn:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatCurrency(selectedMeeting.financialSnapshot.monthlyBurn)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Runway:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.financialSnapshot.runway?.toFixed(1) || 'N/A'} months
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">MRR:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatCurrency(selectedMeeting.financialSnapshot.mrr)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">ARR:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatCurrency(selectedMeeting.financialSnapshot.arr)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Total Raised:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatCurrency(selectedMeeting.financialSnapshot.totalFundsRaised)}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </MagicalDetailCard>
                          )}
                          
                          {selectedMeeting.meetingSections?.userMetrics && selectedMeeting.userMetricsSnapshot && (
                            <MagicalDetailCard>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <AssessmentIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                User Metrics (as of {formatDate(selectedMeeting.userMetricsSnapshot.snapshotDate)})
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="text.secondary">DAU:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.userMetricsSnapshot.dau?.toLocaleString() || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="text.secondary">MAU:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.userMetricsSnapshot.mau?.toLocaleString() || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="text.secondary">DAU/MAU Ratio:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.userMetricsSnapshot.dauMauRatio || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="text.secondary">Total Users:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.userMetricsSnapshot.totalRegisteredUsers?.toLocaleString() || 'N/A'}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </MagicalDetailCard>
                          )}
                          
                          {selectedMeeting.meetingSections?.teamUpdates && selectedMeeting.teamUpdates && (
                            <MagicalDetailCard>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <GroupIcon sx={{ mr: 1, color: 'info.main' }} />
                                Team Updates
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Current Headcount:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.teamUpdates.currentHeadcount}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">New Hires (since last):</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.teamUpdates.newHires?.length || 0}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Open Positions:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.teamUpdates.openPositions}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </MagicalDetailCard>
                          )}
                          
                          {selectedMeeting.meetingSections?.productMilestones && selectedMeeting.highlightedMilestones?.length > 0 && (
                            <MagicalDetailCard>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <AssignmentIcon sx={{ mr: 1, color: 'success.main' }} />
                                Product Milestones
                              </Typography>
                              <Stack spacing={2}>
                                {selectedMeeting.highlightedMilestones.map(m => (
                                  <Box 
                                    key={m.milestoneId} 
                                    sx={{ 
                                      p: 2, 
                                      borderRadius: 2, 
                                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.1)}`
                                      }
                                    }}
                                  >
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {m.milestoneName}{' '}
                                      <Chip 
                                        label={m.status} 
                                        size="small" 
                                        color={m.status === 'Completed' ? 'success' : 'info'} 
                                        sx={{ ml: 1 }}
                                      />
                                    </Typography>
                                    {m.investorSummary && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        {m.investorSummary}
                                      </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      Due: {formatDate(m.plannedEndDate)} | Progress: {m.completionPercentage}%
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            </MagicalDetailCard>
                          )}
                          
                          {selectedMeeting.meetingSections?.kpis && selectedMeeting.highlightedKpis?.length > 0 && (
                            <MagicalDetailCard>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <BarChartIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                Key KPIs
                              </Typography>
                              <Grid container spacing={2}>
                                {selectedMeeting.highlightedKpis.map(kpi => (
                                  <Grid item xs={12} sm={6} md={4} key={kpi.kpiId}>
                                    <Typography variant="body2" color="text.secondary">{kpi.kpiName}:</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {kpi.formattedValue || kpi.value || 'N/A'}
                                      {kpi.trend !== null && kpi.trend !== undefined && (
                                        <Tooltip title={`Trend: ${kpi.trend.toFixed(1)}%`}>
                                          <IconButton 
                                            size="small" 
                                            sx={{ 
                                              ml: 0.5, 
                                              color: kpi.trend > 0 ? 'success.main' : kpi.trend < 0 ? 'error.main' : 'text.disabled' 
                                            }}
                                          >
                                            {kpi.trend > 0 ? <ArrowUpwardIcon fontSize="inherit" /> : 
                                             kpi.trend < 0 ? <ArrowDownwardIcon fontSize="inherit" /> : 
                                             <FiberManualRecordIcon fontSize="inherit" sx={{ opacity: 0.5 }} />}
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Typography>
                                  </Grid>
                                ))}
                              </Grid>
                            </MagicalDetailCard>
                          )}
                          
                          {selectedMeeting.meetingSections?.runwayScenario && selectedMeeting.linkedRunwayScenario && (
                            <MagicalDetailCard>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccountTreeIcon sx={{ mr: 1, color: 'warning.main' }} />
                                Runway Scenario: {selectedMeeting.linkedRunwayScenario.name}
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Total Runway:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.linkedRunwayScenario.totalRunwayMonths?.toFixed(1) || 'N/A'} months
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Cash Out Date:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatDate(selectedMeeting.linkedRunwayScenario.cashOutDate) || 'N/A'}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </MagicalDetailCard>
                          )}
                          
                          {selectedMeeting.meetingSections?.fundraisingPrediction && selectedMeeting.linkedFundraisingPrediction && (
                            <MagicalDetailCard>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <OnlinePredictionIcon sx={{ mr: 1, color: 'info.dark' }} />
                                Fundraising: {selectedMeeting.linkedFundraisingPrediction.name}
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Target Round:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatCurrency(selectedMeeting.linkedFundraisingPrediction.targetRoundSize)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Predicted Close:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatDate(selectedMeeting.linkedFundraisingPrediction.predictedCloseDate) || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Probability:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {(selectedMeeting.linkedFundraisingPrediction.overallProbability * 100).toFixed(0) || 'N/A'}%
                                  </Typography>
                                </Grid>
                              </Grid>
                            </MagicalDetailCard>
                          )}
                          
                          {selectedMeeting.meetingSections?.budgetSummary && selectedMeeting.budgetSummary && (
                            <MagicalDetailCard>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <MonetizationOnIcon sx={{ mr: 1, color: 'primary.dark' }} />
                                Budget: {selectedMeeting.budgetSummary.budgetName}
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="text.secondary">Total Budgeted:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatCurrency(selectedMeeting.budgetSummary.totalBudgeted)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="text.secondary">Total Actual:</Typography>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {formatCurrency(selectedMeeting.budgetSummary.totalActualSpent)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2" color="text.secondary">Variance:</Typography>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      color: selectedMeeting.budgetSummary.totalVariance >= 0 ? 'success.main' : 'error.main' 
                                    }}
                                  >
                                    {formatCurrency(selectedMeeting.budgetSummary.totalVariance)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Typography variant="body2" color="text.secondary">Period:</Typography>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {selectedMeeting.budgetSummary.period}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </MagicalDetailCard>
                          )}
                          
                          {selectedMeeting.meetingSections?.suggestedDocuments && selectedMeeting.suggestedDocuments?.length > 0 && (
                            <MagicalDetailCard>
                              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <ArticleIcon sx={{ mr: 1, color: 'grey.700' }} />
                                Key Documents
                              </Typography>
                              <List dense>
                                {selectedMeeting.suggestedDocuments.map(doc => (
                                  <ListItem 
                                    key={doc.documentId} 
                                    secondaryAction={
                                      <Chip label={doc.category} size="small" />
                                    }
                                    sx={{
                                      borderRadius: 2,
                                      mb: 1,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                                      }
                                    }}
                                  >
                                    <ListItemAvatar>
                                      <Avatar sx={{ bgcolor: alpha(theme.palette.grey[700], 0.1) }}>
                                        <DescriptionIcon />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={doc.fileName} secondary={doc.reason} />
                                  </ListItem>
                                ))}
                              </List>
                            </MagicalDetailCard>
                          )}
                        </Stack>
                      </TabPanel>
                    </Box>
                  </Card>
                ) : (
                  <Card sx={{ 
                    borderRadius: theme.spacing(3), 
                    overflow: 'hidden', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    p: 4, 
                    boxShadow: theme.shadows[8],
                    background: theme.palette.mode === 'dark'
                      ? alpha('#1e293b', 0.9)
                      : alpha('#ffffff', 0.95),
                    backdropFilter: 'blur(20px)'
                  }}>
                    <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
                      <EventNoteIcon sx={{ 
                        fontSize: 80, 
                        color: alpha(theme.palette.primary.main, 0.15), 
                        mb: 2,
                        animation: `${pulse} 3s ease-in-out infinite`
                      }} />
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        No Meeting Selected
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Select a meeting from the list to view its details, or create a new one.
                      </Typography>
                      <FloatingActionButton 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => { 
                          setSelectedMeetingIdForMenu(null); 
                          setFormData(JSON.parse(JSON.stringify(initialFormData))); 
                          setFormErrors({}); 
                          setOpenDialog(true); 
                        }}
                      >
                        Create New Meeting
                      </FloatingActionButton>
                    </Box>
                  </Card>
                )}
              </Grid>
            </Grid>
          </Container>

          {/* Create/Edit Meeting Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => { setOpenDialog(false); setFormErrors({}); }} 
            PaperProps={{ 
              sx: { 
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                  ? alpha('#1e293b', 0.95)
                  : alpha('#ffffff', 0.98),
                backdropFilter: 'blur(20px)'
              } 
            }} 
            maxWidth="md" 
            fullWidth
          >
            <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.4rem' }}>
              {selectedMeetingIdForMenu ? 'Edit Meeting' : 'Create New Meeting'}
            </DialogTitle>
            <DialogContent sx={{ pb: 2, '& .MuiGrid-item': { pt: '12px !important' } }}>
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12} md={8}>
                  <TextField 
                    label="Meeting Title" 
                    fullWidth 
                    value={formData.title} 
                    onChange={(e) => handleFormChange('title', e.target.value)} 
                    error={!!formErrors.title} 
                    helperText={formErrors.title} 
                    size="small" 
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!formErrors.meetingType} size="small">
                    <InputLabel>Meeting Type</InputLabel>
                    <Select 
                      value={formData.meetingType} 
                      label="Meeting Type" 
                      onChange={(e) => handleFormChange('meetingType', e.target.value)}
                    >
                      {meetingTypeOptions.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formErrors.meetingType}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker 
                    label="Meeting Date & Time" 
                    value={formData.meetingDate ? new Date(formData.meetingDate) : null} 
                    onChange={(newDate) => handleFormChange('meetingDate', newDate)} 
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        error: !!formErrors.meetingDate, 
                        helperText: formErrors.meetingDate, 
                        size: 'small' 
                      }
                    }} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Duration (minutes)" 
                    fullWidth 
                    type="number" 
                    value={formData.duration} 
                    onChange={(e) => handleFormChange('duration', parseInt(e.target.value))} 
                    InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }} 
                    size="small" 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Location (e.g., Office, Zoom)" 
                    fullWidth 
                    value={formData.location} 
                    onChange={(e) => handleFormChange('location', e.target.value)} 
                    size="small" 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Meeting Link (if virtual)" 
                    fullWidth 
                    value={formData.meetingLink} 
                    onChange={(e) => handleFormChange('meetingLink', e.target.value)} 
                    size="small" 
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip icon={<PeopleAltIcon />} label="Investors" size="small" />
                  </Divider>
                </Grid>
                
                {formData.investors?.map((investor, index) => (
                  <Grid item xs={12} container spacing={2} key={`investor-form-group-${index}`} alignItems="flex-start" sx={{ mb: 1 }}>
                    <Grid item xs={12}>
                      <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: -0.5, mt: index > 0 ? 1 : 0 }}>
                        Investor {index + 1}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={5}>
                      <Autocomplete 
                        fullWidth 
                        options={availableInvestors} 
                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        value={availableInvestors.find(opt => opt._id === investor.investorId) || investor.name || null}
                        onChange={(event, newValue) => handleInvestorAutocompleteChange(index, newValue)}
                        onInputChange={(event, newInputValue, reason) => { 
                          if (reason === 'input' && !availableInvestors.find(opt => opt.name === newInputValue)) { 
                            handleInvestorAutocompleteChange(index, newInputValue); 
                          }
                        }}
                        loading={isFetchingDropdownData} 
                        loadingText="Loading investors..." 
                        freeSolo 
                        size="small"
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Firm Name" 
                            error={!!formErrors[`investors.${index}.name`]} 
                            helperText={formErrors[`investors.${index}.name`]} 
                            InputProps={{ 
                              ...params.InputProps, 
                              endAdornment: (
                                <>
                                  {isFetchingDropdownData ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              )
                            }} 
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField 
                        label="Contact Name" 
                        fullWidth 
                        value={investor.contactName} 
                        onChange={(e) => handleFormChange('contactName', e.target.value, index, 'investors')} 
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField 
                        label="Contact Email" 
                        fullWidth 
                        value={investor.contactEmail} 
                        onChange={(e) => handleFormChange('contactEmail', e.target.value, index, 'investors')} 
                        error={!!formErrors[`investors.${index}.contactEmail`]} 
                        helperText={formErrors[`investors.${index}.contactEmail`]} 
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField 
                        label="Role" 
                        fullWidth 
                        value={investor.role} 
                        onChange={(e) => handleFormChange('role', e.target.value, index, 'investors')} 
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField 
                        label="Type (VC, Angel)" 
                        fullWidth 
                        value={investor.investorType} 
                        onChange={(e) => handleFormChange('investorType', e.target.value, index, 'investors')} 
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField 
                        label="Stage (Seed, A)" 
                        fullWidth 
                        value={investor.investmentStage} 
                        onChange={(e) => handleFormChange('investmentStage', e.target.value, index, 'investors')} 
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center', pt: '8px !important' }}>
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            checked={investor.attended} 
                            onChange={(e) => handleFormChange('attended', e.target.checked, index, 'investors')} 
                            size="small"
                          />
                        } 
                        label="Attended" 
                        sx={{ mt: { xs: 0, sm: '2px' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-end', md: 'center' }, pt: '8px !important' }}>
                      {formData.investors.length > 1 && (
                        <IconButton onClick={() => removeInvestorFromForm(index)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <Button 
                    onClick={addInvestorToForm} 
                    startIcon={<AddIcon />} 
                    size="small" 
                    variant="outlined" 
                    sx={{ mt: -1 }}
                  >
                    Add Investor
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip icon={<SupervisorAccountIcon />} label="Internal Team Participants" size="small" />
                  </Divider>
                </Grid>
                
                {formData.internalParticipants?.map((participant, index) => (
                  <Grid item xs={12} container spacing={2} key={`internal-participant-form-group-${index}`} alignItems="flex-start">
                    <Grid item xs={12}>
                      <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: -0.5, mt: index > 0 ? 1 : 0 }}>
                        Team Member {index + 1}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={7} md={7}>
                      <Autocomplete 
                        fullWidth 
                        options={availableTeamMembers} 
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.name || ''}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        value={availableTeamMembers.find(opt => opt._id === participant.userId) || participant.name || null}
                        onChange={(event, newValue) => handleInternalParticipantAutocompleteChange(index, newValue)}
                        onInputChange={(event, newInputValue, reason) => { 
                          if (reason === 'input' && !availableTeamMembers.find(opt => opt.name === newInputValue)) { 
                            handleInternalParticipantAutocompleteChange(index, newInputValue); 
                          }
                        }}
                        loading={isFetchingDropdownData} 
                        loadingText="Loading team..." 
                        freeSolo 
                        size="small"
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Team Member Name" 
                            error={!!formErrors[`internalParticipants.${index}.name`]} 
                            helperText={formErrors[`internalParticipants.${index}.name`]} 
                            InputProps={{ 
                              ...params.InputProps, 
                              endAdornment: (
                                <>
                                  {isFetchingDropdownData ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              )
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={formData.internalParticipants.length > 1 ? 4 : 5} md={formData.internalParticipants.length > 1 ? 4 : 5}>
                      <TextField 
                        label="Role in Meeting" 
                        fullWidth 
                        value={participant.role} 
                        onChange={(e) => handleFormChange('role', e.target.value, index, 'internalParticipants')} 
                        size="small"
                      />
                    </Grid>
                    {formData.internalParticipants.length > 1 && (
                      <Grid item xs={12} sm={1} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton onClick={() => removeInternalParticipantFromForm(index)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <Button 
                    onClick={addInternalParticipantToForm} 
                    startIcon={<AddIcon />} 
                    size="small" 
                    variant="outlined" 
                    sx={{ mt: -1 }}
                  >
                    Add Team Member
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Agenda" size="small" />
                  </Divider>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField 
                    label="Meeting Agenda" 
                    fullWidth 
                    multiline 
                    rows={4} 
                    value={formData.agenda} 
                    onChange={(e) => handleFormChange('agenda', e.target.value)} 
                    placeholder="Enter key topics and discussion points..." 
                    size="small"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
              <Button onClick={() => { setOpenDialog(false); setFormErrors({}); }}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit} 
                disabled={isSubmitting || isFetchingDropdownData}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  }
                }}
              >
                {(isSubmitting || isFetchingDropdownData) ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  selectedMeetingIdForMenu ? 'Update Meeting' : 'Create Meeting'
                )}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Prepare Meeting Dialog */}
          <Dialog 
            open={openPrepareDialog} 
            onClose={() => setOpenPrepareDialog(false)} 
            PaperProps={{ 
              sx: { 
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                  ? alpha('#1e293b', 0.95)
                  : alpha('#ffffff', 0.98),
                backdropFilter: 'blur(20px)'
              } 
            }} 
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.4rem' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AutoAwesomeIcon sx={{ color: theme.palette.warning.main }} />
                <span>Prepare Meeting for Investor View</span>
              </Stack>
            </DialogTitle>
            <DialogContent sx={{ pb: 2 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Select data sections to include in the prepared view for "{selectedMeeting?.title}":
              </Typography>
              <FormGroup>
                {prepSectionsConfig.map((section, index) => (
                  <Zoom key={section.key} in timeout={300 + index * 50}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={sectionsToIncludeForPrep[section.key] || false}
                          onChange={handlePrepareSectionsChange}
                          name={section.key}
                          sx={{
                            '&.Mui-checked': {
                              color: theme.palette.warning.main
                            }
                          }}
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {section.icon}
                          <Typography>{section.label}</Typography>
                        </Stack>
                      }
                      sx={{
                        mb: 1,
                        '& .MuiFormControlLabel-label': {
                          fontWeight: 500
                        }
                      }}
                    />
                  </Zoom>
                ))}
              </FormGroup>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
              <Button onClick={() => setOpenPrepareDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handlePrepareMeeting} 
                disabled={isSubmitting}
                startIcon={<ModelTrainingIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`,
                  }
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Prepare & View'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Menu for Meeting Actions */}
          <Menu 
            anchorEl={menuAnchor} 
            open={Boolean(menuAnchor)} 
            onClose={() => { setMenuAnchor(null); setSelectedMeetingIdForMenu(null); }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: theme.shadows[8],
                background: theme.palette.mode === 'dark'
                  ? alpha('#1e293b', 0.95)
                  : alpha('#ffffff', 0.98),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }
            }}
          >
            <MenuItem 
              onClick={() => {
                const meeting = meetings.find(m => m._id === selectedMeetingIdForMenu);
                if (meeting) {
                  const meetingDataForEdit = (selectedMeeting && selectedMeeting._id === selectedMeetingIdForMenu) ? selectedMeeting : meeting;
                  handleEditMeeting(meetingDataForEdit);
                }
                setMenuAnchor(null);
              }}
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Edit
            </MenuItem>
            <MenuItem 
              onClick={() => handleDeleteMeeting(selectedMeetingIdForMenu)} 
              sx={{ 
                color: 'error.main',
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Delete
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default InvestorMeetingsPage;