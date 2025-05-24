// src/components/layout/AppLayout.jsx
// Application layout with Header and Sidebar, ensuring main content is scrollable.
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles'; // Import useTheme

const drawerWidth = 250;

const AppLayout = () => {
  const theme = useTheme(); // Access theme for breakpoints and transitions
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open for desktop

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header onDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Apply padding directly here, it's part of the scrollable content area
          padding: theme.spacing(3), // Consistent padding
          marginTop: '64px', // AppBar height
          height: 'calc(100vh - 64px)', // Crucial: Full viewport height minus header
          overflowY: 'auto', // Crucial: Enables vertical scrolling for this Box only
          width: { // Dynamically adjust width based on sidebar state
            xs: '100%', // Full width on extra small screens (mobile, sidebar overlays)
            md: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` // Adjust for persistent sidebar on medium+
          },
          marginLeft: { // Dynamically adjust margin based on sidebar state for persistent drawer
            xs: 0, // No margin on mobile
            md: `${sidebarOpen ? drawerWidth : 0}px`
          },
          transition: theme.transitions.create(['margin-left', 'width'], { // Smooth transition for width/margin
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Outlet /> {/* Page content will be rendered here and will scroll if it overflows */}
      </Box>
    </Box>
  );
};

export default AppLayout;
