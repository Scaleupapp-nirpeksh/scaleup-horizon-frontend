// src/pages/HeadcountPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Button, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  CircularProgress, Alert, Card, CardContent, Avatar, Stack, Chip, Menu, MenuItem,
  useTheme, alpha, Grow, Skeleton, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, FormHelperText, Autocomplete, Divider, Collapse, Badge,
  Tabs, Tab, LinearProgress, Snackbar, Backdrop,
  ToggleButtonGroup, ToggleButton, InputAdornment, Breadcrumbs, Link
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PublicIcon from '@mui/icons-material/Public';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import HomeIcon from '@mui/icons-material/Home';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';


// API (ensure these are correctly defined in your api.js)
import {
  getHeadcounts,
  getHeadcountSummary,
  createHeadcount,
  updateHeadcount,
  deleteHeadcount,
} from '../services/api';

const calculateTotalAnnualCost = (compensation) => {
  const baseSalary = compensation?.baseSalary || 0;
  const variableCompensation = compensation?.variableCompensation || 0;
  const monthlyBenefits = compensation?.benefits || 0;
  
  return baseSalary + variableCompensation + (monthlyBenefits * 12);
};

// Helper to format ISO dates into "DD Mon YYYY"
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  backdropFilter: 'blur(12px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.85),
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'visible',
  position: 'relative',
  '&:hover': {
    boxShadow: theme.shadows[10],
  }
}));

const MetricDisplayCard = styled(Paper)(({ theme, color = 'primary', $pulse = false }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(145deg, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette[color]?.light || theme.palette.primary.light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color]?.dark || theme.palette.primary.dark, 0.2)}`,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: $pulse ? `${pulseAnimation} 2s infinite ease-in-out` : 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  '& .metric-icon': {
    backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.15),
    color: theme.palette[color]?.dark || theme.palette.primary.dark,
    width: 56,
    height: 56,
    margin: '0 auto 12px auto',
    transition: 'all 0.3s ease',
  },
  '&:hover .metric-icon': {
    transform: 'scale(1.1) rotate(5deg)',
    backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.25),
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: theme.palette[color]?.main || theme.palette.primary.main,
    borderTopLeftRadius: theme.spacing(2),
    borderTopRightRadius: theme.spacing(2),
    opacity: 0.7,
  }
}));

const SearchBarContainer = styled(Box)(({ theme, $focused }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: $focused 
    ? alpha(theme.palette.background.paper, 0.95)
    : alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5, 2),
  width: '100%',
  maxWidth: '400px',
  transition: 'all 0.3s ease',
  border: `1px solid ${$focused ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
  boxShadow: $focused ? theme.shadows[4] : 'none',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    borderColor: $focused ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.4),
  }
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: theme.shadows[3],
  }
}));

const GlowingBadge = styled(Badge)(({ theme, $active }) => ({
  '& .MuiBadge-dot': {
    backgroundColor: $active ? theme.palette.success.main : theme.palette.error.main,
    boxShadow: $active 
      ? `0 0 0 2px ${theme.palette.success.main}, 0 0 8px 2px ${alpha(theme.palette.success.main, 0.5)}`
      : `0 0 0 2px ${theme.palette.error.main}, 0 0 8px 2px ${alpha(theme.palette.error.main, 0.5)}`,
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px -4px ${alpha(theme.palette.common.black, 0.1)}`,
  },
  '&:hover .row-actions': {
    opacity: 1,
  }
}));

const FloatingActionButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  borderRadius: '50%',
  width: 64,
  height: 64,
  minWidth: 'auto',
  boxShadow: theme.shadows[8],
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: theme.shadows[12],
  }
}));

const departmentColors = {
  Engineering: '#3f51b5', Product: '#2196f3', Design: '#00bcd4', Marketing: '#ff9800',
  Sales: '#4caf50', 'Customer Success': '#8bc34a', Finance: '#cddc39', HR: '#ffc107',
  Operations: '#795548', Executive: '#607d8b', Other: '#9e9e9e',
};

const employmentTypeColors = {
  'Full-time': 'primary', 'Part-time': 'secondary', 'Contractor': 'info', 'Intern': 'warning', 'Advisor': 'default'
};

const statusColors = {
  Active: 'success', Former: 'error', 'Offer Extended': 'info', 'Interviewing': 'secondary', 'Open Requisition': 'warning'
};

// Initial form data structure based on HeadcountModel
const initialHeadcountFormData = {
  name: '',
  email: '',
  title: '',
  department: 'Engineering',
  reportingTo: null,
  level: 'Mid',
  status: 'Active',
  employmentType: 'Full-time',
  location: '',
  remoteStatus: 'Remote',
  startDate: null,
  endDate: null,
  requisitionOpenDate: null,
  targetHireDate: null,
  compensation: {
    baseSalary: 0,
    currency: 'INR',
    variableCompensation: 0,
    variableFrequency: 'Annually',
    equityPercentage: 0,
    equityVestingSchedule: '',
    benefits: 0,
    notes: '',
  },
  budgetTracking: {
    budgetedAnnualCost: 0,
    budgetCategory: null,
    budgetNotes: '',
  },
  hiringDetails: {
    requisitionId: '',
    hiringPriority: 'Medium',
    hiringStage: 'Not Started',
    numberOfCandidates: 0,
    interviewsCompleted: 0,
    recruiter: '',
  },
  notes: '',
  tags: [],
};

// Component for the searchbar with animation
const SearchBar = ({ onChange, value, onClear }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <SearchBarContainer $focused={focused}>
      <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
      <TextField
        variant="standard"
        placeholder="Search employees..."
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        fullWidth
        InputProps={{
          disableUnderline: true,
          endAdornment: value ? (
            <IconButton size="small" onClick={onClear}>
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : null
        }}
      />
    </SearchBarContainer>
  );
};

// Filter component with animations
const FilterPanel = ({ open, onClose, filters, setFilters, applyFilters }) => {
  const departmentOptions = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Customer Success', 'Finance', 'HR', 'Operations', 'Executive', 'Other'];
  const statusOptions = ['Active', 'Former', 'Offer Extended', 'Interviewing', 'Open Requisition'];
  const employmentTypeOptions = ['Full-time', 'Part-time', 'Contractor', 'Intern', 'Advisor'];
  
  return (
    <Collapse in={open} timeout={400}>
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: 4,
          animation: `${fadeIn} 0.4s ease-out`
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <FilterAltIcon sx={{ mr: 1 }} /> Filters
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department || ''}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                label="Department"
                displayEmpty
              >
                <MenuItem value="">All Departments</MenuItem>
                {departmentOptions.map(dept => (
                  <MenuItem key={dept} value={dept}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: departmentColors[dept], 
                          mr: 1.5 
                        }} 
                      />
                      {dept}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                label="Status"
                displayEmpty
              >
                <MenuItem value="">All Status</MenuItem>
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: theme => theme.palette[statusColors[status]].main, 
                          mr: 1.5 
                        }} 
                      />
                      {status}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Employment Type</InputLabel>
              <Select
                value={filters.employmentType || ''}
                onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
                label="Employment Type"
                displayEmpty
              >
                <MenuItem value="">All Types</MenuItem>
                {employmentTypeOptions.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker 
              label="Joined After" 
              value={filters.joinedAfter || null}
              onChange={(date) => setFilters({...filters, joinedAfter: date})}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>
        </Grid>
        
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<ClearIcon />}
            onClick={() => setFilters({})}
          >
            Clear Filters
          </Button>
          <Button 
            variant="contained"
            startIcon={<FilterAltIcon />}
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </Stack>
      </Paper>
    </Collapse>
  );
};

// HeadcountPage component
const HeadcountPage = () => {
  const theme = useTheme();
  const [headcounts, setHeadcounts] = useState([]);
  const [filteredHeadcounts, setFilteredHeadcounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form states
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingHeadcount, setEditingHeadcount] = useState(null);
  const [currentFormData, setCurrentFormData] = useState(JSON.parse(JSON.stringify(initialHeadcountFormData)));
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(0);

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedHeadcountForMenu, setSelectedHeadcountForMenu] = useState(null);

  // View states
  const [viewType, setViewType] = useState('table');
  const [tabValue, setTabValue] = useState(0);
  const [openFilterPanel, setOpenFilterPanel] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  // Available data for form dropdowns
  const [availableManagers, setAvailableManagers] = useState([]);
  const formDialogRef = useRef(null);

  // Form steps configuration
  const formSteps = [
    { label: 'Basic Info', icon: <PersonIcon /> },
    { label: 'Employment Details', icon: <BadgeIcon /> },
    { label: 'Compensation', icon: <AttachMoneyIcon /> },
    { label: 'Additional Details', icon: <DescriptionIcon /> }
  ];

  const fetchHeadcountData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const [summaryRes, headcountsRes] = await Promise.all([
        getHeadcountSummary(),
        getHeadcounts({ page: page + 1, limit: rowsPerPage })
      ]);

      if (summaryRes.data?.success) {
        setSummary(summaryRes.data.data);
      } else {
        setError(summaryRes.data?.msg || 'Failed to load summary data.');
      }

      if (headcountsRes.data?.success) {
        const data = headcountsRes.data.data || [];
        setHeadcounts(data);
        setFilteredHeadcounts(data);
      } else {
        setError(headcountsRes.data?.msg || 'Failed to load headcount list.');
      }
    } catch (err) {
      console.error("Error fetching headcount data:", err);
      setError(`Failed to load data: ${err.response?.data?.msg || err.message}`);
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setTimeout(() => setRefreshing(false), 600);
      }
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchHeadcountData();
    
    // Fetch managers for dropdown
    getHeadcounts({ limit: 1000 }).then(res => {
      if(res.data?.success) setAvailableManagers(res.data.data || []);
    }).catch(err => console.error("Failed to fetch managers for dropdown", err));
  }, [fetchHeadcountData]);

  // Apply filters and search
  useEffect(() => {
    if (headcounts.length) {
      let filtered = [...headcounts];
      
      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
          item.name?.toLowerCase().includes(query) || 
          item.email?.toLowerCase().includes(query) || 
          item.title?.toLowerCase().includes(query) ||
          item.department?.toLowerCase().includes(query)
        );
      }
      
      // Apply filters
      if (filters.department) {
        filtered = filtered.filter(item => item.department === filters.department);
      }
      
      if (filters.status) {
        filtered = filtered.filter(item => item.status === filters.status);
      }
      
      if (filters.employmentType) {
        filtered = filtered.filter(item => item.employmentType === filters.employmentType);
      }
      
      if (filters.joinedAfter) {
        filtered = filtered.filter(item => {
          if (!item.startDate) return false;
          return new Date(item.startDate) >= filters.joinedAfter;
        });
      }
      
      // Apply sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          // Handle nested properties like compensation.baseSalary
          const getNestedProperty = (obj, key) => {
            const keys = key.split('.');
            return keys.reduce((acc, curr) => (acc && acc[curr] !== undefined) ? acc[curr] : null, obj);
          };
          
          let aValue = getNestedProperty(a, sortConfig.key);
          let bValue = getNestedProperty(b, sortConfig.key);
          
          // Handle string comparison
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          // Handle date comparison
          if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
            aValue = aValue ? new Date(aValue) : new Date(0);
            bValue = bValue ? new Date(bValue) : new Date(0);
          }
          
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      setFilteredHeadcounts(filtered);
    }
  }, [headcounts, searchQuery, filters, sortConfig]);

  const handleMenuOpen = (event, headcount) => {
    setAnchorEl(event.currentTarget);
    setSelectedHeadcountForMenu(headcount);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedHeadcountForMenu(null);
  };

  const handleOpenCreateDialog = () => {
    setEditingHeadcount(null);
    setCurrentFormData(JSON.parse(JSON.stringify(initialHeadcountFormData)));
    setFormErrors({});
    setFormStep(0);
    setOpenFormDialog(true);
  };

  const handleOpenEditDialog = (headcount) => {
    handleMenuClose();
    setEditingHeadcount(headcount);
    // Map headcount data to form data, handling nested structures and dates
    setCurrentFormData({
      ...initialHeadcountFormData, // Start with defaults
      ...headcount, // Override with existing data
      startDate: headcount.startDate ? new Date(headcount.startDate) : null,
      endDate: headcount.endDate ? new Date(headcount.endDate) : null,
      requisitionOpenDate: headcount.requisitionOpenDate ? new Date(headcount.requisitionOpenDate) : null,
      targetHireDate: headcount.targetHireDate ? new Date(headcount.targetHireDate) : null,
      compensation: { // Ensure nested objects are fully spread or initialized
        ...initialHeadcountFormData.compensation,
        ...(headcount.compensation || {}),
      },
      hiringDetails: {
        ...initialHeadcountFormData.hiringDetails,
        ...(headcount.hiringDetails || {}),
      },
      reportingTo: headcount.reportingTo?._id || headcount.reportingTo || null,
      budgetTracking: {
        ...initialHeadcountFormData.budgetTracking,
        ...(headcount.budgetTracking || {}),
        budgetCategory: headcount.budgetTracking?.budgetCategory?._id || headcount.budgetTracking?.budgetCategory || null,
      }
    });
    setFormErrors({});
    setFormStep(0);
    setOpenFormDialog(true);
  };

  const handleDeleteHeadcount = (headcount) => {
    handleMenuClose();
    setConfirmDelete(headcount);
  };

  const confirmDeleteHeadcount = async () => {
    if (!confirmDelete) return;
    
    setIsSubmitting(true);
    try {
      await deleteHeadcount(confirmDelete._id);
      setSuccess(`${confirmDelete.name} has been deleted successfully.`);
      fetchHeadcountData();
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting headcount:", err);
      setError(`Failed to delete entry: ${err.response?.data?.msg || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormDialogClose = () => {
    setOpenFormDialog(false);
    setEditingHeadcount(null);
    setCurrentFormData(JSON.parse(JSON.stringify(initialHeadcountFormData)));
    setFormErrors({});
    setFormStep(0);
  };

  const handleFormInputChange = (event, path) => {
    const { name, value, type, checked } = event.target;
    const val = type === 'checkbox' ? checked : value;
  
    setCurrentFormData(prev => {
      const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
      let currentLevel = newState;
      if (path && typeof path === 'string') { // For nested fields like compensation.baseSalary
        const keys = path.split('.');
        for (let i = 0; i < keys.length - 1; i++) {
          currentLevel = currentLevel[keys[i]];
        }
        currentLevel[keys[keys.length - 1]] = val;
        
        // If compensation field was updated, recalculate totalAnnualCost
        if (path.startsWith('compensation.')) {
          newState.compensation.totalAnnualCost = calculateTotalAnnualCost(newState.compensation);
          
          // Update budget variance if applicable
          if (newState.budgetTracking?.budgetedAnnualCost != null) {
            newState.budgetTracking.actualVsBudgetVariance = 
              newState.budgetTracking.budgetedAnnualCost - newState.compensation.totalAnnualCost;
          }
        }
      } else {
        newState[name] = val;
      }
      return newState;
    });
  };
  
  const handleDateChange = (name, date, path) => {
    setCurrentFormData(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      if (path && typeof path === 'string') {
        const keys = path.split('.');
        let currentLevel = newState;
        for (let i = 0; i < keys.length - 1; i++) {
          currentLevel = currentLevel[keys[i]];
        }
        currentLevel[keys[keys.length - 1]] = date ? date.toISOString() : null;
      } else {
        newState[name] = date ? date.toISOString() : null;
      }
      return newState;
    });
  };

  const validateHeadcountForm = (stepIndex = null) => {
    const errors = {};
    
    // Validate basic info (step 0)
    if (stepIndex === null || stepIndex === 0) {
      if (!currentFormData.name?.trim()) errors.name = "Name is required.";
      if (!currentFormData.title?.trim()) errors.title = "Title is required.";
      if (!currentFormData.department) errors.department = "Department is required.";
      if (currentFormData.email && !/\S+@\S+\.\S+/.test(currentFormData.email)) {
        errors.email = "Email is invalid.";
      }
    }
    
    // Validate employment details (step 1)
    if (stepIndex === null || stepIndex === 1) {
      if (!currentFormData.status) errors.status = "Status is required.";
      if (!currentFormData.employmentType) errors.employmentType = "Employment type is required.";
      if (currentFormData.status === 'Active' && !currentFormData.startDate) {
        errors.startDate = "Start date is required for active employees.";
      }
      if (currentFormData.status === 'Former' && !currentFormData.endDate) {
        errors.endDate = "End date is required for former employees.";
      }
    }
    
    // Validate compensation (step 2)
    if (stepIndex === null || stepIndex === 2) {
      if (currentFormData.compensation?.baseSalary === undefined || currentFormData.compensation?.baseSalary < 0) {
        errors.baseSalary = "Base salary must be a positive number.";
      }
      if (!currentFormData.compensation?.currency) {
        errors.currency = "Currency is required.";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateHeadcountForm(formStep)) {
      setFormStep(prev => Math.min(prev + 1, formSteps.length - 1));
    }
  };

  const handlePrevStep = () => {
    setFormStep(prev => Math.max(prev - 1, 0));
  };

  const handleFormSubmit = async () => {
    if (!validateHeadcountForm()) return;
    
    setIsSubmitting(true);
    try {
      const payload = { ...currentFormData };
      
      // ========== ADDED CODE START ==========
      // Calculate totalAnnualCost before sending to backend
      if (payload.compensation) {
        const baseSalary = payload.compensation.baseSalary || 0;
        const variableCompensation = payload.compensation.variableCompensation || 0;
        const monthlyBenefits = payload.compensation.benefits || 0;
        
        // Calculate total annual cost
        payload.compensation.totalAnnualCost = baseSalary + variableCompensation + (monthlyBenefits * 12);
        
        // Also calculate budget variance if applicable
        if (payload.budgetTracking && payload.budgetTracking.budgetedAnnualCost != null) {
          payload.budgetTracking.actualVsBudgetVariance = 
            payload.budgetTracking.budgetedAnnualCost - payload.compensation.totalAnnualCost;
        }
      }
      // ========== ADDED CODE END ==========
      
      // Ensure dates are correctly formatted if not already ISO strings
      if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
      if (payload.endDate) payload.endDate = new Date(payload.endDate).toISOString();
      if (payload.requisitionOpenDate) payload.requisitionOpenDate = new Date(payload.requisitionOpenDate).toISOString();
      if (payload.targetHireDate) payload.targetHireDate = new Date(payload.targetHireDate).toISOString();
  
      if (editingHeadcount) {
        await updateHeadcount(editingHeadcount._id, payload);
        setSuccess(`${payload.name} has been updated successfully.`);
      } else {
        await createHeadcount(payload);
        setSuccess(`${payload.name} has been added successfully.`);
      }
      handleFormDialogClose();
      fetchHeadcountData();
    } catch (err) {
      console.error("Error saving headcount:", err);
      const apiError = err.response?.data?.msg || err.message;
      setError(`Failed to save entry: ${apiError}`);
      setFormErrors(prev => ({...prev, _submission: apiError }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const applyFilters = () => {
    setOpenFilterPanel(false);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setOpenFilterPanel(false);
  };

  const handleRefresh = () => {
    fetchHeadcountData(true);
  };

  // Options for dropdowns
  const departmentOptions = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Customer Success', 'Finance', 'HR', 'Operations', 'Executive', 'Other'];
  const statusOptions = ['Active', 'Former', 'Offer Extended', 'Interviewing', 'Open Requisition'];
  const employmentTypeOptions = ['Full-time', 'Part-time', 'Contractor', 'Intern', 'Advisor'];
  const levelOptions = ['Intern', 'Entry', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'VP', 'C-Suite', 'Founder'];
  const remoteStatusOptions = ['Remote', 'Hybrid', 'In-office'];
  const currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];
  const variableFrequencyOptions = ['Monthly', 'Quarterly', 'Annually', 'One-time'];
  const hiringPriorityOptions = ['Critical', 'High', 'Medium', 'Low'];
  const hiringStageOptions = ['Not Started', 'Sourcing', 'Screening', 'Interviewing', 'Offer Stage', 'Closed'];

  // Helper to get current view based on tabs
  const getCurrentView = () => {
    switch (tabValue) {
      case 0: // All
        return filteredHeadcounts;
      case 1: // Active
        return filteredHeadcounts.filter(h => h.status === 'Active');
      case 2: // Hiring
        return filteredHeadcounts.filter(h => ['Open Requisition', 'Interviewing', 'Offer Extended'].includes(h.status));
      case 3: // Former
        return filteredHeadcounts.filter(h => h.status === 'Former');
      default:
        return filteredHeadcounts;
    }
  };

  const currentViewData = getCurrentView();
  const paginatedData = currentViewData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <EventAvailableIcon />;
      case 'Former': return <PersonOffIcon />;
      case 'Open Requisition': return <HourglassTopIcon />;
      case 'Interviewing': return <GroupAddIcon />;
      case 'Offer Extended': return <PersonIcon />;
      default: return <HourglassTopIcon />;
    }
  };

  // Render card view item
  const renderHeadcountCard = (item) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          sx={{ 
            p: 2.5, 
            borderRadius: 2, 
            boxShadow: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
            }
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
            <GlowingBadge
              overlap="circular"
              variant="dot"
              $active={item.status === 'Active'}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <AnimatedAvatar 
                sx={{ 
                  bgcolor: alpha(departmentColors[item.department] || theme.palette.grey[500], 0.2),
                  color: departmentColors[item.department] || theme.palette.text.secondary,
                  width: 56, 
                  height: 56,
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {item.name?.charAt(0).toUpperCase()}
              </AnimatedAvatar>
            </GlowingBadge>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {item.title}
              </Typography>
              <Chip 
                label={item.department} 
                size="small" 
                sx={{
                  bgcolor: alpha(departmentColors[item.department] || theme.palette.grey[500], 0.1),
                  color: departmentColors[item.department] || theme.palette.text.primary,
                  fontWeight: 500,
                  borderRadius: '6px'
                }} 
              />
            </Box>
            <IconButton 
              size="small" 
              onClick={(e) => handleMenuOpen(e, item)}
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'rotate(90deg)' } 
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>
          
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={1.5} sx={{ mb: 2, flexGrow: 1 }}>
            {item.email && (
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.email}
                </Typography>
              </Stack>
            )}
            
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {item.startDate ? `Joined: ${formatDate(item.startDate)}` : 'Start date not set'}
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <PublicIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {item.location || item.remoteStatus || 'Location not set'}
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <LocalAtmIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {item.compensation?.totalAnnualCost 
                  ? `₹${(item.compensation.totalAnnualCost).toLocaleString()}/year`
                  : 'Compensation not set'
                }
              </Typography>
            </Stack>
          </Stack>
          
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Chip 
              icon={getStatusIcon(item.status)}
              label={item.status} 
              size="small" 
              color={statusColors[item.status] || 'default'} 
              sx={{ fontWeight: 500, borderRadius: '6px' }} 
            />
            
            <Chip 
              label={item.employmentType} 
              size="small" 
              variant="outlined" 
              color={employmentTypeColors[item.employmentType] || 'default'} 
              sx={{ fontWeight: 500, borderRadius: '6px' }} 
            />
          </Stack>
        </Card>
      </motion.div>
    </Grid>
  );

  // Helper function to determine if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0 || searchQuery;
  }, [filters, searchQuery]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${alpha(theme.palette.secondary.dark, 0.05)} 100%)`, 
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
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              zIndex: 0
            }
          }}
        >
          <Container maxWidth="xl">
            <Breadcrumbs 
              separator={<KeyboardArrowRightIcon fontSize="small" />} 
              aria-label="breadcrumb"
              sx={{ mb: 2 }}
            >
              <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Dashboard
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleOutlineIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Headcount Management
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
                    color: 'primary.contrastText', 
                    mb: 1, 
                    display: 'flex', 
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  <PeopleOutlineIcon sx={{ mr: 1.5, fontSize: '2.5rem' }} />
                  Headcount Management
                  <Box 
                    component="span" 
                    sx={{ 
                      position: 'absolute',
                      top: -12,
                      right: -20,
                      color: theme.palette.secondary.main,
                      fontWeight: 700,
                      fontSize: '1rem',
                      transform: 'rotate(12deg)',
                      opacity: 0.8,
                      display: { xs: 'none', md: 'block' }
                    }}
                  >
                    <LightbulbIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                    Smart tracking
                  </Box>
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{
                    color: alpha(theme.palette.primary.contrastText, 0.8),
                    maxWidth: 600,
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  Oversee your team, open requisitions, and manage personnel costs with real-time insights and analytics.
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Tooltip title="Refresh data">
                  <IconButton 
                    onClick={handleRefresh}
                    color="primary"
                    sx={{ 
                      animation: refreshing ? `${pulseAnimation} 1s infinite` : 'none',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={handleOpenCreateDialog}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    fontWeight: 600, 
                    boxShadow: 3, 
                    py: 1.2, 
                    px: 2.5, 
                    bgcolor: 'secondary.main', 
                    '&:hover': { 
                      bgcolor: 'secondary.dark',
                      transform: 'translateY(-2px)',
                      boxShadow: 5,
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Add Headcount
                </Button>
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

          {/* Summary Metrics */}
          {loading && !summary ? (
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                  <Skeleton 
                    variant="rectangular" 
                    height={120} 
                    sx={{
                      borderRadius: 2,
                      animation: `${shimmer} 2s infinite linear`,
                      backgroundImage: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.2)} 20%, ${alpha(theme.palette.background.paper, 0.1)} 40%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
                      backgroundSize: '1000px 100%',
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : summary && (
            <Grow in timeout={500}>
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricDisplayCard color="primary">
                    <AnimatedAvatar className="metric-icon"><PeopleOutlineIcon /></AnimatedAvatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{summary.totalHeadcount || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Active Headcount</Typography>
                  </MetricDisplayCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricDisplayCard color="info" $pulse={summary.openPositions > 0}>
                    <AnimatedAvatar className="metric-icon"><HourglassTopIcon /></AnimatedAvatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{summary.openPositions || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Open Requisitions</Typography>
                  </MetricDisplayCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricDisplayCard color="success">
                    <AnimatedAvatar className="metric-icon"><AttachMoneyIcon /></AnimatedAvatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>₹{(summary.annualCost || 0).toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Annual Cost</Typography>
                  </MetricDisplayCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricDisplayCard color="secondary">
                    <AnimatedAvatar className="metric-icon"><BusinessIcon /></AnimatedAvatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{summary.departmentBreakdown?.length || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Active Departments</Typography>
                  </MetricDisplayCard>
                </Grid>
              </Grid>
            </Grow>
          )}

          {/* Search and Filters */}
          <GlassCard sx={{ mb: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <SearchBar 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                  />
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
                    <Button
                      startIcon={<FilterAltIcon />}
                      variant={hasActiveFilters ? "contained" : "outlined"}
                      color={hasActiveFilters ? "primary" : "inherit"}
                      onClick={() => setOpenFilterPanel(!openFilterPanel)}
                      sx={{ borderRadius: 2 }}
                    >
                      Filters {hasActiveFilters ? `(${Object.keys(filters).length + (searchQuery ? 1 : 0)})` : ''}
                    </Button>
                    
                    <Button
                      startIcon={<SortIcon />}
                      variant="outlined"
                      color="inherit"
                      sx={{ borderRadius: 2 }}
                    >
                      Sort
                    </Button>
                    
                    <ToggleButtonGroup
                      value={viewType}
                      exclusive
                      onChange={(e, newValue) => newValue && setViewType(newValue)}
                      aria-label="view type"
                      size="small"
                    >
                      <ToggleButton value="table" aria-label="table view">
                        <ViewListIcon />
                      </ToggleButton>
                      <ToggleButton value="grid" aria-label="grid view">
                        <GridViewIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </GlassCard>
          
          {/* Filter Panel */}
          <FilterPanel 
            open={openFilterPanel}
            onClose={() => setOpenFilterPanel(false)}
            filters={filters}
            setFilters={setFilters}
            applyFilters={applyFilters}
          />
          
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Active Filters:
                </Typography>
                
                {searchQuery && (
                  <Chip 
                    label={`Search: "${searchQuery}"`}
                    size="small"
                    onDelete={() => setSearchQuery('')}
                    sx={{ borderRadius: 1.5 }}
                  />
                )}
                
                {filters.department && (
                  <Chip 
                    label={`Department: ${filters.department}`}
                    size="small"
                    onDelete={() => setFilters({...filters, department: ''})}
                    sx={{ borderRadius: 1.5 }}
                  />
                )}
                
                {filters.status && (
                  <Chip 
                    label={`Status: ${filters.status}`}
                    size="small"
                    onDelete={() => setFilters({...filters, status: ''})}
                    sx={{ borderRadius: 1.5 }}
                  />
                )}
                
                {filters.employmentType && (
                  <Chip 
                    label={`Type: ${filters.employmentType}`}
                    size="small"
                    onDelete={() => setFilters({...filters, employmentType: ''})}
                    sx={{ borderRadius: 1.5 }}
                  />
                )}
                
                {filters.joinedAfter && (
                  <Chip 
                    label={`Joined After: ${formatDate(filters.joinedAfter)}`}
                    size="small"
                    onDelete={() => setFilters({...filters, joinedAfter: null})}
                    sx={{ borderRadius: 1.5 }}
                  />
                )}
                
                <Button 
                  variant="text" 
                  color="inherit" 
                  size="small" 
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              </Stack>
            </Box>
          )}

          {/* Content Tabs */}
          <GlassCard sx={{ mb: { xs: 10, sm: 6 } }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, v) => setTabValue(v)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="headcount tabs"
              >
                <Tab 
                  icon={<PeopleOutlineIcon />} 
                  iconPosition="start" 
                  label={`All (${filteredHeadcounts.length})`} 
                  sx={{ textTransform: 'none', py: 2 }}
                />
                <Tab 
                  icon={<EventAvailableIcon />} 
                  iconPosition="start" 
                  label={`Active (${filteredHeadcounts.filter(h => h.status === 'Active').length})`} 
                  sx={{ textTransform: 'none', py: 2 }}
                />
                <Tab 
                  icon={<HourglassTopIcon />} 
                  iconPosition="start" 
                  label={`Hiring (${filteredHeadcounts.filter(h => ['Open Requisition', 'Interviewing', 'Offer Extended'].includes(h.status)).length})`} 
                  sx={{ textTransform: 'none', py: 2 }}
                />
                <Tab 
                  icon={<PersonOffIcon />} 
                  iconPosition="start" 
                  label={`Former (${filteredHeadcounts.filter(h => h.status === 'Former').length})`} 
                  sx={{ textTransform: 'none', py: 2 }}
                />
              </Tabs>
            </Box>
            
            <CardContent sx={{ p: 0 }}>
              {/* Loading State */}
              {loading && !refreshing && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading headcount data...
                  </Typography>
                </Box>
              )}
              
              {/* Empty State */}
              {!loading && currentViewData.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <AnimatedAvatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      margin: '0 auto', 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mb: 2
                    }}
                  >
                    <PeopleOutlineIcon sx={{ fontSize: 40 }} />
                  </AnimatedAvatar>
                  <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
                    No headcount entries found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    {hasActiveFilters 
                      ? 'Try adjusting your filters or search query to see more results.'
                      : 'Add your first headcount entry to get started with managing your team.'}
                  </Typography>
                  {hasActiveFilters ? (
                    <Button 
                      variant="outlined" 
                      startIcon={<ClearIcon />}
                      onClick={clearFilters}
                      sx={{ borderRadius: 2, mr: 2 }}
                    >
                      Clear Filters
                    </Button>
                  ) : null}
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenCreateDialog}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Headcount
                  </Button>
                </Box>
              )}
              
              {/* Refresh Indicator */}
              {refreshing && (
                <Box sx={{ width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
                  <LinearProgress color="secondary" />
                </Box>
              )}
              
              {/* Table View */}
              {!loading && currentViewData.length > 0 && viewType === 'table' && (
                <>
                  <TableContainer sx={{ position: 'relative' }}>
                    <Table stickyHeader aria-label="headcount table">
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleSort('name')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              Name
                              {sortConfig.key === 'name' && (
                                sortConfig.direction === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleSort('title')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              Title
                              {sortConfig.key === 'title' && (
                                sortConfig.direction === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleSort('department')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              Department
                              {sortConfig.key === 'department' && (
                                sortConfig.direction === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleSort('status')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              Status
                              {sortConfig.key === 'status' && (
                                sortConfig.direction === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleSort('employmentType')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              Type
                              {sortConfig.key === 'employmentType' && (
                                sortConfig.direction === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleSort('startDate')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              Start Date
                              {sortConfig.key === 'startDate' && (
                                sortConfig.direction === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => handleSort('compensation.totalAnnualCost')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              Annual Cost
                              {sortConfig.key === 'compensation.totalAnnualCost' && (
                                sortConfig.direction === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <AnimatePresence>
                          {paginatedData.map((item) => (
                            <StyledTableRow hover key={item._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell component="th" scope="row">
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <GlowingBadge
                                    overlap="circular"
                                    variant="dot"
                                    $active={item.status === 'Active'}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  >
                                    <AnimatedAvatar sx={{ 
                                      bgcolor: alpha(departmentColors[item.department] || theme.palette.grey[500], 0.2), 
                                      color: departmentColors[item.department] || theme.palette.text.secondary, 
                                      width: 36, 
                                      height: 36, 
                                      fontSize: '0.9rem',
                                      fontWeight: 'bold'
                                    }}>
                                      {item.name?.charAt(0).toUpperCase()}
                                    </AnimatedAvatar>
                                  </GlowingBadge>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{fontWeight: 500}}>{item.name}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">{item.email || 'N/A'}</Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>{item.title}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={item.department} 
                                  size="small" 
                                  sx={{
                                    bgcolor: alpha(departmentColors[item.department] || theme.palette.grey[500], 0.1),
                                    color: departmentColors[item.department] || theme.palette.text.primary,
                                    fontWeight: 500,
                                    borderRadius: '6px'
                                  }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  icon={getStatusIcon(item.status)}
                                  label={item.status} 
                                  size="small" 
                                  color={statusColors[item.status] || 'default'} 
                                  sx={{ fontWeight: 500, borderRadius: '6px' }} 
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={item.employmentType} 
                                  size="small" 
                                  variant="outlined" 
                                  color={employmentTypeColors[item.employmentType] || 'default'} 
                                  sx={{ fontWeight: 500, borderRadius: '6px' }} 
                                />
                              </TableCell>
                              <TableCell align="right">{item.startDate ? formatDate(item.startDate) : 'N/A'}</TableCell>
                              <TableCell align="right">₹{(item.compensation?.totalAnnualCost || 0).toLocaleString()}</TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center" className="row-actions" sx={{ opacity: { xs: 1, md: 0 }, transition: 'opacity 0.2s ease' }}>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => handleOpenEditDialog(item)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" color="error" onClick={() => handleDeleteHeadcount(item)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="More Options">
                                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </StyledTableRow>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={currentViewData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
              
              {/* Grid View */}
              {!loading && currentViewData.length > 0 && viewType === 'grid' && (
                <>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {paginatedData.map((item) => renderHeadcountCard(item))}
                    </Grid>
                  </Box>
                  
                  <TablePagination
                    rowsPerPageOptions={[8, 16, 32, 64]}
                    component="div"
                    count={currentViewData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </CardContent>
          </GlassCard>
        </Container>

        {/* Mobile Add Button */}
        <FloatingActionButton
          color="secondary"
          aria-label="add headcount"
          onClick={handleOpenCreateDialog}
          sx={{ display: { md: 'none' } }}
        >
          <AddIcon />
        </FloatingActionButton>

        {/* Form Dialog */}
        <Dialog 
          open={openFormDialog} 
          onClose={handleFormDialogClose} 
          maxWidth="md" 
          fullWidth 
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'visible',
              boxShadow: 24
            }
          }}
          TransitionComponent={Grow}
          TransitionProps={{ timeout: 400 }}
          ref={formDialogRef}
        >
          <DialogTitle 
            sx={{ 
              pb: 1, 
              fontWeight: 700, 
              fontSize: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {editingHeadcount ? <EditIcon sx={{ mr: 1.5 }} /> : <AddIcon sx={{ mr: 1.5 }} />}
              {editingHeadcount ? 'Edit Headcount Entry' : 'Add New Headcount Entry'}
            </Box>
            <IconButton onClick={handleFormDialogClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <Box sx={{ px: 3, pb: 2 }}>
            <Stepper steps={formSteps} activeStep={formStep} />
          </Box>
          
          <DialogContent dividers sx={{ '& .MuiGrid-item': {pt: '12px !important'} }}>
            <Box sx={{ display: formStep === 0 ? 'block' : 'none' }}>
              {/* Basic Info */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="name" 
                    label="Full Name" 
                    fullWidth 
                    value={currentFormData.name} 
                    onChange={handleFormInputChange} 
                    error={!!formErrors.name} 
                    helperText={formErrors.name} 
                    size="small" 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="email" 
                    label="Email Address" 
                    fullWidth 
                    value={currentFormData.email} 
                    onChange={handleFormInputChange} 
                    error={!!formErrors.email} 
                    helperText={formErrors.email} 
                    size="small" 
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="title" 
                    label="Job Title" 
                    fullWidth 
                    value={currentFormData.title} 
                    onChange={handleFormInputChange} 
                    error={!!formErrors.title} 
                    helperText={formErrors.title} 
                    size="small" 
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><BadgeIcon fontSize="small" /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.department} size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department"
                      value={currentFormData.department}
                      label="Department"
                      onChange={handleFormInputChange}
                      startAdornment={<InputAdornment position="start"><BusinessIcon fontSize="small" /></InputAdornment>}
                    >
                      {departmentOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: departmentColors[opt], 
                                mr: 1.5 
                              }} 
                            />
                            {opt}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formErrors.department}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={availableManagers.filter(m => m._id !== editingHeadcount?._id)}
                    getOptionLabel={(option) => option.name || ''}
                    value={availableManagers.find(m => m._id === currentFormData.reportingTo) || null}
                    onChange={(event, newValue) => handleFormInputChange({target: {name: 'reportingTo', value: newValue?._id || null}})}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Reporting To (Manager)" 
                        fullWidth 
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <AccountTreeIcon fontSize="small" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.level} size="small">
                    <InputLabel>Level</InputLabel>
                    <Select
                      name="level"
                      value={currentFormData.level}
                      label="Level"
                      onChange={handleFormInputChange}
                      startAdornment={<InputAdornment position="start"><TrendingUpIcon fontSize="small" /></InputAdornment>}
                    >
                      {levelOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ display: formStep === 1 ? 'block' : 'none' }}>
              {/* Employment Details */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={!!formErrors.status} size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={currentFormData.status}
                      label="Status"
                      onChange={handleFormInputChange}
                      startAdornment={<InputAdornment position="start">{getStatusIcon(currentFormData.status)}</InputAdornment>}
                    >
                      {statusOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: theme => theme.palette[statusColors[opt]].main, 
                                mr: 1.5 
                              }} 
                            />
                            {opt}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formErrors.status}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={!!formErrors.employmentType} size="small">
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      name="employmentType"
                      value={currentFormData.employmentType}
                      label="Employment Type"
                      onChange={handleFormInputChange}
                      startAdornment={<InputAdornment position="start"><WorkOutlineIcon fontSize="small" /></InputAdornment>}
                    >
                      {employmentTypeOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                    <FormHelperText>{formErrors.employmentType}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Remote Status</InputLabel>
                    <Select
                      name="remoteStatus"
                      value={currentFormData.remoteStatus}
                      label="Remote Status"
                      onChange={handleFormInputChange}
                      startAdornment={<InputAdornment position="start"><PublicIcon fontSize="small" /></InputAdornment>}
                    >
                      {remoteStatusOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    name="location" 
                    label="Location (City, Country)" 
                    fullWidth 
                    value={currentFormData.location} 
                    onChange={handleFormInputChange} 
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><HomeIcon fontSize="small" /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker 
                    label="Start Date" 
                    value={currentFormData.startDate ? new Date(currentFormData.startDate) : null} 
                    onChange={(date) => handleDateChange('startDate', date)} 
                    slotProps={{
                      textField: {
                        fullWidth: true, 
                        size: 'small',
                        error: !!formErrors.startDate,
                        helperText: formErrors.startDate,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }
                      }
                    }} 
                  />
                </Grid>
                {currentFormData.status === 'Former' && (
                  <Grid item xs={12} sm={6}>
                    <DatePicker 
                      label="End Date" 
                      value={currentFormData.endDate ? new Date(currentFormData.endDate) : null} 
                      onChange={(date) => handleDateChange('endDate', date)} 
                      slotProps={{
                        textField: {
                          fullWidth: true, 
                          size: 'small',
                          error: !!formErrors.endDate,
                          helperText: formErrors.endDate,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarTodayIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }
                        }
                      }} 
                    />
                  </Grid>
                )}
                {['Open Requisition', 'Interviewing', 'Offer Extended'].includes(currentFormData.status) && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <DatePicker 
                        label="Requisition Open Date" 
                        value={currentFormData.requisitionOpenDate ? new Date(currentFormData.requisitionOpenDate) : null} 
                        onChange={(date) => handleDateChange('requisitionOpenDate', date)} 
                        slotProps={{textField: {fullWidth: true, size: 'small'}}}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker 
                        label="Target Hire Date" 
                        value={currentFormData.targetHireDate ? new Date(currentFormData.targetHireDate) : null} 
                        onChange={(date) => handleDateChange('targetHireDate', date)} 
                        slotProps={{textField: {fullWidth: true, size: 'small'}}}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
            
            <Box sx={{ display: formStep === 2 ? 'block' : 'none' }}>
  {/* Compensation */}
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6} md={4}>
      <TextField 
        name="baseSalary" 
        label="Base Salary (Annual)" 
        type="number" 
        fullWidth 
        value={currentFormData.compensation.baseSalary} 
        onChange={(e) => handleFormInputChange(e, 'compensation.baseSalary')} 
        error={!!formErrors.baseSalary} 
        helperText={formErrors.baseSalary} 
        size="small"
        InputProps={{
          startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small" /></InputAdornment>,
        }}
      />
    </Grid>
    <Grid item xs={12} sm={6} md={2}>
      <FormControl fullWidth size="small" error={!!formErrors.currency}>
        <InputLabel>Currency</InputLabel>
        <Select
          name="currency"
          value={currentFormData.compensation.currency}
          label="Currency"
          onChange={(e) => handleFormInputChange(e, 'compensation.currency')}
        >
          {currencyOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </Select>
        <FormHelperText>{formErrors.currency}</FormHelperText>
      </FormControl>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <TextField 
        name="variableCompensation" 
        label="Variable (Annual)" 
        type="number" 
        fullWidth 
        value={currentFormData.compensation.variableCompensation} 
        onChange={(e) => handleFormInputChange(e, 'compensation.variableCompensation')} 
        size="small"
        InputProps={{
          startAdornment: <InputAdornment position="start"><LocalAtmIcon fontSize="small" /></InputAdornment>,
        }}
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <FormControl fullWidth size="small">
        <InputLabel>Variable Freq.</InputLabel>
        <Select
          name="variableFrequency"
          value={currentFormData.compensation.variableFrequency}
          label="Variable Freq."
          onChange={(e) => handleFormInputChange(e, 'compensation.variableFrequency')}
        >
          {variableFrequencyOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <TextField 
        name="equityPercentage" 
        label="Equity (%)" 
        type="number" 
        fullWidth 
        value={currentFormData.compensation.equityPercentage} 
        onChange={(e) => handleFormInputChange(e, 'compensation.equityPercentage')} 
        size="small"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={6}>
      <TextField 
        name="equityVestingSchedule" 
        label="Vesting Schedule" 
        fullWidth 
        value={currentFormData.compensation.equityVestingSchedule} 
        onChange={(e) => handleFormInputChange(e, 'compensation.equityVestingSchedule')} 
        size="small"
      />
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <TextField 
        name="benefits" 
        label="Benefits (Monthly Cost)" 
        type="number" 
        fullWidth 
        value={currentFormData.compensation.benefits} 
        onChange={(e) => handleFormInputChange(e, 'compensation.benefits')} 
        size="small"
      />
    </Grid>
    <Grid item xs={12}>
      <TextField 
        name="notes" 
        label="Compensation Notes" 
        fullWidth 
        multiline 
        rows={2} 
        value={currentFormData.compensation.notes} 
        onChange={(e) => handleFormInputChange(e, 'compensation.notes')} 
        size="small"
      />
    </Grid>
    
    {/* ========== ADD THIS NEW SECTION ========== */}
    <Grid item xs={12}>
      <Divider sx={{ my: 2 }} />
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgcolor: theme.palette.primary.main,
            opacity: 0.8
          }
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="primary" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EqualizerIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
              Calculated Total Annual Cost
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
              {currentFormData.compensation?.currency || 'INR'} {((currentFormData.compensation?.baseSalary || 0) + (currentFormData.compensation?.variableCompensation || 0) + ((currentFormData.compensation?.benefits || 0) * 12)).toLocaleString('en-IN')}
            </Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Typography variant="caption" color="text.secondary">
                <strong>Base:</strong> {(currentFormData.compensation?.baseSalary || 0).toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Variable:</strong> {(currentFormData.compensation?.variableCompensation || 0).toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Benefits (Annual):</strong> {((currentFormData.compensation?.benefits || 0) * 12).toLocaleString('en-IN')}
              </Typography>
            </Stack>
          </Box>
          
          {/* Monthly breakdown */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Monthly Equivalent
            </Typography>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {currentFormData.compensation?.currency || 'INR'} {Math.round(((currentFormData.compensation?.baseSalary || 0) + (currentFormData.compensation?.variableCompensation || 0) + ((currentFormData.compensation?.benefits || 0) * 12)) / 12).toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Grid>
    {/* ========== END OF NEW SECTION ========== */}
    
  </Grid>
</Box>
            
            <Box sx={{ display: formStep === 3 ? 'block' : 'none' }}>
              {/* Additional Details */}
              <Grid container spacing={2}>
                {['Open Requisition', 'Interviewing', 'Offer Extended'].includes(currentFormData.status) && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Hiring Details
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField 
                        name="requisitionId" 
                        label="Requisition ID" 
                        fullWidth 
                        value={currentFormData.hiringDetails.requisitionId} 
                        onChange={(e) => handleFormInputChange(e, 'hiringDetails.requisitionId')} 
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Hiring Priority</InputLabel>
                        <Select
                          name="hiringPriority"
                          value={currentFormData.hiringDetails.hiringPriority}
                          label="Hiring Priority"
                          onChange={(e) => handleFormInputChange(e, 'hiringDetails.hiringPriority')}
                        >
                          {hiringPriorityOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Hiring Stage</InputLabel>
                        <Select
                          name="hiringStage"
                          value={currentFormData.hiringDetails.hiringStage}
                          label="Hiring Stage"
                          onChange={(e) => handleFormInputChange(e, 'hiringDetails.hiringStage')}
                        >
                          {hiringStageOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField 
                        name="recruiter" 
                        label="Recruiter" 
                        fullWidth 
                        value={currentFormData.hiringDetails.recruiter} 
                        onChange={(e) => handleFormInputChange(e, 'hiringDetails.recruiter')} 
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Additional Notes
                  </Typography>
                  <TextField 
                    name="notes" 
                    label="General Notes" 
                    fullWidth 
                    multiline 
                    rows={4} 
                    value={currentFormData.notes} 
                    onChange={handleFormInputChange} 
                    size="small"
                    placeholder="Add any additional information about this employee..."
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 2.5, pt: 2 }}>
            {formStep > 0 && (
              <Button onClick={handlePrevStep} startIcon={<KeyboardArrowRightIcon sx={{ transform: 'rotate(180deg)' }} />}>
                Back
              </Button>
            )}
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleFormDialogClose}>Cancel</Button>
            {formStep < formSteps.length - 1 ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNextStep}
                endIcon={<KeyboardArrowRightIcon />}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleFormSubmit} 
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit"/> : <DoneIcon />}
              >
                {isSubmitting ? 'Saving...' : (editingHeadcount ? 'Update Entry' : 'Create Entry')}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Action Menu for Table Rows */}
        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: 5,
              minWidth: 180
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleOpenEditDialog(selectedHeadcountForMenu)}>
            <EditIcon fontSize="small" sx={{mr: 1.5}}/> Edit
          </MenuItem>
          <MenuItem onClick={() => handleDeleteHeadcount(selectedHeadcountForMenu)} sx={{color: 'error.main'}}>
            <DeleteIcon fontSize="small" sx={{mr: 1.5}}/> Delete
          </MenuItem>
          <Divider />
          <MenuItem>
            <VisibilityIcon fontSize="small" sx={{mr: 1.5}}/> View Details
          </MenuItem>
          <MenuItem>
            <CopyAllIcon fontSize="small" sx={{mr: 1.5}}/> Duplicate
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={!!confirmDelete} 
          onClose={() => setConfirmDelete(null)}
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
            <Typography variant="body1">
              Are you sure you want to delete <strong>{confirmDelete?.name}</strong>? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={confirmDeleteHeadcount}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon />}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isSubmitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </LocalizationProvider>
  );
};

// Stepper component
const Stepper = ({ steps, activeStep }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            bgcolor: 'divider',
            transform: 'translateY(-50%)',
            zIndex: 0
          }
        }}
      >
        {steps.map((step, index) => (
          <Box 
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative',
              zIndex: 1
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                color: activeStep >= index ? 'primary.contrastText' : 'text.primary',
                mb: 1,
                transition: 'all 0.3s ease',
                transform: activeStep === index ? 'scale(1.2)' : 'scale(1)',
                boxShadow: activeStep === index ? 4 : 0
              }}
            >
              {step.icon}
            </Avatar>
            <Typography 
              variant="caption" 
              sx={{ 
                bgcolor: 'background.paper', 
                px: 1,
                fontWeight: activeStep === index ? 600 : 400,
                color: activeStep === index ? 'primary.main' : 'text.secondary'
              }}
            >
              {step.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default HeadcountPage;