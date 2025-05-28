// src/components/analytics/CashFlowDetails.jsx
import React from 'react';
import {
  Box, Paper, Grid, Typography, Stack, IconButton, Chip,
  Avatar, LinearProgress, Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ComposedChart, LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, ReferenceLine, Brush
} from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import SpeedIcon from '@mui/icons-material/Speed';

import { ScenarioChip, PredictionCard, InsightBox } from './StyledComponents';
import { formatCurrency, formatDate, formatPercentage } from './formatters';

const CashFlowDetails = ({
  forecasts,
  selectedForecast,
  setSelectedForecast,
  historicalCashFlow,
  currentCashPosition,
  onEdit,
  onHistoryClick
}) => {
  // Prepare chart data from actual API response
  const forecastData = selectedForecast?.weeklyForecasts?.map(week => ({
    week: `Week ${week.weekNumber}`,
    date: formatDate(week.startDate),
    inflow: week.totalInflows,
    outflow: week.totalOutflows,
    net: week.netCashFlow,
    balance: week.cashBalance,
    confidence: week.confidenceLevel
  })) || [];

  // Prepare historical data if available
  const weeklyData = [];
  if (historicalCashFlow?.expenses && historicalCashFlow?.revenues) {
    const maxLength = Math.max(
      historicalCashFlow.expenses.length,
      historicalCashFlow.revenues.length
    );
    
    for (let i = 0; i < Math.min(maxLength, 12); i++) {
      const expense = historicalCashFlow.expenses[i];
      const revenue = historicalCashFlow.revenues[i];
      
      weeklyData.push({
        week: `W${i + 1}`,
        inflow: revenue?.total || 0,
        outflow: expense?.total || 0,
        net: (revenue?.total || 0) - (expense?.total || 0)
      });
    }
  }

  if (!selectedForecast && forecasts.length > 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Select a forecast to view details</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {forecasts && forecasts.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          {forecasts.slice(0, 5).map((forecast) => (
            <ScenarioChip
              key={forecast._id}
              label={forecast.forecastName}
              icon={<AccountBalanceIcon />}
              onClick={() => setSelectedForecast(forecast)}
              $active={selectedForecast?._id === forecast._id}
            />
          ))}
          {forecasts.length > 5 && (
            <Chip
              icon={<HistoryIcon />}
              label="View All History"
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
                {selectedForecast 
                  ? `Cash Flow Forecast: ${selectedForecast.forecastName}`
                  : 'Cash Flow Forecast Analysis'
                }
              </Typography>
              {selectedForecast && (
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit('forecast', selectedForecast)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Stack>
            {selectedForecast && forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <ComposedChart data={forecastData}>
                  <defs>
                    <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f44336" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value, name) => {
                      if (name === 'confidence') return [`${(value * 100).toFixed(0)}%`, 'Confidence'];
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    fill="url(#balanceGradient)"
                    stroke="#00bcd4"
                    name="Cash Balance"
                    strokeWidth={2}
                  />
                  <Bar dataKey="inflow" fill="#4caf50" name="Cash Inflow" />
                  <Bar dataKey="outflow" fill="#f44336" name="Cash Outflow" />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#ff9800"
                    name="Net Cash Flow"
                    strokeWidth={3}
                    dot={{ fill: "#ff9800" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    stroke="#9c27b0"
                    name="Confidence"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  {selectedForecast.minimumCashDate && (
                    <ReferenceLine
                      x={formatDate(selectedForecast.minimumCashDate)}
                      stroke="#f44336"
                      strokeDasharray="5 5"
                      label={{ value: "Min Cash", position: "top" }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            ) : weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f44336" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="inflow"
                    stackId="1"
                    stroke="#4caf50"
                    fill="url(#inflowGradient)"
                    name="Cash Inflow"
                  />
                  <Area
                    type="monotone"
                    dataKey="outflow"
                    stackId="2"
                    stroke="#f44336"
                    fill="url(#outflowGradient)"
                    name="Cash Outflow"
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#00bcd4"
                    strokeWidth={3}
                    dot={{ fill: "#00bcd4" }}
                    name="Net Cash Flow"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                <Typography variant="body2" color="text.secondary">
                  No cash flow data available. Create a forecast to see projections.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <PredictionCard severity="info">
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Current Position
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cash Balance
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatCurrency(currentCashPosition?.cash || 0)}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Burn Rate
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(currentCashPosition?.monthlyBurn || 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(currentCashPosition?.monthlyRevenue || 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Net Burn
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: (currentCashPosition?.monthlyRevenue || 0) > (currentCashPosition?.monthlyBurn || 0) 
                        ? '#4caf50' 
                        : '#f44336'
                    }}
                  >
                    {formatCurrency((currentCashPosition?.monthlyRevenue || 0) - (currentCashPosition?.monthlyBurn || 0))}
                  </Typography>
                </Box>
              </Stack>
            </PredictionCard>

            {selectedForecast && (
              <PredictionCard 
                severity={selectedForecast.requiresAdditionalFunding ? 'warning' : 'success'}
              >
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Forecast Summary
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Forecast Period
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(selectedForecast.startDate)} - {formatDate(selectedForecast.endDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Minimum Cash Balance
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontWeight: 600,
                        color: selectedForecast.minimumCashBalance < 0
                          ? '#f44336'
                          : 'inherit'
                      }}
                    >
                      {formatCurrency(selectedForecast.minimumCashBalance)}
                      {selectedForecast.minimumCashDate && ` (${formatDate(selectedForecast.minimumCashDate)})`}
                    </Typography>
                  </Box>
                  {selectedForecast.requiresAdditionalFunding && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Additional Funding Needed
                      </Typography>
                      <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                        {formatCurrency(selectedForecast.additionalFundingNeeded)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </PredictionCard>
            )}

            {selectedForecast?.alerts && selectedForecast.alerts.length > 0 && (
              <PredictionCard severity="warning">
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Forecast Alerts
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {selectedForecast.alerts.map((alert, idx) => (
                    <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {alert.severity === 'critical' ? (
                          <ErrorIcon fontSize="small" color="error" />
                        ) : (
                          <WarningIcon fontSize="small" color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={alert.message}
                        secondary={formatDate(alert.date)}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: alert.severity === 'critical' ? 600 : 400
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </PredictionCard>
            )}

            {weeklyData.length > 0 && weeklyData.some(w => w.net < -50000) && (
              <InsightBox severity="medium">
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <WarningIcon className="insight-icon" fontSize="small" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      High Burn Rate Detected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Several weeks show burn rate exceeding revenue by over ₹50,000
                    </Typography>
                  </Box>
                </Stack>
              </InsightBox>
            )}
          </Stack>
        </Grid>
      </Grid>

      {selectedForecast?.scenarioAnalysis && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Scenario Analysis
          </Typography>
          <Grid container spacing={3}>
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
                  Best Case Scenario (P90)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ending Cash Balance
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
                    {formatCurrency(selectedForecast.scenarioAnalysis.bestCase.endingCash)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Probability
                  </Typography>
                  <Typography variant="body1">
                    {formatPercentage(selectedForecast.scenarioAnalysis.bestCase.probability)}
                  </Typography>
                </Box>
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
                  Most Likely Scenario (P50)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ending Cash Balance
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#00bcd4' }}>
                    {formatCurrency(selectedForecast.scenarioAnalysis.mostLikely.endingCash)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Probability
                  </Typography>
                  <Typography variant="body1">
                    {formatPercentage(selectedForecast.scenarioAnalysis.mostLikely.probability)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: alpha('#f44336', 0.05),
                  border: `1px solid ${alpha('#f44336', 0.2)}`
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1, color: '#f44336' }}>
                  Worst Case Scenario (P10)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ending Cash Balance
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#f44336' }}>
                    {formatCurrency(selectedForecast.scenarioAnalysis.worstCase.endingCash)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Probability
                  </Typography>
                  <Typography variant="body1">
                    {formatPercentage(selectedForecast.scenarioAnalysis.worstCase.probability)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default CashFlowDetails;