// src/components/fundraising/CapTableSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Tooltip, CircularProgress, 
  Card, CardHeader, CardContent, Avatar, Chip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, 
  DialogActions, alpha, useTheme, Grow, Stack, LinearProgress, Fade, Skeleton
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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, Sector } from 'recharts';

import CapTableForm from './CapTableForm';
import { getCapTableSummary, deleteCapTableEntry } from '../../services/api';
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

const CapTableSection = () => {
  const theme = useTheme();
  const [capTableEntries, setCapTableEntries] = useState([]);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchCapTable = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCapTableSummary();
      setCapTableEntries(response.data || []);
    } catch (error) {
      console.error("Error fetching cap table:", error);
      setMessage({ type: 'error', text: 'Could not load cap table data.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapTable();
  }, [fetchCapTable]);

  const handleEntrySaved = (savedEntry) => {
    fetchCapTable();
    setEntryToEdit(null);
    setShowFormDialog(false);
    setMessage({ type: 'success', text: `Cap table entry for "${savedEntry.shareholderName}" saved.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
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
      setMessage({ type: 'success', text: `Entry for "${deleteDialog.name}" deleted.` });
      fetchCapTable();
    } catch (error) {
      console.error("Error deleting cap table entry:", error);
      setMessage({ type: 'error', text: 'Could not delete entry.' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // Calculate metrics
  const totalShares = capTableEntries.reduce((sum, entry) => sum + (entry.numberOfShares || 0), 0);
  const uniqueShareholders = new Set(capTableEntries.map(entry => entry.shareholderName)).size;
  const foundersCount = capTableEntries.filter(entry => entry.shareholderType === 'Founder').length;
  const investorsCount = capTableEntries.filter(entry => entry.shareholderType === 'Investor').length;
  
  const chartData = capTableEntries
    .filter(entry => entry.numberOfShares > 0)
    .map((entry, index) => ({
        name: entry.shareholderName,
        value: entry.numberOfShares,
        percentage: totalShares > 0 ? ((entry.numberOfShares / totalShares) * 100).toFixed(2) : 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
        type: entry.shareholderType
    }));

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
              Track ownership distribution and equity allocation
            </Typography>
          </Box>
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
                  <GroupsIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {uniqueShareholders}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  SHAREHOLDERS
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
                  <DonutLargeIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {totalShares.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  TOTAL SHARES
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
                  <PersonIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {foundersCount}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  FOUNDERS
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
                  <BusinessCenterIcon />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  {investorsCount}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  INVESTORS
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
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      )}
      
      {/* Empty State */}
      {!loading && capTableEntries.length === 0 && (
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
              Add shareholders and track equity distribution across founders, investors, and employees
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
      {!loading && capTableEntries.length > 0 && (
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
                  subheader="Visual breakdown of equity allocation"
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
                            formatter={(value) => `${value.toLocaleString()} shares`}
                            contentStyle={{
                              backgroundColor: alpha(theme.palette.background.paper, 0.95),
                              border: 'none',
                              borderRadius: 8,
                              boxShadow: theme.shadows[4]
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Legend */}
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={1}>
                          {chartData.slice(0, 6).map((entry, index) => (
                            <Grid item xs={6} key={index}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: entry.fill
                                }} />
                                <Typography variant="caption" noWrap>
                                  {entry.name} ({entry.percentage}%)
                                </Typography>
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

          {/* Table Section */}
          <Grid item xs={12} lg={7}>
            <Grow in timeout={500}>
              <StyledCapTableCard>
                <CardHeader 
                  title={
                    <Typography variant="h6" fontWeight={700}>
                      Shareholder Details
                    </Typography>
                  }
                  subheader={`${capTableEntries.length} entries`}
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
                            Ownership
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
                        {capTableEntries.map((entry, index) => {
                          const ownershipPercent = totalShares > 0 && entry.numberOfShares 
                            ? ((entry.numberOfShares / totalShares) * 100).toFixed(2) 
                            : '0.00';
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
                                  <Typography variant="body2" fontWeight={600}>
                                    {entry.shareholderName}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <StatusChip 
                                  label={entry.shareholderType} 
                                  size="small" 
                                  color={entry.shareholderType === 'Founder' ? 'primary' : 'default'}
                                  variant={entry.shareholderType === 'Founder' ? 'filled' : 'outlined'}
                                />
                              </TableCell>
                              <TableCell>
                                <StatusChip 
                                  label={entry.securityType} 
                                  size="small" 
                                  color="secondary"
                                  variant="outlined"
                                  icon={<SecurityIcon sx={{ fontSize: 16 }} />}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={500}>
                                  {entry.numberOfShares?.toLocaleString() || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={parseFloat(ownershipPercent)}
                                    sx={{ 
                                      width: 60, 
                                      height: 6,
                                      borderRadius: 3,
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      '& .MuiLinearProgress-bar': {
                                        borderRadius: 3,
                                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                                      }
                                    }}
                                  />
                                  <Typography variant="body2" fontWeight={600}>
                                    {ownershipPercent}%
                                  </Typography>
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
            This action cannot be undone.
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