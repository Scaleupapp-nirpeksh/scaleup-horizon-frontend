// src/pages/OrganizationManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import {
  Box, Container, Typography, Tabs, Tab, Paper, CircularProgress, Alert,
  Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Tooltip, Slide, Zoom, Skeleton, Badge,
  Card, CardContent, Divider, useMediaQuery
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import Chip from '@mui/material/Chip';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Assuming ProvisionMemberForm is in this location
import ProvisionMemberForm from '../components/organization/ProvisionMemberForm';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

// Styled components
const MagicalContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    height: 300,
    background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.1)}, transparent 50%),
                 radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 50%)`,
    pointerEvents: 'none',
    animation: `${float} 20s ease-in-out infinite`,
  }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  borderRadius: theme.spacing(3),
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
    : `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f5f5f5', 0.8)} 100%)`,
  backdropFilter: 'blur(20px)',
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 48px 0 ${alpha(theme.palette.common.black, 0.15)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(105deg, transparent 40%, ${alpha(theme.palette.common.white, 0.1)} 50%, transparent 60%)`,
    animation: `${shimmer} 3s linear infinite`,
  }
}));

const AnimatedTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1.1rem',
  padding: theme.spacing(2, 3),
  borderRadius: theme.spacing(2, 2, 0, 0),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: -100,
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.3)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    '&::before': {
      left: '100%',
    }
  },
  '&.Mui-selected': {
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
    color: theme.palette.primary.main,
  }
}));

const MagicalButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    borderRadius: '50%',
    background: alpha(theme.palette.common.white, 0.3),
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.6s, height 0.6s',
  },
  '&:hover::before': {
    width: 300,
    height: 300,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));

const AnimatedListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.6)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
    : `linear-gradient(135deg, ${alpha('#ffffff', 0.8)} 0%, ${alpha('#f5f5f5', 0.6)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateX(8px)',
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
      : `linear-gradient(135deg, ${alpha('#ffffff', 1)} 0%, ${alpha('#f5f5f5', 0.8)} 100%)`,
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
    }
  },
  '& .MuiFilledInput-root': {
    borderRadius: theme.spacing(2),
    '&:before, &:after': {
      display: 'none',
    }
  }
}));

const SparkleIcon = styled(AutoAwesomeIcon)(({ theme }) => ({
  position: 'absolute',
  animation: `${sparkle} 3s ease-in-out infinite`,
  color: theme.palette.primary.main,
  fontSize: 16,
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          {...other}
        >
          <Box sx={{ pt: 3 }}>{children}</Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <GlassPaper elevation={0}>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} key={item}>
          <Skeleton variant="rounded" height={56} />
        </Grid>
      ))}
    </Grid>
  </GlassPaper>
);

// Success animation component
const SuccessAnimation = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: theme => `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme => `0 0 60px ${alpha(theme.palette.success.main, 0.5)}`,
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'white' }} />
        </Box>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Organization Details Component ---
const OrganizationDetailsSection = () => {
  const { activeOrganization, refreshAuthData } = useAuth();
  const [details, setDetails] = useState(null);
  const [initialDetails, setInitialDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchDetails = async () => {
      if (activeOrganization?.id) {
        setIsLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 800)); // Smooth loading
          const response = await api.getActiveOrganizationDetails();
          setDetails(response.data);
          setInitialDetails(response.data);
        } catch (err) {
          setError("Failed to load organization details.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setError("No active organization selected or details unavailable.");
      }
    };
    fetchDetails();
  }, [activeOrganization]);

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'name':
        if (!value || value.trim().length < 2) {
          errors.name = 'Organization name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;
      case 'timezone':
        if (!value) {
          errors.timezone = 'Timezone is required';
        } else {
          delete errors.timezone;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDetails(prev => ({ ...prev, [name]: value }));
    if (isEditing) {
      validateField(name, value);
    }
  };
  
  const handleSettingsChange = (event) => {
    const { name, value } = event.target;
    setDetails(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: name === 'financialYearStartMonth' || name === 'financialYearStartDay' ? parseInt(value) : value,
      }
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    
    // Validate all fields
    const isValid = Object.keys(details).every(key => validateField(key, details[key]));
    if (!isValid) return;
    
    setIsLoading(true);
    try {
      const { name, industry, timezone, currency, settings } = details;
      await api.updateActiveOrganizationDetails({ name, industry, timezone, currency, settings });
      setSuccess("Organization details updated successfully!");
      setIsEditing(false);
      setInitialDetails(details);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      await refreshAuthData();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    setDetails(initialDetails);
    setIsEditing(false);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  if (isLoading && !details) return <LoadingSkeleton />;
  if (error && !details) return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
  if (!details) return <Alert severity="info" sx={{ borderRadius: 2 }}>Organization details are not available.</Alert>;
  
  const isOwner = activeOrganization?.role === 'owner';

  return (
    <>
      <SuccessAnimation show={showSuccess} />
      <GlassPaper elevation={0}>
        <SparkleIcon sx={{ top: 20, right: 20 }} />
        <SparkleIcon sx={{ top: 40, right: 40, animationDelay: '1s' }} />
        <SparkleIcon sx={{ bottom: 20, left: 20, animationDelay: '2s' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
              Organization Profile
            </Typography>
          </Box>
          {isOwner && !isEditing && (
            <MagicalButton
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              color="primary"
            >
              Edit Details
            </MagicalButton>
          )}
        </Box>
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Organization Name"
              name="name"
              value={details.name || ''}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              InputLabelProps={{ shrink: true }}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              InputProps={{
                startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Industry"
              name="industry"
              value={details.industry || ''}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <TrendingUpIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant={isEditing ? "outlined" : "filled"} disabled={!isEditing}>
              <InputLabel id="org-currency-label" shrink={true}>Currency</InputLabel>
              <Select
                labelId="org-currency-label"
                name="currency"
                value={details.currency || 'INR'}
                onChange={handleChange}
                label="Currency"
                sx={{ borderRadius: 2 }}
                startAdornment={<AttachMoneyIcon sx={{ ml: 1.5, mr: 0.5, color: 'action.active' }} />}
              >
                {['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => (
                  <MenuItem key={c} value={c}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{c}</span>
                      <Chip label={c === 'INR' ? '₹' : c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : c} size="small" />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Timezone"
              name="timezone"
              value={details.timezone || ''}
              onChange={handleChange}
              fullWidth
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              InputLabelProps={{ shrink: true }}
              error={!!fieldErrors.timezone}
              helperText={fieldErrors.timezone}
              InputProps={{
                startAdornment: <LanguageIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>
              <Chip
                icon={<SettingsIcon />}
                label="Advanced Settings"
                sx={{ px: 2 }}
              />
            </Divider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Date Format"
              name="dateFormat"
              value={details.settings?.dateFormat || 'YYYY-MM-DD'}
              onChange={handleSettingsChange}
              fullWidth
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <StyledTextField
              type="number"
              label="Financial Year Start Month"
              name="financialYearStartMonth"
              value={details.settings?.financialYearStartMonth || 4}
              onChange={handleSettingsChange}
              fullWidth
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1, max: 12 }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <StyledTextField
              type="number"
              label="Financial Year Start Day"
              name="financialYearStartDay"
              value={details.settings?.financialYearStartDay || 1}
              onChange={handleSettingsChange}
              fullWidth
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1, max: 31 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Card sx={{ 
              background: theme => alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
              border: theme => `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon sx={{ color: 'info.main' }} />
                  <Typography variant="subtitle2" color="info.main">
                    Organization Information
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Owner: {details.owner?.email || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(details.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <MagicalButton
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </MagicalButton>
                <MagicalButton
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isLoading || Object.keys(fieldErrors).length > 0}
                  sx={{
                    background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Save Changes'
                  )}
                </MagicalButton>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPaper>
    </>
  );
};

// --- Manage Members Section ---
const ManageMembersSection = () => {
  const { activeOrganization } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchMembers = async () => {
    if (activeOrganization?.id) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        const response = await api.listOrganizationMembers();
        setMembers(response.data);
      } catch (err) {
        setError("Failed to load members.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setError("No active organization to list members from.");
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrganization]);

  const handleOpenRoleDialog = (member) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setRoleDialogOpen(true);
  };

  const handleOpenRemoveDialog = (member) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const handleRoleChange = async () => {
    if (!selectedMember || !newRole) return;
    setActionLoading(true);
    try {
      await api.updateMemberRole(selectedMember.userId, { newRole });
      setSnackbar({ 
        open: true, 
        message: `${selectedMember.name}'s role updated to ${newRole}.`, 
        severity: 'success' 
      });
      fetchMembers();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.msg || "Failed to update role.", 
        severity: 'error' 
      });
    } finally {
      setActionLoading(false);
      setRoleDialogOpen(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      await api.removeMemberFromOrganization(selectedMember.userId);
      setSnackbar({ 
        open: true, 
        message: `${selectedMember.name} has been removed from the organization.`, 
        severity: 'success' 
      });
      fetchMembers();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.msg || "Failed to remove member.", 
        severity: 'error' 
      });
    } finally {
      setActionLoading(false);
      setRemoveDialogOpen(false);
    }
  };
  
  const isOwner = activeOrganization?.role === 'owner';

  if (isLoading) {
    return (
      <GlassPaper elevation={0}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            variant="rounded"
            height={80}
            sx={{ mb: 2, borderRadius: 2 }}
          />
        ))}
      </GlassPaper>
    );
  }

  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;

  return (
    <GlassPaper elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <GroupWorkIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
          Team Members
        </Typography>
        <Badge
          badgeContent={members.length}
          color="primary"
          sx={{ ml: 'auto' }}
        />
      </Box>
      
      {members.length === 0 ? (
        <Card sx={{
          textAlign: 'center',
          py: 6,
          background: theme => alpha(theme.palette.info.main, 0.05),
          borderRadius: 2,
          border: theme => `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
        }}>
          <PeopleIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No members found in this organization
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Start by inviting team members to collaborate
          </Typography>
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          <AnimatePresence>
            {members.map((member, index) => (
              <motion.div
                key={member.userId || member.membershipId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <AnimatedListItem
                  secondaryAction={
                    isOwner && (
                      <Box>
                        <Tooltip title="Change Role" arrow>
                          <IconButton
                            edge="end"
                            aria-label="change-role"
                            onClick={() => handleOpenRoleDialog(member)}
                            sx={{
                              mr: 0.5,
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                color: 'primary.main',
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Member" arrow>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleOpenRemoveDialog(member)}
                            sx={{
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                color: 'error.main',
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        member.role === 'owner' ? (
                          <SecurityIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        ) : null
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor: member.isAccountActive ? 'primary.main' : 'grey.500',
                          width: 48,
                          height: 48,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {member.name}
                        </Typography>
                        <Chip
                          label={member.role}
                          size="small"
                          color={member.role === 'owner' ? 'warning' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16 }} />
                          {member.email}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={member.status}
                            size="small"
                            color={
                              member.status === 'active' ? 'success' :
                              member.status === 'pending_user_setup' ? 'warning' : 'default'
                            }
                            sx={{
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1.5 }
                            }}
                          />
                          {member.status === 'pending_user_setup' && (
                            <Tooltip title="Pending Setup" arrow>
                              <VpnKeyIcon fontSize="small" color="warning" />
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </AnimatedListItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      )}

      {/* Role Change Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            Change Role for {selectedMember?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Select the new role for this member. Owners have full administrative privileges.
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="new-role-label">New Role</InputLabel>
            <Select
              labelId="new-role-label"
              value={newRole}
              label="New Role"
              onChange={(e) => setNewRole(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="member">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon fontSize="small" />
                  Member
                </Box>
              </MenuItem>
              <MenuItem value="owner">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon fontSize="small" color="warning" />
                  Owner
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setRoleDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <MagicalButton
            onClick={handleRoleChange}
            variant="contained"
            disabled={actionLoading}
            sx={{
              background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : "Update Role"}
          </MagicalButton>
        </DialogActions>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <DeleteIcon />
            Remove {selectedMember?.name}?
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove <strong>{selectedMember?.name}</strong> from this organization? 
            This action cannot be undone and they will lose access to all organization resources.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setRemoveDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <MagicalButton
            onClick={handleRemoveMember}
            variant="contained"
            color="error"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : "Remove Member"}
          </MagicalButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: theme => `0 8px 24px ${alpha(theme.palette[snackbar.severity].main, 0.3)}`,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </GlassPaper>
  );
};

// --- Main Organization Management Page ---
const OrganizationManagementPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { activeOrganization, user } = useAuth();
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const isOwner = activeOrganization?.role === 'owner';

  if (!user) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        You must be logged in to manage organizations.
      </Alert>
    );
  }
  
  if (!activeOrganization) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Please select an active organization from the header to manage its settings.
        </Alert>
      </Container>
    );
  }

  return (
    <MagicalContainer maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme => `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              animation: `${pulse} 2s ease-in-out infinite`,
              mr: 3,
            }}
          >
            <BusinessIcon sx={{ fontSize: 36, color: 'white' }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                background: theme => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: `${gradientShift} 3s ease infinite`,
              }}
            >
              Organization Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage settings and members for <strong>{activeOrganization.name}</strong>
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            borderRadius: '16px 16px 0 0',
            background: theme => alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="Organization Management Tabs"
            indicatorColor="primary"
            textColor="primary"
            variant={isSmallScreen ? "scrollable" : "fullWidth"}
            scrollButtons={isSmallScreen ? "auto" : false}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: theme => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }
            }}
          >
            <AnimatedTab
              label="Details"
              icon={<BusinessIcon />}
              iconPosition="start"
              id="org-tab-0"
              aria-controls="org-tabpanel-0"
            />
            {isOwner && (
              <AnimatedTab
                label="Manage Members"
                icon={<PeopleIcon />}
                iconPosition="start"
                id="org-tab-1"
                aria-controls="org-tabpanel-1"
              />
            )}
            {isOwner && (
              <AnimatedTab
                label="Invite New Member"
                icon={<PersonAddIcon />}
                iconPosition="start"
                id="org-tab-2"
                aria-controls="org-tabpanel-2"
              />
            )}
          </Tabs>
        </Paper>

        <TabPanel value={currentTab} index={0}>
          <OrganizationDetailsSection />
        </TabPanel>
        
        {isOwner && (
          <>
            <TabPanel value={currentTab} index={1}>
              <ManageMembersSection />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
              <GlassPaper elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <PersonAddIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
                    Invite Team Members
                  </Typography>
                </Box>
                <ProvisionMemberForm />
              </GlassPaper>
            </TabPanel>
          </>
        )}
        
        {!isOwner && currentTab > 0 && (
          <Alert
            severity="warning"
            sx={{
              mt: 2,
              borderRadius: 2,
              boxShadow: theme => `0 4px 20px ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
          >
            You do not have permission to access this section. Only organization owners can manage members.
          </Alert>
        )}
      </motion.div>
    </MagicalContainer>
  );
};

export default OrganizationManagementPage;