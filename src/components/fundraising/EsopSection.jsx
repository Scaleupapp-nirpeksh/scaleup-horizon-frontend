// src/components/fundraising/EsopSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Tooltip, CircularProgress, 
  Card, CardHeader, CardContent, Avatar, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, 
  DialogActions, alpha, useTheme, Grow, Stack, LinearProgress, Fade, 
  TextField, InputAdornment, Skeleton, Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LockIcon from '@mui/icons-material/Lock';
import TimerIcon from '@mui/icons-material/Timer';

import EsopGrantForm from './EsopGrantForm';
import { getEsopGrants, deleteEsopGrant } from '../../services/api';
import AlertMessage from '../common/AlertMessage';

// Enhanced styled components
const StyledEsopCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
    '&::before': {
      opacity: 1,
    }
  },
}));

const VestingProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: alpha(theme.palette.success.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
  }
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2.5),
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.3s ease',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 28,
  '& .MuiChip-label': {
    px: 2,
  }
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8, 2),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    }
  }
}));

const getVestingStatusColor = (percentage) => {
  if (percentage >= 75) return 'success';
  if (percentage >= 50) return 'info';
  if (percentage >= 25) return 'warning';
  return 'default';
};

const EsopSection = () => {
  const theme = useTheme();
  const [esopGrants, setEsopGrants] = useState([]);
  const [grantToEdit, setGrantToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEsopGrants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEsopGrants(); 
      setEsopGrants(response.data || []);
    } catch (error) {
      console.error("Error fetching ESOP grants:", error);
      setMessage({ type: 'error', text: 'Could not load ESOP grants.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEsopGrants();
  }, [fetchEsopGrants]);

  // Filter grants based on search
  const filteredGrants = esopGrants.filter(grant => {
    const searchLower = searchQuery.toLowerCase();
    return grant.employeeName?.toLowerCase().includes(searchLower) ||
           grant.employeeId?.toLowerCase().includes(searchLower);
  });

  // Calculate metrics
  const totalOptionsGranted = esopGrants.reduce((sum, grant) => sum + (grant.numberOfOptionsGranted || 0), 0);
  const totalOptionsVested = esopGrants.reduce((sum, grant) => sum + (grant.totalOptionsVested || 0), 0);
  const totalOptionsExercised = esopGrants.reduce((sum, grant) => sum + (grant.totalOptionsExercised || 0), 0);
  const activeGrants = esopGrants.filter(grant => grant.totalOptionsVested < grant.numberOfOptionsGranted).length;

  const handleGrantSaved = (savedGrant) => {
    fetchEsopGrants();
    setGrantToEdit(null);
    setShowFormDialog(false);
    setMessage({ type: 'success', text: `ESOP Grant for "${savedGrant.employeeName}" saved.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleEditGrant = (grant) => {
    setGrantToEdit(grant);
    setShowFormDialog(true);
  };
  
  const handleOpenDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  const handleDeleteGrant = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteEsopGrant(deleteDialog.id);
      setMessage({ type: 'success', text: `Grant for "${deleteDialog.name}" deleted.` });
      fetchEsopGrants();
    } catch (error) {
      console.error("Error deleting ESOP grant:", error);
      setMessage({ type: 'error', text: 'Could not delete grant.' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Stack spacing={3} sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              ESOP Grant Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track employee stock options and vesting schedules
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => {
              setGrantToEdit(null);
              setShowFormDialog(true);
            }}
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 600, 
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              boxShadow: '0 4px 20px rgba(245, 87, 108, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 30px rgba(245, 87, 108, 0.35)',
              }
            }}
          >
            New ESOP Grant
          </Button>
        </Stack>

        {/* Summary Metrics */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <MetricCard elevation={0}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: 'primary.main',
                  width: 48,
                  height: 48
                }}>
                  <EmojiEventsIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {totalOptionsGranted.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  OPTIONS GRANTED
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard elevation={0}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1), 
                  color: 'success.main',
                  width: 48,
                  height: 48
                }}>
                  <LockOpenIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {totalOptionsVested.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  OPTIONS VESTED
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard elevation={0}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.info.main, 0.1), 
                  color: 'info.main',
                  width: 48,
                  height: 48
                }}>
                  <CheckBoxIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {totalOptionsExercised.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  OPTIONS EXERCISED
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard elevation={0}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                  color: 'secondary.main',
                  width: 48,
                  height: 48
                }}>
                  <TimerIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700} color="secondary.main">
                  {activeGrants}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  ACTIVE GRANTS
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <SearchBar
          placeholder="Search by employee name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <AlertMessage message={message.text} severity={message.type || 'info'} />

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Empty State */}
      {!loading && filteredGrants.length === 0 && (
        <Fade in>
          <EmptyStateContainer>
            <Box sx={{ 
              width: 120, 
              height: 120, 
              margin: '0 auto 2rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)'
            }}>
              <CardMembershipIcon sx={{ fontSize: 56, color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {searchQuery ? 'No grants found' : 'Start Your ESOP Program'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : 'Create your first ESOP grant to reward and retain your talented team'
              }
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setShowFormDialog(true)}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                }}
              >
                Create First Grant
              </Button>
            )}
          </EmptyStateContainer>
        </Fade>
      )}

      {/* Grant Cards */}
      {!loading && filteredGrants.length > 0 && (
        <Grid container spacing={3}>
          {filteredGrants.map((grant, index) => {
            const vestedPercentage = grant.numberOfOptionsGranted > 0 
              ? (grant.totalOptionsVested / grant.numberOfOptionsGranted) * 100 
              : 0;
            const exercisedPercentage = grant.numberOfOptionsGranted > 0 
              ? (grant.totalOptionsExercised / grant.numberOfOptionsGranted) * 100 
              : 0;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={grant._id}>
                <Grow in timeout={200 + index * 100}>
                  <StyledEsopCard>
                    <CardContent sx={{ p: 3 }}>
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                          <Avatar sx={{ 
                            bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                            color: 'secondary.main',
                            width: 48,
                            height: 48
                          }}>
                            {grant.employeeName?.charAt(0).toUpperCase() || 'E'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }} noWrap>
                              {grant.employeeName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {grant.employeeId || 'N/A'}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => handleEditGrant(grant)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleOpenDeleteDialog(grant._id, grant.employeeName)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Divider sx={{ mb: 3 }} />

                      {/* Grant Details */}
                      <Stack spacing={2}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <EmojiEventsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                Total Granted
                              </Typography>
                            </Stack>
                            <Typography variant="body1" fontWeight={600}>
                              {grant.numberOfOptionsGranted?.toLocaleString()}
                            </Typography>
                          </Stack>
                          
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <MonetizationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                Strike Price
                              </Typography>
                            </Stack>
                            <Typography variant="body1" fontWeight={600}>
                              ₹{grant.strikePrice?.toLocaleString()}
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Vesting Progress */}
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Vesting Progress
                            </Typography>
                            <Typography variant="caption" fontWeight={600}>
                              {vestedPercentage.toFixed(1)}%
                            </Typography>
                          </Stack>
                          <VestingProgressBar 
                            variant="determinate" 
                            value={vestedPercentage}
                          />
                          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {grant.totalOptionsVested?.toLocaleString()} vested
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(grant.numberOfOptionsGranted - grant.totalOptionsVested).toLocaleString()} unvested
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Exercised Info */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CheckBoxIcon sx={{ fontSize: 18, color: 'success.main' }} />
                            <Typography variant="caption" color="text.secondary">
                              Exercised
                            </Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            {grant.totalOptionsExercised?.toLocaleString() || '0'} ({exercisedPercentage.toFixed(1)}%)
                          </Typography>
                        </Stack>

                        {/* Additional Info */}
                        <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                          <StatusChip 
                            icon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
                            label={new Date(grant.grantDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                            size="small"
                            variant="outlined"
                          />
                          <StatusChip 
                            icon={<AccountTreeIcon sx={{ fontSize: 16 }} />}
                            label={grant.vestingScheduleType}
                            size="small"
                            color={getVestingStatusColor(vestedPercentage)}
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </StyledEsopCard>
                </Grow>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Form Dialog */}
      <Dialog
        open={showFormDialog}
        onClose={() => { setShowFormDialog(false); setGrantToEdit(null); }}
        maxWidth="md" 
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            backgroundImage: 'none'
          } 
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          pt: 3,
          px: 3,
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          {grantToEdit ? 'Edit ESOP Grant' : 'Create New ESOP Grant'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <EsopGrantForm 
            onGrantSaved={handleGrantSaved} 
            grantToEdit={grantToEdit}
            onCancelEdit={() => { setShowFormDialog(false); setGrantToEdit(null); }}
            key={grantToEdit?._id || 'new-esop-grant'} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the ESOP grant for "<strong>{deleteDialog.name}</strong>"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteGrant} 
            color="error" 
            variant="contained" 
            sx={{ borderRadius: 2 }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EsopSection;