// src/components/layout/Sidebar.jsx
// Application sidebar with navigation links using MUI Drawer.
// Sidebar structure is always present on desktop; content adapts to auth state.
// Navigation clicks on desktop will not close the persistent sidebar.
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery'; // Import useMediaQuery
import { useTheme } from '@mui/material/styles'; // Import useTheme to access breakpoints
import EventNoteIcon from '@mui/icons-material/EventNote';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FolderIcon from '@mui/icons-material/Folder';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';


const authenticatedNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { name: 'Financials', path: '/financials', icon: <AttachMoneyIcon /> },
  { name: 'Fundraising', path: '/fundraising', icon: <BusinessCenterIcon /> },
  { name: 'KPIs', path: '/kpis', icon: <BarChartIcon /> },
  //{ name: 'Analytics', path: '/analytics', icon: <AssessmentIcon /> },
  { name: 'Budgets', path: '/budgets', icon: <AccountBalanceWalletIcon /> },
  { name: 'Documents', path: '/documents', icon: <FolderIcon /> },
  { name: 'Investor Meetings', path: '/investor-meetings', icon: <EventNoteIcon /> },
  //{ name: 'Reports', path: '/reports', icon: <DescriptionIcon /> },
];

const unAuthenticatedNavItems = [
    { name: 'Login', path: '/login', icon: <LoginIcon /> },
    { name: 'Register', path: '/register', icon: <PersonAddIcon /> },
];

const Sidebar = ({ open, onClose, drawerWidth }) => {
  const { isAuthenticated } = useAuth(); 
  const theme = useTheme();
  // Check if the screen is 'md' or smaller (typical mobile/tablet breakpoint for temporary drawer)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItemsToDisplay = isAuthenticated ? authenticatedNavItems : unAuthenticatedNavItems;

  const handleListItemClick = () => {
    if (isMobile && onClose) { // Only call onClose (to toggle drawer) on mobile
      onClose();
    }
    // Navigation will happen via NavLink's `to` prop
  };

  const drawerContent = (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Box sx={{ p: 2.5, textAlign: 'center', backgroundColor: 'primary.dark', color: 'white' }}>
        <BusinessCenterIcon sx={{ fontSize: 40, mb: 1 }}/>
        <Typography variant="h5" component="h2">ScaleUp</Typography>
        <Typography variant="caption">Horizon</Typography>
      </Box>
      <Divider />
      <List sx={{flexGrow: 1}}> 
        {navItemsToDisplay.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={handleListItemClick} // Use the new handler
              sx={{
                '&.active': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                },
                '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                },
                color: 'text.secondary'
              }}
            >
              <ListItemIcon sx={{color: 'inherit', minWidth: '40px'}}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {isAuthenticated && ( 
        <List>
          <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/settings" onClick={handleListItemClick}
                sx={{
                  '&.active': { backgroundColor: 'primary.light', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'primary.contrastText'}},
                  '&:hover': { backgroundColor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'primary.contrastText'}},
                  color: 'text.secondary'
                }}
              >
             
              
              </ListItemButton>
          </ListItem>
        </List>
      )}
       <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', mt: 'auto' }}>
        &copy; {new Date().getFullYear()} ScaleUp App
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} 
      aria-label="application navigation"
    >
      {/* Temporary Drawer for mobile - always available to be toggled */}
      <Drawer
        variant="temporary"
        open={open} 
        onClose={onClose} // This onClose is for backdrop click or escape key
        ModalProps={{
          keepMounted: true, 
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: 'background.paper' },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Persistent Drawer for desktop - always rendered, visibility controlled by `open` prop */}
      <Drawer
        variant="persistent" 
        open={open} 
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            backgroundColor: 'background.paper', 
            position: 'relative', 
            height: '100vh', 
            borderRight: (theme) => `1px solid ${theme.palette.divider}` 
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
