// src/components/layout/AppWrapper.jsx - Mobile Responsive Version
import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Drawer, List, ListItem, 
  ListItemIcon, ListItemText, IconButton, Box, Avatar, 
  Divider, Collapse, useTheme, alpha, ListItemButton,
  useMediaQuery, SwipeableDrawer, Badge, Menu, MenuItem,
  Tooltip, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const drawerWidth = 280;
const miniDrawerWidth = 64;

// Styled Components
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open, isMobile }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  backdropFilter: 'blur(10px)',
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && !isMobile && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(!open && !isMobile && {
    width: `calc(100% - ${miniDrawerWidth}px)`,
    marginLeft: `${miniDrawerWidth}px`,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, isMobile }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: isMobile ? 0 : `-${drawerWidth}px`,
    ...(open && !isMobile && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
    ...(!open && !isMobile && {
      marginLeft: `-${drawerWidth - miniDrawerWidth}px`,
    }),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  }),
);

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(active && {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.25),
    },
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
  },
}));

const AppWrapper = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [financialsOpen, setFinancialsOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleMobileDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    {
      text: 'Financials',
      icon: <AccountBalanceIcon />,
      subItems: [
        { text: 'Overview', path: '/financials' },
        { text: 'Budgets', icon: <AccountBalanceWalletIcon />, path: '/budgets' },
      ],
    },
    { text: 'KPIs', icon: <BarChartIcon />, path: '/kpis' },
    { text: 'Fundraising', icon: <BusinessCenterIcon />, path: '/fundraising' },
    { text: 'Analytics', icon: <InsightsIcon />, path: '/analytics' },
    { text: 'Documents', icon: <DescriptionIcon />, path: '/documents' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {(open || isMobile) && (
            <>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>S</Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ScaleUp Horizon
              </Typography>
            </>
          )}
        </Box>
        {isMobile && (
          <IconButton onClick={handleMobileDrawerClose}>
            <CloseIcon />
          </IconButton>
        )}
      </DrawerHeader>
      
      <Divider />
      
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <Box key={item.text}>
            {item.subItems ? (
              <>
                <StyledListItemButton
                  onClick={() => setFinancialsOpen(!financialsOpen)}
                  active={location.pathname.startsWith('/financials') || location.pathname === '/budgets'}
                >
                  <ListItemIcon>
                    <Tooltip title={!open && !isMobile ? item.text : ''} placement="right">
                      {item.icon}
                    </Tooltip>
                  </ListItemIcon>
                  {(open || isMobile) && (
                    <>
                      <ListItemText primary={item.text} />
                      {financialsOpen ? <ExpandLess /> : <ExpandMore />}
                    </>
                  )}
                </StyledListItemButton>
                <Collapse in={financialsOpen && (open || isMobile)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <StyledListItemButton
                        key={subItem.text}
                        component={Link}
                        to={subItem.path}
                        active={location.pathname === subItem.path}
                        sx={{ pl: 4 }}
                        onClick={handleMobileDrawerClose}
                      >
                        <ListItemIcon>
                          {subItem.icon || <ChevronRightIcon />}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </StyledListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <StyledListItemButton
                component={Link}
                to={item.path}
                active={location.pathname === item.path}
                onClick={handleMobileDrawerClose}
              >
                <ListItemIcon>
                  <Tooltip title={!open && !isMobile ? item.text : ''} placement="right">
                    {item.icon}
                  </Tooltip>
                </ListItemIcon>
                {(open || isMobile) && <ListItemText primary={item.text} />}
              </StyledListItemButton>
            )}
          </Box>
        ))}
      </List>

      <Divider />
      
      <List sx={{ px: 1, py: 2 }}>
        <StyledListItemButton
          component={Link}
          to="/settings"
          active={location.pathname === '/settings'}
          onClick={handleMobileDrawerClose}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          {(open || isMobile) && <ListItemText primary="Settings" />}
        </StyledListItemButton>
        
        <StyledListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          {(open || isMobile) && <ListItemText primary="Logout" />}
        </StyledListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <StyledAppBar position="fixed" open={open} isMobile={isMobile}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Page title could go here */}
          </Typography>

          {/* Mobile Search - Hidden on Desktop */}
          {isMobile && (
            <IconButton color="inherit" sx={{ display: { md: 'none' } }}>
              <SearchIcon />
            </IconButton>
          )}

          {/* Notifications */}
          <IconButton 
            color="inherit"
            onClick={(e) => setNotificationAnchor(e.currentTarget)}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onOpen={() => setMobileOpen(true)}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: theme.palette.background.paper,
            },
          }}
        >
          {drawerContent}
        </SwipeableDrawer>
      ) : (
        <Drawer
          sx={{
            width: open ? drawerWidth : miniDrawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : miniDrawerWidth,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          variant="permanent"
          open={open}
        >
          {drawerContent}
        </Drawer>
      )}

      <Main open={open} isMobile={isMobile}>
        <DrawerHeader />
        {children}
      </Main>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { minWidth: 200, mt: 1 }
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2">{user?.name || 'User'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>
        <MenuItem component={Link} to="/settings" onClick={() => setAnchorEl(null)}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <MenuItem onClick={() => setNotificationAnchor(null)}>
          <Typography variant="body2">New expense added: ₹5,000</Typography>
        </MenuItem>
        <MenuItem onClick={() => setNotificationAnchor(null)}>
          <Typography variant="body2">Budget alert: Marketing budget at 80%</Typography>
        </MenuItem>
        <MenuItem onClick={() => setNotificationAnchor(null)}>
          <Typography variant="body2">New investor update available</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AppWrapper;