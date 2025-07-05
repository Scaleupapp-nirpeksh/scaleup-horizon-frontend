// src/components/layout/Sidebar.jsx - FINAL FIXED VERSION
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Box, Typography, useMediaQuery, Tooltip, Chip, Fade
} from '@mui/material';
import { useTheme, styled, alpha, keyframes } from '@mui/material/styles';

// Icons (keeping all your existing icons)
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

// Animations
const subtleShimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

// CRITICAL FIX: Completely rewritten drawer styling
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 250,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 250,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    // CRITICAL: Remove all positioning conflicts
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: theme.zIndex.drawer,
    // CRITICAL: No padding top or margin
    overflowX: 'hidden',
  }
}));

// CRITICAL FIX: Organization header with proper top spacing
const OrganizationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(0, 2, 0, 2),
  // CRITICAL: Add top margin to push below header
  marginTop: theme.spacing(9), // 64px header + some spacing
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
  width: 48,
  height: 48,
  margin: '0 auto',
  marginBottom: theme.spacing(1),
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px solid ${alpha(theme.palette.common.white, 0.25)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
    transform: 'scale(1.05)',
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
}));

const FooterSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  marginTop: 'auto', // Push to bottom
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '& .footer-text': {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    opacity: 0.7,
  }
}));

// Navigation items (keeping your existing items)
const authenticatedNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, status: null },
  { name: 'Financials', path: '/financials', icon: <AttachMoneyIcon />, status: null },
  { name: 'Fundraising', path: '/fundraising', icon: <BusinessCenterIcon />, status: null },
  { name: 'KPIs', path: '/kpis', icon: <BarChartIcon />, status: null },
  { name: 'Product Roadmap', path: '/product-milestones', icon: <RocketLaunchIcon />, status: null }, 
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
  const { isAuthenticated, activeOrganization } = useAuth(); 
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
          <BusinessIcon sx={{ fontSize: 24, color: 'inherit' }} />
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
            fontSize: '1rem',
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
                        fontSize: '1.25rem',
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

  // CRITICAL: Simplified drawer variants
  if (isMobile) {
    return (
      <StyledDrawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            marginTop: '64px',
            height: 'calc(100vh - 64px)',
          },
        }}
      >
        {drawerContent}
      </StyledDrawer>
    );
  }

  // Desktop drawer - only show when open
  if (!open) return null;

  return (
    <StyledDrawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        display: { xs: 'none', md: 'block' },
      }}
    >
      {drawerContent}
    </StyledDrawer>
  );
};

export default Sidebar;