// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Box, Typography, useMediaQuery, Tooltip, Chip, Fade
} from '@mui/material';
import { useTheme, styled, alpha, keyframes } from '@mui/material/styles';

// Icons
import EventNoteIcon from '@mui/icons-material/EventNote';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FolderIcon from '@mui/icons-material/Folder';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BusinessIcon from '@mui/icons-material/Business';
import CircleIcon from '@mui/icons-material/Circle';
import TaskIcon from '@mui/icons-material/Task';
// Subtle animation
const subtleShimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

// Styled Components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    position: 'relative',
    // Add padding top to prevent content from going under the header
    paddingTop: '64px', // Standard MUI AppBar height
    overflowX: 'hidden',
  }
}));

const OrganizationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  margin: theme.spacing(2, 2, 0, 2),
  borderRadius: theme.spacing(2),
  textAlign: 'center',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, 
      transparent 0%, 
      ${alpha(theme.palette.common.white, 0.1)} 50%, 
      transparent 100%)`,
    animation: `${subtleShimmer} 8s ease-in-out infinite`,
  }
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  margin: '0 auto',
  marginBottom: theme.spacing(1),
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px solid ${alpha(theme.palette.common.white, 0.25)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
    transform: 'scale(1.05) rotate(5deg)',
    boxShadow: `0 0 20px ${alpha(theme.palette.common.white, 0.3)}`,
  }
}));

const NavigationList = styled(List)(({ theme }) => ({
  padding: theme.spacing(1.5),
  '& .MuiListItem-root': {
    marginBottom: theme.spacing(0.5),
  }
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: theme.spacing(1.5),
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(1.25, 2),
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      transform: 'scale(1.1)',
    }
  },
  ...(active && {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
    fontWeight: 600,
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 4,
      height: '60%',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '0 4px 4px 0',
      boxShadow: `2px 0 8px ${alpha(theme.palette.primary.main, 0.3)}`,
    }
  })
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  color: theme.palette.text.secondary,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const StatusDot = styled(CircleIcon)(({ theme, status }) => ({
  fontSize: 7,
  marginLeft: theme.spacing(0.75),
  color: status === 'new' 
    ? theme.palette.success.main 
    : theme.palette.warning.main,
  filter: `drop-shadow(0 0 3px ${status === 'new' 
    ? theme.palette.success.main 
    : theme.palette.warning.main})`,
}));

const SectionDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(1, 2),
  opacity: 0.1,
}));

const FooterSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(to top, 
    ${alpha(theme.palette.primary.main, 0.02)} 0%, 
    transparent 100%)`,
  '& .footer-text': {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
    '&:hover': {
      opacity: 1,
    }
  }
}));

// Navigation items
const authenticatedNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, status: null },
  { name: 'Financials', path: '/financials', icon: <AttachMoneyIcon />, status: null },
  { name: 'Fundraising', path: '/fundraising', icon: <BusinessCenterIcon />, status: null },
  { name: 'KPIs', path: '/kpis', icon: <BarChartIcon />, status: null },
  { name: 'Product Roadmap', path: '/product-milestones', icon: <RocketLaunchIcon />, status: null }, 
  //{ name: 'Analytics', path: '/analytics', icon: <AssessmentIcon />, status: null },
  { name: 'Budgets', path: '/budgets', icon: <AccountBalanceWalletIcon />, status: null },
  { name: 'Headcount', path: '/headcount', icon: <PeopleOutlineIcon />, status: null },
  { name: 'Documents', path: '/documents', icon: <FolderIcon />, status: null },
  { name: 'Task Tracking', path: '/tasks', icon: <TaskIcon />, status: 'new' },
  { name: 'Live Investor View', path: '/investor-dashboard', icon: <VisibilityIcon />, status: null },
  { name: 'Investor Meetings', path: '/investor-meetings', icon: <EventNoteIcon />, status: null },
];

const unAuthenticatedNavItems = [
  { name: 'Login', path: '/login', icon: <LoginIcon />, status: null },
  { name: 'Register', path: '/register', icon: <PersonAddIcon />, status: null },
];

const Sidebar = ({ open, onClose, drawerWidth }) => {
  const { isAuthenticated, activeOrganization, user } = useAuth(); 
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItemsToDisplay = isAuthenticated ? authenticatedNavItems : unAuthenticatedNavItems;

  const handleListItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <OrganizationHeader>
        <LogoContainer>
          <BusinessIcon sx={{ fontSize: 28, color: 'inherit' }} />
        </LogoContainer>
        
        <Typography 
          variant="subtitle1" 
          component="h2" 
          sx={{ 
            fontWeight: 700,
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            px: 1,
            letterSpacing: '0.5px',
          }}
        >
          {activeOrganization?.name || 'ScaleUp Horizon'}
        </Typography>
        
        
      </OrganizationHeader>
      
      <NavigationList sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {navItemsToDisplay.map((item, index) => {
          const isActive = isActiveRoute(item.path);
          return (
            <Fade in timeout={300 + index * 50} key={item.name}>
              <ListItem 
                disablePadding
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <StyledListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={handleListItemClick}
                  active={isActive ? 1 : 0}
                >
                  <StyledListItemIcon>
                    {React.cloneElement(item.icon, {
                      sx: {
                        transition: 'transform 0.2s ease',
                        transform: hoveredItem === item.name ? 'scale(1.1)' : 'scale(1)',
                      }
                    })}
                  </StyledListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.name}
                        {item.status && (
                          <Tooltip 
                            title={item.status === 'new' ? 'New Feature' : 'Beta Feature'} 
                            arrow
                            placement="right"
                          >
                            <StatusDot status={item.status} />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{
                      sx: { 
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.875rem',
                        letterSpacing: '0.3px',
                      }
                    }}
                  />
                </StyledListItemButton>
              </ListItem>
            </Fade>
          );
        })}
      </NavigationList>
      
      
      
      <FooterSection>
        <Typography className="footer-text">
          &copy; {new Date().getFullYear()} ScaleUp App
        </Typography>
      </FooterSection>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} 
      aria-label="application navigation"
    >
      {/* Mobile drawer */}
      <StyledDrawer
        variant="temporary"
        open={open} 
        onClose={onClose}
        ModalProps={{
          keepMounted: true, 
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth,
            // Ensure mobile drawer also has proper padding
            paddingTop: '64px',
            zIndex: (theme) => theme.zIndex.drawer,
          },
        }}
      >
        {drawerContent}
      </StyledDrawer>
      
      {/* Desktop drawer */}
      <StyledDrawer
        variant="persistent" 
        open={open} 
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth,
            position: 'relative',
            height: '100vh',
            // Make sure desktop drawer is below header
            zIndex: (theme) => theme.zIndex.drawer - 1,
          },
        }}
      >
        {drawerContent}
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;