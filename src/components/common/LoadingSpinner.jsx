// src/components/common/LoadingSpinner.jsx
import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const LoadingSpinner = ({ fullScreen, message = "Loading..." }) => {
  if (fullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: (theme) => theme.zIndex.drawer + 2, // Ensure it's above other elements
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>{message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      <CircularProgress size={24} sx={{mr: 1}}/>
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
};

export default LoadingSpinner;
