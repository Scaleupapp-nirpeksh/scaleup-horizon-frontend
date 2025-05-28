// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Grid, Tabs, Tab, Snackbar, Alert,
  LinearProgress, Stack, Chip, Breadcrumbs, Link, IconButton,
  ToggleButtonGroup, ToggleButton, alpha, Backdrop, CircularProgress,
  SpeedDial, SpeedDialAction, SpeedDialIcon, Dialog, DialogActions,
  DialogContent, DialogTitle, Button
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Icons
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import EmailIcon from '@mui/icons-material/Email';

// Components - Updated paths
import { GlassCard } from '../components/analytics/StyledComponents';
import MetricCards from '../components/analytics/MetricCards';
import RunwayScenarios from '../components/analytics/RunwayScenarios';
import FundraisingPredictions from '../components/analytics/FundraisingPredictions';
import CashFlowForecasts from '../components/analytics/CashFlowForecasts';
import RevenueCohorts from '../components/analytics/RevenueCohorts';
// API calls for initialization
import {
  getFundraisingReadiness,
  getCurrentCashPosition,
  getCohortsComparison
} from '../services/api';

const AnalyticsPage = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('charts');
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  
  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Data state
  const [fundraisingReadiness, setFundraisingReadiness] = useState(null);
  const [currentCashPosition, setCurrentCashPosition] = useState(null);
  const [cohortComparison, setCohortComparison] = useState(null);

  // Fetch initial data
  const fetchInitialData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      // Only fetch summary metrics here, individual sections will fetch their own data
      const [
        fundraisingRes,
        currentCashRes,
        cohortCompareRes
      ] = await Promise.all([
        getFundraisingReadiness(),
        getCurrentCashPosition(),
        getCohortsComparison()
      ]);

      setFundraisingReadiness(fundraisingRes.data || null);
      setCurrentCashPosition(currentCashRes.data || null);
      setCohortComparison(cohortCompareRes.data || null);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handle deleting items
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      setLoading(true);
      
      switch (itemToDelete.type) {
        case 'scenario':
          // This would be handled in the RunwayScenarios component
          break;
        case 'prediction':
          // This would be handled in the Fundraising component
          break;
        case 'forecast':
          // This would be handled in the CashFlow component
          break;
        case 'cohort':
          // This would be handled in the Cohorts component
          break;
        default:
          break;
      }
      
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchInitialData(true);
    } catch (err) {
      setError(`Failed to delete ${itemToDelete.type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Export functions (would implement properly in a real app)
  const exportToPDF = () => {
    setSuccess('PDF export started. Check your downloads.');
  };

  const exportToCSV = () => {
    setSuccess('CSV export started. Check your downloads.');
  };

  const shareViaEmail = () => {
    setSuccess('Report shared via email successfully.');
  };

  // Render insights panel (simplified version)
  const renderInsights = () => {
    return (
      <GlassCard>
        <Box sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              AI-Generated Insights & Recommendations
            </Typography>
            <IconButton onClick={() => setViewMode('charts')}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant="body1">
            The insights panel would be implemented here with real data from the API.
            It would analyze the runway scenarios, fundraising predictions, cash flow forecasts,
            and cohort analysis to provide actionable recommendations.
          </Typography>
        </Box>
      </GlassCard>
    );
  };

  if (loading && !refreshing) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
        {/* Header Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, #303f9f 0%, #3f51b5 100%)`,
            borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
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
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
              zIndex: 1
            },
          }}
        >
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
            <Breadcrumbs
              separator={<KeyboardArrowRightIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />}
              aria-label="breadcrumb"
              sx={{ mb: 2 }}
            >
              <Link 
                color="inherit" 
                href="/" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' }
                }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Dashboard
              </Link>
              <Typography sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                <InsightsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Predictive Analytics
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
                    color: 'white',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <InsightsIcon sx={{ mr: 1.5, fontSize: '2.5rem' }} />
                  Predictive Analytics
                  <Chip
                    icon={<InsightsIcon />}
                    label="AI-Powered"
                    size="small"
                    sx={{ 
                      ml: 2,
                      bgcolor: alpha('#fff', 0.2),
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    maxWidth: 600
                  }}
                >
                  Leverage machine learning to predict runway, optimize fundraising timing, and analyze revenue cohorts with confidence intervals.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton
                  onClick={() => fetchInitialData(true)}
                  sx={{
                    bgcolor: alpha('#fff', 0.1),
                    color: 'white',
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.2),
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  aria-label="view mode"
                  size="small"
                  sx={{ 
                    bgcolor: alpha('#fff', 0.1),
                    borderRadius: 1,
                    '& .MuiToggleButton-root': {
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-selected': {
                        bgcolor: alpha('#fff', 0.2),
                        color: 'white',
                      }
                    }
                  }}
                >
                  <ToggleButton value="charts" aria-label="charts view">
                    <ShowChartIcon />
                  </ToggleButton>
                  <ToggleButton value="insights" aria-label="insights view">
                    <LightbulbIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
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

          {/* Refresh Progress */}
          {refreshing && (
            <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 1200 }}>
              <LinearProgress color="secondary" />
            </Box>
          )}

          {/* Metric Summary Cards */}
          <MetricCards 
            selectedScenario={null} // This will come from RunwayScenarios component
            fundraisingReadiness={fundraisingReadiness}
            currentCashPosition={currentCashPosition}
            cohortComparison={cohortComparison}
          />

          {/* Main Content Tabs */}
          {viewMode === 'charts' ? (
            <GlassCard sx={{ mb: 4 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, v) => setActiveTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="analytics tabs"
                >
                  <Tab
                    icon={<TimelineIcon />}
                    iconPosition="start"
                    label="Runway Scenarios"
                    sx={{ textTransform: 'none', py: 2 }}
                  />
                  <Tab
                    icon={<RocketLaunchIcon />}
                    iconPosition="start"
                    label="Fundraising"
                    sx={{ textTransform: 'none', py: 2 }}
                  />
                  <Tab
                    icon={<AccountBalanceIcon />}
                    iconPosition="start"
                    label="Cash Flow"
                    sx={{ textTransform: 'none', py: 2 }}
                  />
                  <Tab
                    icon={<PeopleIcon />}
                    iconPosition="start"
                    label="Revenue Cohorts"
                    sx={{ textTransform: 'none', py: 2 }}
                  />
                </Tabs>
              </Box>

              <Box sx={{ p: 4 }}>
                {/* Runway Scenarios Tab */}
                <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                  <RunwayScenarios 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onEditItem={(type, item) => {
                      // Handle edit through the component itself
                    }}
                    onDeleteItem={(item) => {
                      setItemToDelete(item);
                      setDeleteConfirmOpen(true);
                    }}
                    onShowSuccess={(message) => setSuccess(message)}
                    onShowError={(message) => setError(message)}
                    refreshData={refreshing}
                  />
                </Box>

                {/* Fundraising Tab */}
                <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                  <FundraisingPredictions 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onEditItem={(type, item) => {
                      // Handle edit through the component itself
                    }}
                    onDeleteItem={(item) => {
                      setItemToDelete(item);
                      setDeleteConfirmOpen(true);
                    }}
                    onShowSuccess={(message) => setSuccess(message)}
                    onShowError={(message) => setError(message)}
                    refreshData={refreshing}
                  />
                </Box>

                {/* Cash Flow Tab */}
                <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
                  <CashFlowForecasts 
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onEditItem={(type, item) => {
                      // Handle edit through the component itself
                    }}
                    onDeleteItem={(item) => {
                      setItemToDelete(item);
                      setDeleteConfirmOpen(true);
                    }}
                    onShowSuccess={(message) => setSuccess(message)}
                    onShowError={(message) => setError(message)}
                    refreshData={refreshing}
                  />
                </Box>

                
                <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
  <RevenueCohorts 
    viewMode={viewMode}
    setViewMode={setViewMode}
    onEditItem={(type, item) => {
      // Handle edit through the component itself
    }}
    onDeleteItem={(item) => {
      setItemToDelete(item);
      setDeleteConfirmOpen(true);
    }}
    onShowSuccess={(message) => setSuccess(message)}
    onShowError={(message) => setError(message)}
    refreshData={refreshing}
  />
</Box>
              </Box>
            </GlassCard>
          ) : (
            // Insights View
            renderInsights()
          )}
        </Container>

        {/* Speed Dial for quick actions */}
        <SpeedDial
          ariaLabel="Analytics actions"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
          onClose={() => setOpenSpeedDial(false)}
          onOpen={() => setOpenSpeedDial(true)}
          open={openSpeedDial}
        >
          <SpeedDialAction
            icon={<PictureAsPdfIcon />}
            tooltipTitle="Export as PDF"
            onClick={exportToPDF}
          />
          <SpeedDialAction
            icon={<TableChartIcon />}
            tooltipTitle="Export as CSV"
            onClick={exportToCSV}
          />
          <SpeedDialAction
            icon={<EmailIcon />}
            tooltipTitle="Share via Email"
            onClick={shareViaEmail}
          />
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Refresh Data"
            onClick={() => fetchInitialData(true)}
          />
        </SpeedDial>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
          }}
          PaperProps={{
            sx: {
              borderRadius: 3
            }
          }}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setDeleteConfirmOpen(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="error"
              onClick={handleDeleteItem}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;