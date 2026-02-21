// src/pages/ReportsPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Stack, Button, alpha, useTheme, Grid
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ConstructionIcon from '@mui/icons-material/Construction';

const ReportsPage = () => {
  const theme = useTheme();

  const availableModules = [
    {
      label: 'Analytics Dashboard',
      description: 'Cash flow forecasts, revenue cohorts, runway scenarios, and fundraising predictions.',
      path: '/analytics',
      icon: <BarChartIcon />,
      color: theme.palette.primary.main,
    },
    {
      label: 'KPI Tracking',
      description: 'Monitor DAU/MAU, retention, user growth, and custom KPI snapshots.',
      path: '/kpis',
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
    },
    {
      label: 'Budget vs Actuals',
      description: 'Compare planned budgets against actual spending with variance analysis.',
      path: '/budgets',
      icon: <AccountBalanceWalletIcon />,
      color: theme.palette.secondary.main,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <AssessmentIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Reports</Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Automated report generation is coming soon. In the meantime, explore these analytics modules:
      </Typography>

      <Grid container spacing={3}>
        {availableModules.map((mod) => (
          <Grid item xs={12} sm={6} md={4} key={mod.path}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${alpha(mod.color, 0.15)}`,
                background: `linear-gradient(135deg, ${alpha(mod.color, 0.03)} 0%, ${alpha(mod.color, 0.08)} 100%)`,
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(mod.color, 0.15)}` },
              }}
            >
              <Box sx={{
                width: 48, height: 48, borderRadius: 2, mb: 2,
                background: `linear-gradient(135deg, ${mod.color}, ${alpha(mod.color, 0.7)})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
              }}>
                {mod.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{mod.label}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                {mod.description}
              </Typography>
              <Button
                component={RouterLink}
                to={mod.path}
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                size="small"
                sx={{ borderRadius: 2, alignSelf: 'flex-start', borderColor: alpha(mod.color, 0.4), color: mod.color }}
              >
                View
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Coming soon note */}
      <Paper
        sx={{
          mt: 4, p: 3, borderRadius: 3,
          border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
          background: alpha(theme.palette.background.paper, 0.5),
          textAlign: 'center',
        }}
      >
        <ConstructionIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Full reporting with PDF/Excel export, scheduled reports, and investor update templates is coming soon.
        </Typography>
      </Paper>
    </Container>
  );
};

export default ReportsPage;
