// src/components/fundraising/InvestorsSection.jsx - COMPLETE FIXED VERSION WITH NULL SAFETY
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Tooltip, CircularProgress,
  Card, CardContent, Avatar, Chip, Collapse, LinearProgress, Stack, alpha,
  useTheme, Grow, Fade, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VisibilityIcon from '@mui/icons-material/Visibility';

import InvestorForm from './InvestorForm';
import { getInvestors, deleteInvestor, getRounds } from '../../services/api';
import AlertMessage from '../common/AlertMessage';

// ✅ FIX: Helper function for safe array operations
const safeArray = (arr) => Array.isArray(arr) ? arr : [];

// ✅ FIX: Helper function for safe tranches operations
const safeTranches = (tranches) => Array.isArray(tranches) ? tranches : [];

// Enhanced styled components
const StyledInvestorCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
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

const MetricItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'Invested': return { bg: theme.palette.success.main, text: '#fff' };
      case 'Hard Committed': return { bg: theme.palette.info.main, text: '#fff' };
      case 'Soft Committed': return { bg: theme.palette.warning.main, text: '#fff' };
      case 'Negotiating': return { bg: theme.palette.secondary.main, text: '#fff' };
      case 'Pitched': return { bg: theme.palette.primary.main, text: '#fff' };
      case 'Declined': return { bg: theme.palette.error.main, text: '#fff' };
      case 'Passed': return { bg: theme.palette.grey[600], text: '#fff' };
      default: return { bg: theme.palette.grey[300], text: theme.palette.text.primary };
    }
  };

  const colors = getStatusColor();
  
  return {
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: '0.75rem',
    height: '28px',
    fontWeight: 600,
  };
});

const TrancheStatusChip = styled(Chip)(({ theme, status }) => {
  const getTrancheStatusColor = () => {
    switch(status) {
      case 'Fully Received': return { bg: theme.palette.success.main, text: '#fff' };
      case 'Partially Received': return { bg: theme.palette.warning.main, text: '#fff' };
      case 'Pending': return { bg: theme.palette.grey[400], text: '#fff' };
      case 'Cancelled': return { bg: theme.palette.error.main, text: '#fff' };
      default: return { bg: theme.palette.grey[300], text: theme.palette.text.primary };
    }
  };

  const colors = getTrancheStatusColor();
  
  return {
    backgroundColor: colors.bg,
    color: colors.text,
    fontSize: '0.7rem',
    height: '24px',
    fontWeight: 600,
  };
});

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8, 2),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
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

/**
 * Enhanced Tranche Row Component WITH NULL SAFETY
 */
const TrancheRow = ({ tranche, index, pricePerShare }) => {
  const theme = useTheme();
  
  // ✅ FIX: Add null safety for tranche properties
  const receivedAmount = tranche?.receivedAmount || 0;
  const agreedAmount = tranche?.agreedAmount || 0;
  const progress = agreedAmount > 0 ? (receivedAmount / agreedAmount) * 100 : 0;
  const calculatedShares = pricePerShare > 0 ? Math.round(receivedAmount / pricePerShare) : 0;
  
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };
  
  if (!tranche) {
    return null; // ✅ FIX: Return null if tranche is not valid
  }
  
  return (
    <Box sx={{ p: 2, mb: 1, backgroundColor: alpha(theme.palette.primary.main, 0.03), borderRadius: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Tranche {tranche.trancheNumber || index + 1}
        </Typography>
        <TrancheStatusChip label={tranche.status || 'Unknown'} status={tranche.status} size="small" />
      </Stack>
      
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={4}>
          <Typography variant="caption" color="text.secondary">Agreed</Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(agreedAmount)}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="caption" color="text.secondary">Received</Typography>
          <Typography variant="body2" fontWeight={600} color="success.main">
            {formatCurrency(receivedAmount)}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="caption" color="text.secondary">Shares</Typography>
          <Typography variant="body2" fontWeight={600}>
            {calculatedShares.toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
      
      {/* Progress bar for this tranche */}
      <LinearProgress 
        variant="determinate" 
        value={Math.min(progress, 100)}
        sx={{ 
          height: 4,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            backgroundColor: progress >= 100 ? theme.palette.success.main : theme.palette.warning.main
          }
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {progress.toFixed(0)}% received
        {tranche.dateReceived && ` • Paid ${new Date(tranche.dateReceived).toLocaleDateString()}`}
        {tranche.triggerCondition && ` • ${tranche.triggerCondition}`}
      </Typography>
    </Box>
  );
};

/**
 * Enhanced Investor Card Component WITH NULL SAFETY
 */
const InvestorCard = ({ investor, onEdit, onDelete, onToggleExpand, isExpanded, rounds }) => {
  const theme = useTheme();
  
  // ✅ FIX: Add comprehensive null safety for investor properties
  if (!investor) {
    return null;
  }
  
  // ✅ FIX: Safe access to investor properties with fallbacks
  const investorTranches = safeTranches(investor.tranches);
  const actualReceivedAmount = investorTranches.reduce((sum, t) => sum + (t?.receivedAmount || 0), 0);
  const totalCommitted = investor.totalCommittedAmount || 0;
  const commitmentProgress = totalCommitted > 0 ? (actualReceivedAmount / totalCommitted) * 100 : 0;
  
  // Get round information
  const getRoundInfo = (roundId) => {
    if (!roundId) return null;
    if (typeof roundId === 'object' && roundId._id) {
      return roundId; // Already populated
    }
    return safeArray(rounds).find(r => r._id === roundId) || null;
  };
  
  const roundInfo = getRoundInfo(investor.roundId);
  const pricePerShare = roundInfo?.pricePerShare || 0;
  
  // ✅ FIX: Calculate shares based on actual received amount with null safety
  const actualShares = pricePerShare > 0 ? Math.round(actualReceivedAmount / pricePerShare) : 0;
  const allocatedShares = investor.sharesAllocated || 0;
  
  const formatCurrency = (amount) => {
    if (!amount || amount <= 0) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };
  
  return (
    <StyledInvestorCard elevation={1}>
      <CardContent sx={{ p: 3 }}>
        {/* Header with investor name and status */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              {investor.name || 'Unknown Investor'}
            </Typography>
            <StatusChip 
              label={investor.status || 'Unknown'} 
              status={investor.status}
              icon={getStatusIcon(investor.status)}
            />
            {investor.entityName && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {investor.entityName}
              </Typography>
            )}
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => onToggleExpand(investor._id)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Investor">
              <IconButton size="small" onClick={() => onEdit(investor)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Investor">
              <IconButton size="small" onClick={() => onDelete(investor._id, investor.name)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Key metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <MetricItem>
              <Typography variant="caption" color="text.secondary">EQUITY ALLOCATED</Typography>
              <Typography variant="h6" color="primary.main" fontWeight={700}>
                {(investor.equityPercentageAllocated || 0).toFixed(3)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @ ₹{(pricePerShare || 0).toLocaleString()}/share
              </Typography>
            </MetricItem>
          </Grid>
          <Grid item xs={6}>
            <MetricItem>
              <Typography variant="caption" color="text.secondary">SHARES</Typography>
              <Typography variant="h6" fontWeight={700}>
                {actualShares.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {allocatedShares > actualShares && `of ${allocatedShares.toLocaleString()} allocated`}
              </Typography>
            </MetricItem>
          </Grid>
        </Grid>

        {/* ✅ FIX: Enhanced commitment progress with null safety */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Commitment Progress
            </Typography>
            <Typography variant="caption" fontWeight={600} color={commitmentProgress >= 100 ? 'success.main' : 'warning.main'}>
              {commitmentProgress.toFixed(0)}%
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(commitmentProgress, 100)}
            sx={{ 
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: commitmentProgress >= 100 ? 
                  'linear-gradient(45deg, #4caf50, #66bb6a)' :
                  'linear-gradient(45deg, #ff9800, #ffb74d)'
              }
            }}
          />
        </Box>

        {/* ✅ FIX: Enhanced financial summary with null safety */}
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Committed</Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(totalCommitted)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">Received</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatCurrency(actualReceivedAmount)}
            </Typography>
          </Box>
        </Stack>

        {/* ✅ FIX: Enhanced tranches summary with null safety */}
        {investorTranches.length > 0 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Tranches: {investorTranches.length} total
                {investorTranches.filter(t => t?.status === 'Fully Received').length > 0 && 
                  ` • ${investorTranches.filter(t => t?.status === 'Fully Received').length} received`}
              </Typography>
              <Button 
                size="small" 
                onClick={() => onToggleExpand(investor._id)}
                endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ minWidth: 'auto' }}
              >
                {isExpanded ? 'Hide' : 'Show'}
              </Button>
            </Stack>
            
            {/* Expanded tranche details */}
            <Collapse in={isExpanded}>
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                {investorTranches.map((tranche, index) => (
                  <TrancheRow 
                    key={tranche?._id || `tranche-${index}`} 
                    tranche={tranche} 
                    index={index} 
                    pricePerShare={pricePerShare} 
                  />
                ))}
                
                {/* Summary for multiple tranches */}
                {investorTranches.length > 1 && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: alpha(theme.palette.success.main, 0.1), 
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                  }}>
                    <Typography variant="subtitle2" fontWeight={600} color="success.main" sx={{ mb: 1 }}>
                      Total Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Total Committed</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(investorTranches.reduce((sum, t) => sum + (t?.agreedAmount || 0), 0))}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Total Received</Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(actualReceivedAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Total Shares</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {actualShares.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        )}
      </CardContent>
    </StyledInvestorCard>
  );
};

/**
 * Enhanced InvestorsSection Component with Corrected Data Display AND NULL SAFETY
 */
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
  const [expandedInvestorId, setExpandedInvestorId] = useState(null);

  // ✅ FIX: Enhanced data fetching with proper error handling AND NULL SAFETY
  const fetchInvestorsAndRounds = useCallback(async () => {
    setLoading(true);
    try {
      const [investorsRes, roundsRes] = await Promise.all([
        getInvestors(selectedRoundFilter ? { roundId: selectedRoundFilter } : {}),
        getRounds()
      ]);
      
      // ✅ FIX: Handle different API response structures with null safety
      const investorsData = Array.isArray(investorsRes?.data) ? investorsRes.data : 
                           Array.isArray(investorsRes?.data?.investors) ? investorsRes.data.investors : [];
      const roundsData = Array.isArray(roundsRes?.data) ? roundsRes.data : 
                        Array.isArray(roundsRes?.data?.rounds) ? roundsRes.data.rounds : [];
      
      console.log('🔍 Investors loaded:', investorsData.length);
      console.log('🔍 Sample investor:', investorsData[0]);
      
      // ✅ FIX: Ensure tranches data is properly structured and recalculate totals WITH NULL SAFETY
      const processedInvestors = safeArray(investorsData).map(investor => {
        if (!investor) return null;
        
        const tranches = safeTranches(investor.tranches);
        const totalReceivedFromTranches = tranches.reduce((sum, t) => sum + (t?.receivedAmount || 0), 0);
        
        return {
          ...investor,
          tranches: tranches,
          // Ensure received amount is calculated from tranches
          totalReceivedAmount: totalReceivedFromTranches,
          actualReceivedAmount: totalReceivedFromTranches, // Add this for clarity
          // Add safety for other fields
          name: investor.name || 'Unknown Investor',
          status: investor.status || 'Unknown',
          totalCommittedAmount: investor.totalCommittedAmount || 0,
          equityPercentageAllocated: investor.equityPercentageAllocated || 0,
          sharesAllocated: investor.sharesAllocated || 0
        };
      }).filter(Boolean); // Remove null entries
      
      setInvestors(processedInvestors);
      setRounds(safeArray(roundsData));
      
    } catch (error) {
      console.error("❌ Error fetching investors/rounds:", error);
      setMessage({ type: 'error', text: 'Could not load investor data.' });
      setInvestors([]);
      setRounds([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRoundFilter]);

  useEffect(() => {
    fetchInvestorsAndRounds();
  }, [fetchInvestorsAndRounds]);

  // ✅ FIX: Enhanced metrics calculation with proper received amounts AND NULL SAFETY
  const calculateEnhancedMetrics = () => {
    const filteredInvestors = safeArray(investors).filter(investor => {
      if (!investor) return false;
      const matchesSearch = (investor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (investor.entityName || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    const totalInvestors = filteredInvestors.length;
    const totalCommitted = filteredInvestors.reduce((sum, inv) => sum + (inv?.totalCommittedAmount || 0), 0);
    
    // ✅ FIX: Calculate total received from tranches with null safety
    const totalReceived = filteredInvestors.reduce((sum, inv) => {
      if (!inv) return sum;
      const trancheReceived = safeTranches(inv.tranches).reduce((trSum, t) => trSum + (t?.receivedAmount || 0), 0);
      return sum + trancheReceived;
    }, 0);
    
    const totalShares = filteredInvestors.reduce((sum, inv) => {
      if (!inv) return sum;
      // Calculate shares from received amounts and round price
      const roundInfo = safeArray(rounds).find(r => r?._id === inv?.roundId || r?._id === inv?.roundId?._id);
      const pricePerShare = roundInfo?.pricePerShare || 0;
      const receivedAmount = safeTranches(inv.tranches).reduce((trSum, t) => trSum + (t?.receivedAmount || 0), 0);
      const shares = pricePerShare > 0 ? Math.round(receivedAmount / pricePerShare) : 0;
      return sum + shares;
    }, 0);
    
    const investedCount = filteredInvestors.filter(inv => {
      if (!inv) return false;
      const received = safeTranches(inv.tranches).reduce((sum, t) => sum + (t?.receivedAmount || 0), 0);
      return received > 0;
    }).length;

    return {
      totalInvestors,
      totalShares,
      totalCommitted,
      totalReceived,
      avgCommitment: totalInvestors > 0 ? totalCommitted / totalInvestors : 0,
      conversionRate: totalInvestors > 0 ? (investedCount / totalInvestors) * 100 : 0,
      collectionRate: totalCommitted > 0 ? (totalReceived / totalCommitted) * 100 : 0
    };
  };

  const metrics = calculateEnhancedMetrics();

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount || amount <= 0) return '₹0';
    if (amount >= 10000000) { // 1 Crore
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) { // 1 Lakh
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const handleInvestorSaved = (savedInvestor) => {
    fetchInvestorsAndRounds();
    setInvestorToEdit(null);
    setShowFormDialog(false);
    setMessage({ 
      type: 'success', 
      text: `Investor "${savedInvestor?.name || 'Unknown'}" saved successfully. Equity allocation: ${savedInvestor?.equityPercentageAllocated || 0}%` 
    });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleEditInvestor = (investor) => {
    setInvestorToEdit(investor);
    setShowFormDialog(true);
  };
  
  const handleOpenDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name: name || 'Unknown Investor' });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  const handleDeleteInvestor = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteInvestor(deleteDialog.id);
      setMessage({ type: 'success', text: `Investor "${deleteDialog.name}" deleted successfully.` });
      fetchInvestorsAndRounds();
    } catch (error) {
      console.error("Error deleting investor:", error);
      setMessage({ type: 'error', text: 'Could not delete investor.' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const toggleInvestorExpansion = (investorId) => {
    setExpandedInvestorId(expandedInvestorId === investorId ? null : investorId);
  };

  // Filter investors based on search and round WITH NULL SAFETY
  const filteredInvestors = safeArray(investors).filter(investor => {
    if (!investor) return false;
    const matchesSearch = (investor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (investor.entityName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
              Manage relationships, track equity allocations & commitments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
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

        {/* ✅ FIX: Enhanced Summary Metrics with null safety */}
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <MetricCard elevation={0}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: 'primary.main',
                  width: 48,
                  height: 48
                }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {metrics.totalInvestors || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  TOTAL INVESTORS
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(metrics.conversionRate || 0).toFixed(1)}% conversion rate
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard elevation={0}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1), 
                  color: 'success.main',
                  width: 48,
                  height: 48
                }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {(metrics.totalShares || 0) > 1000 ? `${((metrics.totalShares || 0)/1000).toFixed(0)}K` : (metrics.totalShares || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  EQUITY ALLOCATED
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(metrics.totalShares || 0)} shares
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard elevation={0}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.info.main, 0.1), 
                  color: 'info.main',
                  width: 48,
                  height: 48
                }}>
                  <AccountBalanceIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {formatCurrency(metrics.totalCommitted || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  COMMITTED
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg: {formatCurrency(metrics.avgCommitment || 0)}
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard elevation={0}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                  color: 'secondary.main',
                  width: 48,
                  height: 48
                }}>
                  <MonetizationOnIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {formatCurrency(metrics.totalReceived || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  RECEIVED
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(metrics.collectionRate || 0).toFixed(1)}% collected
                </Typography>
              </Stack>
            </MetricCard>
          </Grid>
        </Grid>

        {/* Search and Filter Controls */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search investors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Round</InputLabel>
            <Select
              value={selectedRoundFilter}
              label="Filter by Round"
              onChange={(e) => setSelectedRoundFilter(e.target.value)}
              startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="">All Rounds</MenuItem>
              {safeArray(rounds).map(round => (
                <MenuItem key={round?._id || 'unknown'} value={round?._id || ''}>
                  {round?.name || 'Unknown Round'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <AlertMessage message={message.text} severity={message.type || 'info'} />

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && filteredInvestors.length === 0 && (
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
              <PeopleIcon sx={{ fontSize: 56, color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              {searchQuery || selectedRoundFilter ? 'No investors found' : 'Start Building Your Investor Network'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              {searchQuery || selectedRoundFilter ? 
                'Try adjusting your search criteria or filters to find investors.' :
                'Add investors to track commitments, manage tranches, and monitor equity allocations with real-time calculations.'
              }
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
              Add First Investor
            </Button>
          </EmptyStateContainer>
        </Fade>
      )}

      {/* Investors Grid */}
      {!loading && filteredInvestors.length > 0 && (
        <Grid container spacing={3}>
          {filteredInvestors.map((investor, index) => (
            <Grid item xs={12} md={6} lg={4} key={investor?._id || `investor-${index}`}>
              <Grow in timeout={300 + index * 100}>
                <div>
                  <InvestorCard
                    investor={investor}
                    onEdit={handleEditInvestor}
                    onDelete={handleOpenDeleteDialog}
                    onToggleExpand={toggleInvestorExpansion}
                    isExpanded={expandedInvestorId === investor?._id}
                    rounds={rounds}
                  />
                </div>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Form Dialog */}
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

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete investor "<strong>{deleteDialog.name}</strong>"? 
            This will also remove all their tranches, cap table entries, and cannot be undone.
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