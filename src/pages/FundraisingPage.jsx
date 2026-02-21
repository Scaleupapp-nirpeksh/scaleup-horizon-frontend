// src/pages/FundraisingPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Tabs, Tab, alpha, useTheme,
  Card, Grid, Stack, Fade, Grow, Avatar, LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GroupWorkIcon from '@mui/icons-material/GroupWork'; 
import PeopleIcon from '@mui/icons-material/People'; 
import PieChartOutlineIcon from '@mui/icons-material/PieChartOutline'; 
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import HandshakeIcon from '@mui/icons-material/Handshake';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Import the actual section components
import RoundsSection from '../components/fundraising/RoundsSection'; 
import InvestorsSection from '../components/fundraising/InvestorsSection';
import CapTableSection from '../components/fundraising/CapTableSection';
import EsopSection from '../components/fundraising/EsopSection';

// Import APIs to fetch real data for metrics
import { getRounds, getInvestors, getCapTableSummary, getEsopGrants } from '../services/api';

// Enhanced styled components
const StyledTabsContainer = styled(Box)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  padding: theme.spacing(2, 3),
  minHeight: 64,
  color: theme.palette.text.secondary,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '3px',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '3px 3px 0 0',
    }
  },
  '& .MuiTab-iconWrapper': {
    marginBottom: '6px',
  }
}));

const HeroCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.primary.main, 0.2),
  }
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fundraising-tabpanel-${index}`}
      aria-labelledby={`fundraising-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in timeout={400}>
          <Box sx={{ pt: 4 }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

const FundraisingPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState({
    totalRaised: 0,
    activeInvestors: 0,
    currentValuation: 0,
    totalOptionsVested: 0,
    loading: true
  });

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch real metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [roundsRes, investorsRes, , esopRes] = await Promise.all([
          getRounds(),
          getInvestors(),
          getCapTableSummary(),
          getEsopGrants()
        ]);
        
        const rounds = roundsRes.data || [];
        const investors = investorsRes.data || [];
        const esopGrants = esopRes.data || [];
        
        // Calculate real metrics
        const totalRaised = rounds.reduce((sum, round) => sum + (round.totalFundsReceived || 0), 0);
        const activeInvestors = investors.filter(inv => inv.status === 'Invested').length;
        const currentValuation = rounds.length > 0 
          ? Math.max(...rounds.map(r => r.currentValuationPreMoney || 0))
          : 0;
        const totalOptionsVested = esopGrants.reduce((sum, grant) => sum + (grant.totalOptionsVested || 0), 0);
        
        setMetrics({
          totalRaised,
          activeInvestors,
          currentValuation,
          totalOptionsVested,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchMetrics();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === 0) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const tabConfig = [
    { label: 'Funding Rounds', icon: <GroupWorkIcon sx={{ fontSize: 24 }} />, color: '#667eea' },
    { label: 'Investors', icon: <PeopleIcon sx={{ fontSize: 24 }} />, color: '#764ba2' },
    { label: 'Cap Table', icon: <PieChartOutlineIcon sx={{ fontSize: 24 }} />, color: '#f093fb' },
    { label: 'ESOP Grants', icon: <CardMembershipIcon sx={{ fontSize: 24 }} />, color: '#f5576c' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      {/* Enhanced Hero Section */}
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: 6,
        pb: 8,
        mb: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 50%, transparent 100%)`,
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -200,
          right: -200,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          zIndex: 0,
        }
      }}>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grow in timeout={500}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                }}>
                  <RocketLaunchIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}>
                    Fundraising Hub
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                    Manage your funding journey from seed to scale
                  </Typography>
                </Box>
              </Stack>

              {/* Quick Stats Cards */}
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Grow in timeout={700}>
                    <HeroCard>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1), 
                          color: 'primary.main',
                          width: 48,
                          height: 48
                        }}>
                          <AccountBalanceIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Total Raised
                          </Typography>
                          {metrics.loading ? (
                            <LinearProgress sx={{ width: 80, mt: 1 }} />
                          ) : (
                            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.dark }}>
                              {formatCurrency(metrics.totalRaised)}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </HeroCard>
                  </Grow>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Grow in timeout={900}>
                    <HeroCard>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                          color: 'secondary.main',
                          width: 48,
                          height: 48
                        }}>
                          <HandshakeIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Active Investors
                          </Typography>
                          {metrics.loading ? (
                            <LinearProgress sx={{ width: 80, mt: 1 }} />
                          ) : (
                            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.secondary.dark }}>
                              {metrics.activeInvestors}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </HeroCard>
                  </Grow>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Grow in timeout={1100}>
                    <HeroCard>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          bgcolor: alpha(theme.palette.success.main, 0.1), 
                          color: 'success.main',
                          width: 48,
                          height: 48
                        }}>
                          <TrendingUpIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Current Valuation
                          </Typography>
                          {metrics.loading ? (
                            <LinearProgress sx={{ width: 80, mt: 1 }} />
                          ) : (
                            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.dark }}>
                              {formatCurrency(metrics.currentValuation)}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </HeroCard>
                  </Grow>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Grow in timeout={1300}>
                    <HeroCard>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          bgcolor: alpha(theme.palette.info.main, 0.1), 
                          color: 'info.main',
                          width: 48,
                          height: 48
                        }}>
                          <EmojiEventsIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Options Vested
                          </Typography>
                          {metrics.loading ? (
                            <LinearProgress sx={{ width: 80, mt: 1 }} />
                          ) : (
                            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.dark }}>
                              {metrics.totalOptionsVested.toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </HeroCard>
                  </Grow>
                </Grid>
              </Grid>
            </Box>
          </Grow>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Fade in timeout={800}>
          <StyledTabsContainer>
            <Tabs
              value={activeTab}
              onChange={handleChangeTab}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Fundraising sections"
              sx={{ 
                minHeight: 64,
                px: 2,
                "& .MuiTabs-indicator": {
                  display: 'none',
                },
                "& .MuiTabs-flexContainer": {
                  gap: 1,
                }
              }}
            >
              {tabConfig.map((tab, index) => (
                <StyledTab 
                  key={index}
                  label={tab.label} 
                  icon={React.cloneElement(tab.icon, { 
                    sx: { 
                      fontSize: 24,
                      color: activeTab === index ? tab.color : 'inherit',
                      transition: 'all 0.3s ease'
                    } 
                  })} 
                  iconPosition="top" 
                />
              ))}
            </Tabs>

            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 4 }}>
              <TabPanel value={activeTab} index={0}>
                <RoundsSection />
              </TabPanel>
              <TabPanel value={activeTab} index={1}>
                <InvestorsSection />
              </TabPanel>
              <TabPanel value={activeTab} index={2}>
                <CapTableSection />
              </TabPanel>
              <TabPanel value={activeTab} index={3}>
                <EsopSection />
              </TabPanel>
            </Box>
          </StyledTabsContainer>
        </Fade>
      </Container>
    </Box>
  );
};

export default FundraisingPage;