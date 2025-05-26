// src/pages/InvestorMeetingsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Card, CardContent, Stack,
  Button, IconButton, Avatar, Chip, Divider, Tooltip, Badge, useTheme,
  alpha, Fade, Grow, Skeleton, LinearProgress, TextField, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, FormHelperText, Tab, Tabs, Autocomplete, InputAdornment, ListItem,
  ListItemAvatar, ListItemText, List, CircularProgress, Alert, AlertTitle, Checkbox, FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Link from '@mui/material/Link'; // MUI Link

// Icons (ensure all used icons are imported)
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
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; // For internal team


// API
import {
  getInvestorMeetings,
  getInvestorMeetingById,
  createInvestorMeeting,
  updateInvestorMeeting,
  deleteInvestorMeeting,
  createInvestorMeetingTalkingPoint,
  createInvestorMeetingFollowUp,
  updateInvestorMeetingFollowUp,
  getInvestorMeetingMetrics,
  // These should be actual imports from your api.js:
  getInvestors as getAvailableInvestorsFromAPI, // Renamed for clarity
  getHeadcounts as getAvailableTeamMembersFromAPI, // Assuming getHeadcounts is for team members
} from '../services/api';


// Styled Components (HeroSection, MetricCard, MeetingCard, TabPanel - remain the same)
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
    zIndex: -1,
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

const MeetingCard = styled(Card)(({ theme, status }) => {
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
    borderRadius: theme.spacing(2),
    background: alpha(theme.palette.background.paper, 0.85),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8], 
      '&::before': {
        opacity: 0.9,
      }
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '5px',
      height: '100%',
      background: statusColor,
      opacity: 0.6, 
      transition: 'opacity 0.3s ease',
    }
  };
});

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`meeting-tabpanel-${index}`}
    aria-labelledby={`meeting-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const AnimatedNumber = ({ value, duration = 1500, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = parseFloat(value);

  useEffect(() => {
    if (isNaN(targetValue)) {
        setDisplayValue(value); 
        return;
    }
    const startTime = Date.now();
    const startValue = displayValue; 
    const endValue = targetValue;
    let animationFrameId;
    const updateNumber = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      setDisplayValue(currentValue);
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(endValue); 
      }
    };
    animationFrameId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration, displayValue, targetValue]); 

  if (isNaN(targetValue)) return <span>{prefix}{value}{suffix}</span>;

  return (
    <span>
      {prefix}{displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}{suffix}
    </span>
  );
};

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
  return <Chip icon={icon} label={label} color={color} size="small" sx={{ fontWeight: 600 }} />;
};

const initialInvestorData = {
  investorId: null, 
  name: '', // Firm Name from InvestorModel
  company: '', // entityName from InvestorModel or same as name
  contactName: '', // contactPerson from InvestorModel
  contactEmail: '', // email from InvestorModel
  role: '', // role from InvestorModel (if exists, otherwise meeting specific)
  investorType: 'VC', // investorType from InvestorModel (if exists)
  investmentStage: 'Seed', // investmentStage from InvestorModel (if exists)
  attended: true,
};

const initialInternalParticipantData = {
  userId: null, 
  name: '', // name from UserModel/HeadcountModel
  role: '', // Role for this specific meeting (can be prefilled from user's title)
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
};


const InvestorMeetingsPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true); // For main meeting list
  const [meetings, setMeetings] = useState([]);
  const [metrics, setMetrics] = useState({ totalMeetings: 0, completedMeetings: 0, avgEffectiveness: 0, avgSentiment: 0, upcomingCount: 0, cancelledCount: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false); // For loading individual meeting details
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission CUD operations
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(initialFormData)));
  const [formErrors, setFormErrors] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMeetingIdForMenu, setSelectedMeetingIdForMenu] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState(0);
  const [talkingPointForm, setTalkingPointForm] = useState({ title: '', content: '', category: 'Update', priority: 3 });
  const [followUpForm, setFollowUpForm] = useState({ action: '', assignee: '', dueDate: null, notes: '', status: 'Not Started' });

  const [availableInvestors, setAvailableInvestors] = useState([]);
  const [availableTeamMembers, setAvailableTeamMembers] = useState([]);
  const [isFetchingDropdownData, setIsFetchingDropdownData] = useState(false);

  // Fetch data for Autocomplete dropdowns
  const fetchDropdownData = useCallback(async () => {
    setIsFetchingDropdownData(true);
    try {
      const [investorsRes, teamRes] = await Promise.all([
        getAvailableInvestorsFromAPI(), 
        getAvailableTeamMembersFromAPI()  
      ]);

      // The backend /fundraising/investors returns the investors directly in response.data
      if (investorsRes.data && Array.isArray(investorsRes.data)) {
        setAvailableInvestors(investorsRes.data);
      } else if (investorsRes.data?.success && Array.isArray(investorsRes.data.data)) { // If nested under 'data'
        setAvailableInvestors(investorsRes.data.data);
      } else {
        console.error("Failed to fetch investors or unexpected format:", investorsRes.data);
        setAvailableInvestors([]); // Ensure it's an array
      }

      // Assuming getAvailableTeamMembersFromAPI (getHeadcounts) also returns array directly or nested
      if (teamRes.data && Array.isArray(teamRes.data)) {
        setAvailableTeamMembers(teamRes.data);
      } else if (teamRes.data?.success && Array.isArray(teamRes.data.data)) {
        setAvailableTeamMembers(teamRes.data.data);
      } else {
        console.error("Failed to fetch team members or unexpected format:", teamRes.data);
        setAvailableTeamMembers([]); // Ensure it's an array
      }

    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      setError("Could not load selection data for investors/team. Please try refreshing.");
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
      let fetchedMeetingsArray = [];
      // Adjust based on your actual getInvestorMeetings response structure
      if (response.data && response.data.success) {
          if(Array.isArray(response.data.data)) { 
            fetchedMeetingsArray = response.data.data;
          } else if (response.data.data && Array.isArray(response.data.data.meetings)) { 
            fetchedMeetingsArray = response.data.data.meetings;
          } else if (response.data.data && Array.isArray(response.data.data.data)) { 
             fetchedMeetingsArray = response.data.data.data;
          } else if (Array.isArray(response.data)) { // If API returns array directly
             fetchedMeetingsArray = response.data;
          }
      } else if (Array.isArray(response.data)) { // Fallback if no 'success' flag but data is array
          fetchedMeetingsArray = response.data;
      }


      if (fetchedMeetingsArray.length >= 0 ) { // Allow empty array if success
        setMeetings(fetchedMeetingsArray);
        setMetrics(prevMetrics => ({
            ...prevMetrics,
            upcomingCount: fetchedMeetingsArray.filter(m => m.status === 'Scheduled' || m.status === 'Preparation').length,
            cancelledCount: fetchedMeetingsArray.filter(m => m.status === 'Cancelled').length,
        }));
      } else {
        setMeetings([]);
        setError(response.data?.msg || 'No meetings found or invalid response format.');
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(`Failed to load meetings: ${err.response?.data?.msg || err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeetingStatistics = useCallback(async () => {
    try {
      const response = await getInvestorMeetingMetrics();
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

  const fetchFullMeetingDetails = useCallback(async (meetingId) => {
    if (!meetingId) return;
    setIsDetailLoading(true);
    try {
      const response = await getInvestorMeetingById(meetingId);
      if (response.data && response.data.success) {
        setSelectedMeeting(response.data.data);
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
        if (!newFormData[parentField][index]) newFormData[parentField][index] = JSON.parse(JSON.stringify(parentField === 'investors' ? initialInvestorData : initialInternalParticipantData));
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
  
  const handleInvestorAutocompleteChange = (index, newValue, reason) => {
    setFormData(prev => {
      const newFormData = JSON.parse(JSON.stringify(prev));
      if (newValue && typeof newValue === 'object' && newValue._id) { // Existing investor selected
        newFormData.investors[index] = {
          investorId: newValue._id,
          name: newValue.name || '', // From InvestorModel: name (firm name)
          company: newValue.entityName || newValue.name || '', // From InvestorModel: entityName or name
          contactName: newValue.contactPerson || '', // From InvestorModel: contactPerson
          contactEmail: newValue.email || '', // From InvestorModel: email
          role: newValue.role || '', // From InvestorModel: role (if it exists)
          investorType: newValue.investorType || 'VC', // From InvestorModel (if it exists) or default
          investmentStage: newValue.investmentStage || 'Seed', // From InvestorModel (if it exists) or default
          attended: prev.investors[index]?.attended ?? true,
        };
      } else if (typeof newValue === 'string') { // User typed a new name
        newFormData.investors[index] = {
          ...initialInvestorData,
          name: newValue,
          attended: prev.investors[index]?.attended ?? true,
        };
      } else { // Cleared
        newFormData.investors[index] = JSON.parse(JSON.stringify(initialInvestorData));
      }
      return newFormData;
    });
  };

  const handleInternalParticipantAutocompleteChange = (index, newValue, reason) => {
    setFormData(prev => {
      const newFormData = JSON.parse(JSON.stringify(prev));
      if (newValue && typeof newValue === 'object' && newValue._id) { // Existing team member selected
        newFormData.internalParticipants[index] = {
          userId: newValue._id,
          name: newValue.name || '',
          // Backend HeadcountModel has 'title', frontend form has 'role' for meeting context
          role: newFormData.internalParticipants[index]?.role || newValue.title || '', 
        };
      } else if (typeof newValue === 'string') { 
         newFormData.internalParticipants[index] = {
          ...initialInternalParticipantData,
          name: newValue,
          role: newFormData.internalParticipants[index]?.role || '', 
        };
      } else { 
         newFormData.internalParticipants[index] = JSON.parse(JSON.stringify(initialInternalParticipantData));
      }
      return newFormData;
    });
  };


  const addInvestorToForm = () => setFormData(prev => ({ ...prev, investors: [...prev.investors, JSON.parse(JSON.stringify(initialInvestorData))] }));
  const removeInvestorFromForm = (index) => setFormData(prev => ({ ...prev, investors: prev.investors.filter((_, i) => i !== index) }));
  
  const addInternalParticipantToForm = () => setFormData(prev => ({ ...prev, internalParticipants: [...prev.internalParticipants, JSON.parse(JSON.stringify(initialInternalParticipantData))] }));
  const removeInternalParticipantFromForm = (index) => setFormData(prev => ({ ...prev, internalParticipants: prev.internalParticipants.filter((_, i) => i !== index) }));

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.meetingDate) errors.meetingDate = 'Meeting date is required';
    if (!formData.meetingType) errors.meetingType = 'Meeting type is required';
    formData.investors?.forEach((investor, index) => {
      if (!investor.name?.trim()) errors[`investors.${index}.name`] = `Investor ${index + 1} firm name is required`;
    });
    formData.internalParticipants?.forEach((participant, index) => {
      if (!participant.name?.trim()) errors[`internalParticipants.${index}.name`] = `Participant ${index + 1} name is required`;
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
    const investorsForForm = meetingToEdit.investors?.map(inv => {
        const existingInvestor = availableInvestors.find(i => i._id === (inv.investorId || inv._id));
        return {
            investorId: inv.investorId || inv._id || null,
            name: inv.name || existingInvestor?.name || '',
            company: inv.company || existingInvestor?.entityName || existingInvestor?.name || '',
            contactName: inv.contactName || existingInvestor?.contactPerson || '',
            contactEmail: inv.email || existingInvestor?.email || '',
            role: inv.role || existingInvestor?.role || '',
            investorType: inv.investorType || existingInvestor?.investorType || 'VC',
            investmentStage: inv.investmentStage || existingInvestor?.investmentStage || 'Seed',
            attended: typeof inv.attended === 'boolean' ? inv.attended : true,
        };
    }) || [JSON.parse(JSON.stringify(initialInvestorData))];

    const internalParticipantsForForm = meetingToEdit.internalParticipants?.map(par => {
        const existingTeamMember = availableTeamMembers.find(t => t._id === (par.userId || par._id));
        return {
            userId: par.userId || par._id || null,
            name: par.name || existingTeamMember?.name || '',
            role: par.role || existingTeamMember?.title || '', // 'title' from Headcount/User model for default role
        };
    }) || [JSON.parse(JSON.stringify(initialInternalParticipantData))];

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
      const payload = { ...talkingPointForm };
      await createInvestorMeetingTalkingPoint(selectedMeeting._id, payload);
      setSuccess('Talking point added!');
      fetchFullMeetingDetails(selectedMeeting._id); 
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

  const handleTalkingPointFormChange = (field, value) => setTalkingPointForm(prev => ({ ...prev, [field]: value }));

  const handleAddFollowUp = async () => {
    if (!selectedMeeting?._id || !followUpForm.action?.trim()) {
      setError('Action description is required for follow-ups.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...followUpForm, dueDate: followUpForm.dueDate ? new Date(followUpForm.dueDate).toISOString() : null };
      await createInvestorMeetingFollowUp(selectedMeeting._id, payload);
      setSuccess('Follow-up added!');
      fetchFullMeetingDetails(selectedMeeting._id); 
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

  const handleFollowUpFormChange = (field, value) => setFollowUpForm(prev => ({ ...prev, [field]: value }));

  const handleUpdateFollowUpStatus = async (followUpId, newStatus, currentNotes) => {
    if (!selectedMeeting?._id || !followUpId) return;
    setIsSubmitting(true);
    try {
      await updateInvestorMeetingFollowUp(selectedMeeting._id, followUpId, { status: newStatus, notes: currentNotes });
      setSuccess('Follow-up status updated!');
      fetchFullMeetingDetails(selectedMeeting._id); 
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating follow-up status:', err);
      setError(`Failed to update follow-up: ${err.response?.data?.msg || err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (activeTab === 0) return true;
    const lowerStatus = meeting.status?.toLowerCase();
    if (activeTab === 1) return lowerStatus === 'scheduled' || lowerStatus === 'preparation';
    if (activeTab === 2) return lowerStatus === 'completed';
    if (activeTab === 3) return lowerStatus === 'cancelled';
    return true;
  });
  
  const meetingTypeOptions = ['Regular Update', 'Board Meeting', 'Fundraising', 'Due Diligence', 'Strategic Discussion', 'Other'];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <HeroSection sx={{ py: { xs: 3, md: 5 }, mb: { xs: 3, md: 4 } }}>
          <Container maxWidth="xl">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Typography variant="h3" sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
                    Investor Meetings
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                    Manage investor relationships, prepare for meetings, and track follow-ups.
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedMeetingIdForMenu(null); setFormData(JSON.parse(JSON.stringify(initialFormData))); setFormErrors({}); setOpenDialog(true); }}
                    sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)' }}>
                    New Meeting
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <MetricCard glowColor="primary"><CardContent sx={{textAlign: 'center'}}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 56, height: 56, mx: 'auto', mb: 1 }}><EventNoteIcon /></Avatar>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Total Meetings</Typography>
                    <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700, color: theme.palette.primary.dark }}>
                      {loading ? <Skeleton width={60} sx={{mx: 'auto'}} /> : <AnimatedNumber value={metrics.totalMeetings} />}
                    </Typography>
                  </CardContent></MetricCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <MetricCard glowColor="warning"><CardContent sx={{textAlign: 'center'}}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, width: 56, height: 56, mx: 'auto', mb: 1 }}><ScheduleIcon /></Avatar>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Upcoming</Typography>
                    <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700, color: theme.palette.warning.dark }}>
                       {loading ? <Skeleton width={60} sx={{mx: 'auto'}} /> : <AnimatedNumber value={metrics.upcomingCount} />}
                    </Typography>
                  </CardContent></MetricCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <MetricCard glowColor="success"><CardContent sx={{textAlign: 'center'}}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, width: 56, height: 56, mx: 'auto', mb: 1 }}><CheckCircleIcon /></Avatar>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Completed</Typography>
                    <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700, color: theme.palette.success.dark }}>
                       {loading ? <Skeleton width={60} sx={{mx: 'auto'}} /> : <AnimatedNumber value={metrics.completedMeetings} />}
                    </Typography>
                  </CardContent></MetricCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <MetricCard glowColor="info"><CardContent sx={{textAlign: 'center'}}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, width: 56, height: 56, mx: 'auto', mb: 1 }}><BusinessCenterIcon /></Avatar>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>Avg. Effectiveness</Typography>
                    <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700, color: theme.palette.info.dark }}>
                      {loading ? <Skeleton width={60} sx={{mx: 'auto'}} /> : <AnimatedNumber value={metrics.avgEffectiveness} decimals={1} suffix="/5" />}
                    </Typography>
                  </CardContent></MetricCard>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </HeroSection>

        <Container maxWidth="xl" sx={{ pb: 4 }}>
          {success && <Grow in={!!success}><Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert></Grow>}
          {error && <Grow in={!!error}><Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert></Grow>}

          <Grid container spacing={4}>
            <Grid item xs={12} md={5} lg={4}>
              <Card sx={{ borderRadius: theme.spacing(2.5), overflow: 'hidden', height: '100%', boxShadow: theme.shadows[3] }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                  <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto" aria-label="Meeting filter tabs">
                    <Tab label="All" id="meeting-tab-0" aria-controls="meeting-tabpanel-0" />
                    <Tab label="Upcoming" id="meeting-tab-1" aria-controls="meeting-tabpanel-1" />
                    <Tab label="Completed" id="meeting-tab-2" aria-controls="meeting-tabpanel-2" />
                    <Tab label="Cancelled" id="meeting-tab-3" aria-controls="meeting-tabpanel-3" />
                  </Tabs>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                  <Typography variant="body2" color="text.secondary">{filteredMeetings.length} meetings</Typography>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Filter"><IconButton size="small" sx={{ bgcolor: alpha(theme.palette.grey[500], 0.08) }}><FilterAltIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Sort"><IconButton size="small" sx={{ bgcolor: alpha(theme.palette.grey[500], 0.08) }}><SortIcon fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                </Box>
                <Divider />
                <Box sx={{ height: { xs: 'auto', md: 'calc(100vh - 480px)' }, overflowY: 'auto', p: 2 }}>
                  {loading && meetings.length === 0 ? (
                    <Stack spacing={2}>{[...Array(4)].map((_, i) => <Skeleton key={i} variant="rectangular" height={130} sx={{ borderRadius: 2 }} />)}</Stack>
                  ) : filteredMeetings.length > 0 ? (
                    <Stack spacing={2}>
                      {filteredMeetings.map((meeting) => (
                        <MeetingCard key={meeting._id} status={meeting.status} onClick={() => handleMeetingClick(meeting)}
                          sx={{ cursor: 'pointer', boxShadow: selectedMeeting?._id === meeting._id ? `0 0 0 2.5px ${theme.palette.primary.main}` : theme.shadows[1] }}>
                          <CardContent>
                            <Stack spacing={1.5}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{maxWidth: 'calc(100% - 40px)'}}>
                                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meeting.title}</Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    {meeting.investors?.map(inv => inv.name).join(', ') || 'No Investors'}
                                  </Typography>
                                </Box>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setSelectedMeetingIdForMenu(meeting._id); }}><MoreVertIcon fontSize="small" /></IconButton>
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center" color="text.secondary"><CalendarMonthIcon fontSize="small" /><Typography variant="body2">{formatDate(meeting.meetingDate)}</Typography></Stack>
                              <Stack direction="row" spacing={1} alignItems="center" color="text.secondary"><AccessTimeIcon fontSize="small" /><Typography variant="body2">{formatTime(meeting.meetingDate)} ({meeting.duration} min)</Typography></Stack>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt:1}}>
                                <Chip label={meeting.meetingType} size="small" sx={{ borderRadius: '6px', bgcolor: alpha(theme.palette.grey[500], 0.1), color: 'text.primary', fontWeight: 500 }}/>
                                <StatusChip status={meeting.status} />
                              </Stack>
                            </Stack>
                          </CardContent>
                        </MeetingCard>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, textAlign: 'center' }}>
                      <EventNoteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">No meetings found for this filter.</Typography>
                      <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setSelectedMeetingIdForMenu(null); setFormData(JSON.parse(JSON.stringify(initialFormData))); setFormErrors({}); setOpenDialog(true); }} sx={{ mt: 2 }}>Create Meeting</Button>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
              {isDetailLoading ? <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', height: '100%'}}><CircularProgress /></Box>
              : selectedMeeting ? (
                <Card sx={{ borderRadius: theme.spacing(2.5), overflow: 'hidden', height: '100%', boxShadow: theme.shadows[3] }}>
                  <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Stack direction={{xs: 'column', sm: 'row'}} justifyContent="space-between" alignItems={{xs:'flex-start', sm: 'center'}} spacing={{xs:2, sm:1}}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedMeeting.title}</Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <StatusChip status={selectedMeeting.status} />
                          <Typography variant="body2" color="text.secondary">{formatDate(selectedMeeting.meetingDate)} at {formatTime(selectedMeeting.meetingDate)}</Typography>
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1} alignSelf={{xs:'flex-start', sm:'center'}}>
                        <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => handleEditMeeting(selectedMeeting)}>Edit</Button>
                        {selectedMeeting.meetingLink && <Button variant="contained" startIcon={<VideoCallIcon />} color="primary" size="small" href={selectedMeeting.meetingLink} target="_blank" rel="noopener noreferrer">Join</Button>}
                      </Stack>
                    </Stack>
                  </Box>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', px: {xs:1, sm:2} }}>
                    <Tabs value={activeDetailTab} onChange={(e, newValue) => setActiveDetailTab(newValue)} variant="scrollable" scrollButtons="auto" aria-label="Meeting details tabs">
                      <Tab icon={<DescriptionIcon />} label="Details" iconPosition="start" id="meeting-detail-tab-0" aria-controls="meeting-detail-tabpanel-0" />
                      <Tab icon={<FormatListBulletedIcon />} label="Talking Points" iconPosition="start" id="meeting-detail-tab-1" aria-controls="meeting-detail-tabpanel-1" />
                      <Tab icon={<GroupIcon />} label="Attendees" iconPosition="start" id="meeting-detail-tab-2" aria-controls="meeting-detail-tabpanel-2" />
                      
                    </Tabs>
                  </Box>
                  <Box sx={{ p: {xs:2, sm:3}, height: { xs: 'auto', md: 'calc(100vh - 500px)' }, overflowY: 'auto' }}>
                    <TabPanel value={activeDetailTab} index={0}> {/* Details */}
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Meeting Information</Typography>
                            <Stack spacing={2}>
                              <Stack direction="row" spacing={1}><BusinessCenterIcon fontSize="small" color="action" sx={{mt:0.3}}/><Box><Typography variant="caption" color="text.secondary">Type</Typography><Typography>{selectedMeeting.meetingType}</Typography></Box></Stack>
                              <Stack direction="row" spacing={1}><AccessTimeIcon fontSize="small" color="action" sx={{mt:0.3}}/><Box><Typography variant="caption" color="text.secondary">Duration</Typography><Typography>{selectedMeeting.duration} minutes</Typography></Box></Stack>
                              <Stack direction="row" spacing={1}><LocationOnIcon fontSize="small" color="action" sx={{mt:0.3}}/><Box><Typography variant="caption" color="text.secondary">Location</Typography><Typography>{selectedMeeting.location}</Typography></Box></Stack>
                              {selectedMeeting.meetingLink && <Stack direction="row" spacing={1}><VideocamIcon fontSize="small" color="action" sx={{mt:0.3}}/><Box><Typography variant="caption" color="text.secondary">Meeting Link</Typography><Link href={selectedMeeting.meetingLink} target="_blank" rel="noopener noreferrer" sx={{display:'flex', alignItems:'center', gap:0.5}}>Join Meeting <LinkIcon fontSize="inherit"/></Link></Box></Stack>}
                            </Stack>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Investor Information</Typography>
                            {selectedMeeting.investors?.length > 0 ? selectedMeeting.investors.map((inv, idx) => (
                              <Box key={idx} mb={idx < selectedMeeting.investors.length -1 ? 2 : 0}>
                                <Stack spacing={1.5}>
                                  <Stack direction="row" spacing={1}><BusinessCenterIcon fontSize="small" color="action" sx={{mt:0.3}}/><Box><Typography variant="caption" color="text.secondary">Investor Firm</Typography><Typography>{inv.name}</Typography></Box></Stack>
                                  {inv.contactName && <Stack direction="row" spacing={1}><PermContactCalendarIcon fontSize="small" color="action" sx={{mt:0.3}}/><Box><Typography variant="caption" color="text.secondary">Contact</Typography><Typography>{inv.contactName}</Typography></Box></Stack>}
                                  {inv.email && <Stack direction="row" spacing={1}><MailIcon fontSize="small" color="action" sx={{mt:0.3}}/><Box><Typography variant="caption" color="text.secondary">Email</Typography><Link href={`mailto:${inv.email}`}>{inv.email}</Link></Box></Stack>}
                                  {(inv.investorType || inv.investmentStage) && <Stack direction="row" spacing={1}><CategoryIcon fontSize="small" color="action" sx={{mt:0.3}}/><Box><Typography variant="caption" color="text.secondary">Type & Stage</Typography><Typography>{inv.investorType} &bull; {inv.investmentStage}</Typography></Box></Stack>}
                                </Stack>
                                {idx < selectedMeeting.investors.length -1 && <Divider sx={{my:2}}/>}
                              </Box>
                            )) : <Typography color="text.secondary">No investor details provided.</Typography>}
                          </Paper>
                        </Grid>
                        <Grid item xs={12}>
                          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Agenda</Typography>
                            {selectedMeeting.agenda ? <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{selectedMeeting.agenda}</Typography> : <Typography color="text.secondary" sx={{fontStyle:'italic'}}>No agenda specified.</Typography>}
                          </Paper>
                        </Grid>
                      </Grid>
                    </TabPanel>
                    <TabPanel value={activeDetailTab} index={1}> {/* Talking Points */}
                       <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Add Talking Point</Typography>
                                <Stack spacing={2}>
                                    <TextField label="Title" fullWidth value={talkingPointForm.title} onChange={(e) => handleTalkingPointFormChange('title', e.target.value)} />
                                    <TextField label="Content" fullWidth multiline rows={3} value={talkingPointForm.content} onChange={(e) => handleTalkingPointFormChange('content', e.target.value)} placeholder="Use new lines for bullets."/>
                                    <FormControl fullWidth><InputLabel>Category</InputLabel><Select value={talkingPointForm.category} label="Category" onChange={(e) => handleTalkingPointFormChange('category', e.target.value)}><MenuItem value="Win">Win</MenuItem><MenuItem value="Challenge">Challenge</MenuItem><MenuItem value="Request">Request</MenuItem><MenuItem value="Update">Update</MenuItem><MenuItem value="Question">Question</MenuItem><MenuItem value="Strategic">Strategic</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl>
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddTalkingPoint} disabled={isSubmitting || !talkingPointForm.title || !talkingPointForm.content}>Add Talking Point</Button>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Talking Points ({selectedMeeting.talkingPoints?.length || 0})</Typography>
                                {selectedMeeting.talkingPoints?.length > 0 ? (
                                    <Stack spacing={2.5}>
                                    {selectedMeeting.talkingPoints.map((point, index) => (
                                        <Paper key={point._id || index} variant="outlined" sx={{ p: 2, borderRadius: 1.5, bgcolor: alpha(theme.palette.background.default, 0.3)}}>
                                            <Stack spacing={1}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{point.title}</Typography>
                                                    <Chip label={point.category || 'Update'} size="small" sx={{borderRadius: '6px'}} />
                                                </Stack>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{point.content}</Typography>
                                                <Stack direction="row" justifyContent="flex-end" spacing={0.5} sx={{mt:1}}>
                                                    <Tooltip title="Edit (Not Implemented)"><IconButton size="small" color="primary" disabled><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Delete (Not Implemented)"><IconButton size="small" color="error" disabled><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    ))}
                                    </Stack>
                                ) : <Typography color="text.secondary" align="center" sx={{py:3}}>No talking points added yet.</Typography>}
                            </Paper>
                        </Grid>
                       </Grid>
                    </TabPanel>
                    <TabPanel value={activeDetailTab} index={2}> {/* Attendees */}
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Investors Attending ({selectedMeeting.investors?.length || 0})</Typography>
                            {selectedMeeting.investors?.length > 0 ? (
                                <List dense>{selectedMeeting.investors.map((att, idx) => (
                                    <ListItem key={`inv-${idx}`} secondaryAction={<Chip label={att.attended ? "Attended" : "Did not attend"} size="small" color={att.attended ? "success" : "default"}/>}>
                                        <ListItemAvatar><Avatar sx={{bgcolor: theme.palette.primary.light}}>{att.name?.charAt(0).toUpperCase()}</Avatar></ListItemAvatar>
                                        <ListItemText primary={att.name} secondary={<>{att.role && `${att.role} • `}{att.email}</>} />
                                    </ListItem>
                                ))}</List>
                            ) : <Typography color="text.secondary">No investors listed for this meeting.</Typography>}
                            <Typography variant="h6" sx={{ fontWeight: 600, mt:3, mb: 2 }}>Internal Participants ({selectedMeeting.internalParticipants?.length || 0})</Typography>
                            {selectedMeeting.internalParticipants?.length > 0 ? (
                                <List dense>{selectedMeeting.internalParticipants.map((att, idx) => (
                                    <ListItem key={`int-${idx}`}>
                                        <ListItemAvatar><Avatar sx={{bgcolor: theme.palette.secondary.light}}>{att.name?.charAt(0).toUpperCase()}</Avatar></ListItemAvatar>
                                        <ListItemText primary={att.name} secondary={att.role} />
                                    </ListItem>
                                ))}</List>
                            ) : <Typography color="text.secondary">No internal participants listed.</Typography>}
                            <Typography variant="caption" sx={{mt:2, display:'block', textAlign:'center'}}>Note: To modify attendees, please edit the main meeting details.</Typography>
                        </Paper>
                    </TabPanel>
                    <TabPanel value={activeDetailTab} index={3}> {/* Follow-ups (Action Items) */}
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Add Follow-up Action</Typography>
                                    <Stack spacing={2}>
                                        <TextField label="Action Description" fullWidth value={followUpForm.action} onChange={(e) => handleFollowUpFormChange('action', e.target.value)} />
                                        <TextField label="Assignee (Name or ID)" fullWidth value={followUpForm.assignee} onChange={(e) => handleFollowUpFormChange('assignee', e.target.value)} />
                                        <DatePicker label="Due Date" value={followUpForm.dueDate} onChange={(newDate) => handleFollowUpFormChange('dueDate', newDate)} slotProps={{ textField: { fullWidth: true, helperText: 'Optional' } }} />
                                        <TextField label="Notes" fullWidth multiline rows={2} value={followUpForm.notes} onChange={(e) => handleFollowUpFormChange('notes', e.target.value)} />
                                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddFollowUp} disabled={isSubmitting || !followUpForm.action}>Add Follow-up</Button>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Follow-up Actions ({selectedMeeting.actionItems?.length || 0})</Typography>
                                    {selectedMeeting.actionItems?.length > 0 ? (
                                        <Stack spacing={2.5}>
                                        {selectedMeeting.actionItems.map((item, index) => (
                                            <Paper key={item._id || index} variant="outlined" sx={{p:2, borderRadius:1.5}}>
                                                <Stack spacing={1}>
                                                    <Typography variant="subtitle1" sx={{fontWeight:600}}>{item.action}</Typography>
                                                    {item.assigneeName && <Typography variant="body2" color="text.secondary">Assignee: {item.assigneeName}</Typography>}
                                                    {item.assignee && !item.assigneeName && <Typography variant="body2" color="text.secondary">Assignee ID: {item.assignee}</Typography>}
                                                    {item.dueDate && <Typography variant="body2" color="text.secondary">Due: {formatDate(item.dueDate)}</Typography>}
                                                    {item.notes && <Typography variant="body2" sx={{fontStyle:'italic', whiteSpace:'pre-line'}}>{item.notes}</Typography>}
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt:1}}>
                                                        <Select value={item.status || 'Not Started'} size="small" onChange={(e) => handleUpdateFollowUpStatus(item._id, e.target.value, item.notes)}
                                                            sx={{fontWeight:500, borderRadius:'6px', '.MuiSelect-select': {py:0.8, px:1.5}, '.MuiOutlinedInput-notchedOutline': {borderColor: alpha(theme.palette.divider,0.7)}}}>
                                                            <MenuItem value="Not Started">Not Started</MenuItem>
                                                            <MenuItem value="In Progress">In Progress</MenuItem>
                                                            <MenuItem value="Completed">Completed</MenuItem>
                                                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                                                        </Select>
                                                        <Tooltip title="Delete (Not Implemented)"><IconButton size="small" color="error" disabled><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                        ))}
                                        </Stack>
                                    ) : <Typography color="text.secondary" align="center" sx={{py:3}}>No follow-up actions added yet.</Typography>}
                                </Paper>
                            </Grid>
                        </Grid>
                    </TabPanel>
                  </Box>
                </Card>
              ) : (
                <Card sx={{ borderRadius: theme.spacing(2.5), overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, boxShadow: theme.shadows[3] }}>
                  <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
                    <EventNoteIcon sx={{ fontSize: 80, color: alpha(theme.palette.primary.main, 0.15), mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>No Meeting Selected</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>Select a meeting from the list to view its details, or create a new one.</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedMeetingIdForMenu(null); setFormData(JSON.parse(JSON.stringify(initialFormData))); setFormErrors({}); setOpenDialog(true); }}>Create New Meeting</Button>
                  </Box>
                </Card>
              )}
            </Grid>
          </Grid>
        </Container>

        <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setFormErrors({}); }} PaperProps={{sx:{borderRadius:3}}} maxWidth="md" fullWidth>
          <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.4rem' }}>{selectedMeetingIdForMenu ? 'Edit Meeting' : 'Create New Meeting'}</DialogTitle>
          <DialogContent sx={{ pb: 2, '& .MuiGrid-item': {pt: '12px !important'} }}> 
            <Grid container spacing={2} sx={{ mt: 0 }}> 
              {/* Basic Meeting Info */}
              <Grid item xs={12} md={8}><TextField label="Meeting Title" fullWidth value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} error={!!formErrors.title} helperText={formErrors.title} size="small" /></Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!formErrors.meetingType} size="small">
                  <InputLabel>Meeting Type</InputLabel>
                  <Select value={formData.meetingType} label="Meeting Type" onChange={(e) => handleFormChange('meetingType', e.target.value)}>
                    {meetingTypeOptions.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                  <FormHelperText>{formErrors.meetingType}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}><DatePicker label="Meeting Date & Time" value={formData.meetingDate ? new Date(formData.meetingDate) : null} onChange={(newDate) => handleFormChange('meetingDate', newDate)} slotProps={{ textField: { fullWidth: true, error: !!formErrors.meetingDate, helperText: formErrors.meetingDate, size: 'small' }}} /></Grid>
              <Grid item xs={12} md={6}><TextField label="Duration (minutes)" fullWidth type="number" value={formData.duration} onChange={(e) => handleFormChange('duration', parseInt(e.target.value))} InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }} size="small" /></Grid>
              <Grid item xs={12} md={6}><TextField label="Location (e.g., Office, Zoom)" fullWidth value={formData.location} onChange={(e) => handleFormChange('location', e.target.value)} size="small" /></Grid>
              <Grid item xs={12} md={6}><TextField label="Meeting Link (if virtual)" fullWidth value={formData.meetingLink} onChange={(e) => handleFormChange('meetingLink', e.target.value)} size="small" /></Grid>
              
              {/* Investors Section */}
              <Grid item xs={12}><Divider sx={{my:1}}><Chip icon={<PeopleAltIcon/>} label="Investors" size="small"/></Divider></Grid>
              {formData.investors?.map((investor, index) => (
                <Grid item xs={12} container spacing={2} key={`investor-form-group-${index}`} alignItems="flex-start" sx={{mb:1}}> {/* Use flex-start for better alignment with helperText */}
                  <Grid item xs={12}><Typography variant="overline" color="text.secondary" display="block" sx={{mb: -0.5, mt: index > 0 ? 1 : 0}}>Investor {index + 1}</Typography></Grid>
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
                        <TextField {...params} label="Firm Name" 
                                   error={!!formErrors[`investors.${index}.name`]} 
                                   helperText={formErrors[`investors.${index}.name`]} 
                                   InputProps={{ ...params.InputProps, endAdornment: (<>{isFetchingDropdownData ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>)}}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Contact Name" fullWidth value={investor.contactName} onChange={(e) => handleFormChange('contactName', e.target.value, index, 'investors')} size="small"/></Grid>
                  <Grid item xs={12} sm={6} md={3}><TextField label="Contact Email" fullWidth value={investor.contactEmail} onChange={(e) => handleFormChange('contactEmail', e.target.value, index, 'investors')} error={!!formErrors[`investors.${index}.contactEmail`]} helperText={formErrors[`investors.${index}.contactEmail`]} size="small"/></Grid>
                  <Grid item xs={12} sm={6} md={3}><TextField label="Role" fullWidth value={investor.role} onChange={(e) => handleFormChange('role', e.target.value, index, 'investors')} size="small"/></Grid>
                  <Grid item xs={12} sm={6} md={3}><TextField label="Type (VC, Angel)" fullWidth value={investor.investorType} onChange={(e) => handleFormChange('investorType', e.target.value, index, 'investors')} size="small"/></Grid>
                  <Grid item xs={12} sm={6} md={3}><TextField label="Stage (Seed, A)" fullWidth value={investor.investmentStage} onChange={(e) => handleFormChange('investmentStage', e.target.value, index, 'investors')} size="small"/></Grid>
                  <Grid item xs={12} sm={6} md={2} sx={{display:'flex', alignItems:'center', pt:'8px !important'}}> {/* Adjusted padding for checkbox */}
                    <FormControlLabel control={<Checkbox checked={investor.attended} onChange={(e) => handleFormChange('attended', e.target.checked, index, 'investors')} size="small"/>} label="Attended" sx={{mt: {xs:0, sm: '2px'}}}/>
                  </Grid>
                  <Grid item xs={12} sm={12} md={1} sx={{display:'flex', alignItems:'center', justifyContent: {xs: 'flex-end', md: 'center'}, pt:'8px !important'}}>
                    {formData.investors.length > 1 && <IconButton onClick={() => removeInvestorFromForm(index)} color="error" size="small"><DeleteIcon/></IconButton>}
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={12}><Button onClick={addInvestorToForm} startIcon={<AddIcon />} size="small" variant="outlined" sx={{mt: -1}}>Add Investor</Button></Grid>

              {/* Internal Participants Section */}
              <Grid item xs={12}><Divider sx={{my:1}}><Chip icon={<SupervisorAccountIcon/>} label="Internal Team Participants" size="small"/></Divider></Grid>
              {formData.internalParticipants?.map((participant, index) => (
                <Grid item xs={12} container spacing={2} key={`internal-participant-form-group-${index}`} alignItems="flex-start">
                  <Grid item xs={12}><Typography variant="overline" color="text.secondary" display="block" sx={{mb: -0.5, mt: index > 0 ? 1 : 0}}>Team Member {index + 1}</Typography></Grid>
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
                        <TextField {...params} label="Team Member Name" 
                                   error={!!formErrors[`internalParticipants.${index}.name`]} 
                                   helperText={formErrors[`internalParticipants.${index}.name`]}
                                   InputProps={{ ...params.InputProps, endAdornment: (<>{isFetchingDropdownData ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>)}}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={formData.internalParticipants.length > 1 ? 4 : 5} md={formData.internalParticipants.length > 1 ? 4 : 5}>
                    <TextField label="Role in Meeting" fullWidth value={participant.role} onChange={(e) => handleFormChange('role', e.target.value, index, 'internalParticipants')} size="small"/>
                  </Grid>
                  {formData.internalParticipants.length > 1 && <Grid item xs={12} sm={1} md={1} sx={{display:'flex', alignItems:'center', justifyContent:'center'}}><IconButton onClick={() => removeInternalParticipantFromForm(index)} color="error" size="small"><DeleteIcon/></IconButton></Grid>}
                </Grid>
              ))}
              <Grid item xs={12}><Button onClick={addInternalParticipantToForm} startIcon={<AddIcon />} size="small" variant="outlined" sx={{mt: -1}}>Add Team Member</Button></Grid>


              <Grid item xs={12}><Divider sx={{my:1}}><Chip label="Agenda" size="small"/></Divider></Grid>
              <Grid item xs={12}><TextField label="Meeting Agenda" fullWidth multiline rows={4} value={formData.agenda} onChange={(e) => handleFormChange('agenda', e.target.value)} placeholder="Enter key topics and discussion points..." size="small"/></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, pt:1 }}>
            <Button onClick={() => { setOpenDialog(false); setFormErrors({}); }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting || isFetchingDropdownData}>
              {(isSubmitting || isFetchingDropdownData) ? <CircularProgress size={24} color="inherit"/> : (selectedMeetingIdForMenu ? 'Update Meeting' : 'Create Meeting')}
            </Button>
          </DialogActions>
        </Dialog>

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => { setMenuAnchor(null); setSelectedMeetingIdForMenu(null); }}>
          <MenuItem onClick={() => {
            const meeting = meetings.find(m => m._id === selectedMeetingIdForMenu);
            if (meeting) {
                fetchFullMeetingDetails(selectedMeetingIdForMenu).then(() => {
                    const meetingDataForEdit = selectedMeeting && selectedMeeting._id === selectedMeetingIdForMenu ? selectedMeeting : meeting;
                    handleEditMeeting(meetingDataForEdit);
                });
            }
            setMenuAnchor(null); 
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => handleDeleteMeeting(selectedMeetingIdForMenu)} sx={{color: 'error.main'}}>
            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Delete
          </MenuItem>
        </Menu>
      </Box>
    </LocalizationProvider>
  );
};

export default InvestorMeetingsPage;
