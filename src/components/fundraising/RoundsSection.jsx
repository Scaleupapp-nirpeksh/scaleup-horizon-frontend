// src/components/fundraising/RoundsSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Tooltip, CircularProgress, 
  Card, CardContent, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  alpha, useTheme, Grow, Stack, LinearProgress, Fade, Skeleton, Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';

import RoundForm from './RoundForm';
import { getRounds, deleteRound } from '../../services/api';
import AlertMessage from '../common/AlertMessage';

// Enhanced styled components
const StyledRoundCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, transparent 0%, rgba(102, 126, 234, 0.05) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
    '&::before': {
      opacity: 1,
    }
  },
}));

const StatusIcon = styled(Box)(({ theme, status }) => {
  const getStatusStyles = () => {
    switch(status) {
      case 'Open': 
        return { 
          bg: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', 
          icon: <PlayCircleOutlineIcon sx={{ fontSize: 24, color: '#fff' }} />,
          shadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
        };
      case 'Closed': 
        return { 
          bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
          icon: <CheckCircleOutlineIcon sx={{ fontSize: 24, color: '#fff' }} />,
          shadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
        };
      case 'Planning': 
        return { 
          bg: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', 
          icon: <HourglassTopIcon sx={{ fontSize: 24, color: '#fff' }} />,
          shadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
        };
      case 'Closing': 
        return { 
          bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
          icon: <TrendingUpIcon sx={{ fontSize: 24, color: '#fff' }} />,
          shadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
        };
      default: 
        return { 
          bg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', 
          icon: <GroupWorkIcon sx={{ fontSize: 24, color: '#fff' }} />,
          shadow: '0 4px 20px rgba(100, 116, 139, 0.4)'
        };
    }
  };

  const styles = getStatusStyles();

  return {
    width: 48,
    height: 48,
    borderRadius: '16px',
    background: styles.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: styles.shadow,
    position: 'relative',
    '& > *': {
      zIndex: 1,
    }
  };
});

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  }
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2.5),
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  }
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8, 2),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const RoundsSection = () => {
  const theme = useTheme();
  const [rounds, setRounds] = useState([]);
  const [roundToEdit, setRoundToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const fetchRounds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRounds();
      setRounds(response.data || []);
    } catch (error) {
      console.error("Error fetching rounds:", error);
      setMessage({ type: 'error', text: 'Could not load fundraising rounds.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  // Calculate summary metrics
  const totalTarget = rounds.reduce((sum, round) => sum + (round.targetAmount || 0), 0);
  const totalReceived = rounds.reduce((sum, round) => sum + (round.totalFundsReceived || 0), 0);
  const openRounds = rounds.filter(round => round.status === 'Open').length;
  const closedRounds = rounds.filter(round => round.status === 'Closed').length;

  const handleRoundSaved = (savedRound) => {
    fetchRounds();
    setRoundToEdit(null);
    setShowFormDialog(false);
    setMessage({ type: 'success', text: `Round "${savedRound.name}" saved successfully.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleEditRound = (round) => {
    setRoundToEdit(round);
    setShowFormDialog(true);
  };

  const handleOpenDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  const handleDeleteRound = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteRound(deleteDialog.id);
      setMessage({ type: 'success', text: `Round "${deleteDialog.name}" deleted.` });
      fetchRounds();
    } catch (error) {
      console.error("Error deleting round:", error);
      setMessage({ type: 'error', text: 'Could not delete round.' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Box>
      {/* Header Section */}
      <Stack spacing={3} sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Funding Rounds
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage your fundraising milestones
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RocketLaunchIcon />}
            onClick={() => {
              setRoundToEdit(null);
              setShowFormDialog(true);
            }}
            sx={{ 
              borderRadius: '12px', 
              fontWeight: 600, 
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
              '&:hover': {
                boxShadow: '0 6px 30px rgba(102, 126, 234, 0.35)',
              }
            }}
          >
            New Round
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
                  width: 40,
                  height: 40
                }}>
                  <GroupWorkIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {rounds.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  TOTAL ROUNDS
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
                  width: 40,
                  height: 40
                }}>
                  <PlayCircleOutlineIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {openRounds}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  OPEN ROUNDS
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard elevation={0}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.warning.main, 0.1), 
                  color: 'warning.main',
                  width: 40,
                  height: 40
                }}>
                  <FlagIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  ₹{(totalTarget / 10000000).toFixed(1)}Cr
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  TARGET AMOUNT
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
                  width: 40,
                  height: 40
                }}>
                  <MonetizationOnIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  ₹{(totalReceived / 10000000).toFixed(1)}Cr
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  TOTAL RAISED
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
        </Grid>
      </Stack>

      <AlertMessage message={message.text} severity={message.type || 'info'} />

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Empty State */}
      {!loading && rounds.length === 0 && (
        <Fade in>
          <EmptyStateContainer>
            <Box sx={{ 
              width: 120, 
              height: 120, 
              margin: '0 auto 2rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}>
              <RocketLaunchIcon sx={{ fontSize: 56, color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Launch Your First Funding Round
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              Start tracking your fundraising journey by creating your first funding round
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setShowFormDialog(true)}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Create Your First Round
            </Button>
          </EmptyStateContainer>
        </Fade>
      )}

      {/* Round Cards */}
      {!loading && rounds.length > 0 && (
        <Grid container spacing={3}>
          {rounds.map((round, index) => (
            <Grid item xs={12} md={6} lg={4} key={round._id}>
              <Grow in timeout={200 + index * 100}>
                <StyledRoundCard>
                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                        <StatusIcon status={round.status}>
                          {(() => {
                            switch(round.status) {
                              case 'Open': return <PlayCircleOutlineIcon sx={{ fontSize: 24, color: '#fff' }} />;
                              case 'Closed': return <CheckCircleOutlineIcon sx={{ fontSize: 24, color: '#fff' }} />;
                              case 'Planning': return <HourglassTopIcon sx={{ fontSize: 24, color: '#fff' }} />;
                              case 'Closing': return <TrendingUpIcon sx={{ fontSize: 24, color: '#fff' }} />;
                              default: return <GroupWorkIcon sx={{ fontSize: 24, color: '#fff' }} />;
                            }
                          })()}
                        </StatusIcon>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {round.name}
                          </Typography>
                          <Chip 
                            label={round.status} 
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.dark
                            }}
                          />
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit Round">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleEditRound(round);
                          }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Round">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteDialog(round._id, round.name);
                          }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    {/* Progress Section */}
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Funding Progress
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {round.targetAmount > 0 
                            ? `${Math.round((round.totalFundsReceived / round.targetAmount) * 100)}%`
                            : '0%'
                          }
                        </Typography>
                      </Stack>
                      <ProgressBar 
                        variant="determinate" 
                        value={round.targetAmount ? (round.totalFundsReceived / round.targetAmount * 100) : 0}
                      />
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Raised
                          </Typography>
                          <Typography variant="h6" fontWeight={700} color="success.main">
                            ₹{(round.totalFundsReceived / 100000).toFixed(1)}L
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            Target
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            ₹{(round.targetAmount / 100000).toFixed(1)}L
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Details Grid */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarMonthIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Open Date
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDate(round.openDate)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={6}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EventIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Target Close
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDate(round.targetCloseDate)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* Valuation */}
                    {round.currentValuationPreMoney && (
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        mb: 2
                      }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccountBalanceIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Pre-Money Valuation
                            </Typography>
                            <Typography variant="body1" fontWeight={600} color="primary.main">
                              ₹{(round.currentValuationPreMoney / 10000000).toFixed(1)}Cr
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {/* Notes */}
                    {round.notes && (
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.grey[100], 0.5),
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                      }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <DescriptionIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.5 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {round.notes.length > 100 ? `${round.notes.substring(0, 100)}...` : round.notes}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </StyledRoundCard>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Round Form Dialog */}
      <Dialog
        open={showFormDialog}
        onClose={() => { setShowFormDialog(false); setRoundToEdit(null); }}
        maxWidth="sm"
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
          {roundToEdit ? 'Edit Fundraising Round' : 'Create New Fundraising Round'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <RoundForm 
            onRoundSaved={handleRoundSaved} 
            roundToEdit={roundToEdit}
            onCancelEdit={() => { setShowFormDialog(false); setRoundToEdit(null); }}
            key={roundToEdit?._id || 'new-round'} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the round "<strong>{deleteDialog.name}</strong>"? 
            This action cannot be undone and will affect all associated data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteRound} 
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

export default RoundsSection;