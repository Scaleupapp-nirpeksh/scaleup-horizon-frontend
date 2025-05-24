// src/components/kpis/CustomKpiSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Paper, IconButton, Tooltip, CircularProgress, 
  Card, CardHeader, CardContent, Avatar, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, alpha, useTheme, Grow, Stack, Divider, Fade, Skeleton,
  LinearProgress, Tab, Tabs, TextField, InputAdornment, ToggleButton, 
  ToggleButtonGroup, Collapse, Badge, CardActions, Menu, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InsightsIcon from '@mui/icons-material/Insights';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import FunctionsIcon from '@mui/icons-material/Functions';
import CategoryIcon from '@mui/icons-material/Category';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SpeedIcon from '@mui/icons-material/Speed';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { SparkLineChart } from '@mui/x-charts';


import CustomKpiForm from './CustomKpiForm';
import { getCustomKpis, deleteCustomKpi, calculateCustomKpiValue } from '../../services/api';
import AlertMessage from '../common/AlertMessage';

// Styled Components matching KpisPage design
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2.5),
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const KpiMetricCard = styled(GlassCard)(({ theme, colorType = 'primary' }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette[colorType].light, 0.1)} 0%, ${alpha(theme.palette[colorType].main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette[colorType].main, 0.15)}`,
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: alpha(theme.palette[colorType].main, 0.08),
    zIndex: 0,
  },
  '&:hover': {
    border: `1px solid ${alpha(theme.palette[colorType].main, 0.3)}`,
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  marginRight: theme.spacing(2),
  minHeight: 48,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  }
}));

const CategoryChip = styled(Chip)(({ theme, selected }) => ({
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  ...(selected && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    }
  })
}));

const ValueDisplay = styled(Box)(({ theme, trend }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.grey[500], 0.05),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.05),
    borderColor: alpha(theme.palette.primary.main, 0.2),
  }
}));

// Color palette for categories
const categoryColors = {
  revenue: '#6366f1',
  users: '#8b5cf6',
  engagement: '#10b981',
  performance: '#f59e0b',
  conversion: '#ef4444',
  custom: '#3b82f6'
};

// Mock sparkline data generator
const generateSparklineData = () => {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 50);
};

const CustomKpiSection = ({ embedded = false }) => {
  const theme = useTheme();
  const [customKpis, setCustomKpis] = useState([]);
  const [kpiToEdit, setKpiToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [calculationResults, setCalculationResults] = useState({});
  const [calculatingKpiId, setCalculatingKpiId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedKpiMenu, setSelectedKpiMenu] = useState(null);

  const fetchCustomKpis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCustomKpis(); 
      // Add mock sparkline data for demo
      const kpisWithSparkline = (response.data || []).map(kpi => ({
        ...kpi,
        sparklineData: generateSparklineData(),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendValue: Math.floor(Math.random() * 30) + 1
      }));
      setCustomKpis(kpisWithSparkline);
    } catch (error) {
      console.error("Error fetching custom KPIs:", error);
      setMessage({ type: 'error', text: 'Could not load custom KPIs.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomKpis();
  }, [fetchCustomKpis]);

  const handleKpiSaved = (savedKpi) => {
    fetchCustomKpis();
    setKpiToEdit(null);
    setShowFormDialog(false);
    setMessage({ type: 'success', text: `Custom KPI "${savedKpi.displayName}" saved successfully!` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleEditKpi = (kpi) => {
    setKpiToEdit(kpi);
    setShowFormDialog(true);
    setAnchorEl(null);
  };
  
  const handleOpenDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, id, name });
    setAnchorEl(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, name: '' });
  };

  const handleDeleteKpi = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteCustomKpi(deleteDialog.id);
      setMessage({ type: 'success', text: `KPI "${deleteDialog.name}" deleted successfully.` });
      fetchCustomKpis();
    } catch (error) {
      console.error("Error deleting custom KPI:", error);
      setMessage({ type: 'error', text: 'Could not delete KPI.' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleCalculateKpi = async (kpiId) => {
    setCalculatingKpiId(kpiId);
    try {
      const response = await calculateCustomKpiValue(kpiId);
      const result = {
        ...response.data,
        sparklineData: generateSparklineData(),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendValue: Math.floor(Math.random() * 30) + 1
      };
      
      setCalculationResults(prev => ({...prev, [kpiId]: result}));
      
      const kpiIndex = customKpis.findIndex(k => k._id === kpiId);
      if (kpiIndex !== -1) {
        const updatedKpis = [...customKpis];
        updatedKpis[kpiIndex] = {
          ...updatedKpis[kpiIndex], 
          cache: response.data,
          sparklineData: result.sparklineData,
          trend: result.trend,
          trendValue: result.trendValue
        };
        setCustomKpis(updatedKpis);
      }
      
      setMessage({type: 'success', text: `KPI calculated: ${response.data.formattedValue}`});
    } catch (error) {
      console.error("Error calculating KPI value:", error);
      setMessage({type: 'error', text: `Failed to calculate KPI: ${error.response?.data?.msg || error.message}`});
      setCalculationResults(prev => ({...prev, [kpiId]: { error: 'Calculation failed' }}));
    } finally {
      setCalculatingKpiId(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Filter KPIs
  const categories = ['all', ...new Set(customKpis.map(kpi => kpi.category || 'custom'))];
  
  const filteredKpis = customKpis.filter(kpi => {
    const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
    const matchesSearch = kpi.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kpi.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderKpiCard = (kpi, index) => {
    const kpiColor = categoryColors[kpi.category] || categoryColors.custom;
    const currentValue = kpi.cache?.formattedValue || calculationResults[kpi._id]?.formattedValue;
    const isCalculating = calculatingKpiId === kpi._id;
    
    return (
      <Grid item xs={12} sm={6} md={4} key={kpi._id}>
        <Grow in timeout={200 + index * 100}>
          <KpiMetricCard colorType={kpi.category === 'revenue' ? 'success' : kpi.category === 'users' ? 'primary' : 'info'}>
            <CardHeader
              avatar={
                <Badge
                  badgeContent={kpi.trend === 'up' ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                  color={kpi.trend === 'up' ? 'success' : 'error'}
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <Avatar sx={{ 
                    bgcolor: alpha(kpiColor, 0.15), 
                    color: kpiColor,
                    width: 48,
                    height: 48
                  }}>
                    <FunctionsIcon />
                  </Avatar>
                </Badge>
              }
              action={
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setSelectedKpiMenu(kpi._id);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              }
              title={
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                  {kpi.displayName}
                </Typography>
              }
              subheader={
                <Stack direction="row" spacing={1} alignItems="center">
                  <CategoryChip 
                    icon={<CategoryIcon sx={{ fontSize: 16 }} />}
                    label={kpi.category || 'custom'} 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(kpiColor, 0.1),
                      color: kpiColor,
                      fontWeight: 600
                    }}
                  />
                  {kpi.unit && (
                    <Typography variant="caption" color="text.secondary">
                      ({kpi.unit})
                    </Typography>
                  )}
                </Stack>
              }
              sx={{ pb: 1 }}
            />
            
            <CardContent sx={{ pt: 0, flexGrow: 1 }}>
              {/* Description */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2, 
                  fontStyle: 'italic', 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {kpi.description || "No description provided."}
              </Typography>

              {/* Formula Display */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  mb: 2, 
                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {kpi.formula}
                </Typography>
              </Paper>

              {/* Sparkline Chart */}
              {kpi.sparklineData && (
                <Box sx={{ mb: 2, height: 60 }}>
                  <SparkLineChart
                    data={kpi.sparklineData}
                    height={60}
                    showTooltip
                    showHighlight
                    colors={[kpiColor]}
                  />
                </Box>
              )}

              {/* Value Display */}
              <ValueDisplay trend={kpi.trend}>
                <Stack spacing={1}>
                  <Box sx={{ textAlign: 'center' }}>
                    {isCalculating ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          color: kpiColor,
                          textAlign: 'center'
                        }}
                      >
                        {currentValue || '—'}
                      </Typography>
                    )}
                  </Box>
                  
                  {kpi.trendValue && currentValue && (
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      {kpi.trend === 'up' ? (
                        <TrendingUpIcon fontSize="small" color="success" />
                      ) : (
                        <TrendingDownIcon fontSize="small" color="error" />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color: kpi.trend === 'up' ? 'success.main' : 'error.main',
                          fontWeight: 600
                        }}
                      >
                        {kpi.trendValue}% from last period
                      </Typography>
                    </Stack>
                  )}
                  
                  {kpi.cache?.lastCalculated && (
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      Last updated: {new Date(kpi.cache.lastCalculated).toLocaleDateString()}
                    </Typography>
                  )}
                </Stack>
              </ValueDisplay>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={() => handleCalculateKpi(kpi._id)}
                disabled={isCalculating}
                sx={{
                  bgcolor: kpiColor,
                  '&:hover': {
                    bgcolor: alpha(kpiColor, 0.8),
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 4,
                }}
              >
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </Button>
            </CardActions>
          </KpiMetricCard>
        </Grow>
      </Grid>
    );
  };

  return (
    <Box sx={{ mt: embedded ? 4 : 0 }}>
      {/* Header Section */}
      {!embedded && (
        <Box sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          borderRadius: 3,
          p: 3,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: alpha(theme.palette.primary.main, 0.05),
          }
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', mb: 1 }}>
                <AutoGraphIcon sx={{ mr: 1.5, fontSize: '2.5rem', verticalAlign: 'middle' }} />
                Custom KPI Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Define and track your custom business metrics with powerful formulas
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setKpiToEdit(null);
                setShowFormDialog(true);
              }}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 4,
                px: 3,
                py: 1.5,
                '&:hover': { boxShadow: 8 }
              }}
            >
              Create New KPI
            </Button>
          </Stack>
        </Box>
      )}

      {/* Alert Messages */}
      {message.text && (
        <Fade in>
          <Box sx={{ mb: 3 }}>
            <AlertMessage message={message.text} severity={message.type || 'info'} />
          </Box>
        </Fade>
      )}

      {/* Main Content Card */}
      <GlassCard sx={{ mb: 4 }}>
        <CardContent>
          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <StyledTab 
              label="All KPIs" 
              icon={<QueryStatsIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start" 
            />
            <StyledTab 
              label="Analytics" 
              icon={<ShowChartIcon sx={{ fontSize: 20 }} />} 
              iconPosition="start" 
            />
          </Tabs>

          {/* All KPIs Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Filters and Search */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
                <TextField
                  placeholder="Search KPIs..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ maxWidth: 300 }}
                />
                
                <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                  {categories.map(category => (
                    <CategoryChip
                      key={category}
                      label={category}
                      onClick={() => setSelectedCategory(category)}
                      selected={selectedCategory === category}
                      size="small"
                    />
                  ))}
                </Stack>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, v) => v && setViewMode(v)}
                  size="small"
                >
                  <ToggleButton value="grid">Grid</ToggleButton>
                  <ToggleButton value="list">List</ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {/* Loading State */}
              {loading && (
                <Grid container spacing={3}>
                  {[...Array(6)].map((_, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Empty State */}
              {!loading && filteredKpis.length === 0 && (
                <Paper elevation={0} sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.03)} 0%, ${alpha(theme.palette.grey[500], 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <AutoGraphIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'No KPIs found matching your criteria' 
                      : 'No custom KPIs defined yet'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {searchQuery || selectedCategory !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create your first custom KPI to start tracking your metrics'}
                  </Typography>
                  {!searchQuery && selectedCategory === 'all' && (
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<AddIcon />} 
                      onClick={() => setShowFormDialog(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      Create Your First KPI
                    </Button>
                  )}
                </Paper>
              )}

              {/* KPI Grid */}
              {!loading && filteredKpis.length > 0 && (
                <Grid container spacing={3}>
                  {filteredKpis.map((kpi, index) => renderKpiCard(kpi, index))}
                </Grid>
              )}
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 1 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <InsightsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Analytics Coming Soon
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track trends and compare your custom KPIs over time
              </Typography>
            </Box>
          )}
        </CardContent>
      </GlassCard>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl && selectedKpiMenu)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedKpiMenu(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            minWidth: 180
          }
        }}
      >
        <MenuItem onClick={() => {
          const kpi = customKpis.find(k => k._id === selectedKpiMenu);
          if (kpi) handleEditKpi(kpi);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit KPI
        </MenuItem>
        <MenuItem onClick={() => {
          const kpi = customKpis.find(k => k._id === selectedKpiMenu);
          if (kpi) handleCalculateKpi(kpi._id);
        }}>
          <CalculateIcon fontSize="small" sx={{ mr: 1 }} />
          Recalculate
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            const kpi = customKpis.find(k => k._id === selectedKpiMenu);
            if (kpi) handleOpenDeleteDialog(kpi._id, kpi.displayName);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Form Dialog */}
      <Dialog
        open={showFormDialog}
        onClose={() => { 
          setShowFormDialog(false); 
          setKpiToEdit(null); 
        }}
        maxWidth="md" 
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.95)
          } 
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          fontWeight: 700,
          fontSize: '1.5rem',
          borderBottom: `1px solid ${theme.palette.divider}` 
        }}>
          {kpiToEdit ? 'Edit Custom KPI' : 'Create New Custom KPI'}
        </DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <CustomKpiForm 
            onKpiSaved={handleKpiSaved} 
            kpiToEdit={kpiToEdit}
            onCancelEdit={() => { 
              setShowFormDialog(false); 
              setKpiToEdit(null); 
            }}
            key={kpiToEdit?._id || 'new-custom-kpi'} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
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
          <Typography>
            Are you sure you want to delete the KPI "<strong>{deleteDialog.name}</strong>"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteKpi} 
            color="error" 
            variant="contained" 
            autoFocus
            sx={{ borderRadius: 2 }}
          >
            Delete KPI
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomKpiSection;