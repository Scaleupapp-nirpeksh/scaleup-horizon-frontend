// src/pages/BudgetPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Grid, Paper, List, ListItem, ListItemText,
  IconButton, Tooltip, Button, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, FormControl, InputLabel, Select,
  MenuItem, TextField, CircularProgress, Alert, Card, CardContent,
  CardHeader, Avatar, Stack, useTheme, alpha, Fade, Grow, Skeleton,
  Chip, LinearProgress, ToggleButton, ToggleButtonGroup, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, Collapse, ButtonGroup, Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BudgetForm from '../components/budgets/BudgetForm';
import { getBudgets, deleteBudget, getBudgetVsActualsReport } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PieChartIcon from '@mui/icons-material/PieChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import TimelineIcon from '@mui/icons-material/Timeline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, RadialBarChart, RadialBar } from 'recharts';

// Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const MetricCard = styled(Paper)(({ theme, colorType }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette[colorType].light, 0.15)} 0%, ${alpha(theme.palette[colorType].main, 0.08)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette[colorType].main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: alpha(theme.palette[colorType].main, 0.1),
  }
}));

const BudgetCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    borderColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
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

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'active' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.dark,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(status === 'overbudget' && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.dark,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  }),
  ...(status === 'warning' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.dark,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
}));

const CircularProgressWithLabel = ({ value, size = 60, thickness = 4, color = 'primary' }) => {
  const theme = useTheme();
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: alpha(theme.palette.grey[300], 0.2) }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        color={color}
        sx={{ position: 'absolute', left: 0 }}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" component="div" color="text.primary" sx={{ fontWeight: 700 }}>
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

// Chart Colors
const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// Components
const BudgetOverviewCard = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme();
  return (
    <MetricCard colorType={color} elevation={0}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette[color].dark, mb: 0.5 }}>
            {typeof value === 'number' && title !== 'Active Budgets' && title !== 'Over Budget' 
              ? `₹${value.toLocaleString()}` 
              : value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ 
          bgcolor: alpha(theme.palette[color].main, 0.2), 
          color: theme.palette[color].main, 
          width: 56, 
          height: 56,
          position: 'relative',
          zIndex: 1
        }}>
          {icon}
        </Avatar>
      </Stack>
    </MetricCard>
  );
};

const BudgetPage = () => {
  const theme = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [budgetReport, setBudgetReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBudgets();
      setBudgets(response.data || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setMessage({ type: 'error', text: 'Could not load budgets.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleBudgetSaved = (savedBudget) => {
    fetchBudgets(); 
    setBudgetToEdit(null);
    setShowFormDialog(false);
    setMessage({ type: 'success', text: `Budget "${savedBudget.name}" saved.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleEditBudget = (budget) => {
    setBudgetToEdit(budget);
    setShowFormDialog(true);
  };

  const handleDeleteBudget = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the budget "${name}"?`)) {
      try {
        await deleteBudget(id);
        setMessage({ type: 'success', text: `Budget "${name}" deleted.` });
        fetchBudgets(); 
      } catch (error) {
        console.error("Error deleting budget:", error);
        setMessage({ type: 'error', text: 'Could not delete budget.' });
      }
    }
  };
  
  const handleViewBudgetVsActuals = async (budget) => {
    setSelectedBudget(budget);
    setReportLoading(true);
    setBudgetReport(null);
    try {
      const response = await getBudgetVsActualsReport({ budgetId: budget._id });
      setBudgetReport(response.data);
      setActiveTab(1); // Switch to report tab
    } catch (error) {
      console.error("Error fetching budget vs actuals:", error);
      setMessage({type: 'error', text: 'Could not fetch budget vs actuals report.'});
    } finally {
      setReportLoading(false);
    }
  };

  // Calculate overview metrics from real data
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.totalBudgetedAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.totalActualSpent || 0), 0);
  const activeBudgets = budgets.filter(b => b.status === 'active').length;
  const overBudgetCount = budgets.filter(b => b.status === 'overbudget').length;

  // Get budget status with color
  const getBudgetStatus = (budget) => {
    if (budget.status === 'overbudget') return { status: 'overbudget', label: 'Over Budget' };
    if (budget.status === 'warning') return { status: 'warning', label: 'At Risk' };
    return { status: 'active', label: 'On Track' };
  };

  // Generate chart data for report
  const generateChartData = () => {
    if (!budgetReport) return [];
    return budgetReport.reportItems.map(item => ({
      category: item.category,
      budgeted: item.budgetedAmount,
      actual: item.actualSpent,
      variance: Math.abs(item.variance)
    }));
  };

  const generatePieData = () => {
    if (!budgetReport) return [];
    return budgetReport.reportItems.map(item => ({
      name: item.category,
      value: item.actualSpent,
      color: item.variance < 0 ? CHART_COLORS.error : CHART_COLORS.success
    }));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      {/* Hero Section */}
      <Box sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        py: 4,
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
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', mb: 1, display: 'flex', alignItems: 'center' }}>
                <AccountBalanceWalletIcon sx={{ mr: 1.5, fontSize: '2.5rem' }} />
                Budget Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track spending, manage budgets, and analyze financial performance
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setBudgetToEdit(null);
                setShowFormDialog(true);
              }}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 4,
                py: 1.5,
                px: 3,
                '&:hover': { boxShadow: 8 }
              }}
            >
              Create Budget
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {message.text && (
          <Fade in>
            <Box sx={{ mb: 3 }}>
              <AlertMessage message={message.text} severity={message.type} />
            </Box>
          </Fade>
        )}

        {/* Overview Metrics - ALL FROM REAL DATA */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={500}>
              <Box>
                <BudgetOverviewCard
                  title="Total Budget"
                  value={totalBudgeted}
                  icon={<AccountBalanceWalletIcon />}
                  color="primary"
                  subtitle={`Across ${budgets.length} budgets`}
                />
              </Box>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={700}>
              <Box>
                <BudgetOverviewCard
                  title="Active Budgets"
                  value={activeBudgets}
                  icon={<CheckCircleIcon />}
                  color="success"
                  subtitle="Currently tracking"
                />
              </Box>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={900}>
              <Box>
                <BudgetOverviewCard
                  title="Over Budget"
                  value={overBudgetCount}
                  icon={<WarningAmberIcon />}
                  color="error"
                  subtitle="Need attention"
                />
              </Box>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={1100}>
              <Box>
                <BudgetOverviewCard
                  title="Total Spent"
                  value={totalSpent}
                  icon={<AttachMoneyIcon />}
                  color="info"
                  subtitle="Actual spending"
                />
              </Box>
            </Grow>
          </Grid>
        </Grid>

        {/* Main Content */}
        <GlassCard>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <StyledTab label="Budget Overview" icon={<PieChartIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
                <StyledTab 
                  label="Budget Analysis" 
                  icon={<AssessmentIcon sx={{ fontSize: 20 }} />} 
                  iconPosition="start"
                  disabled={!budgetReport}
                />
              </Tabs>
              {activeTab === 0 && (
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, v) => v && setViewMode(v)}
                  size="small"
                >
                  <ToggleButton value="grid">Grid</ToggleButton>
                  <ToggleButton value="list">List</ToggleButton>
                </ToggleButtonGroup>
              )}
            </Stack>

            {/* Budget Overview Tab */}
            {activeTab === 0 && (
              <Fade in>
                <Box>
                  {loading ? (
                    <Grid container spacing={3}>
                      {[...Array(4)].map((_, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : budgets.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <AccountBalanceWalletIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No budgets created yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Start by creating your first budget to track expenses
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowFormDialog(true)}
                      >
                        Create First Budget
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {budgets.map((budget, index) => {
                        const status = getBudgetStatus(budget);
                        const spentPercentage = (budget.totalActualSpent || 0) / budget.totalBudgetedAmount * 100;
                        
                        return (
                          <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={budget._id}>
                            <Grow in timeout={index * 100}>
                              <BudgetCard onClick={() => handleViewBudgetVsActuals(budget)}>
                                <Stack spacing={2}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {budget.name}
                                      </Typography>
                                      <StatusChip
                                        label={status.label}
                                        size="small"
                                        status={status.status}
                                      />
                                    </Box>
                                    <Stack direction="row" spacing={0.5}>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditBudget(budget);
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteBudget(budget._id, budget.name);
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Stack>
                                  </Stack>

                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <CalendarMonthIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                      {new Date(budget.periodStartDate).toLocaleDateString()} - {new Date(budget.periodEndDate).toLocaleDateString()}
                                    </Typography>
                                  </Stack>

                                  <Box>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Budget Progress
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        ₹{(budget.totalActualSpent || 0).toLocaleString()} / ₹{budget.totalBudgetedAmount.toLocaleString()}
                                      </Typography>
                                    </Stack>
                                    <LinearProgress
                                      variant="determinate"
                                      value={Math.min(spentPercentage, 100)}
                                      sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: alpha(theme.palette.grey[300], 0.2),
                                        '& .MuiLinearProgress-bar': {
                                          borderRadius: 4,
                                          backgroundColor: spentPercentage > 100 
                                            ? theme.palette.error.main 
                                            : spentPercentage > 80 
                                            ? theme.palette.warning.main 
                                            : theme.palette.success.main
                                        }
                                      }}
                                    />
                                  </Box>

                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Remaining
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                        ₹{Math.max(budget.totalBudgetedAmount - (budget.totalActualSpent || 0), 0).toLocaleString()}
                                      </Typography>
                                    </Box>
                                    <CircularProgressWithLabel
                                      value={Math.min(spentPercentage, 100)}
                                      color={spentPercentage > 100 ? "error" : spentPercentage > 80 ? "warning" : "success"}
                                    />
                                  </Stack>
                                </Stack>
                              </BudgetCard>
                            </Grow>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Box>
              </Fade>
            )}

            {/* Budget Analysis Tab */}
            {activeTab === 1 && budgetReport && (
              <Fade in>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {budgetReport.budgetName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Period: {new Date(budgetReport.periodStartDate).toLocaleDateString()} - {new Date(budgetReport.periodEndDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <ButtonGroup variant="outlined" size="small">
                      <Button startIcon={<VisibilityIcon />}>Export</Button>
                      <Button startIcon={<TimelineIcon />}>Trends</Button>
                    </ButtonGroup>
                  </Stack>

                  {/* Summary Cards */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                          ₹{budgetReport.totals.totalBudgeted.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Budget
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <Typography variant="h5" color="info.main" sx={{ fontWeight: 700 }}>
                          ₹{budgetReport.totals.totalActualSpent.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Actual Spent
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: alpha(
                        budgetReport.totals.totalVariance < 0 ? theme.palette.error.main : theme.palette.success.main, 
                        0.05
                      )}}>
                        <Typography 
                          variant="h5" 
                          color={budgetReport.totals.totalVariance < 0 ? 'error.main' : 'success.main'}
                          sx={{ fontWeight: 700 }}
                        >
                          ₹{Math.abs(budgetReport.totals.totalVariance).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {budgetReport.totals.totalVariance < 0 ? 'Over Budget' : 'Under Budget'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {((budgetReport.totals.totalActualSpent / budgetReport.totals.totalBudgeted) * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Utilization
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Charts */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} lg={8}>
                      <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                          Budget vs Actual by Category
                        </Typography>
                        {reportLoading ? (
                          <Skeleton variant="rectangular" height={300} />
                        ) : (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={generateChartData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                              <XAxis dataKey="category" />
                              <YAxis />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: alpha(theme.palette.background.paper, 0.98),
                                  border: 'none',
                                  borderRadius: 12,
                                  boxShadow: theme.shadows[8],
                                }}
                              />
                              <Legend />
                              <Bar dataKey="budgeted" fill={CHART_COLORS.primary} name="Budgeted" radius={[8, 8, 0, 0]} />
                              <Bar dataKey="actual" fill={CHART_COLORS.info} name="Actual" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </Paper>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                      <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                          Spending Distribution
                        </Typography>
                        {reportLoading ? (
                          <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={generatePieData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {generatePieData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[Object.keys(CHART_COLORS)[index % Object.keys(CHART_COLORS).length]]} />
                                ))}
                              </Pie>
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: alpha(theme.palette.background.paper, 0.98),
                                  border: 'none',
                                  borderRadius: 12,
                                  boxShadow: theme.shadows[8],
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Detailed Table */}
                  <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Budgeted</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actual</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Variance</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Progress</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {budgetReport.reportItems.map((item, index) => {
                            const percentage = (item.actualSpent / item.budgetedAmount) * 100;
                            return (
                              <TableRow key={index} sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 32, height: 32 }}>
                                      <CategoryIcon fontSize="small" color="primary" />
                                    </Avatar>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {item.category}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="right">₹{item.budgetedAmount.toLocaleString()}</TableCell>
                                <TableCell align="right">₹{item.actualSpent.toLocaleString()}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={`₹${Math.abs(item.variance).toLocaleString()}`}
                                    size="small"
                                    color={item.variance < 0 ? 'error' : 'success'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {item.variance < 0 ? (
                                    <Tooltip title="Over Budget">
                                      <ErrorIcon color="error" fontSize="small" />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Within Budget">
                                      <CheckCircleIcon color="success" fontSize="small" />
                                    </Tooltip>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={Math.min(percentage, 100)}
                                      sx={{
                                        flex: 1,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: alpha(theme.palette.grey[300], 0.2),
                                        '& .MuiLinearProgress-bar': {
                                          borderRadius: 3,
                                          backgroundColor: percentage > 100 
                                            ? theme.palette.error.main 
                                            : percentage > 80 
                                            ? theme.palette.warning.main 
                                            : theme.palette.success.main
                                        }
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ minWidth: 45, fontWeight: 600 }}>
                                      {percentage.toFixed(0)}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                            <TableCell sx={{ fontWeight: 700 }}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                                  <AttachMoneyIcon fontSize="small" />
                                </Avatar>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                  Total
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              ₹{budgetReport.totals.totalBudgeted.toLocaleString()}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              ₹{budgetReport.totals.totalActualSpent.toLocaleString()}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              <Chip
                                label={`₹${Math.abs(budgetReport.totals.totalVariance).toLocaleString()}`}
                                color={budgetReport.totals.totalVariance < 0 ? 'error' : 'success'}
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {budgetReport.totals.totalVariance < 0 ? (
                                <ErrorIcon color="error" />
                              ) : (
                                <CheckCircleIcon color="success" />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {((budgetReport.totals.totalActualSpent / budgetReport.totals.totalBudgeted) * 100).toFixed(0)}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              </Fade>
            )}
          </CardContent>
        </GlassCard>

        {/* Form Dialog */}
        <Dialog
          open={showFormDialog}
          onClose={() => {
            setShowFormDialog(false);
            setBudgetToEdit(null);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            {budgetToEdit ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <BudgetForm 
                onBudgetSaved={handleBudgetSaved} 
                budgetToEdit={budgetToEdit}
                onCancelEdit={() => {
                  setBudgetToEdit(null);
                  setShowFormDialog(false);
                }}
                key={budgetToEdit?._id || 'new-budget'} 
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BudgetPage;