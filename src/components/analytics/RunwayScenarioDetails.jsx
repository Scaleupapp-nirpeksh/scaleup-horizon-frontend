// src/components/analytics/RunwayScenarioDetails.jsx
import React from 'react';
import {
  Box, Paper, Grid, Typography, Stack, IconButton, Chip,
  LinearProgress, Avatar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Line, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, ComposedChart, ReferenceLine, Brush
} from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import HistoryIcon from '@mui/icons-material/History';

import { ScenarioChip, PredictionCard } from './StyledComponents';
import { formatCurrency, formatDate, formatPercentage } from './formatters';
import { chartColors } from './StyledComponents';

const RunwayScenarioDetails = ({
  scenarios,
  selectedScenario,
  setSelectedScenario,
  scenarioComparison,
  onEdit,
  onHistoryClick
}) => {
  // Prepare chart data from API response
  const chartData = selectedScenario?.monthlyProjections?.map(proj => ({
    month: `Month ${proj.month}`,
    cash: proj.endingCash,
    revenue: proj.revenue,
    expenses: proj.expenses,
    netCashFlow: proj.netCashFlow,
    runwayRemaining: proj.runwayRemaining
  })) || [];

  const probabilityData = scenarioComparison?.scenarios?.map((scenario) => ({
    name: scenario.name,
    runway: scenario.runwayMonths,
    burned: scenario.totalBurned,
    type: scenario.type
  })) || [];

  if (!selectedScenario) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          No scenario selected. Please select or create a scenario.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
        {scenarios.map((scenario) => (
          <ScenarioChip
            key={scenario._id}
            label={scenario.name}
            icon={scenario.scenarioType === 'Baseline' ? <ShowChartIcon /> : null}
            onClick={() => setSelectedScenario(scenario)}
            $active={selectedScenario?._id === scenario._id}
          />
        ))}
        {scenarios.length > 5 && (
          <Chip
            icon={<HistoryIcon />}
            label="View All History"
            onClick={onHistoryClick}
            variant="outlined"
            sx={{ cursor: 'pointer' }}
          />
        )}
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Cash Flow Projection - {selectedScenario?.name}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => onEdit('scenario', selectedScenario)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <TuneIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3f51b5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.1)} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: alpha('#fff', 0.95),
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cash"
                    fill="url(#cashGradient)"
                    stroke="#3f51b5"
                    strokeWidth={2}
                    name="Cash Balance"
                  />
                  <Bar dataKey="revenue" fill="#4caf50" name="Revenue" />
                  <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
                  <Line
                    type="monotone"
                    dataKey="netCashFlow"
                    stroke="#ff9800"
                    strokeWidth={3}
                    dot={false}
                    name="Net Cash Flow"
                  />
                  {selectedScenario?.dateOfCashOut && (
                    <ReferenceLine
                      x={`Month ${selectedScenario.totalRunwayMonths}`}
                      stroke="#f44336"
                      strokeDasharray="5 5"
                      label={{ value: "Cash Out", position: "top" }}
                    />
                  )}
                  <Brush dataKey="month" height={30} stroke="#3f51b5" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                <Typography variant="body2" color="text.secondary">
                  No projection data available for this scenario
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <PredictionCard severity={selectedScenario?.totalRunwayMonths > 12 ? 'success' : 'warning'}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: selectedScenario?.totalRunwayMonths > 12 
                      ? alpha('#4caf50', 0.1)
                      : alpha('#ff9800', 0.1),
                    color: selectedScenario?.totalRunwayMonths > 12 
                      ? '#4caf50'
                      : '#ff9800'
                  }}
                >
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Runway Remaining
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedScenario?.totalRunwayMonths || 0} months
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Until {formatDate(selectedScenario?.dateOfCashOut)}
                  </Typography>
                </Box>
              </Stack>
            </PredictionCard>

            <PredictionCard severity="info">
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Monte Carlo Confidence Intervals
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">P10 (Worst):</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedScenario?.simulation?.p10 || 'N/A'} months
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={((selectedScenario?.simulation?.p10 || 0) / 24) * 100}
                    sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                    color="error"
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">P50 (Expected):</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedScenario?.simulation?.p50 || 'N/A'} months
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={((selectedScenario?.simulation?.p50 || 0) / 24) * 100}
                    sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                    color="primary"
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">P90 (Best):</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedScenario?.simulation?.p90 || 'N/A'} months
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={((selectedScenario?.simulation?.p90 || 0) / 24) * 100}
                    sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                    color="success"
                  />
                </Box>
              </Stack>
            </PredictionCard>

            <PredictionCard severity="info">
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Key Assumptions
              </Typography>
              <Stack spacing={1.5}>
                {selectedScenario?.assumptions?.map((assumption, idx) => (
                  <Box key={idx}>
                    <Typography variant="caption" color="text.secondary">
                      {assumption.metric.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPercentage(assumption.growthRate)} growth
                      </Typography>
                      {assumption.growthRate > 0 ? (
                        <TrendingUpIcon fontSize="small" color="success" />
                      ) : assumption.growthRate < 0 ? (
                        <TrendingUpIcon fontSize="small" color="error" sx={{ transform: 'rotate(180deg)' }} />
                      ) : null}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </PredictionCard>
          </Stack>
        </Grid>
      </Grid>

      {probabilityData.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Scenario Comparison Analysis
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={probabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="runway" fill="#3f51b5" name="Runway (months)">
                {probabilityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors.mixed[index % chartColors.mixed.length]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
};

export default RunwayScenarioDetails;