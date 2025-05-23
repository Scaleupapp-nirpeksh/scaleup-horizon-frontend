// src/components/layout/Header.jsx
// Application header using MUI AppBar.
// The menu toggle (onDrawerToggle) will always be visible on mobile.
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import Box from '@mui/material/Box';

const Header = ({ onDrawerToggle, drawerWidth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
        position="fixed" 
        sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'primary.main'
        }}
    >
      <Toolbar>
        {/* Menu toggle is always available on mobile for the sidebar */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }} 
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          ScaleUp Horizon
        </Typography>
        {isAuthenticated && user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountCircle sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ mr: 2, display: { xs: 'none', sm: 'block'} }}>
              {user.name} ({user.role})
            </Typography>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login" startIcon={<LoginIcon />}>
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
