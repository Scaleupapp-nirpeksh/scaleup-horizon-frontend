// src/components/fundraising/InvestorsSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Paper, List, ListItem, ListItemText,
  IconButton, Tooltip, Divider, CircularProgress, Card, CardHeader, CardContent, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, alpha, useTheme, Grow, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, 
  FormControl, InputLabel, LinearProgress, Fade, InputAdornment, TextField, Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BusinessIcon from '@mui/icons-material/Business';
import InfoIcon from '@mui/icons-material/Info';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InvestorForm from './InvestorForm';
import { getInvestors, deleteInvestor, getRounds } from '../../services/api';
import AlertMessage from '../common/AlertMessage';

// Enhanced styled components
const StyledInvestorCard = styled(Card)(({ theme }) => ({
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
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
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

const StatusBadge = styled(Box)(({ theme, status }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'Invested': return { bg: '#10b981', text: '#fff' };
      case 'Hard Committed': return { bg: '#3b82f6', text: '#fff' };
      case 'Soft Committed': return { bg: '#6366f1', text: '#fff' };
      case 'Pitched': return { bg: '#8b5cf6', text: '#fff' };
      case 'Declined': return { bg: '#ef4444', text: '#fff' };
      case 'Introduced': return { bg: '#64748b', text: '#fff' };
      default: return { bg: '#94a3b8', text: '#fff' };
    }
  };

  const colors = getStatusColor();

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '12px',
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    boxShadow: `0 2px 8px ${alpha(colors.bg, 0.3)}`,
  };
});

const MetricBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.grey[100], 0.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.05),
    borderColor: alpha(theme.palette.primary.main, 0.2),
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

const getStatusIcon = (status) => {
  switch(status) {
    case 'Invested': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    case 'Declined': return <CancelIcon sx={{ fontSize: 16 }} />;
    case 'Hard Committed':
    case 'Soft Committed':
    case 'Pitched':
    case 'Introduced':
    default: return <HourglassEmptyIcon sx={{ fontSize: 16 }} />;
  }
};

const InvestorsSection = () => {
  const theme = useTheme();
  const [investors, setInvestors] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [investorToEdit, setInvestorToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const fetchInvestorsAndRounds = useCallback(async () => {
    setLoading(true);
    try {
      const [investorsRes, roundsRes] = await Promise.all([
        getInvestors(selectedRoundFilter ? { roundId: selectedRoundFilter } : {}),
        getRounds()
      ]);
      setInvestors(investorsRes.data || []);
      setRounds(roundsRes.data || []);
    } catch (error) {
      console.error("Error fetching investors/rounds:", error);
      setMessage({ type: 'error', text: 'Could not load investor data.' });
    } finally {
      setLoading(false);
    }
  }, [selectedRoundFilter]);

  useEffect(() => {
    fetchInvestorsAndRounds();
  }, [fetchInvestorsAndRounds]);

  // Filter investors based on search
  const filteredInvestors = investors.filter(investor => {
    const searchLower = searchQuery.toLowerCase();
    return investor.name?.toLowerCase().includes(searchLower) ||
           investor.entityName?.toLowerCase().includes(searchLower) ||
           investor.contactPerson?.toLowerCase().includes(searchLower);
  });

  // Calculate summary metrics
  const totalCommitted = investors.reduce((sum, inv) => sum + (inv.totalCommittedAmount || 0), 0);
  const totalReceived = investors.reduce((sum, inv) => sum + (inv.totalReceivedAmount || 0), 0);
  const investedCount = investors.filter(inv => inv.status === 'Invested').length;

  const handleInvestorSaved = (savedInvestor) => {
    fetchInvestorsAndRounds();
    setInvestorToEdit(null);
    setShowFormDialog(false);
    setMessage({ type: 'success', text: `Investor "${savedInvestor.name}" saved successfully.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleEditInvestor = (investor) => {
    setInvestorToEdit(investor);
    setShowFormDialog(true);
  };
  
  const handleOpenDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  const handleDeleteInvestor = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteInvestor(deleteDialog.id);
      setMessage({ type: 'success', text: `Investor "${deleteDialog.name}" deleted.` });
      fetchInvestorsAndRounds();
    } catch (error) {
      console.error("Error deleting investor:", error);
      setMessage({ type: 'error', text: 'Could not delete investor.' });
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
              Investor Network
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage relationships and track commitments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => {
              setInvestorToEdit(null);
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
            Add Investor
          </Button>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricBox>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 32, height: 32 }}>
                    <PeopleIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    TOTAL INVESTORS
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700}>
                  {investors.length}
                </Typography>
              </Stack>
            </MetricBox>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricBox>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), width: 32, height: 32 }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    INVESTED
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {investedCount}
                </Typography>
              </Stack>
            </MetricBox>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricBox>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), width: 32, height: 32 }}>
                    <HandshakeIcon sx={{ fontSize: 18, color: 'info.main' }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    COMMITTED
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  ₹{totalCommitted > 10000000 ? `${(totalCommitted / 10000000).toFixed(1)}Cr` : `${(totalCommitted / 100000).toFixed(1)}L`}
                </Typography>
              </Stack>
            </MetricBox>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricBox>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), width: 32, height: 32 }}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    RECEIVED
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  ₹{totalReceived > 10000000 ? `${(totalReceived / 10000000).toFixed(1)}Cr` : `${(totalReceived / 100000).toFixed(1)}L`}
                </Typography>
              </Stack>
            </MetricBox>
          </Grid>
        </Grid>

        {/* Filters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <SearchBar
            placeholder="Search investors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1, maxWidth: { sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Round</InputLabel>
            <Select
              value={selectedRoundFilter}
              label="Filter by Round"
              onChange={(e) => setSelectedRoundFilter(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">All Rounds</MenuItem>
              {rounds.map(round => (
                <MenuItem key={round._id} value={round._id}>{round.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <AlertMessage message={message.text} severity={message.type || 'info'} />

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Empty State */}
      {!loading && filteredInvestors.length === 0 && (
        <Fade in>
          <EmptyStateContainer>
            <Box sx={{ 
              width: 100, 
              height: 100, 
              margin: '0 auto 2rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {searchQuery ? 'No investors found' : 'Start Building Your Network'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : 'Add your first investor to begin tracking commitments and building relationships'
              }
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowFormDialog(true)}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Add Your First Investor
              </Button>
            )}
          </EmptyStateContainer>
        </Fade>
      )}

      {/* Investor Cards */}
      {!loading && filteredInvestors.length > 0 && (
        <Grid container spacing={3}>
          {filteredInvestors.map((investor, index) => (
            <Grid item xs={12} sm={6} md={4} key={investor._id}>
              <Grow in timeout={200 + index * 100}>
                <StyledInvestorCard>
                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }} noWrap>
                          {investor.name}
                        </Typography>
                        <StatusBadge status={investor.status}>
                          {getStatusIcon(investor.status)}
                          {investor.status}
                        </StatusBadge>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => handleEditInvestor(investor)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(investor._id, investor.name)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Financial Info */}
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Commitment Progress
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {investor.totalCommittedAmount > 0 
                              ? `${Math.round((investor.totalReceivedAmount / investor.totalCommittedAmount) * 100)}%`
                              : '0%'
                            }
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={investor.totalCommittedAmount > 0 ? (investor.totalReceivedAmount / investor.totalCommittedAmount * 100) : 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            }
                          }}
                        />
                      </Box>
                      <Stack direction="row" justifyContent="space-between">
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Committed
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            ₹{investor.totalCommittedAmount > 10000000 
                              ? `${(investor.totalCommittedAmount / 10000000).toFixed(1)}Cr`
                              : `${(investor.totalCommittedAmount / 100000).toFixed(1)}L`
                            }
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            Received
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color="success.main">
                            ₹{investor.totalReceivedAmount > 10000000 
                              ? `${(investor.totalReceivedAmount / 10000000).toFixed(1)}Cr`
                              : `${(investor.totalReceivedAmount / 100000).toFixed(1)}L`
                            }
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {/* Details */}
                    <Stack spacing={1.5}>
                      {investor.roundId?.name && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <GroupWorkIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {investor.roundId.name}
                          </Typography>
                        </Stack>
                      )}
                      {investor.contactPerson && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AssignmentIndIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {investor.contactPerson}
                          </Typography>
                        </Stack>
                      )}
                      {investor.entityName && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {investor.entityName}
                          </Typography>
                        </Stack>
                      )}
                      {investor.investmentVehicle && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <InfoIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {investor.investmentVehicle}
                          </Typography>
                        </Stack>
                      )}
                      {investor.notes && (
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: alpha(theme.palette.grey[100], 0.5),
                          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                            {investor.notes.length > 80 ? `${investor.notes.substring(0, 80)}...` : investor.notes}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </StyledInvestorCard>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Investor Form Dialog */}
      <Dialog
        open={showFormDialog}
        onClose={() => { setShowFormDialog(false); setInvestorToEdit(null); }}
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
          {investorToEdit ? 'Edit Investor' : 'Add New Investor'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <InvestorForm 
            onInvestorSaved={handleInvestorSaved} 
            investorToEdit={investorToEdit}
            onCancelEdit={() => { setShowFormDialog(false); setInvestorToEdit(null); }}
            key={investorToEdit?._id || 'new-investor'} 
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
            Are you sure you want to delete the investor "<strong>{deleteDialog.name}</strong>"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteInvestor} 
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

export default InvestorsSection;