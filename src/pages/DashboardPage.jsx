// src/pages/DashboardPage.jsx
// Basic Dashboard Page using MUI.
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingDownIcon from '@mui/icons-material/TrendingDown'; // For Burn Rate
import HourglassTopIcon from '@mui/icons-material/HourglassTop'; // For Runway
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // For Users
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart'; // For DAU/MAU Ratio
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [overviewData, setOverviewData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const overviewRes = await api.get('/financials/overview');
        setOverviewData(overviewRes.data);

        const kpiRes = await api.get('/kpis/snapshots?limit=1'); // Fetch latest snapshot for KPIs
        if (kpiRes.data.snapshots && kpiRes.data.snapshots.length > 0) {
          setKpiData(kpiRes.data.snapshots[0]);
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, unit = '', color = 'primary.main' }) => (
    <Paper elevation={3} sx={{ p: 2.5, display: 'flex', alignItems: 'center', height: '100%' }}>
      <Box sx={{ backgroundColor: color, borderRadius: '50%', p: 1.5, mr: 2, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {React.cloneElement(icon, { sx: { color: 'white', fontSize: '2rem' } })}
      </Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {value !== null && value !== undefined ? `${unit}${typeof value === 'number' ? value.toLocaleString() : value}` : 'N/A'}
        </Typography>
      </Box>
    </Paper>
  );


  if (loading) {
    return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)'}}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{m:2}}>{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Welcome back, {user?.name}!
      </Typography>
      
      <Grid container spacing={3}>
        {overviewData && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Bank Balance" value={overviewData.currentTotalBankBalance} unit="₹" icon={<AccountBalanceIcon />} color="success.main" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Avg. Monthly Burn" value={parseFloat(overviewData.averageMonthlyBurnRate)} unit="₹" icon={<TrendingDownIcon />} color="error.main"/>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Est. Runway" value={overviewData.estimatedRunwayMonths} unit="" icon={<HourglassTopIcon />} color="warning.main" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Funds Raised" value={overviewData.totalFundsReceivedFromRounds} unit="₹" icon={<TrendingUpIcon />} color="info.main"/>
            </Grid>
          </>
        )}
        {kpiData && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Users" value={kpiData.totalRegisteredUsers} icon={<PeopleAltIcon />} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Daily Active Users (DAU)" value={kpiData.dau} icon={<PeopleAltIcon color="action"/>} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Monthly Active Users (MAU)" value={kpiData.mau} icon={<PeopleAltIcon color="secondary"/>} />
            </Grid>
             <Grid item xs={12} sm={6} md={3}>
              <StatCard title="DAU/MAU Ratio" value={kpiData.mau ? ((kpiData.dau / kpiData.mau) * 100).toFixed(1) + '%' : 'N/A'} icon={<BarChartIcon />} />
            </Grid>
          </>
        )}
      </Grid>

      {/* Placeholder for more dashboard content */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Recent Activities & Alerts</Typography>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography color="text.secondary">
            Upcoming transactions, recent anomalies, and important notifications will appear here.
            (Further implementation needed)
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
export default DashboardPage;