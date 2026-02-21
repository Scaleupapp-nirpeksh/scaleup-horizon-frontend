// src/components/analytics/RevenueCohortDetails.jsx
import React, { useState } from 'react';
import {
  Box, Paper, Grid, Typography, Stack, IconButton, Chip,
  Divider, List, ListItem, ListItemIcon, ListItemText,
  Button, Tab, Tabs, FormControl, Select, MenuItem,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ComposedChart, Line, Area, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DataUsageIcon from '@mui/icons-material/DataUsage';

import { ScenarioChip, PredictionCard, InsightBox } from './StyledComponents';
import { formatCurrency, formatDate, formatPercentage } from './formatters';
import CohortMetricsEditor from './CohortMetricsEditor';

const RevenueCohortDetails = ({
  cohorts,
  selectedCohort,
  setSelectedCohort,
  onEdit,
  onHistoryClick,
  onGenerateProjections,
  onUpdateCohort
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [metricView, setMetricView] = useState('retention');
  const [showMetricsEditor, setShowMetricsEditor] = useState(false);
  
  // Prepare chart data from cohort metrics
  const prepareRetentionData = () => {
    if (!selectedCohort?.metrics || selectedCohort.metrics.length === 0) {
      return [];
    }
    
    return selectedCohort.metrics.map(metric => ({
      period: metric.periodLabel || `Period ${metric.periodNumber}`,
      periodNumber: metric.periodNumber,
      activeUsers: metric.activeUsers,
      retentionRate: metric.retentionRate,
      churnedUsers: metric.churnedUsers,
      projected: metric.isProjected,
      confidence: metric.confidenceLevel || 0.5
    }));
  };
  
  const prepareRevenueData = () => {
    if (!selectedCohort?.metrics || selectedCohort.metrics.length === 0) {
      return [];
    }
    
    return selectedCohort.metrics.map(metric => ({
      period: metric.periodLabel || `Period ${metric.periodNumber}`,
      periodNumber: metric.periodNumber,
      revenue: metric.revenue,
      arpu: metric.averageRevenuePerUser,
      cumulativeRevenue: metric.cumulativeRevenue,
      projected: metric.isProjected,
      confidence: metric.confidenceLevel || 0.5
    }));
  };
  
  const prepareLTVData = () => {
    if (!selectedCohort?.metrics || selectedCohort.metrics.length === 0) {
      return [];
    }
    
    const data = [];
    let cumRevenue = 0;
    let remainingUsers = selectedCohort.initialUsers;
    
    selectedCohort.metrics.forEach(metric => {
      cumRevenue += metric.revenue || 0;
      remainingUsers = metric.activeUsers || remainingUsers * (metric.retentionRate || 0.8);
      
      data.push({
        period: metric.periodLabel || `Period ${metric.periodNumber}`,
        periodNumber: metric.periodNumber,
        cumulativeRevenue: cumRevenue,
        ltvPerUser: selectedCohort.initialUsers > 0 ? cumRevenue / selectedCohort.initialUsers : 0,
        remainingUsers,
        projected: metric.isProjected,
        confidence: metric.confidenceLevel || 0.5
      });
    });
    
    return data;
  };
  
  const retentionData = prepareRetentionData();
  const revenueData = prepareRevenueData();
  const ltvData = prepareLTVData();
  
  // Get the latest metrics
  const getLatestMetrics = () => {
    if (!selectedCohort?.metrics || selectedCohort.metrics.length === 0) {
      return {
        activeUsers: selectedCohort?.initialUsers || 0,
        retentionRate: 1,
        churnedUsers: 0,
        revenue: 0,
        arpu: 0,
        cumulativeRevenue: 0,
        ltvPerUser: 0
      };
    }
    
    const latest = selectedCohort.metrics[selectedCohort.metrics.length - 1];
    const initialUsers = selectedCohort.initialUsers || 1;
    
    return {
      activeUsers: latest.activeUsers || 0,
      retentionRate: latest.retentionRate || 0,
      churnedUsers: initialUsers - (latest.activeUsers || 0),
      revenue: latest.revenue || 0,
      arpu: latest.averageRevenuePerUser || 0,
      cumulativeRevenue: latest.cumulativeRevenue || 0,
      ltvPerUser: (latest.cumulativeRevenue || 0) / initialUsers
    };
  };
  
  const latestMetrics = getLatestMetrics();
  
  // Determine if metrics have projections
  const hasProjections = selectedCohort?.metrics?.some(m => m.isProjected) || false;
  
  // Check if metrics have been added
  const hasMetrics = selectedCohort?.metrics && selectedCohort.metrics.length > 0;
  
  // Format historical metrics vs projections for display
  const historicalMetrics = selectedCohort?.metrics?.filter(m => !m.isProjected) || [];
  const projectedMetrics = selectedCohort?.metrics?.filter(m => m.isProjected) || [];
  
  if (!selectedCohort && cohorts.length > 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Select a cohort to view details</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {cohorts && cohorts.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          {cohorts.slice(0, 5).map((cohort) => (
            <ScenarioChip
              key={cohort._id}
              label={cohort.cohortName}
              icon={<PeopleIcon />}
              onClick={() => setSelectedCohort(cohort)}
              $active={selectedCohort?._id === cohort._id}
            />
          ))}
          {cohorts.length > 5 && (
            <Chip
              icon={<HistoryIcon />}
              label="View All Cohorts"
              onClick={onHistoryClick}
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Stack>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                {selectedCohort 
                  ? `${selectedCohort.cohortName} Analysis`
                  : 'Cohort Analysis'
                }
              </Typography>
              {selectedCohort && (
                <Stack direction="row" spacing={1}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                      value={metricView}
                      onChange={(e) => setMetricView(e.target.value)}
                      displayEmpty
                      variant="outlined"
                      size="small"
                    >
                      <MenuItem value="retention">Retention</MenuItem>
                      <MenuItem value="revenue">Revenue</MenuItem>
                      <MenuItem value="ltv">LTV</MenuItem>
                    </Select>
                  </FormControl>
                  <Tooltip title="Edit Metrics Data">
                    <IconButton
                      size="small"
                      onClick={() => setShowMetricsEditor(true)}
                    >
                      <DataUsageIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    onClick={() => onEdit('cohort', selectedCohort)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Stack>
            
            {selectedCohort && hasMetrics ? (
              <ResponsiveContainer width="100%" height="90%">
                {metricView === 'retention' ? (
                  <ComposedChart data={retentionData}>
                    <defs>
                      <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9c27b0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(value, index) => index % 2 === 0 ? value : ''}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        if (name === 'retentionRate') return [`${(value * 100).toFixed(1)}%`, 'Retention Rate'];
                        if (name === 'activeUsers') return [value, 'Active Users'];
                        if (name === 'confidence') return [`${(value * 100).toFixed(0)}%`, 'Confidence'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="activeUsers"
                      fill="url(#retentionGradient)"
                      stroke="#9c27b0"
                      name="Active Users"
                      yAxisId="left"
                    />
                    <Line
                      type="monotone"
                      dataKey="retentionRate"
                      stroke="#2196f3"
                      name="Retention Rate"
                      yAxisId="right"
                      strokeWidth={2}
                      dot={{ fill: "#2196f3" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="#ff9800"
                      name="Confidence"
                      yAxisId="right"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <ReferenceLine 
                      y={0.5} 
                      yAxisId="right" 
                      stroke="#f44336" 
                      strokeDasharray="3 3"
                      label={{ value: "50% Retention", position: "insideBottomRight" }}
                    />
                  </ComposedChart>
                ) : metricView === 'revenue' ? (
                  <ComposedChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(value, index) => index % 2 === 0 ? value : ''}
                    />
                    <YAxis />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                        if (name === 'arpu') return [formatCurrency(value), 'ARPU'];
                        if (name === 'cumulativeRevenue') return [formatCurrency(value), 'Cumulative Revenue'];
                        if (name === 'confidence') return [`${(value * 100).toFixed(0)}%`, 'Confidence'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="#4caf50"
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="arpu"
                      stroke="#2196f3"
                      name="ARPU"
                      yAxisId="right"
                      strokeWidth={2}
                      dot={{ fill: "#2196f3" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativeRevenue"
                      stroke="#ff9800"
                      name="Cumulative Revenue"
                      strokeWidth={2}
                      dot={{ fill: "#ff9800" }}
                    />
                  </ComposedChart>
                ) : (
                  <ComposedChart data={ltvData}>
                    <defs>
                      <linearGradient id="ltvGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(value, index) => index % 2 === 0 ? value : ''}
                    />
                    <YAxis />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        if (name === 'ltvPerUser') return [formatCurrency(value), 'LTV Per User'];
                        if (name === 'cumulativeRevenue') return [formatCurrency(value), 'Cumulative Revenue'];
                        if (name === 'remainingUsers') return [value, 'Remaining Users'];
                        if (name === 'confidence') return [`${(value * 100).toFixed(0)}%`, 'Confidence'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="ltvPerUser"
                      fill="url(#ltvGradient)"
                      stroke="#00bcd4"
                      name="LTV Per User"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="remainingUsers"
                      stroke="#9c27b0"
                      name="Remaining Users"
                      yAxisId="right"
                      strokeWidth={2}
                      dot={{ fill: "#9c27b0" }}
                    />
                    {selectedCohort.averageCAC > 0 && (
                      <ReferenceLine 
                        y={selectedCohort.averageCAC} 
                        stroke="#f44336" 
                        strokeDasharray="3 3"
                        label={{ value: "CAC", position: "insideTopRight" }}
                      />
                    )}
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            ) : selectedCohort ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No metrics data available for this cohort yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<ShowChartIcon />}
                  onClick={() => onGenerateProjections(selectedCohort._id)}
                >
                  Generate Projections
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                <Typography variant="body2" color="text.secondary">
                  No cohort selected. Choose a cohort to see analytics.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <PredictionCard severity="info">
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Cohort Summary
              </Typography>
              {selectedCohort ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Initial Users
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedCohort.initialUsers}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDate(selectedCohort.cohortStartDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Acquisition Channel
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedCohort.acquisitionChannel || 'Mixed'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Product Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedCohort.productType || 'All Products'}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a cohort to view details
                </Typography>
              )}
            </PredictionCard>

            {selectedCohort && hasMetrics && (
              <PredictionCard 
                severity={selectedCohort.ltcacRatio >= 3 ? 'success' : selectedCohort.ltcacRatio >= 1 ? 'warning' : 'error'}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Key Metrics
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Current Retention Rate
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontWeight: 600,
                        color: latestMetrics.retentionRate > 0.5
                          ? '#4caf50'
                          : latestMetrics.retentionRate > 0.2
                          ? 'inherit'
                          : '#f44336'
                      }}
                    >
                      {formatPercentage(latestMetrics.retentionRate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Average Revenue Per User
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(latestMetrics.arpu)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Customer Acquisition Cost
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedCohort.averageCAC)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Lifetime Value
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="success.main" 
                      sx={{ fontWeight: 600 }}
                    >
                      {formatCurrency(selectedCohort.projectedLTV || selectedCohort.actualLTV || 0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      LTV:CAC Ratio
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: selectedCohort.ltcacRatio >= 3 
                            ? '#4caf50' 
                            : selectedCohort.ltcacRatio >= 1 
                            ? '#ff9800' 
                            : '#f44336'
                        }}
                      >
                        {selectedCohort.ltcacRatio ? selectedCohort.ltcacRatio.toFixed(1) : '0.0'}x
                      </Typography>
                      {selectedCohort.ltcacRatio >= 3 ? (
                        <TrendingUpIcon fontSize="small" color="success" />
                      ) : selectedCohort.ltcacRatio < 1 ? (
                        <TrendingDownIcon fontSize="small" color="error" />
                      ) : null}
                    </Stack>
                  </Box>
                </Stack>
              </PredictionCard>
            )}

            {selectedCohort?.insights && selectedCohort.insights.length > 0 && (
              <PredictionCard severity="warning">
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Cohort Insights
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {selectedCohort.insights.map((insight, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {insight.severity === 'critical' ? (
                          <ErrorIcon fontSize="small" color="error" />
                        ) : insight.severity === 'warning' ? (
                          <WarningIcon fontSize="small" color="warning" />
                        ) : insight.severity === 'positive' ? (
                          <CheckCircleIcon fontSize="small" color="success" />
                        ) : (
                          <WarningIcon fontSize="small" color="info" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={insight.message}
                        secondary={insight.recommendedAction}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: insight.severity === 'critical' ? 600 : 400
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </PredictionCard>
            )}

            {selectedCohort && hasMetrics && selectedCohort.paybackPeriod && (
              <InsightBox severity={selectedCohort.paybackPeriod <= 6 ? "low" : selectedCohort.paybackPeriod <= 12 ? "medium" : "high"}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <AttachMoneyIcon className="insight-icon" fontSize="small" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Payback Period: {selectedCohort.paybackPeriod.toFixed(1)} months
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCohort.paybackPeriod <= 6 
                        ? "Fast payback period - excellent unit economics"
                        : selectedCohort.paybackPeriod <= 12
                        ? "Moderate payback period - consider optimizing acquisition costs"
                        : "Long payback period - review pricing and acquisition strategy"}
                    </Typography>
                  </Box>
                </Stack>
              </InsightBox>
            )}
          </Stack>
        </Grid>
      </Grid>

      {selectedCohort && hasMetrics && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)}
            sx={{ mb: 2 }}
          >
            <Tab label="Historical Metrics" />
            {hasProjections && <Tab label="Projections" />}
            <Tab label="Cohort Details" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Historical Performance Data
                </Typography>
                {historicalMetrics.length > 0 ? (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 800 }}>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Period
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Active Users
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Retention Rate
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Revenue
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            ARPU
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Cumulative Revenue
                          </Typography>
                        </Grid>
                      </Grid>
                      {historicalMetrics.map((metric, index) => (
                        <Grid container key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(0,0,0,0.03)' } }}>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {metric.periodLabel || `Period ${metric.periodNumber}`}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {metric.activeUsers}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {formatPercentage(metric.retentionRate || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {formatCurrency(metric.revenue || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {formatCurrency(metric.averageRevenuePerUser || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {formatCurrency(metric.cumulativeRevenue || 0)}
                            </Typography>
                          </Grid>
                        </Grid>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No historical metrics data available for this cohort.
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && hasProjections && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Projected Performance
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<ShowChartIcon />}
                    onClick={() => onGenerateProjections(selectedCohort._id)}
                  >
                    Regenerate Projections
                  </Button>
                </Stack>
                {projectedMetrics.length > 0 ? (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 800 }}>
                      <Grid container>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Period
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Active Users
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Retention Rate
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Revenue
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            ARPU
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Cumulative Revenue
                          </Typography>
                        </Grid>
                        <Grid item xs={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600, p: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Confidence
                          </Typography>
                        </Grid>
                      </Grid>
                      {projectedMetrics.map((metric, index) => (
                        <Grid container key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(0,0,0,0.03)' } }}>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {metric.periodLabel || `Period ${metric.periodNumber}`}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {metric.activeUsers}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {formatPercentage(metric.retentionRate || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {formatCurrency(metric.revenue || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {formatCurrency(metric.averageRevenuePerUser || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {formatCurrency(metric.cumulativeRevenue || 0)}
                            </Typography>
                          </Grid>
                          <Grid item xs={1}>
                            <Typography variant="body2" sx={{ p: 1 }}>
                              {formatPercentage(metric.confidenceLevel || 0)}
                            </Typography>
                          </Grid>
                        </Grid>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No projection data available.
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}

          {activeTab === hasProjections ? 2 : 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: alpha('#9c27b0', 0.05),
                    border: `1px solid ${alpha('#9c27b0', 0.2)}`
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#9c27b0' }}>
                    Acquisition Details
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Acquisition Channel
                      </Typography>
                      <Typography variant="body1">
                        {selectedCohort?.acquisitionChannel || 'Multiple Channels'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Acquisition Cost
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedCohort?.acquisitionCost || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Average CAC
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedCohort?.averageCAC || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: alpha('#00bcd4', 0.05),
                    border: `1px solid ${alpha('#00bcd4', 0.2)}`
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#00bcd4' }}>
                    User Metrics
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Initial Users
                      </Typography>
                      <Typography variant="body1">
                        {selectedCohort?.initialUsers || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Current Active Users
                      </Typography>
                      <Typography variant="body1">
                        {latestMetrics.activeUsers || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Current Retention Rate
                      </Typography>
                      <Typography variant="body1">
                        {formatPercentage(latestMetrics.retentionRate || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: alpha('#4caf50', 0.05),
                    border: `1px solid ${alpha('#4caf50', 0.2)}`
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1, color: '#4caf50' }}>
                    Revenue Metrics
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Revenue
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(latestMetrics.cumulativeRevenue || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        LTV Per User
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedCohort?.projectedLTV || selectedCohort?.actualLTV || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Payback Period
                      </Typography>
                      <Typography variant="body1">
                        {selectedCohort?.paybackPeriod ? `${selectedCohort.paybackPeriod.toFixed(1)} months` : 'Not calculated'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Paper>
      )}
      {/* Metrics Editor Dialog */}
      {selectedCohort && (
        <CohortMetricsEditor
          open={showMetricsEditor}
          onClose={() => setShowMetricsEditor(false)}
          cohort={selectedCohort}
          onSave={(updatedCohort) => {
            if (onUpdateCohort) {
              onUpdateCohort(updatedCohort);
            }
          }}
        />
      )}
    </Box>
  );
};

export default RevenueCohortDetails;