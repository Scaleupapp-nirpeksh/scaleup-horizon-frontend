// src/components/fundraising/CapTableSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Tooltip, CircularProgress, 
  Card, CardHeader, CardContent, Avatar, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, 
  DialogActions, alpha, useTheme, Grow, Stack, LinearProgress, Fade, Skeleton,
  Alert, Badge, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, Sector } from 'recharts';

import CapTableForm from './CapTableForm';
import { getCapTableSummary, deleteCapTableEntry, getRounds } from '../../services/api';
import AlertMessage from '../common/AlertMessage';

// Enhanced styled components
const StyledCapTableCard = styled(Card)(({ theme }) => ({
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

const ValueCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 500,
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.3),
    }
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: alpha(theme.palette.grey[200], 0.5),
    borderRadius: '4px',
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8, 2),
  borderRadius: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 28,
  '& .MuiChip-label': {
    px: 2,
  }
}));

// Enhanced Chart Colors with gradients
const CHART_COLORS = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#fa709a',
  '#fee140',
  '#30cfd0',
  '#a8edea'
];

// Custom active shape for pie chart
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  );
};

/**
 * Enhanced CapTableSection Component with Corrected Valuation Integration
 * 
 * Key Features:
 * - Displays share values using current round pricing
 * - Shows monetary value alongside ownership percentages
 * - Integrates with corrected fundraising calculation system
 * - Real-time valuation updates based on active rounds
 * - Enhanced metrics with financial context
 */
const CapTableSection = () => {
  const theme = useTheme();
  const [capTableEntries, setCapTableEntries] = useState([]);
  const [capTableSummary, setCapTableSummary] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchCapTableAndRounds = useCallback(async () => {
    setLoading(true);
    try {
      const [capTableRes, roundsRes] = await Promise.all([
        getCapTableSummary(),
        getRounds()
      ]);
      
      console.log('🔍 Cap Table API Response:', capTableRes.data);
      
      // FIX: Correctly access the entries from the API response structure
      const responseData = capTableRes.data || {};
      
      // The API returns { entries: [...], summary: {...} }
      // But we were accessing it as if it returned the entries directly
      if (responseData.entries) {
        setCapTableEntries(responseData.entries);
        setCapTableSummary(responseData.summary);
        console.log('✅ Cap Table Entries loaded:', responseData.entries.length);
      } else if (Array.isArray(responseData)) {
        // Fallback for older API response format
        setCapTableEntries(responseData);
        console.log('✅ Cap Table Entries (fallback):', responseData.length);
      } else {
        console.warn('⚠️  Unexpected cap table response format:', responseData);
        setCapTableEntries([]);
        setCapTableSummary(null);
      }
      
      setRounds(roundsRes.data || []);
      
      // Auto-select the most recent active round for valuation
      const activeRounds = roundsRes.data?.filter(r => r.status === 'Open' && r.pricePerShare) || [];
      if (activeRounds.length > 0 && !selectedRound) {
        setSelectedRound(activeRounds[0]._id);
      }
    } catch (error) {
      console.error("❌ Error fetching cap table:", error);
      setMessage({ type: 'error', text: 'Could not load cap table data.' });
      setCapTableEntries([]);
      setCapTableSummary(null);
    } finally {
      setLoading(false);
    }
  }, [selectedRound]);

  useEffect(() => {
    fetchCapTableAndRounds();
  }, [fetchCapTableAndRounds]);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (amount >= 10000000) { // 1 Crore
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) { // 1 Lakh
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  // Get current round for valuation calculations
  const getCurrentRound = () => {
    if (!selectedRound) return null;
    return rounds.find(r => r._id === selectedRound);
  };

  // Calculate enhanced metrics with valuation
  const calculateEnhancedMetrics = () => {
    // Ensure capTableEntries is an array before processing
    const entries = Array.isArray(capTableEntries) ? capTableEntries : [];
    const currentRound = getCurrentRound();
    const currentSharePrice = currentRound?.pricePerShare || 0;
    
    console.log('📊 Calculating metrics for', entries.length, 'entries');
    
    const totalShares = entries.reduce((sum, entry) => sum + (entry.numberOfShares || 0), 0);
    const totalValue = totalShares * currentSharePrice;
    const uniqueShareholders = new Set(entries.map(entry => entry.shareholderName)).size;
    
    // Category breakdown
    const categorizeEntry = (entry) => {
      switch(entry.shareholderType) {
        case 'Founder': return 'founders';
        case 'Investor': return 'investors';
        case 'Employee': return 'employees';
        case 'Advisor': return 'advisors';
        default: return 'others';
      }
    };

    const categoryMetrics = entries.reduce((acc, entry) => {
      const category = categorizeEntry(entry);
      acc[category] = acc[category] || { count: 0, shares: 0, value: 0 };
      acc[category].count++;
      acc[category].shares += entry.numberOfShares || 0;
      acc[category].value += (entry.numberOfShares || 0) * currentSharePrice;
      return acc;
    }, {});

    const metrics = {
      totalShares,
      totalValue,
      uniqueShareholders,
      currentSharePrice,
      foundersCount: categoryMetrics.founders?.count || 0,
      investorsCount: categoryMetrics.investors?.count || 0,
      employeesCount: categoryMetrics.employees?.count || 0,
      advisorsCount: categoryMetrics.advisors?.count || 0,
      foundersShares: categoryMetrics.founders?.shares || 0,
      investorsShares: categoryMetrics.investors?.shares || 0,
      foundersValue: categoryMetrics.founders?.value || 0,
      investorsValue: categoryMetrics.investors?.value || 0,
      categoryMetrics
    };
    
    console.log('📈 Calculated metrics:', metrics);
    return metrics;
  };

  const metrics = calculateEnhancedMetrics();
  const currentRound = getCurrentRound();

  const handleEntrySaved = (savedEntry) => {
    fetchCapTableAndRounds();
    setEntryToEdit(null);
    setShowFormDialog(false);
    const entryValue = savedEntry.numberOfShares * (currentRound?.pricePerShare || 0);
    setMessage({ 
      type: 'success', 
      text: `Cap table entry for "${savedEntry.shareholderName}" saved. ${savedEntry.numberOfShares?.toLocaleString()} shares${entryValue > 0 ? ` (${formatCurrency(entryValue)})` : ''}.` 
    });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleEditEntry = (entry) => {
    setEntryToEdit(entry);
    setShowFormDialog(true);
  };
  
  const handleOpenDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  const handleDeleteEntry = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteCapTableEntry(deleteDialog.id);
      setMessage({ type: 'success', text: `Entry for "${deleteDialog.name}" deleted successfully.` });
      fetchCapTableAndRounds();
    } catch (error) {
      console.error("Error deleting cap table entry:", error);
      setMessage({ type: 'error', text: 'Could not delete entry.' });
    } finally {
      handleCloseDeleteDialog();
    }
  };
  
  // Enhanced chart data with monetary values
  const chartData = Array.isArray(capTableEntries) 
    ? capTableEntries
        .filter(entry => entry.numberOfShares > 0)
        .map((entry, index) => {
            const shares = entry.numberOfShares || 0;
            const value = shares * (currentRound?.pricePerShare || 0);
            const percentage = metrics.totalShares > 0 ? ((shares / metrics.totalShares) * 100).toFixed(2) : 0;
            
            return {
                name: entry.shareholderName,
                value: shares,
                monetaryValue: value,
                percentage: percentage,
                fill: CHART_COLORS[index % CHART_COLORS.length],
                type: entry.shareholderType,
                securityType: entry.securityType
            };
        })
    : [];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <Box>
      {/* Header Section */}
      <Stack spacing={3} sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              Capitalization Table
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track ownership distribution, equity allocation & current valuations
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Valuation Round</InputLabel>
              <Select
                value={selectedRound}
                label="Valuation Round"
                onChange={(e) => setSelectedRound(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <em>No Round Selected</em>
                </MenuItem>
                {rounds
                  .filter(r => r.pricePerShare > 0)
                  .map(round => (
                    <MenuItem key={round._id} value={round._id}>
                      <Box>
                        <Typography variant="body2">{round.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ₹{round.pricePerShare?.toLocaleString()}/share
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEntryToEdit(null);
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
              Add Entry
            </Button>
          </Stack>
        </Stack>

        {/* Valuation Context Alert */}
        {currentRound && (
          <Alert 
            severity="info" 
            icon={<InfoIcon />}
            sx={{ 
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}
          >
            <Typography variant="body2">
              <strong>Valuation Context:</strong> Using {currentRound.name} pricing (₹{currentRound.pricePerShare?.toLocaleString()}/share) 
              for monetary value calculations. Total company value: {formatCurrency(metrics.totalValue)}
            </Typography>
          </Alert>
        )}

        {/* Enhanced Summary Metrics */}
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
                  <GroupsIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {metrics.uniqueShareholders}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  SHAREHOLDERS
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {metrics.foundersCount}F • {metrics.investorsCount}I • {metrics.employeesCount}E
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
                  <DonutLargeIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {metrics.totalShares.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  TOTAL SHARES
                </Typography>
                {currentRound && (
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    @ ₹{currentRound.pricePerShare.toLocaleString()}/share
                  </Typography>
                )}
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
                  <PersonIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {metrics.foundersShares.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  FOUNDER SHARES
                </Typography>
                {metrics.totalShares > 0 && (
                  <Typography variant="caption" color="info.main" fontWeight={600}>
                    {((metrics.foundersShares / metrics.totalShares) * 100).toFixed(1)}% ownership
                  </Typography>
                )}
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
                  {formatCurrency(metrics.totalValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  TOTAL VALUE
                </Typography>
                {currentRound && (
                  <Typography variant="caption" color="secondary.main" fontWeight={600}>
                    Based on {currentRound.name}
                  </Typography>
                )}
              </Stack>
            </MetricCard>
          </Grid>
        </Grid>

        {/* Value Breakdown Cards */}
        {currentRound && (metrics.foundersValue > 0 || metrics.investorsValue > 0) && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ValueCard>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      FOUNDER VALUE
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="info.main">
                      {formatCurrency(metrics.foundersValue)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                    <PersonIcon />
                  </Avatar>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {metrics.foundersShares.toLocaleString()} shares • {((metrics.foundersShares / metrics.totalShares) * 100).toFixed(1)}% ownership
                </Typography>
              </ValueCard>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ValueCard>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      INVESTOR VALUE
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="secondary.main">
                      {formatCurrency(metrics.investorsValue)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                    <BusinessCenterIcon />
                  </Avatar>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {metrics.investorsShares.toLocaleString()} shares • {((metrics.investorsShares / metrics.totalShares) * 100).toFixed(1)}% ownership
                </Typography>
              </ValueCard>
            </Grid>
          </Grid>
        )}
      </Stack>

      <AlertMessage message={message.text} severity={message.type || 'info'} />

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      )}
      
      {/* Empty State */}
      {!loading && (!Array.isArray(capTableEntries) || capTableEntries.length === 0) && (
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
              <PieChartOutlineIcon sx={{ fontSize: 56, color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Start Building Your Cap Table
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              Add shareholders and track equity distribution with real-time valuations across founders, investors, and employees
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
              Add First Entry
            </Button>
          </EmptyStateContainer>
        </Fade>
      )}

      

      {/* Main Content */}
      {!loading && Array.isArray(capTableEntries) && capTableEntries.length > 0 && (
        <Grid container spacing={3}>
          {/* Chart Section */}
          <Grid item xs={12} lg={5}>
            <Grow in timeout={300}>
              <StyledCapTableCard>
                <CardHeader 
                  avatar={
                    <Avatar sx={{ 
                      bgcolor: 'transparent',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      width: 48,
                      height: 48
                    }}>
                      <AssessmentIcon sx={{ color: 'white' }} />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" fontWeight={700}>
                      Ownership Distribution
                    </Typography>
                  }
                  subheader={`Visual breakdown of equity allocation${currentRound ? ` • ${currentRound.name} Valuation` : ''}`}
                />
                <CardContent>
                  {chartData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value, name, props) => [
                              `${value.toLocaleString()} shares${currentRound ? ` (${formatCurrency(props.payload.monetaryValue)})` : ''}`,
                              'Holdings'
                            ]}
                            labelFormatter={(label) => `${label}`}
                            contentStyle={{
                              backgroundColor: alpha(theme.palette.background.paper, 0.95),
                              border: 'none',
                              borderRadius: 8,
                              boxShadow: theme.shadows[4]
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Enhanced Legend */}
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={1}>
                          {chartData.slice(0, 6).map((entry, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: entry.fill
                                }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="caption" noWrap fontWeight={500}>
                                    {entry.name}
                                  </Typography>
                                  <Typography variant="caption" display="block" color="text.secondary" noWrap>
                                    {entry.percentage}%{currentRound ? ` • ${formatCurrency(entry.monetaryValue)}` : ''}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                          ))}
                          {chartData.length > 6 && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                +{chartData.length - 6} more shareholders
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                      <Typography color="text.secondary">
                        No share data to display
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </StyledCapTableCard>
            </Grow>
          </Grid>

          {/* Enhanced Table Section */}
          <Grid item xs={12} lg={7}>
            <Grow in timeout={500}>
              <StyledCapTableCard>
                <CardHeader 
                  title={
                    <Typography variant="h6" fontWeight={700}>
                      Shareholder Details
                    </Typography>
                  }
                  subheader={`${Array.isArray(capTableEntries) ? capTableEntries.length : 0} entries${currentRound ? ` • Valued at ${formatCurrency(metrics.totalValue)}` : ''}`}
                />
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <StyledTableContainer>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 700,
                            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                            Shareholder
                          </TableCell>
                          <TableCell sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 700,
                            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                            Type
                          </TableCell>
                          <TableCell sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 700,
                            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                            Security
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 700,
                            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                            Shares
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 700,
                            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                            {currentRound ? 'Value/Ownership' : 'Ownership'}
                          </TableCell>
                          <TableCell align="center" sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 700,
                            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(capTableEntries) && capTableEntries.map((entry, index) => {
                          const shares = entry.numberOfShares || 0;
                          const ownershipPercent = metrics.totalShares > 0 && shares 
                            ? ((shares / metrics.totalShares) * 100).toFixed(2) 
                            : '0.00';
                          const monetaryValue = currentRound ? shares * currentRound.pricePerShare : 0;
                          
                          return (
                            <StyledTableRow key={entry._id}>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32,
                                    bgcolor: CHART_COLORS[index % CHART_COLORS.length],
                                    fontSize: '0.875rem'
                                  }}>
                                    {entry.shareholderName.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {entry.shareholderName}
                                    </Typography>
                                    {entry.linkedInvestorId && (
                                      <Typography variant="caption" color="primary.main">
                                        Linked to investor
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <StatusChip 
                                  label={entry.shareholderType} 
                                  size="small" 
                                  color={entry.shareholderType === 'Founder' ? 'primary' : entry.shareholderType === 'Investor' ? 'secondary' : 'default'}
                                  variant={entry.shareholderType === 'Founder' ? 'filled' : 'outlined'}
                                />
                              </TableCell>
                              <TableCell>
                                <StatusChip 
                                  label={entry.securityType} 
                                  size="small" 
                                  color="info"
                                  variant="outlined"
                                  icon={<SecurityIcon sx={{ fontSize: 16 }} />}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={500}>
                                  {shares.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ textAlign: 'right' }}>
                                  {currentRound && monetaryValue > 0 && (
                                    <Typography variant="body2" fontWeight={600} color="success.main">
                                      {formatCurrency(monetaryValue)}
                                    </Typography>
                                  )}
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={parseFloat(ownershipPercent)}
                                      sx={{ 
                                        width: 50, 
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        '& .MuiLinearProgress-bar': {
                                          borderRadius: 3,
                                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                                        }
                                      }}
                                    />
                                    <Typography variant="caption" fontWeight={600}>
                                      {ownershipPercent}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  <Tooltip title="Edit Entry">
                                    <IconButton size="small" onClick={() => handleEditEntry(entry)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Entry">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleOpenDeleteDialog(entry._id, entry.shareholderName)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </StyledTableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                </CardContent>
              </StyledCapTableCard>
            </Grow>
          </Grid>
        </Grid>
      )}

      {/* Form Dialog */}
      <Dialog
        open={showFormDialog}
        onClose={() => { setShowFormDialog(false); setEntryToEdit(null); }}
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
          {entryToEdit ? 'Edit Cap Table Entry' : 'Add New Cap Table Entry'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <CapTableForm 
            onEntrySaved={handleEntrySaved} 
            entryToEdit={entryToEdit}
            onCancelEdit={() => { setShowFormDialog(false); setEntryToEdit(null); }}
            key={entryToEdit?._id || 'new-captable-entry'} 
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
            Are you sure you want to delete the cap table entry for "<strong>{deleteDialog.name}</strong>"? 
            This action will remove their shares and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteEntry} 
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

export default CapTableSection;