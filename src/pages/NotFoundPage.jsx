// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Stack, Paper, alpha, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const suggestedPages = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Financials', path: '/financials', icon: <AccountBalanceWalletIcon /> },
    { label: 'Analytics', path: '/analytics', icon: <BarChartIcon /> },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        p: 2,
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <ErrorOutlineIcon aria-hidden="true" sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>

        <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
          The page you're looking for doesn't exist or has been moved. Try one of the links below.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2 }}
          >
            Go Back
          </Button>
          <Button
            component={RouterLink}
            to="/dashboard"
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            sx={{ borderRadius: 2 }}
          >
            Go to Dashboard
          </Button>
        </Stack>

        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Quick Links
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          {suggestedPages.map((page) => (
            <Paper
              key={page.path}
              component={RouterLink}
              to={page.path}
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1.5,
                borderRadius: 2,
                textDecoration: 'none',
                color: 'text.primary',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
              }}
            >
              <Box sx={{ color: 'primary.main', display: 'flex' }}>{page.icon}</Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{page.label}</Typography>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
