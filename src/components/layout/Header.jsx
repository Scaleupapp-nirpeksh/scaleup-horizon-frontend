// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Menu, MenuItem,
  Avatar, Divider, CircularProgress, Tooltip, Chip, useTheme, alpha, Button,
  ListItemIcon, Fade, Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import { styled } from '@mui/material/styles';

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  color: theme.palette.text.primary,
  boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.08)}, 0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
  backdropFilter: 'blur(10px) saturate(180%)',
  WebkitBackdropFilter: 'blur(10px) saturate(180%)',
  transition: 'all 0.3s ease',
  // Ensure header stays above sidebar
  zIndex: theme.zIndex.drawer + 2,
}));

const HeaderToolbar = styled(Toolbar)(({ theme }) => ({
  justifyContent: 'space-between',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  minHeight: 64,
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  }
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const AppTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  cursor: 'pointer',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.primary.dark} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    opacity: 0.9,
    transform: 'translateY(-1px)',
  },
  '& .subtitle': {
    fontWeight: 400,
    opacity: 0.85,
    marginLeft: theme.spacing(0.5),
  }
}));

const OrganizationButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  padding: theme.spacing(0.75, 2),
  borderRadius: theme.spacing(1.5),
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.08)} 0%, 
    ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  color: theme.palette.text.primary,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  minHeight: 38,
  maxWidth: 250,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, 
      transparent 0%, 
      ${alpha(theme.palette.primary.main, 0.1)} 50%, 
      transparent 100%)`,
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.main, 0.12)} 0%, 
      ${alpha(theme.palette.primary.light, 0.08)} 100%)`,
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
    '&::before': {
      left: '100%',
    }
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  '& .MuiButton-endIcon': {
    marginLeft: theme.spacing(0.5),
    transition: 'transform 0.2s ease',
  },
  '&[aria-expanded="true"] .MuiButton-endIcon': {
    transform: 'rotate(180deg)',
  }
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    marginTop: theme.spacing(1),
    minWidth: 260,
    boxShadow: theme.shadows[8],
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme, selected }) => ({
  padding: theme.spacing(1.5, 2),
  '& .MuiListItemIcon-root': {
    minWidth: 36,
    color: theme.palette.text.secondary,
  },
  ...(selected && {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    }
  }),
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 38,
  height: 38,
  cursor: 'pointer',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.secondary.main} 100%)`,
  fontSize: '0.875rem',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
  '&:hover': {
    transform: 'scale(1.08)',
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontSize: '0.7rem',
    height: 16,
    minWidth: 16,
    padding: '0 4px',
  }
}));

const Header = ({ onDrawerToggle, drawerWidth }) => {
  const { 
    user, logout, activeOrganization, memberships, switchOrganization, isLoading: authLoading 
  } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElOrg, setAnchorElOrg] = useState(null);
  const [isSwitchingOrg, setIsSwitchingOrg] = useState(false);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleOpenOrgMenu = (event) => {
    if (memberships && memberships.length > 0) {
      setAnchorElOrg(event.currentTarget);
    }
  };
  const handleCloseOrgMenu = () => setAnchorElOrg(null);

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  const handleNavigateToSettings = () => {
    handleCloseUserMenu();
    navigate('/settings');
  };
  
  const handleNavigateToOrgManagement = () => {
    handleCloseOrgMenu();
    navigate('/settings/organization'); 
  };

  const handleSwitchOrg = async (organizationId) => {
    handleCloseOrgMenu();
    if (activeOrganization?.id === organizationId || isSwitchingOrg) return;

    setIsSwitchingOrg(true);
    try {
      const result = await switchOrganization(organizationId);
      if (result.success) {
        window.location.reload(); 
      } else {
        console.error("Failed to switch organization:", result.message);
      }
    } catch (error) {
      console.error("Exception during switch organization:", error);
    } finally {
      setIsSwitchingOrg(false);
    }
  };
  
  const getUserInitials = (name) => {
    if (!name) return '?';
    const nameParts = name.split(' ');
    return (nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}` 
      : name[0]
    ).toUpperCase();
  };

  const currentOrgRole = activeOrganization?.role || 
    (memberships?.find(m => m.organizationId === activeOrganization?.id)?.role);

  return (
    <StyledAppBar position="fixed" elevation={0}>
      <HeaderToolbar>
        <LogoSection>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <AppTitle variant="h6" noWrap onClick={() => navigate('/dashboard')}>
            Scaleup Horizon
            <span className="subtitle">Horizon</span>
          </AppTitle>
        </LogoSection>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (isSwitchingOrg || authLoading) && (
            <CircularProgress size={20} thickness={3} />
          )}
          
          {user && activeOrganization && !isSwitchingOrg && !authLoading && (
            <Fade in timeout={300}>
              <OrganizationButton
                aria-controls={anchorElOrg ? 'organization-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorElOrg)}
                onClick={handleOpenOrgMenu}
                startIcon={<BusinessIcon fontSize="small" />}
                endIcon={<ExpandMoreIcon fontSize="small" />}
              >
                <Typography 
                  variant="body2" 
                  noWrap
                  sx={{ 
                    fontWeight: 500,
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {activeOrganization.name}
                </Typography>
              </OrganizationButton>
            </Fade>
          )}
          
          {user && !activeOrganization && !isSwitchingOrg && !authLoading && 
           memberships && memberships.length > 0 && (
            <Chip 
              label="Select Organization" 
              onClick={handleOpenOrgMenu} 
              icon={<BusinessIcon />} 
              color="warning"
              size="small"
              clickable
              sx={{ fontWeight: 500 }}
            />
          )}

          <StyledMenu
            id="organization-menu"
            anchorEl={anchorElOrg}
            open={Boolean(anchorElOrg)}
            onClose={handleCloseOrgMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1, opacity: 0.7 }}>
              <Typography variant="caption" fontWeight={600}>
                SWITCH ORGANIZATION
              </Typography>
            </Box>
            
            {memberships?.map((membership) => (
              <StyledMenuItem
                key={membership.organizationId}
                selected={activeOrganization?.id === membership.organizationId}
                onClick={() => handleSwitchOrg(membership.organizationId)}
                disabled={isSwitchingOrg}
              >
                <ListItemIcon>
                  <BusinessIcon fontSize="small" />
                </ListItemIcon>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {membership.organizationName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {membership.role}
                  </Typography>
                </Box>
                {activeOrganization?.id === membership.organizationId && (
                  <CheckCircleIcon color="primary" fontSize="small" />
                )}
              </StyledMenuItem>
            ))}
            
            {currentOrgRole === 'owner' && (
              <>
                <Divider sx={{ my: 1 }} />
                <StyledMenuItem onClick={handleNavigateToOrgManagement}>
                  <ListItemIcon>
                    <SupervisorAccountOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  Manage Organization
                </StyledMenuItem>
              </>
            )}
          </StyledMenu>

          {user && (
            <Tooltip title="Account menu" arrow>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
                <UserAvatar>
                  {getUserInitials(user.name)}
                </UserAvatar>
              </IconButton>
            </Tooltip>
          )}
          
          <StyledMenu
            id="menu-appbar-user"
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <ProfileHeader>
              <UserAvatar sx={{ width: 48, height: 48 }}>
                {getUserInitials(user?.name)}
              </UserAvatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </ProfileHeader>
            
            <Box sx={{ py: 0.5 }}>
              <StyledMenuItem onClick={handleNavigateToSettings}>
                <ListItemIcon>
                  <SettingsOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Account Settings
              </StyledMenuItem>
              
              {currentOrgRole === 'owner' && (
                <StyledMenuItem 
                  onClick={() => { 
                    navigate('/settings/organization/invite'); 
                    handleCloseUserMenu(); 
                  }}
                >
                  <ListItemIcon>
                    <GroupAddOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  Invite Members
                </StyledMenuItem>
              )}
            </Box>
            
            <Divider />
            
            <Box sx={{ py: 0.5 }}>
              <StyledMenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error">Logout</Typography>
              </StyledMenuItem>
            </Box>
          </StyledMenu>
        </Box>
      </HeaderToolbar>
    </StyledAppBar>
  );
};

export default Header;