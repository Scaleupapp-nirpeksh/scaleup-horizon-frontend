// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Paper, alpha, useTheme,
  Grid, Card, CardContent, Stack, Chip, Button, IconButton,
  LinearProgress, Avatar, Divider, Tooltip, Badge, Menu, MenuItem,
  ToggleButton, ToggleButtonGroup, TextField, InputAdornment,
  FormControl, Select, Skeleton, Fade, Grow, Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InsightsIcon from '@mui/icons-material/Insights';
import TimelineIcon from '@mui/icons-material/Timeline';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import FilterListIcon from '@mui/icons-material/FilterList';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, ReferenceLine, Brush, PieChart, 
  Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Treemap, Sankey
} from 'recharts';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { Gauge } from '@mui/x-charts/Gauge';

import RunwayScenariosSection from '../components/analytics/RunwayScenariosSection';

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

const MetricCard = styled(Paper)(({ theme, colorType = 'primary' }) => ({
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

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  marginRight: theme.spacing(1),
  padding: theme.spacing(1, 2.5),
  minHeight: 48,
  borderRadius: '8px 8px 0 0',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  }
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.6),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  height: '100%',
}));

// Chart Colors
const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  grey: '#94a3b8'
};

// Helper Components
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{pt:0}}>{children}</Box>}
    </div>
  );
}

// Fundraising Predictions Section
const FundraisingPredictionsSection = () => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('12m');
  const [selectedRound, setSelectedRound] = useState('series-a');
  const [loading, setLoading] = useState(true);
  const [fundraisingData, setFundraisingData] = useState({
    probabilityData: [],
    fundingFactors: [],
    comparableDeals: [],
    metrics: {
      optimalWindow: null,
      predictedValuation: null,
      targetAmount: null,
      readinessScore: null
    }
  });

  useEffect(() => {
    // Fetch fundraising predictions data
    fetchFundraisingData();
  }, [timeframe, selectedRound]);

  const fetchFundraisingData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getFundraisingPredictions({ timeframe, round: selectedRound });
      // setFundraisingData(response.data);
    } catch (error) {
      console.error('Error fetching fundraising data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header Controls */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Fundraising Predictions & Analysis
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small">
            <Select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="seed">Seed</MenuItem>
              <MenuItem value="series-a">Series A</MenuItem>
              <MenuItem value="series-b">Series B</MenuItem>
              <MenuItem value="series-c">Series C</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={timeframe}
            exclusive
            onChange={(e, v) => v && setTimeframe(v)}
            size="small"
          >
            <ToggleButton value="6m">6 Months</ToggleButton>
            <ToggleButton value="12m">12 Months</ToggleButton>
            <ToggleButton value="24m">24 Months</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="success">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Optimal Raise Window
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.dark' }}>
                  {fundraisingData.metrics.optimalWindow || '—'}
                </Typography>
                {fundraisingData.metrics.optimalWindow && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      {fundraisingData.metrics.optimalProbability}% probability
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="primary">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Predicted Valuation
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                  {fundraisingData.metrics.predictedValuation || '—'}
                </Typography>
                {fundraisingData.metrics.comparableCount && (
                  <Typography variant="caption" color="text.secondary">
                    Based on {fundraisingData.metrics.comparableCount} comparables
                  </Typography>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="info">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Target Raise Amount
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.dark' }}>
                  {fundraisingData.metrics.targetAmount || '—'}
                </Typography>
                {fundraisingData.metrics.runwayMonths && (
                  <Typography variant="caption" color="text.secondary">
                    {fundraisingData.metrics.runwayMonths} months runway
                  </Typography>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="warning">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Readiness Score
                </Typography>
                {fundraisingData.metrics.readinessScore ? (
                  <>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <Gauge 
                        width={100} 
                        height={75} 
                        value={fundraisingData.metrics.readinessScore} 
                        sx={{ 
                          [`& .MuiGauge-valueArc`]: { fill: theme.palette.warning.main },
                          [`& .MuiGauge-valueText`]: { fontSize: 24, fontWeight: 700 }
                        }}
                      />
                    </Box>
                    {fundraisingData.metrics.areasToImprove && (
                      <Typography variant="caption" color="text.secondary">
                        {fundraisingData.metrics.areasToImprove} areas to improve
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                    —
                  </Typography>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Probability Chart */}
        <Grid item xs={12} md={8}>
          <ChartContainer>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Fundraising Success Probability Over Time
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={350} />
            ) : fundraisingData.probabilityData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={fundraisingData.probabilityData}>
                  <defs>
                    <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="probability"
                    stroke={CHART_COLORS.success}
                    fill="url(#colorProb)"
                    name="Monthly Probability %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.primary }}
                    name="Cumulative Success %"
                  />
                  <ReferenceLine 
                    y={50} 
                    yAxisId="left"
                    stroke={theme.palette.warning.main} 
                    strokeDasharray="5 5"
                    label="50% Threshold"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No probability data available</Typography>
              </Box>
            )}
          </ChartContainer>
        </Grid>

        {/* Readiness Factors */}
        <Grid item xs={12} md={4}>
          <ChartContainer>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Fundraising Readiness Factors
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={350} />
            ) : fundraisingData.fundingFactors?.length > 0 ? (
              <Box sx={{ height: 350, overflowY: 'auto' }}>
                {fundraisingData.fundingFactors.map((factor, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {factor.factor}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {factor.score}/100
                        </Typography>
                        <Chip 
                          label={`${factor.weight}%`} 
                          size="small" 
                          variant="outlined"
                          color={factor.score >= 80 ? 'success' : factor.score >= 60 ? 'warning' : 'error'}
                        />
                      </Stack>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={factor.score}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.grey[300], 0.2),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: 
                            factor.score >= 80 ? theme.palette.success.main :
                            factor.score >= 60 ? theme.palette.warning.main :
                            theme.palette.error.main
                        }
                      }}
                    />
                  </Box>
                ))}
                {fundraisingData.metrics?.readinessScore && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {fundraisingData.metrics.readinessScore}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overall Readiness Score
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            ) : (
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No readiness factors available</Typography>
              </Box>
            )}
          </ChartContainer>
        </Grid>

        {/* Comparable Deals */}
        <Grid item xs={12}>
          <ChartContainer>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Comparable Deals
              </Typography>
              <Button size="small" startIcon={<FilterListIcon />}>
                Filter
              </Button>
            </Stack>
            {loading ? (
              <Grid container spacing={2}>
                {[...Array(4)].map((_, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            ) : fundraisingData.comparableDeals?.length > 0 ? (
              <Grid container spacing={2}>
                {fundraisingData.comparableDeals.map((deal, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        background: alpha(theme.palette.grey[50], 0.5),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4],
                        }
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {deal.company}
                          </Typography>
                          <Chip label={deal.date} size="small" />
                        </Stack>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            ${deal.amount}M
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {deal.round} Round
                          </Typography>
                        </Box>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            Valuation
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            ${deal.valuation}M
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No comparable deals found</Typography>
              </Box>
            )}
          </ChartContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

// Cash Flow Forecasts Section
const CashFlowForecastsSection = () => {
  const theme = useTheme();
  const [forecastPeriod, setForecastPeriod] = useState('6m');
  const [scenario, setScenario] = useState('expected');
  const [loading, setLoading] = useState(true);
  const [cashFlowData, setCashFlowData] = useState({
    cashFlow: [],
    waterfall: [],
    categoryBreakdown: [],
    metrics: {
      currentCash: null,
      burnRate: null,
      breakEvenDate: null,
      cashEfficiency: null
    }
  });

  useEffect(() => {
    // Fetch cash flow data
    fetchCashFlowData();
  }, [forecastPeriod, scenario]);

  const fetchCashFlowData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getCashFlowForecasts({ period: forecastPeriod, scenario });
      // setCashFlowData(response.data);
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Cash Flow Forecasts & Analysis
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small">
            <Select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="optimistic">Optimistic</MenuItem>
              <MenuItem value="expected">Expected</MenuItem>
              <MenuItem value="pessimistic">Pessimistic</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={forecastPeriod}
            exclusive
            onChange={(e, v) => v && setForecastPeriod(v)}
            size="small"
          >
            <ToggleButton value="3m">3 Months</ToggleButton>
            <ToggleButton value="6m">6 Months</ToggleButton>
            <ToggleButton value="12m">12 Months</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="primary">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Current Cash Position
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                  {cashFlowData.metrics.currentCash || '—'}
                </Typography>
                {cashFlowData.metrics.cashTrend && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {cashFlowData.metrics.cashTrend > 0 ? (
                      <TrendingUpIcon fontSize="small" color="success" />
                    ) : (
                      <TrendingDownIcon fontSize="small" color="error" />
                    )}
                    <Typography variant="caption" color={cashFlowData.metrics.cashTrend > 0 ? "success.main" : "error.main"}>
                      {Math.abs(cashFlowData.metrics.cashTrend)}% from last month
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="info">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Monthly Burn Rate
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.dark' }}>
                  {cashFlowData.metrics.burnRate || '—'}
                </Typography>
                {cashFlowData.metrics.burnImprovement && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingDownIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      {cashFlowData.metrics.burnImprovement}% improvement
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="success">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Break-Even Date
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.dark' }}>
                  {cashFlowData.metrics.breakEvenDate || '—'}
                </Typography>
                {cashFlowData.metrics.monthsToBreakEven && (
                  <Typography variant="caption" color="text.secondary">
                    {cashFlowData.metrics.monthsToBreakEven} months away
                  </Typography>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="warning">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Cash Efficiency Ratio
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                  {cashFlowData.metrics.cashEfficiency || '—'}
                </Typography>
                {cashFlowData.metrics.efficiencyTrend && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      Improving trend
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Main Cash Flow Chart */}
        <Grid item xs={12} md={8}>
          <ChartContainer>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Cash Flow Projection
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={400} />
            ) : cashFlowData.cashFlow?.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={cashFlowData.cashFlow}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                  <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="url(#colorRevenue)" name="Revenue" />
                  <Bar yAxisId="left" dataKey="expenses" fill={alpha(CHART_COLORS.error, 0.7)} name="Expenses" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativeCash"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.primary }}
                    name="Cash Balance"
                  />
                  <ReferenceLine 
                    y={0} 
                    yAxisId="left"
                    stroke={theme.palette.error.main} 
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No cash flow data available</Typography>
              </Box>
            )}
          </ChartContainer>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} md={4}>
          <ChartContainer>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Monthly Expense Breakdown
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={300} />
            ) : cashFlowData.categoryBreakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cashFlowData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="percentage"
                    >
                      {cashFlowData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {cashFlowData.categoryBreakdown.map((item, index) => (
                    <Stack 
                      key={index} 
                      direction="row" 
                      justifyContent="space-between" 
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: Object.values(CHART_COLORS)[index] 
                          }} 
                        />
                        <Typography variant="body2">{item.category}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{(item.amount/100000).toFixed(1)}L ({item.percentage}%)
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No expense breakdown available</Typography>
              </Box>
            )}
          </ChartContainer>
        </Grid>

        {/* Waterfall Chart */}
        <Grid item xs={12}>
          <ChartContainer>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              6-Month Cash Waterfall Analysis
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={350} />
            ) : cashFlowData.waterfall?.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={cashFlowData.waterfall}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                  <RechartsTooltip formatter={(value) => `₹${Math.abs(value).toLocaleString()}`} />
                  <Bar dataKey="value">
                    {cashFlowData.waterfall.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.type === 'positive' ? CHART_COLORS.success :
                          entry.type === 'negative' ? CHART_COLORS.error :
                          entry.type === 'start' ? CHART_COLORS.info :
                          CHART_COLORS.primary
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No waterfall data available</Typography>
              </Box>
            )}
          </ChartContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

// Revenue Cohorts Section
const RevenueCohortsSection = () => {
  const theme = useTheme();
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [cohortPeriod, setCohortPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [cohortData, setCohortData] = useState({
    cohorts: [],
    ltvSegments: [],
    retentionCurve: [],
    metrics: {
      avgLTV: null,
      avgCAC: null,
      ltvCacRatio: null,
      netRevenueRetention: null
    }
  });

  useEffect(() => {
    // Fetch cohort data
    fetchCohortData();
  }, [selectedMetric, cohortPeriod]);

  const fetchCohortData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getRevenueCohorts({ metric: selectedMetric, period: cohortPeriod });
      // setCohortData(response.data);
    } catch (error) {
      console.error('Error fetching cohort data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCohortColor = (value) => {
    if (value >= 90) return theme.palette.success.main;
    if (value >= 80) return theme.palette.success.light;
    if (value >= 70) return theme.palette.warning.light;
    if (value >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Revenue Cohorts & Customer Analytics
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small">
            <Select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="revenue">Revenue</MenuItem>
              <MenuItem value="customers">Customers</MenuItem>
              <MenuItem value="retention">Retention</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={cohortPeriod}
            exclusive
            onChange={(e, v) => v && setCohortPeriod(v)}
            size="small"
          >
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="quarterly">Quarterly</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="success">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Average LTV
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.dark' }}>
                  {cohortData.metrics.avgLTV || '—'}
                </Typography>
                {cohortData.metrics.ltvGrowth && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      {cohortData.metrics.ltvGrowth}% YoY
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="primary">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Average CAC
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                  {cohortData.metrics.avgCAC || '—'}
                </Typography>
                {cohortData.metrics.cacImprovement && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingDownIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      {cohortData.metrics.cacImprovement}% improvement
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="info">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  LTV:CAC Ratio
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.dark' }}>
                  {cohortData.metrics.ltvCacRatio || '—'}
                </Typography>
                {cohortData.metrics.ltvCacRatio && cohortData.metrics.ltvCacRatio >= 3 && (
                  <Chip 
                    label={
                      cohortData.metrics.ltvCacRatio >= 6 ? "Excellent" :
                      cohortData.metrics.ltvCacRatio >= 4 ? "Good" : "Fair"
                    }
                    size="small" 
                    color="success"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricCard colorType="warning">
            {loading ? (
              <Skeleton variant="rectangular" height={120} />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Net Revenue Retention
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                  {cohortData.metrics.netRevenueRetention ? `${cohortData.metrics.netRevenueRetention}%` : '—'}
                </Typography>
                {cohortData.metrics.netRevenueRetention && cohortData.metrics.netRevenueRetention > 100 && (
                  <Typography variant="caption" color="text.secondary">
                    Top 20% of SaaS
                  </Typography>
                )}
              </Stack>
            )}
          </MetricCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Cohort Retention Table */}
        <Grid item xs={12}>
          <ChartContainer>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Revenue Retention by Cohort
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={400} />
            ) : cohortData.cohorts?.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 800, p: 2 }}>
                  <Grid container spacing={1}>
                    {/* Header */}
                    <Grid item xs={2}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Cohort
                      </Typography>
                    </Grid>
                    {[1, 2, 3, 4, 5, 6].map(month => (
                      <Grid item xs={1.6} key={month}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', display: 'block' }}>
                          Month {month}
                        </Typography>
                      </Grid>
                    ))}
                    
                    {/* Data Rows */}
                    {cohortData.cohorts.map((cohort, index) => (
                      <React.Fragment key={index}>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {cohort.cohort}
                          </Typography>
                        </Grid>
                        {[1, 2, 3, 4, 5, 6].map(month => {
                          const value = cohort[`month${month}`];
                          return (
                            <Grid item xs={1.6} key={month}>
                              {value !== undefined ? (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 1,
                                    textAlign: 'center',
                                    backgroundColor: alpha(getCohortColor(value), 0.1),
                                    border: `1px solid ${alpha(getCohortColor(value), 0.3)}`,
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: getCohortColor(value) }}>
                                    {value}%
                                  </Typography>
                                </Paper>
                              ) : (
                                <Box sx={{ p: 1, textAlign: 'center' }}>
                                  <Typography variant="body2" color="text.disabled">
                                    —
                                  </Typography>
                                </Box>
                              )}
                            </Grid>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </Grid>
                </Box>
              </Box>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No cohort data available</Typography>
              </Box>
            )}
          </ChartContainer>
        </Grid>

        {/* LTV by Segment */}
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              LTV:CAC by Customer Segment
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={350} />
            ) : cohortData.ltvSegments?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={cohortData.ltvSegments} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="segment" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="ltv" fill={CHART_COLORS.success} name="LTV (₹)" />
                    <Bar dataKey="cac" fill={CHART_COLORS.error} name="CAC (₹)" />
                  </BarChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {cohortData.ltvSegments.map((item, index) => (
                    <Stack 
                      key={index} 
                      direction="row" 
                      justifyContent="space-between" 
                      alignItems="center"
                      sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.grey[100], 0.5) }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.segment}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Chip 
                          label={`${item.ratio}x`} 
                          size="small" 
                          color={item.ratio >= 5 ? 'success' : item.ratio >= 3 ? 'warning' : 'error'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {item.customers} customers
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No segment data available</Typography>
              </Box>
            )}
          </ChartContainer>
        </Grid>

        {/* Retention Curves */}
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Customer & Revenue Retention Curves
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={350} />
            ) : cohortData.retentionCurve?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={cohortData.retentionCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                    <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="retention"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={3}
                      name="Customer Retention"
                      dot={{ fill: CHART_COLORS.primary }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_COLORS.success}
                      strokeWidth={3}
                      name="Revenue Retention"
                      dot={{ fill: CHART_COLORS.success }}
                    />
                    <ReferenceLine 
                      y={80} 
                      stroke={theme.palette.warning.main} 
                      strokeDasharray="5 5"
                      label="Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
                {cohortData.insights && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.08), borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Key Insights:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cohortData.insights}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No retention data available</Typography>
              </Box>
            )}
          </ChartContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Analytics Page Component
const AnalyticsPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState([
    { label: 'Total Runway', value: '—', icon: <TimelineIcon />, color: 'primary', trend: null },
    { label: 'Burn Rate', value: '—', icon: <TrendingDownIcon />, color: 'warning', trend: null },
    { label: 'ARR', value: '—', icon: <ShowChartIcon />, color: 'success', trend: null },
    { label: 'Cash Position', value: '—', icon: <AccountBalanceIcon />, color: 'info', trend: null },
  ]);

  useEffect(() => {
    // Fetch overview stats
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await getAnalyticsOverview();
      // setOverviewStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching overview stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 6 }}>
      {/* Hero Section */}
      <Box sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
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
          background: alpha(theme.palette.info.main, 0.05),
        }
      }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.dark', mb: 1, display: 'flex', alignItems: 'center' }}>
                <InsightsIcon sx={{ mr: 1.5, fontSize: '2.5rem' }} />
                Predictive Analytics & Forecasting
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Leverage data to model scenarios, forecast financials, and make informed strategic decisions
              </Typography>
            </Box>
            
            {/* Overview Stats */}
            <Grid container spacing={2}>
              {overviewStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Grow in timeout={300 + index * 100}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        background: alpha(theme.palette.background.paper, 0.9),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4],
                        }
                      }}
                    >
                      {loading ? (
                        <Skeleton variant="rectangular" height={80} />
                      ) : (
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette[stat.color].main, 0.1),
                              color: theme.palette[stat.color].main,
                              width: 48,
                              height: 48,
                            }}
                          >
                            {stat.icon}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {stat.label}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette[stat.color].dark }}>
                              {stat.value}
                            </Typography>
                            {stat.trend && (
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                {stat.trend.includes('+') ? (
                                  <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                ) : (
                                  <TrendingDownIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                )}
                                <Typography variant="caption" color="success.main">
                                  {stat.trend}
                                </Typography>
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      )}
                    </Paper>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <GlassCard>
          <Tabs
            value={activeTab}
            onChange={handleChangeTab}
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Predictive Analytics sections"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              px: 2, 
              bgcolor: alpha(theme.palette.background.default, 0.5),
              "& .MuiTabs-indicator": { height: 3, borderRadius: '3px 3px 0 0' }
            }}
          >
            <StyledTab label="Runway Scenarios" icon={<TimelineIcon />} iconPosition="start" />
            <StyledTab label="Fundraising Predictions" icon={<MonetizationOnIcon />} iconPosition="start" />
            <StyledTab label="Cash Flow Forecasts" icon={<WaterfallChartIcon />} iconPosition="start" />
            <StyledTab label="Revenue Cohorts" icon={<GroupAddIcon />} iconPosition="start" />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <TabPanel value={activeTab} index={0}>
              <RunwayScenariosSection embedded={true} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <FundraisingPredictionsSection />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <CashFlowForecastsSection />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <RevenueCohortsSection />
            </TabPanel>
          </Box>
        </GlassCard>

        {/* Export Actions */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
          <Button startIcon={<ShareIcon />} variant="outlined">
            Share Report
          </Button>
          <Button startIcon={<DownloadIcon />} variant="contained">
            Export Analytics
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default AnalyticsPage;