// src/components/analytics/FundraisingDetails.jsx
import React from 'react';
import {
  Box, Paper, Grid, Typography, Stack, IconButton, Chip, 
  Avatar, LinearProgress, Divider, Table, TableContainer, 
  TableHead, TableRow, TableCell, TableBody, Rating
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import HistoryIcon from '@mui/icons-material/History';

import { ScenarioChip, GlassCard, PredictionCard } from './StyledComponents';
import { formatCurrency, formatDate, formatPercentage } from './formatters';

const FundraisingDetails = ({
  predictions,
  selectedPrediction,
  setSelectedPrediction,
  fundraisingReadiness,
  onEdit,
  onHistoryClick
}) => {
  // Build radar data from fundraising readiness
  const radarData = fundraisingReadiness ? [
    { 
      factor: 'Burn Rate', 
      value: fundraisingReadiness.runwayMonths > 12 ? 80 : 
              fundraisingReadiness.runwayMonths > 6 ? 60 : 30 
    },
    { 
      factor: 'Growth', 
      value: (fundraisingReadiness.dauGrowth || 0) * 500 // Convert to percentage scale
    },
    { 
      factor: 'Revenue', 
      value: fundraisingReadiness.monthlyRevenue > 0 ? 80 : 30 
    },
    { 
      factor: 'Team', 
      value: (fundraisingReadiness.teamSize || 10) * 5 // Scale team size
    },
    { 
      factor: 'Market', 
      value: 70 // Default since not in API
    },
    { 
      factor: 'Product', 
      value: fundraisingReadiness.revenueGrowth > 0 ? 80 : 60 
    }
  ] : [];

  if (!fundraisingReadiness) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Loading fundraising readiness data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {predictions && predictions.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          {predictions.slice(0, 5).map((prediction) => (
            <ScenarioChip
              key={prediction._id}
              label={prediction.predictionName}
              icon={<RocketLaunchIcon />}
              onClick={() => setSelectedPrediction(prediction)}
              $active={selectedPrediction?._id === prediction._id}
            />
          ))}
          {predictions.length > 5 && (
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Fundraising Readiness Score
              </Typography>
              {selectedPrediction && (
                <Typography variant="subtitle2" color="text.secondary">
                  Current Prediction: {selectedPrediction.predictionName}
                </Typography>
              )}
            </Stack>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={alpha('#000', 0.3)} />
                  <PolarAngleAxis dataKey="factor" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Current Score"
                    dataKey="value"
                    stroke="#9c27b0" // Secondary color
                    fill={alpha('#9c27b0', 0.3)}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                <Typography variant="body2" color="text.secondary">
                  No readiness data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <GlassCard>
              <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#9c27b0', 0.1), color: '#9c27b0' }}>
                    <RocketLaunchIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Overall Readiness</Typography>
                    <Typography variant="h3" color="secondary" sx={{ fontWeight: 700 }}>
                      {Math.round((fundraisingReadiness.overallProbability || 0) * 100)}%
                    </Typography>
                  </Box>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(fundraisingReadiness.overallProbability || 0) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                  color="secondary"
                />
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Chip 
                    label={`${fundraisingReadiness.runwayMonths || 0} months runway`} 
                    size="small" 
                    color={fundraisingReadiness.runwayMonths > 12 ? "success" : "warning"}
                  />
                  <Chip 
                    label={`${formatPercentage(fundraisingReadiness.dauGrowth || 0)} DAU growth`} 
                    size="small" 
                    color="primary"
                  />
                </Stack>
              </Box>
            </GlassCard>

            <GlassCard>
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Key Recommendations
                </Typography>
                {fundraisingReadiness.recommendations ? (
                  <Stack spacing={1.5}>
                    {fundraisingReadiness.recommendations.map((rec, idx) => (
                      <Typography key={idx} variant="body2">
                        • {rec}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    {fundraisingReadiness.dauGrowth > 0.1 && (
                      <Typography variant="body2">
                        • Strong user growth at {formatPercentage(fundraisingReadiness.dauGrowth)} positions you well for fundraising
                      </Typography>
                    )}
                    {fundraisingReadiness.runwayMonths < 12 && (
                      <Typography variant="body2">
                        • Consider extending runway beyond {fundraisingReadiness.runwayMonths} months for better negotiation position
                      </Typography>
                    )}
                    {fundraisingReadiness.monthlyRevenue === 0 && (
                      <Typography variant="body2">
                        • Focus on initial revenue generation to strengthen fundraising potential
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>
            </GlassCard>
          </Stack>
        </Grid>

        {selectedPrediction && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Prediction: {selectedPrediction.predictionName}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit('prediction', selectedPrediction)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Timeline
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                      Start: {formatDate(selectedPrediction.predictedStartDate)}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Close: {formatDate(selectedPrediction.predictedCloseDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confidence Interval: ±{selectedPrediction.confidenceInterval || 30} days
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Round Details
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Target Size
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatCurrency(selectedPrediction.targetRoundSize)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Target Valuation
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatCurrency(selectedPrediction.targetValuation)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Round Type
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedPrediction.roundType}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Success Probabilities
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Overall Success</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatPercentage(selectedPrediction.overallProbability)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedPrediction.overallProbability || 0) * 100}
                        sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                        color="secondary"
                      />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Timeline Probability</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatPercentage(selectedPrediction.timelineProbability)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedPrediction.timelineProbability || 0) * 100}
                        sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                        color="secondary"
                      />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Amount Probability</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatPercentage(selectedPrediction.amountProbability)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedPrediction.amountProbability || 0) * 100}
                        sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                        color="info"
                      />
                    </Box>
                  </Stack>
                </Grid>
                
                {selectedPrediction.keyMilestones && selectedPrediction.keyMilestones.length > 0 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      Key Milestones
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedPrediction.keyMilestones.map((milestone, idx) => (
                        <Grid item xs={12} sm={6} md={3} key={idx}>
                          <Paper 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2,
                              border: `1px solid ${alpha('#000', 0.1)}`
                            }}
                          >
                            <Typography variant="subtitle2">
                              {milestone.name}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Completion
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={milestone.percentageComplete}
                                sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                                color={milestone.percentageComplete > 75 ? "success" : "secondary"}
                              />
                              <Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
                                {milestone.percentageComplete}%
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}

        
      </Grid>
    </Box>
  );
};

export default FundraisingDetails;