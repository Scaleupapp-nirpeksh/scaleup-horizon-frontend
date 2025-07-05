// src/components/layout/AppLayout.jsx - FINAL FIX
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';
import { useTheme, useMediaQuery } from '@mui/material';

const drawerWidth = 250;

const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* CRITICAL: Header with proper z-index */}
      <Header 
        onDrawerToggle={handleDrawerToggle} 
        drawerWidth={drawerWidth}
        sx={{
          zIndex: theme.zIndex.drawer + 1, // Ensure header is above sidebar
        }}
      />
      
      {/* CRITICAL: Sidebar that starts from top but content below header */}
      <Box
        sx={{
          width: { xs: 0, md: sidebarOpen ? drawerWidth : 0 },
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Sidebar 
          open={sidebarOpen} 
          onClose={handleDrawerToggle} 
          drawerWidth={drawerWidth} 
        />
      </Box>
      
      {/* CRITICAL: Main content with no margin - just flex grow */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Spacer for header */}
        <Box sx={{ height: '64px', flexShrink: 0 }} />
        
        {/* Scrollable content area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: theme.spacing(3),
            height: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;