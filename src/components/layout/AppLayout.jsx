// src/components/layout/AppLayout.jsx
// Basic application layout with Header and Sidebar using MUI.
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const drawerWidth = 250;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    marginTop: '64px', // Height of AppBar
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    [theme.breakpoints.up('md')]: { // For larger screens, always show sidebar or adjust margin
        marginLeft: 0, // If sidebar is permanent on larger screens
    },
  }),
);


const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open for desktop

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Sidebar open={sidebarOpen} onClose={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px', // AppBar height
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${sidebarOpen ? drawerWidth : 0}px` },
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Outlet /> {/* Page content will be rendered here */}
      </Box>
    </Box>
  );
};

export default AppLayout;