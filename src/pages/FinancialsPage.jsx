// src/pages/FinancialsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Grid, Typography, Box, Paper, List, ListItem, ListItemText,
  IconButton, Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Button, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Chip, Card,
  CardHeader, CardContent, Avatar, Stack, useTheme, alpha,
  Fade, Grow, Skeleton, TextField, MenuItem, ToggleButton,
  ToggleButtonGroup, Zoom, Collapse, SwipeableDrawer, Tab, Tabs,
  LinearProgress, Badge, ButtonGroup, FormControl, Select,
  FormControlLabel, Switch
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TimelineIcon from '@mui/icons-material/Timeline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InsightsIcon from '@mui/icons-material/Insights';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';

// Recharts imports for data visualization
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, Area, AreaChart, ComposedChart
} from 'recharts';

import {
  getExpenses, getRevenue, getBankAccounts, getRecurringTransactions,
  deleteExpense, deleteRevenue, deleteBankAccount, deleteRecurringTransaction,
  updateExpense, updateRevenue, updateBankAccount, updateRecurringTransaction,
  pauseRecurringTransaction, resumeRecurringTransaction, getRecurringSummary
} from '../services/api';
import ExpenseForm from '../components/financials/ExpenseForm';
import RevenueForm from '../components/financials/RevenueForm';
import BankAccountForm from '../components/financials/BankAccountForm';
import RecurringTransactionForm from '../components/financials/RecurringTransactionForm';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12],
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  }
}));

const MetricCard = styled(GlassCard)(({ theme, colorType }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette[colorType].light, 0.15)} 0%, ${alpha(theme.palette[colorType].main, 0.08)} 100%)`,
  border: `1px solid ${alpha(theme.palette[colorType].main, 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  '& td': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  }
}));

const AnimatedChip = styled(Chip)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
  }
}));

const FilterBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(3),
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  marginRight: theme.spacing(2),
  minHeight: 40,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  }
}));

const ChartCard = styled(GlassCard)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '& .chart-header': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  }
}));

// Chart color constants
const CHART_COLORS = {
  primary: '#1976d2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  secondary: '#9c27b0',
  palette: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#67b7dc']
};

// Components
const MetricDisplay = ({ title, value, icon, color, loading }) => {
  const theme = useTheme();
  return (
    <MetricCard colorType={color} elevation={0}>
      {loading ? (
        <Skeleton variant="rectangular" height={120} />
      ) : (
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette[color].dark }}>
              ₹{value.toLocaleString()}
            </Typography>
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
      )}
    </MetricCard>
  );
};

const QuickActionCard = ({ title, description, icon, onClick, color }) => {
  const theme = useTheme();
  return (
    <GlassCard
      elevation={0}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: alpha(theme.palette[color].main, 0.05),
          borderColor: alpha(theme.palette[color].main, 0.3),
          '& .action-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          }
        }
      }}
      onClick={onClick}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar 
          className="action-icon"
          sx={{ 
            bgcolor: alpha(theme.palette[color].main, 0.1), 
            color: theme.palette[color].main,
            transition: 'transform 0.3s ease'
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">{description}</Typography>
        </Box>
      </Stack>
    </GlassCard>
  );
};

const EditableField = ({ value, onSave, type = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography>{type === 'currency' ? `₹${value.toLocaleString()}` : value}</Typography>
        <IconButton size="small" onClick={() => setIsEditing(true)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Stack>
    );
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <TextField
        size="small"
        value={editValue}
        onChange={(e) => setEditValue(type === 'currency' ? parseFloat(e.target.value) || 0 : e.target.value)}
        type={type === 'currency' ? 'number' : 'text'}
        autoFocus
      />
      <IconButton size="small" color="success" onClick={handleSave}>
        <CheckIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" color="error" onClick={handleCancel}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
};

const FinancialsPage = () => {
  const theme = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [recurringSummary, setRecurringSummary] = useState(null);

  const [loading, setLoading] = useState({
    expenses: false, revenue: false, bankAccounts: false, recurring: false
  });
  const [globalMsg, setGlobalMsg] = useState({ type: '', text: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, type: '', name: '' });
  const [showForms, setShowForms] = useState({ expense: false, revenue: false, recurring: false, bankAccount: false });
  
  // Filters
  const [transactionType, setTransactionType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // New state for analytics
  const [viewMode, setViewMode] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [comparisonEnabled, setComparisonEnabled] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading({ expenses: true, revenue: true, bankAccounts: true, recurring: true });
    try {
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start.toISOString();
      if (dateRange.end) params.endDate = dateRange.end.toISOString();

      const [e, r, b, rc, rs] = await Promise.all([
        getExpenses({ ...params, limit: 20, sort: '-date' }),
        getRevenue({ ...params, limit: 20, sort: '-date' }),
        getBankAccounts(),
        getRecurringTransactions({ limit: 20, sort: 'nextDueDate' }),
        getRecurringSummary()
      ]);
      setExpenses(e.data); 
      setRevenues(r.data); 
      setBankAccounts(b.data); 
      setRecurring(rc.data);
      setRecurringSummary(rs.data);
    } catch {
      setGlobalMsg({ type: 'error', text: 'Failed to load data. Refresh please.' });
    } finally {
      setLoading({ expenses: false, revenue: false, bankAccounts: false, recurring: false });
    }
  }, [dateRange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async () => {
    const { id, type } = deleteDialog;
    const fn = {
      expense: deleteExpense,
      revenue: deleteRevenue,
      bankAccount: deleteBankAccount,
      recurringTransaction: deleteRecurringTransaction
    }[type];
    try {
      await fn(id);
      setGlobalMsg({ type: 'success', text: `${deleteDialog.name} deleted!` });
      fetchAll();
    } catch {
      setGlobalMsg({ type: 'error', text: `Could not delete ${type}.` });
    } finally {
      setDeleteDialog({ open: false, id: null, type: '', name: '' });
    }
  };

  const handleUpdateBankAccount = async (id, field, value) => {
    try {
      const account = bankAccounts.find(acc => acc._id === id);
      await updateBankAccount(id, { ...account, [field]: value });
      setGlobalMsg({ type: 'success', text: 'Bank account updated!' });
      fetchAll();
    } catch {
      setGlobalMsg({ type: 'error', text: 'Failed to update bank account.' });
    }
  };

  const handleUpdateTransaction = async (id, type, updates) => {
    try {
      if (type === 'expense') {
        await updateExpense(id, updates);
      } else {
        await updateRevenue(id, updates);
      }
      setGlobalMsg({ type: 'success', text: 'Transaction updated!' });
      fetchAll();
    } catch {
      setGlobalMsg({ type: 'error', text: 'Failed to update transaction.' });
    }
  };

  const handleToggleRecurring = async (id, isPaused) => {
    try {
      if (isPaused) {
        await resumeRecurringTransaction(id);
      } else {
        await pauseRecurringTransaction(id);
      }
      setGlobalMsg({ type: 'success', text: `Recurring transaction ${isPaused ? 'resumed' : 'paused'}!` });
      fetchAll();
    } catch {
      setGlobalMsg({ type: 'error', text: 'Failed to update recurring transaction.' });
    }
  };

  // Calculate metrics from real data
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let allTransactions = [];
    
    if (transactionType === 'all' || transactionType === 'revenue') {
      allTransactions = [...allTransactions, ...revenues.map(r => ({ ...r, type: 'revenue' }))];
    }
    if (transactionType === 'all' || transactionType === 'expense') {
      allTransactions = [...allTransactions, ...expenses.map(e => ({ ...e, type: 'expense' }))];
    }
    
    return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactionType, expenses, revenues]);

  // Analytics calculations
  const calculateAnalytics = useMemo(() => {
    const now = new Date();
    const periods = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };
    
    const daysToShow = periods[selectedPeriod];
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToShow);
    
    // 1. Daily trend data
    const dailyTrend = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayExpenses = expenses
        .filter(e => e.date.startsWith(dateStr))
        .reduce((sum, e) => sum + e.amount, 0);
      
      const dayRevenue = revenues
        .filter(r => r.date.startsWith(dateStr))
        .reduce((sum, r) => sum + r.amount, 0);
      
      dailyTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        expenses: dayExpenses,
        revenue: dayRevenue,
        profit: dayRevenue - dayExpenses
      });
    }
    
    // 2. Category breakdown for expenses
    const expenseByCategory = {};
    expenses.forEach(expense => {
      const cat = expense.category || 'Other';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + expense.amount;
    });
    
    const categoryData = Object.entries(expenseByCategory)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.value - a.value);
    
    // 3. Revenue by source
    const revenueBySource = {};
    revenues.forEach(revenue => {
      const src = revenue.source || 'Other';
      revenueBySource[src] = (revenueBySource[src] || 0) + revenue.amount;
    });
    
    const sourceData = Object.entries(revenueBySource)
      .map(([source, amount]) => ({
        name: source,
        value: amount,
        percentage: totalRevenue > 0 ? (amount / totalRevenue * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.value - a.value);
    
    // 4. Month-over-month comparison
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthExpenses = expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    const lastMonthExpenses = expenses
      .filter(e => {
        const date = new Date(e.date);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return date.getMonth() === lastMonth && date.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    const expenseChange = lastMonthExpenses ? 
      ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100) : 0;
    
    // 5. Top expenses
    const topExpenses = expenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(e => ({
        name: e.vendor || e.description,
        amount: e.amount,
        category: e.category,
        date: new Date(e.date).toLocaleDateString()
      }));
    
    return {
      dailyTrend,
      categoryData,
      sourceData,
      expenseChange,
      thisMonthExpenses,
      lastMonthExpenses,
      topExpenses,
      avgDailyExpense: daysToShow > 0 ? totalExpenses / daysToShow : 0,
      avgDailyRevenue: daysToShow > 0 ? totalRevenue / daysToShow : 0,
      profitMargin: totalRevenue ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0
    };
  }, [expenses, revenues, selectedPeriod, totalExpenses, totalRevenue]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
        {/* Hero Section with Gradient */}
        <Box sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 50%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
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
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', mb: 1 }}>
                  Financial Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track your income, expenses, and financial health
                </Typography>
              </Box>
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': { boxShadow: 4 }
              }}>
                <Badge badgeContent={dateRange.start || dateRange.end ? 1 : 0} color="primary">
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="xl">
          {globalMsg.text && (
            <Fade in>
              <Box sx={{ mb: 3 }}>
                <AlertMessage message={globalMsg.text} severity={globalMsg.type} />
              </Box>
            </Fade>
          )}

          {/* Key Metrics - ALL FROM REAL DATA */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={500}>
                <Box>
                  <MetricDisplay
                    title="Total Balance"
                    value={totalBalance}
                    icon={<AccountBalanceWalletIcon />}
                    color="primary"
                    loading={loading.bankAccounts}
                  />
                </Box>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={700}>
                <Box>
                  <MetricDisplay
                    title="Total Revenue"
                    value={totalRevenue}
                    icon={<TrendingUpIcon />}
                    color="success"
                    loading={loading.revenue}
                  />
                </Box>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={900}>
                <Box>
                  <MetricDisplay
                    title="Total Expenses"
                    value={totalExpenses}
                    icon={<TrendingDownIcon />}
                    color="error"
                    loading={loading.expenses}
                  />
                </Box>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={1100}>
                <Box>
                  <MetricDisplay
                    title="Net Income"
                    value={netIncome}
                    icon={<PointOfSaleIcon />}
                    color={netIncome >= 0 ? "success" : "error"}
                    loading={loading.expenses || loading.revenue}
                  />
                </Box>
              </Grow>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Add Expense"
                  description="Record a new expense"
                  icon={<PaymentsIcon />}
                  color="error"
                  onClick={() => setShowForms({ expense: true, revenue: false, recurring: false, bankAccount: false })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Add Revenue"
                  description="Record new income"
                  icon={<PointOfSaleIcon />}
                  color="success"
                  onClick={() => setShowForms({ expense: false, revenue: true, recurring: false, bankAccount: false })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Recurring Transaction"
                  description="Set up recurring items"
                  icon={<AutorenewIcon />}
                  color="primary"
                  onClick={() => setShowForms({ expense: false, revenue: false, recurring: true, bankAccount: false })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Add Bank Account"
                  description="Link a new account"
                  icon={<AccountBalanceIcon />}
                  color="info"
                  onClick={() => setShowForms({ expense: false, revenue: false, recurring: false, bankAccount: true })}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Forms Section */}
          <Collapse in={showForms.expense || showForms.revenue || showForms.recurring || showForms.bankAccount}>
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                {showForms.expense && (
                  <Grid item xs={12} md={4}>
                    <Zoom in>
                      <Box>
                        <ExpenseForm onExpenseAdded={() => {
                          fetchAll();
                          setShowForms({ expense: false, revenue: false, recurring: false, bankAccount: false });
                        }} />
                      </Box>
                    </Zoom>
                  </Grid>
                )}
                {showForms.revenue && (
                  <Grid item xs={12} md={4}>
                    <Zoom in>
                      <Box>
                        <RevenueForm onRevenueAdded={() => {
                          fetchAll();
                          setShowForms({ expense: false, revenue: false, recurring: false, bankAccount: false });
                        }} />
                      </Box>
                    </Zoom>
                  </Grid>
                )}
                {showForms.recurring && (
                  <Grid item xs={12} md={4}>
                    <Zoom in>
                      <Box>
                        <RecurringTransactionForm onTransactionAdded={() => {
                          fetchAll();
                          setShowForms({ expense: false, revenue: false, recurring: false, bankAccount: false });
                        }} />
                      </Box>
                    </Zoom>
                  </Grid>
                )}
                {showForms.bankAccount && (
                  <Grid item xs={12} md={4}>
                    <Zoom in>
                      <Box>
                        <BankAccountForm onAccountAdded={() => {
                          fetchAll();
                          setShowForms({ expense: false, revenue: false, recurring: false, bankAccount: false });
                        }} />
                      </Box>
                    </Zoom>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>

          {/* Main Content with Tabs */}
          <StyledCard sx={{ mb: 4 }}>
            <CardContent>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <StyledTab label="Overview" icon={<ReceiptLongIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
                <StyledTab label="Bank Accounts" icon={<AccountBalanceIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
                <StyledTab label="Recurring" icon={<AutorenewIcon sx={{ fontSize: 20 }} />} iconPosition="start" />
              </Tabs>

              {/* Enhanced Overview Tab */}
              {activeTab === 0 && (
                <Fade in>
                  <Box>
                    {/* View Mode Toggle */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, v) => v && setViewMode(v)}
                        size="small"
                      >
                        <ToggleButton value="dashboard">
                          <InsightsIcon sx={{ mr: 1, fontSize: 20 }} />
                          Analytics Dashboard
                        </ToggleButton>
                        <ToggleButton value="table">
                          <ReceiptLongIcon sx={{ mr: 1, fontSize: 20 }} />
                          Transactions Table
                        </ToggleButton>
                      </ToggleButtonGroup>
                      
                      <Stack direction="row" spacing={2}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="week">Last 7 Days</MenuItem>
                            <MenuItem value="month">Last 30 Days</MenuItem>
                            <MenuItem value="quarter">Last Quarter</MenuItem>
                            <MenuItem value="year">Last Year</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={comparisonEnabled} 
                              onChange={(e) => setComparisonEnabled(e.target.checked)} 
                              size="small"
                            />
                          }
                          label="Compare Periods"
                        />
                      </Stack>
                    </Box>

                    {viewMode === 'dashboard' ? (
                      <Box>
                        {/* Insights Row */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12} md={3}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                              <Typography variant="caption" color="text.secondary">
                                Avg Daily Expense
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                ₹{calculateAnalytics.avgDailyExpense.toFixed(0)}
                              </Typography>
                              <Typography variant="caption" color={calculateAnalytics.expenseChange > 0 ? 'error' : 'success'}>
                                {calculateAnalytics.expenseChange > 0 ? '↑' : '↓'} 
                                {Math.abs(calculateAnalytics.expenseChange).toFixed(1)}% vs last month
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                              <Typography variant="caption" color="text.secondary">
                                Avg Daily Revenue
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                ₹{calculateAnalytics.avgDailyRevenue.toFixed(0)}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                              <Typography variant="caption" color="text.secondary">
                                Profit Margin
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {calculateAnalytics.profitMargin.toFixed(1)}%
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                              <Typography variant="caption" color="text.secondary">
                                Burn Rate (Monthly)
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                ₹{(calculateAnalytics.thisMonthExpenses).toFixed(0)}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>

                        {/* Charts Row 1: Trends */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                          <Grid item xs={12} lg={8}>
                            <ChartCard>
                              <div className="chart-header">
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                  Revenue vs Expenses Trend
                                </Typography>
                              </div>
                              <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={calculateAnalytics.dailyTrend}>
                                  <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={CHART_COLORS.error} stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor={CHART_COLORS.error} stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                                  <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                                  <YAxis stroke={theme.palette.text.secondary} />
                                  <RechartsTooltip 
                                    contentStyle={{ 
                                      backgroundColor: theme.palette.background.paper,
                                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                      borderRadius: 8
                                    }}
                                  />
                                  <Legend />
                                  <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke={CHART_COLORS.success} 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                    strokeWidth={2}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="expenses" 
                                    stroke={CHART_COLORS.error} 
                                    fillOpacity={1} 
                                    fill="url(#colorExpenses)"
                                    strokeWidth={2}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="profit" 
                                    stroke={CHART_COLORS.primary} 
                                    strokeWidth={2}
                                    dot={false}
                                    strokeDasharray="5 5"
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </ChartCard>
                          </Grid>
                          
                          <Grid item xs={12} lg={4}>
                            <ChartCard>
                              <div className="chart-header">
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  <DonutLargeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                  Expense Categories
                                </Typography>
                              </div>
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                  <Pie
                                    data={calculateAnalytics.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({name, percentage}) => `${name}: ${percentage}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {calculateAnalytics.categoryData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS.palette[index % CHART_COLORS.palette.length]} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip 
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                    contentStyle={{ 
                                      backgroundColor: theme.palette.background.paper,
                                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                      borderRadius: 8
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </ChartCard>
                          </Grid>
                        </Grid>

                        {/* Charts Row 2: Comparisons */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                          <Grid item xs={12} md={6}>
                            <ChartCard>
                              <div className="chart-header">
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                  Revenue Sources
                                </Typography>
                              </div>
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={calculateAnalytics.sourceData} layout="horizontal">
                                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                  <YAxis />
                                  <RechartsTooltip 
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                    contentStyle={{ 
                                      backgroundColor: theme.palette.background.paper,
                                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                      borderRadius: 8
                                    }}
                                  />
                                  <Bar dataKey="value" fill={CHART_COLORS.success}>
                                    {calculateAnalytics.sourceData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={alpha(CHART_COLORS.success, 0.8 - index * 0.1)} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </ChartCard>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <ChartCard>
                              <div className="chart-header">
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  Top Expenses
                                </Typography>
                              </div>
                              <List dense>
                                {calculateAnalytics.topExpenses.map((expense, index) => (
                                  <ListItem key={index} sx={{ px: 0 }}>
                                    <ListItemText
                                      primary={
                                        <Stack direction="row" justifyContent="space-between">
                                          <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>
                                            {expense.name}
                                          </Typography>
                                          <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                                            ₹{expense.amount.toLocaleString()}
                                          </Typography>
                                        </Stack>
                                      }
                                      secondary={
                                        <Stack direction="row" spacing={1}>
                                          <Chip label={expense.category} size="small" variant="outlined" />
                                          <Typography variant="caption" color="text.secondary">
                                            {expense.date}
                                          </Typography>
                                        </Stack>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </ChartCard>
                          </Grid>
                        </Grid>

                        {/* Comparison View (when enabled) */}
                        {comparisonEnabled && (
                          <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12}>
                              <ChartCard>
                                <div className="chart-header">
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    <CompareArrowsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Period Comparison
                                  </Typography>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                  <ComposedChart data={[
                                    { name: 'Previous Period', revenue: 50000, expenses: 35000, profit: 15000 },
                                    { name: 'Current Period', revenue: totalRevenue, expenses: totalExpenses, profit: netIncome }
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="revenue" fill={CHART_COLORS.success} />
                                    <Bar dataKey="expenses" fill={CHART_COLORS.error} />
                                    <Line type="monotone" dataKey="profit" stroke={CHART_COLORS.primary} strokeWidth={3} />
                                  </ComposedChart>
                                </ResponsiveContainer>
                              </ChartCard>
                            </Grid>
                          </Grid>
                        )}
                      </Box>
                    ) : (
                      // Table view
                      <Box>
                        <FilterBar>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                            <ToggleButtonGroup
                              value={transactionType}
                              exclusive
                              onChange={(e, v) => v && setTransactionType(v)}
                              size="small"
                            >
                              <ToggleButton value="all">All Transactions</ToggleButton>
                              <ToggleButton value="revenue">Revenue Only</ToggleButton>
                              <ToggleButton value="expense">Expenses Only</ToggleButton>
                            </ToggleButtonGroup>
                            <Box sx={{ flexGrow: 1 }} />
                            <Stack direction="row" spacing={2}>
                              <DatePicker
                                label="Start Date"
                                value={dateRange.start}
                                onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                                slotProps={{ textField: { size: 'small' } }}
                              />
                              <DatePicker
                                label="End Date"
                                value={dateRange.end}
                                onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                                slotProps={{ textField: { size: 'small' } }}
                              />
                              <Button
                                size="small"
                                onClick={() => setDateRange({ start: null, end: null })}
                              >
                                Clear
                              </Button>
                            </Stack>
                          </Stack>
                        </FilterBar>

                        {/* Transactions Table */}
                        <TableContainer sx={{ maxHeight: 500 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Category</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Amount</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {loading.expenses || loading.revenue ? (
                                [...Array(5)].map((_, i) => (
                                  <TableRow key={i}>
                                    {[...Array(6)].map((_, j) => (
                                      <TableCell key={j}><Skeleton /></TableCell>
                                    ))}
                                  </TableRow>
                                ))
                              ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map(transaction => (
                                  <StyledTableRow key={transaction._id}>
                                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <EditableField
                                        value={transaction.description}
                                        onSave={(value) => handleUpdateTransaction(
                                          transaction._id,
                                          transaction.type,
                                          { description: value }
                                        )}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <AnimatedChip
                                        label={transaction.type}
                                        size="small"
                                        color={transaction.type === 'revenue' ? 'success' : 'error'}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={transaction.category || transaction.source}
                                        size="small"
                                        variant="filled"
                                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <EditableField
                                        value={transaction.amount}
                                        type="currency"
                                        onSave={(value) => handleUpdateTransaction(
                                          transaction._id,
                                          transaction.type,
                                          { amount: value }
                                        )}
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                        size="small"
                                        onClick={() => setDeleteDialog({
                                          open: true,
                                          id: transaction._id,
                                          type: transaction.type,
                                          name: transaction.description
                                        })}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </StyledTableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      No transactions found for the selected filters
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Box>
                </Fade>
              )}

              {/* Bank Accounts Tab */}
              {activeTab === 1 && (
                <Fade in>
                  <Box>
                    <Grid container spacing={3}>
                      {loading.bankAccounts ? (
                        [...Array(3)].map((_, i) => (
                          <Grid item xs={12} md={4} key={i}>
                            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                          </Grid>
                        ))
                      ) : bankAccounts.length > 0 ? (
                        bankAccounts.map(acc => (
                          <Grid item xs={12} md={4} key={acc._id}>
                            <GlassCard>
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                                      <SavingsIcon />
                                    </Avatar>
                                    <EditableField
                                      value={acc.accountName}
                                      onSave={(value) => handleUpdateBankAccount(acc._id, 'accountName', value)}
                                    />
                                  </Stack>
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeleteDialog({
                                      open: true,
                                      id: acc._id,
                                      type: 'bankAccount',
                                      name: acc.accountName
                                    })}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                                <Divider />
                                <Stack>
                                  <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Current Balance
                                  </Typography>
                                  <EditableField
                                    value={acc.currentBalance}
                                    type="currency"
                                    onSave={(value) => handleUpdateBankAccount(acc._id, 'currentBalance', value)}
                                  />
                                </Stack>
                                {acc.accountNumber && (
                                  <Stack>
                                    <Typography variant="caption" color="text.secondary">
                                      Account Number
                                    </Typography>
                                    <Typography variant="body2">•••• {acc.accountNumber.slice(-4)}</Typography>
                                  </Stack>
                                )}
                              </Stack>
                            </GlassCard>
                          </Grid>
                        ))
                      ) : (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 6 }}>
                            <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No bank accounts added yet
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddCircleOutlineIcon />}
                              onClick={() => setShowForms({ expense: false, revenue: false, recurring: false, bankAccount: true })}
                            >
                              Add Bank Account
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Fade>
              )}

              {/* Recurring Tab */}
              {activeTab === 2 && (
                <Fade in>
                  <Box>
                    {recurringSummary && (
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                            <Typography variant="h6" color="success.main">
                              ₹{recurringSummary.totalMonthlyIncome?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Monthly Income
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                            <Typography variant="h6" color="error.main">
                              ₹{recurringSummary.totalMonthlyExpense?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Monthly Expenses
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <Typography variant="h6" color="primary.main">
                              {recurringSummary.activeCount || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Active Recurring
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    )}

                    <Grid container spacing={3}>
                      {loading.recurring ? (
                        [...Array(3)].map((_, i) => (
                          <Grid item xs={12} md={4} key={i}>
                            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
                          </Grid>
                        ))
                      ) : recurring.length > 0 ? (
                        recurring.map(rt => (
                          <Grid item xs={12} md={4} key={rt._id}>
                            <GlassCard sx={{ 
                              opacity: rt.isPaused ? 0.7 : 1,
                              position: 'relative',
                              overflow: 'visible'
                            }}>
                              {rt.isPaused && (
                                <Chip
                                  label="PAUSED"
                                  size="small"
                                  color="warning"
                                  sx={{
                                    position: 'absolute',
                                    top: -10,
                                    right: 16,
                                    fontWeight: 700
                                  }}
                                />
                              )}
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {rt.name}
                                    </Typography>
                                    <AnimatedChip
                                      label={rt.type}
                                      size="small"
                                      color={rt.type === 'income' ? 'success' : 'error'}
                                      variant="outlined"
                                      sx={{ mt: 0.5 }}
                                    />
                                  </Box>
                                  <Stack direction="row" spacing={0.5}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleToggleRecurring(rt._id, rt.isPaused)}
                                      color={rt.isPaused ? 'success' : 'warning'}
                                    >
                                      {rt.isPaused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => setDeleteDialog({
                                        open: true,
                                        id: rt._id,
                                        type: 'recurringTransaction',
                                        name: rt.name
                                      })}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </Stack>
                                <Divider />
                                <Stack direction="row" justifyContent="space-between">
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Amount</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                      ₹{rt.amount.toLocaleString()}
                                    </Typography>
                                  </Box>
                                  <Box textAlign="right">
                                    <Typography variant="caption" color="text.secondary">Frequency</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                      {rt.frequency}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Paper sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <CalendarMonthIcon fontSize="small" color="primary" />
                                    <Typography variant="caption">
                                      Next: {new Date(rt.nextDueDate).toLocaleDateString()}
                                    </Typography>
                                  </Stack>
                                </Paper>
                              </Stack>
                            </GlassCard>
                          </Grid>
                        ))
                      ) : (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', py: 6 }}>
                            <AutorenewIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No recurring transactions set up
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddCircleOutlineIcon />}
                              onClick={() => setShowForms({ expense: false, revenue: false, recurring: true, bankAccount: false })}
                            >
                              Add Recurring Transaction
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </StyledCard>

          {/* Filter Drawer */}
          <SwipeableDrawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onOpen={() => setDrawerOpen(true)}
            PaperProps={{
              sx: { width: 300, p: 3 }
            }}
          >
            <Typography variant="h6" gutterBottom>Advanced Filters</Typography>
            <Stack spacing={3}>
              <TextField
                select
                label="Time Period"
                fullWidth
                size="small"
                onChange={(e) => {
                  const value = e.target.value;
                  const now = new Date();
                  let start = null;
                  
                  switch(value) {
                    case 'today':
                      start = new Date(now.setHours(0,0,0,0));
                      break;
                    case 'week':
                      start = new Date(now.setDate(now.getDate() - 7));
                      break;
                    case 'month':
                      start = new Date(now.setMonth(now.getMonth() - 1));
                      break;
                    case 'year':
                      start = new Date(now.setFullYear(now.getFullYear() - 1));
                      break;
                  }
                  
                  setDateRange({ start, end: new Date() });
                }}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 days</MenuItem>
                <MenuItem value="month">Last 30 days</MenuItem>
                <MenuItem value="year">Last year</MenuItem>
              </TextField>
              
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => {
                  setDrawerOpen(false);
                  fetchAll();
                }}
              >
                Apply Filters
              </Button>
            </Stack>
          </SwipeableDrawer>

          {/* Delete Dialog */}
          <Dialog
            open={deleteDialog.open}
            onClose={() => setDeleteDialog(d => ({ ...d, open: false }))}
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete <strong>"{deleteDialog.name}"</strong>? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setDeleteDialog(d => ({ ...d, open: false }))} variant="outlined" size="small">
                Cancel
              </Button>
              <Button onClick={handleDelete} color="error" variant="contained" size="small">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default FinancialsPage;