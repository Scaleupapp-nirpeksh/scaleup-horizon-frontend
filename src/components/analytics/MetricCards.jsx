// src/components/analytics/MetricCards.jsx
import React from 'react';
import { Grid, Typography, Box, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';

import { MetricCard, AnimatedAvatar } from './StyledComponents';
import { formatCurrency, formatDate } from './formatters';

const MetricCards = ({ 
  selectedScenario, 
  fundraisingReadiness, 
  currentCashPosition, 
  cohortComparison 
}) => {
  const metrics = [
    {
      title: 'Predicted Runway',
      value: selectedScenario?.totalRunwayMonths || 0,
      unit: ' months',
      icon: <TimelineIcon />,
      color: selectedScenario?.totalRunwayMonths > 12 ? 'success' : 'warning',
      trend: selectedScenario?.totalRunwayMonths > 12 ? 'up' : 'down',
      description: selectedScenario?.dateOfCashOut ? `Until ${formatDate(selectedScenario.dateOfCashOut)}` : 'Loading...'
    },
    {
      title: 'Fundraising Readiness',
      value: Math.round((fundraisingReadiness?.overallProbability || 0) * 100),
      unit: '%',
      icon: <RocketLaunchIcon />,
      color: 'primary',
      trend: 'neutral',
      description: 'Based on current metrics'
    },
    {
      title: 'Cash Position',
      value: formatCurrency(currentCashPosition?.cash || 0),
      unit: '',
      icon: <AccountBalanceIcon />,
      color: 'info',
      trend: 'up',
      description: 'Current bank balance'
    },
    {
      title: 'Avg Retention',
      value: cohortComparison?.insights?.averageRetention 
        ? (cohortComparison.insights.averageRetention * 100).toFixed(1) 
        : '0',
      unit: '%',
      icon: <PeopleIcon />,
      color: 'secondary',
      trend: 'neutral',
      description: 'Across all cohorts'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -8 }}
          >
            <MetricCard color={metric.color} $trend={metric.trend}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {metric.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {metric.value}{metric.unit}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metric.description}
                  </Typography>
                </Box>
                <AnimatedAvatar className="metric-icon">
                  {metric.icon}
                </AnimatedAvatar>
              </Stack>
            </MetricCard>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

export default MetricCards;