// src/components/common/ErrorBoundary.jsx
// App-level error boundary: catches render errors so a single broken
// component shows a recoverable error screen instead of a blank page.
import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled render error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign('/dashboard');
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'background.default'
          }}
        >
          <Paper sx={{ p: 5, borderRadius: 3, maxWidth: 480, textAlign: 'center' }}>
            <Stack spacing={2} alignItems="center">
              <ErrorOutlineIcon color="error" sx={{ fontSize: 56 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary">
                An unexpected error occurred while rendering this page. Your data is safe —
                reloading usually resolves it.
              </Typography>
              {this.state.error?.message && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace', wordBreak: 'break-word' }}
                >
                  {this.state.error.message}
                </Typography>
              )}
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={this.handleReload}>
                  Reload Page
                </Button>
                <Button variant="outlined" onClick={this.handleGoHome}>
                  Go to Dashboard
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
