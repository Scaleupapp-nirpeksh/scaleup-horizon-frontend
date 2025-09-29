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
  FormControlLabel, Switch, Alert
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
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';

// Recharts imports for data visualization
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, Area, AreaChart, ComposedChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, Sector
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

const EmptyStateBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.action.hover, 0.04),
  border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
}));

// Chart color constants
const CHART_COLORS = {
  primary: '#1976d2',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  secondary: '#9c27b0',
  palette: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1', '#D084D0']
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, border: '1px solid rgba(0,0,0,0.1)' }} elevation={3}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="caption" display="block" sx={{ color: entry.color }}>
            {entry.name}: ₹{entry.value.toLocaleString()}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Custom active shape for pie chart
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} style={{ fontWeight: 600, fontSize: '14px' }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#666" style={{ fontSize: '12px' }}>
        ₹{value.toLocaleString()}
      </text>
      <text x={cx} y={cy + 25} dy={8} textAnchor="middle" fill="#999" style={{ fontSize: '11px' }}>
        ({(percent * 100).toFixed(1)}%)
      </text>
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
        innerRadius={innerRadius - 10}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

// Components
const MetricDisplay = ({ title, value, icon, color, loading, trend }) => {
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
            {trend !== undefined && (
              <Typography variant="caption" sx={{ color: trend > 0 ? 'success.main' : 'error.main', fontWeight: 500 }}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% from last period
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
  const [chartView, setChartView] = useState('separated'); // 'separated' or 'combined'
  const [activePieIndex, setActivePieIndex] = useState(0);

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

  // Enhanced Analytics calculations
  const calculateAnalytics = useMemo(() => {
    const now = new Date();
    const periods = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };
    
    const daysToShow = periods[selectedPeriod] || 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToShow);
    
    // 1. Separate daily trends for expenses and revenue
    const dailyExpenseTrend = [];
    const dailyRevenueTrend = [];
    const combinedTrend = [];
    
    for (let i = 0; i < Math.min(daysToShow, 30); i++) { // Limit to 30 days for performance
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayExpenses = expenses
        .filter(e => e.date && e.date.startsWith(dateStr))
        .reduce((sum, e) => sum + e.amount, 0);
      
      const dayRevenue = revenues
        .filter(r => r.date && r.date.startsWith(dateStr))
        .reduce((sum, r) => sum + r.amount, 0);
      
      if (dayExpenses > 0) {
        dailyExpenseTrend.push({
          date: formattedDate,
          amount: dayExpenses
        });
      }
      
      if (dayRevenue > 0) {
        dailyRevenueTrend.push({
          date: formattedDate,
          amount: dayRevenue
        });
      }
      
      combinedTrend.push({
        date: formattedDate,
        expenses: dayExpenses,
        revenue: dayRevenue,
        profit: dayRevenue - dayExpenses
      });
    }
    
    // 2. Enhanced category breakdown for expenses
    const expenseByCategory = {};
    expenses.forEach(expense => {
      const cat = expense.category || 'Uncategorized';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + expense.amount;
    });
    
    const categoryData = Object.entries(expenseByCategory)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Limit to top 8 categories
    
    // 3. Enhanced revenue by source
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
    
    // 4. Revenue status breakdown
    const revenueByStatus = {
      Received: 0,
      Pending: 0,
      Expected: 0
    };
    
    revenues.forEach(rev => {
      const status = rev.status || 'Pending';
      revenueByStatus[status] = (revenueByStatus[status] || 0) + rev.amount;
    });
    
    // 5. Payment method breakdown for expenses
    const paymentMethods = {};
    expenses.forEach(expense => {
      const method = expense.paymentMethod || 'Other';
      paymentMethods[method] = (paymentMethods[method] || 0) + expense.amount;
    });
    
    const paymentMethodData = Object.entries(paymentMethods)
      .map(([method, amount]) => ({
        name: method,
        value: amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.value - a.value);
    
    // 6. Vendor analysis
    const vendorExpenses = {};
    expenses.forEach(expense => {
      if (expense.vendor) {
        vendorExpenses[expense.vendor] = (vendorExpenses[expense.vendor] || 0) + expense.amount;
      }
    });
    
    const topVendors = Object.entries(vendorExpenses)
      .map(([vendor, amount]) => ({
        name: vendor,
        amount: amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // 7. Cash flow calculation
    const cashFlow = [];
    let runningBalance = 0;
    combinedTrend.forEach(day => {
      runningBalance += day.profit;
      cashFlow.push({
        date: day.date,
        balance: runningBalance
      });
    });
    
    // 8. Period comparisons
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
    
    const thisMonthRevenue = revenues
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + r.amount, 0);
    
    const lastMonthRevenue = revenues
      .filter(r => {
        const date = new Date(r.date);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return date.getMonth() === lastMonth && date.getFullYear() === year;
      })
      .reduce((sum, r) => sum + r.amount, 0);
    
    const expenseChange = lastMonthExpenses ? 
      ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100) : 0;
    
    const revenueChange = lastMonthRevenue ? 
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;
    
    // 9. Top transactions
    const topExpenses = expenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(e => ({
        name: e.vendor || e.description,
        amount: e.amount,
        category: e.category,
        date: new Date(e.date).toLocaleDateString()
      }));
    
    const topRevenues = revenues
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(r => ({
        name: r.description,
        amount: r.amount,
        source: r.source,
        status: r.status,
        date: new Date(r.date).toLocaleDateString()
      }));
    
    return {
      dailyExpenseTrend,
      dailyRevenueTrend,
      combinedTrend,
      categoryData,
      sourceData,
      revenueByStatus,
      paymentMethodData,
      topVendors,
      cashFlow,
      expenseChange,
      revenueChange,
      thisMonthExpenses,
      lastMonthExpenses,
      thisMonthRevenue,
      lastMonthRevenue,
      topExpenses,
      topRevenues,
      avgDailyExpense: daysToShow > 0 ? totalExpenses / daysToShow : 0,
      avgDailyRevenue: daysToShow > 0 ? totalRevenue / daysToShow : 0,
      profitMargin: totalRevenue ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0,
      hasExpenseData: expenses.length > 0,
      hasRevenueData: revenues.length > 0
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
                    trend={calculateAnalytics.revenueChange}
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
                    trend={calculateAnalytics.expenseChange}
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
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
                      
                      <Stack direction="row" spacing={2} alignItems="center">
                        {viewMode === 'dashboard' && (
                          <ToggleButtonGroup
                            value={chartView}
                            exclusive
                            onChange={(e, v) => v && setChartView(v)}
                            size="small"
                          >
                            <ToggleButton value="separated">
                              <ShowChartIcon sx={{ fontSize: 20 }} />
                              Separated
                            </ToggleButton>
                            <ToggleButton value="combined">
                              <TimelineIcon sx={{ fontSize: 20 }} />
                              Combined
                            </ToggleButton>
                          </ToggleButtonGroup>
                        )}
                        
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
                      </Stack>
                    </Box>

                    {viewMode === 'dashboard' ? (
                      <Box>
                        {/* Enhanced Insights Row */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), position: 'relative' }}>
                              <Typography variant="caption" color="text.secondary">
                                Avg Daily Expense
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                ₹{calculateAnalytics.avgDailyExpense.toFixed(0)}
                              </Typography>
                              {calculateAnalytics.expenseChange !== 0 && (
                                <Typography variant="caption" color={calculateAnalytics.expenseChange > 0 ? 'error' : 'success'}>
                                  {calculateAnalytics.expenseChange > 0 ? '↑' : '↓'} 
                                  {Math.abs(calculateAnalytics.expenseChange).toFixed(1)}% vs last month
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                              <Typography variant="caption" color="text.secondary">
                                Avg Daily Revenue
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                ₹{calculateAnalytics.avgDailyRevenue.toFixed(0)}
                              </Typography>
                              {calculateAnalytics.revenueChange !== 0 && (
                                <Typography variant="caption" color={calculateAnalytics.revenueChange > 0 ? 'success' : 'error'}>
                                  {calculateAnalytics.revenueChange > 0 ? '↑' : '↓'} 
                                  {Math.abs(calculateAnalytics.revenueChange).toFixed(1)}% vs last month
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                              <Typography variant="caption" color="text.secondary">
                                Profit Margin
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: calculateAnalytics.profitMargin >= 0 ? 'success.main' : 'error.main' }}>
                                {calculateAnalytics.profitMargin.toFixed(1)}%
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.abs(Math.min(calculateAnalytics.profitMargin, 100))} 
                                sx={{ 
                                  mt: 1, 
                                  height: 4, 
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.divider, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: calculateAnalytics.profitMargin >= 0 ? 'success.main' : 'error.main'
                                  }
                                }}
                              />
                            </Paper>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                              <Typography variant="caption" color="text.secondary">
                                Burn Rate (Monthly)
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                ₹{(calculateAnalytics.thisMonthExpenses).toFixed(0)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Runway: {totalBalance > 0 && calculateAnalytics.thisMonthExpenses > 0 ? 
                                  `${Math.floor(totalBalance / calculateAnalytics.thisMonthExpenses)} months` : 
                                  'N/A'}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>

                        {/* Enhanced Charts Section */}
                        {chartView === 'separated' ? (
                          <>
                            {/* Separated View: Expenses and Revenue Charts */}
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                              {/* Expense Trend */}
                              <Grid item xs={12} lg={6}>
                                {calculateAnalytics.hasExpenseData ? (
                                  <ChartCard>
                                    <div className="chart-header">
                                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                                        <TrendingDownIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Expense Trend
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Total: ₹{totalExpenses.toLocaleString()}
                                      </Typography>
                                    </div>
                                    <ResponsiveContainer width="100%" height={250}>
                                      <AreaChart data={calculateAnalytics.dailyExpenseTrend}>
                                        <defs>
                                          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.error} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={CHART_COLORS.error} stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                                        <YAxis stroke={theme.palette.text.secondary} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Area 
                                          type="monotone" 
                                          dataKey="amount" 
                                          name="Expenses"
                                          stroke={CHART_COLORS.error} 
                                          fillOpacity={1} 
                                          fill="url(#expenseGradient)" 
                                          strokeWidth={2}
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </ChartCard>
                                ) : (
                                  <EmptyStateBox>
                                    <TrendingDownIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                      No Expense Data
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Add expenses to see trends
                                    </Typography>
                                  </EmptyStateBox>
                                )}
                              </Grid>

                              {/* Revenue Trend */}
                              <Grid item xs={12} lg={6}>
                                {calculateAnalytics.hasRevenueData ? (
                                  <ChartCard>
                                    <div className="chart-header">
                                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                        <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Revenue Trend
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Total: ₹{totalRevenue.toLocaleString()}
                                      </Typography>
                                    </div>
                                    <ResponsiveContainer width="100%" height={250}>
                                      <AreaChart data={calculateAnalytics.dailyRevenueTrend}>
                                        <defs>
                                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                                        <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                                        <YAxis stroke={theme.palette.text.secondary} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Area 
                                          type="monotone" 
                                          dataKey="amount" 
                                          name="Revenue"
                                          stroke={CHART_COLORS.success} 
                                          fillOpacity={1} 
                                          fill="url(#revenueGradient)" 
                                          strokeWidth={2}
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </ChartCard>
                                ) : (
                                  <EmptyStateBox>
                                    <TrendingUpIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                      No Revenue Data
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Add revenue to see trends
                                    </Typography>
                                  </EmptyStateBox>
                                )}
                              </Grid>
                            </Grid>
                          </>
                        ) : (
                          <>
                            {/* Combined View */}
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                              <Grid item xs={12}>
                                {(calculateAnalytics.hasExpenseData || calculateAnalytics.hasRevenueData) ? (
                                  <ChartCard>
                                    <div className="chart-header">
                                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Revenue vs Expenses Overview
                                      </Typography>
                                      <ButtonGroup size="small">
                                        <Chip 
                                          label={`Profit: ₹${netIncome.toLocaleString()}`}
                                          color={netIncome >= 0 ? 'success' : 'error'}
                                          variant="outlined"
                                        />
                                      </ButtonGroup>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                      <ComposedChart data={calculateAnalytics.combinedTrend}>
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
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="revenue" fill={CHART_COLORS.success} opacity={0.8} />
                                        <Bar dataKey="expenses" fill={CHART_COLORS.error} opacity={0.8} />
                                        <Line 
                                          type="monotone" 
                                          dataKey="profit" 
                                          stroke={CHART_COLORS.primary} 
                                          strokeWidth={2}
                                          dot={{ fill: CHART_COLORS.primary }}
                                        />
                                      </ComposedChart>
                                    </ResponsiveContainer>
                                  </ChartCard>
                                ) : (
                                  <EmptyStateBox>
                                    <TimelineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                      No Transaction Data
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Add transactions to see financial overview
                                    </Typography>
                                  </EmptyStateBox>
                                )}
                              </Grid>
                            </Grid>
                          </>
                        )}

                        {/* Category and Source Analysis */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                          {/* Enhanced Expense Categories Pie */}
                          <Grid item xs={12} md={6}>
                            {calculateAnalytics.hasExpenseData && calculateAnalytics.categoryData.length > 0 ? (
                              <ChartCard>
                                <div className="chart-header">
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    <DonutLargeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Expense Breakdown
                                  </Typography>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                  <PieChart>
                                    <Pie
                                      activeIndex={activePieIndex}
                                      activeShape={renderActiveShape}
                                      data={calculateAnalytics.categoryData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={100}
                                      fill="#8884d8"
                                      dataKey="value"
                                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                                    >
                                      {calculateAnalytics.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS.palette[index % CHART_COLORS.palette.length]} />
                                      ))}
                                    </Pie>
                                  </PieChart>
                                </ResponsiveContainer>
                                <Box sx={{ mt: 2, maxHeight: 150, overflowY: 'auto' }}>
                                  {calculateAnalytics.categoryData.map((cat, index) => (
                                    <Stack key={index} direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <Box sx={{ 
                                          width: 12, 
                                          height: 12, 
                                          borderRadius: '50%', 
                                          bgcolor: CHART_COLORS.palette[index % CHART_COLORS.palette.length] 
                                        }} />
                                        <Typography variant="caption">{cat.name}</Typography>
                                      </Stack>
                                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                        {cat.percentage}%
                                      </Typography>
                                    </Stack>
                                  ))}
                                </Box>
                              </ChartCard>
                            ) : (
                              <EmptyStateBox>
                                <DonutLargeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                  No Expense Categories
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Add categorized expenses to see breakdown
                                </Typography>
                              </EmptyStateBox>
                            )}
                          </Grid>

                          {/* Revenue Sources */}
                          <Grid item xs={12} md={6}>
                            {calculateAnalytics.hasRevenueData && calculateAnalytics.sourceData.length > 0 ? (
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
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Revenue" radius={[8, 8, 0, 0]}>
                                      {calculateAnalytics.sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS.palette[index % CHART_COLORS.palette.length]} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                                
                                {/* Revenue Status Indicators */}
                                {calculateAnalytics.revenueByStatus && (
                                  <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="center">
                                    <Chip 
                                      icon={<CheckCircleOutlineIcon />}
                                      label={`Received: ₹${calculateAnalytics.revenueByStatus.Received?.toLocaleString() || 0}`}
                                      color="success"
                                      size="small"
                                      variant="outlined"
                                    />
                                    <Chip 
                                      icon={<PendingIcon />}
                                      label={`Pending: ₹${calculateAnalytics.revenueByStatus.Pending?.toLocaleString() || 0}`}
                                      color="warning"
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Stack>
                                )}
                              </ChartCard>
                            ) : (
                              <EmptyStateBox>
                                <BarChartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                  No Revenue Sources
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Add revenue to see source breakdown
                                </Typography>
                              </EmptyStateBox>
                            )}
                          </Grid>
                        </Grid>

                        {/* Additional Insights Row */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                          {/* Top Expenses */}
                          <Grid item xs={12} md={6}>
                            {calculateAnalytics.topExpenses.length > 0 ? (
                              <ChartCard>
                                <div className="chart-header">
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Top Expenses
                                  </Typography>
                                  <Chip label={`${calculateAnalytics.topExpenses.length} items`} size="small" />
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
                                          <Stack direction="row" spacing={1} alignItems="center">
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
                            ) : (
                              <EmptyStateBox>
                                <InfoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                  No Expenses Yet
                                </Typography>
                              </EmptyStateBox>
                            )}
                          </Grid>
                          
                          {/* Payment Methods or Top Vendors */}
                          <Grid item xs={12} md={6}>
                            {calculateAnalytics.hasExpenseData && (calculateAnalytics.paymentMethodData.length > 0 || calculateAnalytics.topVendors.length > 0) ? (
                              <ChartCard>
                                <div className="chart-header">
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Payment Methods & Vendors
                                  </Typography>
                                </div>
                                
                                {/* Payment Methods */}
                                {calculateAnalytics.paymentMethodData.length > 0 && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                      Payment Methods
                                    </Typography>
                                    <Stack spacing={1}>
                                      {calculateAnalytics.paymentMethodData.slice(0, 3).map((method, index) => (
                                        <Box key={index}>
                                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption">{method.name}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                              {method.percentage}%
                                            </Typography>
                                          </Stack>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={parseFloat(method.percentage)} 
                                            sx={{ 
                                              height: 4, 
                                              borderRadius: 2,
                                              bgcolor: alpha(theme.palette.divider, 0.1),
                                              '& .MuiLinearProgress-bar': {
                                                bgcolor: CHART_COLORS.palette[index]
                                              }
                                            }}
                                          />
                                        </Box>
                                      ))}
                                    </Stack>
                                  </Box>
                                )}
                                
                                {/* Top Vendors */}
                                {calculateAnalytics.topVendors.length > 0 && (
                                  <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                      Top Vendors
                                    </Typography>
                                    <List dense>
                                      {calculateAnalytics.topVendors.map((vendor, index) => (
                                        <ListItem key={index} sx={{ px: 0 }}>
                                          <ListItemText
                                            primary={vendor.name}
                                            secondary={`₹${vendor.amount.toLocaleString()}`}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                )}
                              </ChartCard>
                            ) : (
                              <EmptyStateBox>
                                <InfoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                  No Payment Data
                                </Typography>
                              </EmptyStateBox>
                            )}
                          </Grid>
                        </Grid>

                        {/* Cash Flow Analysis (if data exists) */}
                        {calculateAnalytics.cashFlow.length > 0 && (
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <ChartCard>
                                <div className="chart-header">
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Cash Flow Trend
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Cumulative cash position over time
                                  </Typography>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                  <AreaChart data={calculateAnalytics.cashFlow}>
                                    <defs>
                                      <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Area 
                                      type="monotone" 
                                      dataKey="balance" 
                                      name="Net Position"
                                      stroke={CHART_COLORS.primary} 
                                      fill="url(#cashFlowGradient)" 
                                    />
                                  </AreaChart>
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

              {/* Bank Accounts Tab - No changes */}
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

              {/* Recurring Tab - No changes */}
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