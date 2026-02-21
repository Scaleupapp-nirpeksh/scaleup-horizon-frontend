// src/pages/SettingsPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Stack, Button, alpha, useTheme, Grid
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ConstructionIcon from '@mui/icons-material/Construction';

const SettingsPage = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Settings</Typography>
      </Stack>

      <Grid container spacing={3}>
        {/* Organization Management - available now */}
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}` },
            }}
          >
            <Box sx={{
              width: 48, height: 48, borderRadius: 2, mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BusinessIcon sx={{ color: 'white' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Organization</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage your organization details, team members, and roles.
            </Typography>
            <Button
              component={RouterLink}
              to="/settings/organization"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Manage Organization
            </Button>
          </Paper>
        </Grid>

        {/* Coming soon placeholder */}
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: alpha(theme.palette.background.paper, 0.6),
              opacity: 0.7,
            }}
          >
            <Box sx={{
              width: 48, height: 48, borderRadius: 2, mb: 2,
              background: alpha(theme.palette.text.secondary, 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ConstructionIcon sx={{ color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'text.secondary' }}>
              More Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Profile preferences, notifications, theme customization, and integrations are coming soon.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
