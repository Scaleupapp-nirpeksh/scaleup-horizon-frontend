// src/components/dashboard/HeadcountSummary.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Grid, Avatar,
  Divider, Chip, CircularProgress, Skeleton, useTheme, alpha,
  Tooltip, IconButton, Badge, LinearProgress, Paper, Grow // Added Grow for animations
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Icons
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
// HourglassTopIcon, PersonOffIcon, EventAvailableIcon, GroupAddIcon - not directly used in final render, but keep if plans exist
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';


// API
import { getHeadcountSummary } from '../../services/api';

// Animations (existing ones are good)
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

// const float = keyframes` // Not used in current render, can be kept for future
//   0%, 100% { transform: translateY(0px); }
//   50% { transform: translateY(-10px); }
// `;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ripple = keyframes`
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
`;

// Styled Components (existing ones are well-defined)
const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
    : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 0.92)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 10px 30px -10px ${alpha(theme.palette.common.black, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 20px 40px -15px ${alpha(theme.palette.common.black, 0.15)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg,
      ${theme.palette.primary.main},
      ${theme.palette.secondary.main},
      ${theme.palette.primary.main})`,
    backgroundSize: '200% 100%',
    animation: `${gradientShift} 10s ease infinite`,
  }
}));

const MetricCard = styled(Paper)(({ theme, color = 'primary' }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2.5),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
    : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette[color].main, 0.12)}`,
  boxShadow: `0 10px 40px -15px ${alpha(theme.palette[color].main, 0.25)}`,
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  overflow: 'hidden',
  height: '100%', // Ensure cards in a row have same height for consistent animation
  display: 'flex', // For aligning content if needed
  flexDirection: 'column', // For aligning content if needed
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px -10px ${alpha(theme.palette[color].main, 0.35)}`,
    '& .metric-icon': {
      transform: 'rotate(10deg) scale(1.2)',
      boxShadow: `0 10px 25px -5px ${alpha(theme.palette[color].main, 0.45)}`,
    },
    '& .metric-value': {
      transform: 'scale(1.05)',
      color: theme.palette[color].dark, // This already helps
    },
    '&::after': {
      opacity: 0.8,
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette[color].main, 0.03)})`,
    opacity: 0.2,
    transition: 'opacity 0.4s ease',
  }
}));

const MetricIcon = styled(Avatar)(({ theme, color = 'primary' }) => ({
  width: 52,
  height: 52,
  backgroundColor: alpha(theme.palette[color].main, 0.12),
  color: theme.palette[color].main,
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  fontSize: '1.5rem',
  boxShadow: `0 8px 16px -8px ${alpha(theme.palette[color].main, 0.25)}`,
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
  '&.metric-icon': { // Class already used
    '& .MuiSvgIcon-root': {
      fontSize: '1.8rem',
    }
  }
}));

const MetricValue = styled(Typography)(({ theme, color = 'primary' }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  lineHeight: 1.1,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
  transition: 'all 0.3s ease',
  letterSpacing: '-0.02em',
}));

const PulseDot = styled('span')(({ theme, color = 'success' }) => ({
  display: 'inline-block',
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette[color].main,
  position: 'relative',
  marginRight: theme.spacing(1),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: theme.palette[color].main,
    animation: `${ripple} 2s infinite ease-in-out`,
    zIndex: 0,
  }
}));

const LiveChip = styled(Chip)(({ theme }) => ({
  borderRadius: '20px',
  height: '28px',
  background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.15)} 0%, ${alpha(theme.palette.success.main, 0.25)} 100%)`,
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
  '& .MuiChip-label': {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: '0.75rem',
    letterSpacing: '0.03em',
    color: theme.palette.success.dark,
    padding: '0 8px',
  }
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.4)
    : alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
  boxShadow: `0 10px 40px -15px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 15px 50px -12px ${alpha(theme.palette.common.black, 0.15)}`,
  }
}));

// DepartmentChip - defined but not used in this component's render. Keeping for completeness.
// const DepartmentChip = styled(Chip)(({ theme, bgcolor, textcolor }) => ({...}));

const StyledTooltip = styled(({ className, ...props }) => ( // This is the RechartsTooltip wrapper
  <RechartsTooltip {...props} wrapperStyle={{ zIndex: 1100 }} /> // Ensure tooltip is above other elements
))(({ theme }) => ({
  // This class targets the recharts-tooltip-wrapper
  // Individual content styling is best done in the `content` prop of RechartsTooltip
}));


// Enhanced Animated Number Component (already very good)
const AnimatedNumber = ({ value, duration = 1500, prefix = '', suffix = '', decimals = 0, format = true, className }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    // Ensure startValue reflects previous displayValue for smoother updates if value changes rapidly
    // For this component, it always animates from 0 on value change, which is fine.
    const startValue = 0; // If you want it to animate from previous value, you'd store and use that.
    const endValue = parseFloat(value) || 0;

    let animationFrameId;
    const updateNumber = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      }
    };
    updateNumber();
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formattedValue = format
    ? displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })
    : displayValue.toFixed(decimals);

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

// Enhanced CustomTooltip component for the Pie chart
const EnhancedCustomTooltip = ({ active, payload, theme }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Full data object for the slice
    const departmentName = payload[0].name;
    const departmentValue = payload[0].value;
    const departmentPercent = payload[0].percent;

    return (
      <Paper
        elevation={6} // Slightly more pronounced shadow for a "magical" lift
        sx={{
          p: 2,
          borderRadius: theme.spacing(1.5),
          borderLeft: `5px solid ${data.color || theme.palette.primary.main}`,
          backgroundColor: alpha(theme.palette.background.default, 0.85), // Use default for better contrast in light/dark
          backdropFilter: 'blur(12px)', // Enhanced blur
          boxShadow: theme.shadows[12], // Deeper shadow
          minWidth: '180px', // Ensure enough space
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: data.color || theme.palette.text.primary, mb: 1 }}>
          {departmentName}
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            <strong>Count:</strong> {departmentValue.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Percentage:</strong> {`${(departmentPercent * 100).toFixed(1)}%`}
          </Typography>
        </Stack>
      </Paper>
    );
  }
  return null;
};


// Department colors (existing are good)
const departmentColors = {
  Engineering: '#4f46e5', Product: '#0ea5e9', Design: '#06b6d4', Marketing: '#f59e0b',
  Sales: '#22c55e', 'Customer Success': '#84cc16', Finance: '#10b981', HR: '#f97316',
  Operations: '#8b5cf6', Executive: '#6366f1', Other: '#94a3b8',
};

// HeadcountSummary Component
const HeadcountSummary = () => {
  const theme = useTheme();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animateIn, setAnimateIn] = useState(false);

  const fetchSummaryData = useCallback(async () => {
    setLoading(true);
    setAnimateIn(false); // Reset animation trigger
    try {
      const summaryRes = await getHeadcountSummary();
      // console.log("Headcount summary response:", summaryRes); // Keep for debugging if needed
      if (summaryRes.data?.success) {
        setSummary(summaryRes.data.data);
      } else {
        setError(summaryRes.data?.msg || 'Failed to load headcount summary.');
      }
    } catch (err) {
      console.error("Error fetching headcount summary:", err);
      setError(`Failed to load headcount data: ${err.response?.data?.msg || err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  useEffect(() => {
    if (!loading && summary) {
      const timer = setTimeout(() => setAnimateIn(true), 50); // Slight delay for smooth render then animate
      return () => clearTimeout(timer);
    }
  }, [loading, summary]);


  const departmentData = React.useMemo(() => {
    if (!summary?.departmentBreakdown || !Array.isArray(summary.departmentBreakdown)) {
      return [];
    }
    return summary.departmentBreakdown.map((dept, index) => {
      const deptName = typeof dept === 'object' ? (dept._id || `Dept ${index+1}`) : dept;
      const count = typeof dept === 'object' ? (dept.count || 0) : 0; // Default to 0 if not a number
      return {
        name: deptName,
        value: count,
        color: departmentColors[deptName] || Object.values(departmentColors)[index % Object.values(departmentColors).length]
      };
    });
  }, [summary]);

  const totalFromDepts = React.useMemo(() => {
    return departmentData.reduce((sum, dept) => sum + dept.value, 0);
  }, [departmentData]);

  if (loading) {
    return (
      <StatsCard elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={24} thickness={4} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Loading Headcount Data
              </Typography>
            </Stack>
          </Stack>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton
                  variant="rounded"
                  height={140}
                  sx={{
                    borderRadius: 3,
                    animation: `${shimmer} 2s infinite linear`,
                    backgroundImage: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.2)} 20%, ${alpha(theme.palette.background.paper, 0.1)} 40%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
                    backgroundSize: '1000px 100%',
                  }}
                />
              </Grid>
            ))}
          </Grid>
          <Skeleton
            variant="rounded"
            height={220}
            sx={{
              mt: 3, borderRadius: 3,
              animation: `${shimmer} 2s infinite linear`,
              backgroundImage: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.2)} 20%, ${alpha(theme.palette.background.paper, 0.1)} 40%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
              backgroundSize: '1000px 100%',
            }}
          />
        </CardContent>
      </StatsCard>
    );
  }

  if (error) {
    return (
      <StatsCard elevation={0}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
              <InfoIcon />
            </Avatar>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
              Unable to Load Headcount Data
            </Typography>
          </Stack>
          <Typography color="error.main" variant="body2" sx={{ ml: 7 }}>
            {error}
          </Typography>
        </CardContent>
      </StatsCard>
    );
  }

  const activeHeadcount = typeof summary?.totalHeadcount === 'object' ?
    summary?.totalHeadcount?.count || 0 :
    summary?.totalHeadcount || 0;
  const openPositions = typeof summary?.openPositions === 'object' ?
    summary?.openPositions?.count || 0 :
    summary?.openPositions || 0;
  const annualCost = typeof summary?.annualCost === 'object' ?
    summary?.annualCost?.totalAnnualCost || 0 :
    summary?.annualCost || 0;

  const metricCardsData = [
    {
      title: "ACTIVE EMPLOYEES",
      value: activeHeadcount,
      icon: <PersonIcon />,
      color: "primary",
      decimals: 0,
      footer: <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>{departmentData.length} Departments</Typography>,
      trendIcon: <TrendingUpIcon sx={{ color: 'success.main', fontSize: '0.875rem', marginRight: 0.5 }} />
    },
    {
      title: "OPEN POSITIONS",
      value: openPositions,
      icon: <WorkOutlineIcon />,
      color: "warning",
      decimals: 0,
      footer: openPositions > 0 && (activeHeadcount + openPositions > 0) ?
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {((openPositions / (activeHeadcount + openPositions)) * 100).toFixed(1)}% of total potential
        </Typography> : <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>&nbsp;</Typography>, // Placeholder for alignment
    },
    {
      title: "ANNUAL COST",
      value: annualCost / 100000, // Value in Lakhs
      icon: <AttachMoneyIcon />,
      color: "success",
      decimals: 1,
      prefix: "₹",
      suffix: "L",
      footer: activeHeadcount > 0 ?
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          ₹{(annualCost / activeHeadcount / 100000).toFixed(1)}L per employee
        </Typography> : <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>&nbsp;</Typography>,
    },
    {
      title: "AVERAGE SALARY",
      value: activeHeadcount > 0 ? annualCost / activeHeadcount / 100000 : 0, // Value in Lakhs
      icon: <BoltIcon />,
      color: "info",
      decimals: 1,
      prefix: "₹",
      suffix: "L",
      footer: <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Annual per employee</Typography>,
    },
  ];


  return (
    <StatsCard elevation={0}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}> {/* Responsive padding */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }} // Responsive direction
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 3.5 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: { xs: 2, sm: 0 } }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main,
                width: 42, height: 42,
                boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              <PeopleOutlineIcon fontSize="medium" />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Team Composition
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>
                Real-time workforce overview
              </Typography>
            </Box>
          </Stack>
          <LiveChip
            icon={<PulseDot color="success" />}
            label="LIVE DATA"
            variant="outlined"
          />
        </Stack>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {metricCardsData.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={metric.title}>
              <Grow in={animateIn} style={{ transformOrigin: '0 0 0' }} timeout={500 + index * 150}>
                <MetricCard color={metric.color} elevation={0}>
                  <Stack spacing={1} flexGrow={1} justifyContent="space-between"> {/* Ensure content fills card */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start"> {/* Align icon to top right */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase',
                          letterSpacing: '0.03em', fontSize: '0.7rem'
                        }}
                      >
                        {metric.title}
                      </Typography>
                      <MetricIcon className="metric-icon" color={metric.color}>
                        {metric.icon}
                      </MetricIcon>
                    </Stack>
                    <MetricValue className="metric-value" color={metric.color}>
                      <AnimatedNumber
                        value={metric.value}
                        decimals={metric.decimals}
                        prefix={metric.prefix}
                        suffix={metric.suffix && <small style={{ fontSize: '0.6em', verticalAlign: 'text-top' }}>{metric.suffix}</small>}
                      />
                    </MetricValue>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minHeight: '1.2em' }}> {/* Ensure consistent height for footer */}
                       {metric.trendIcon} {metric.footer}
                    </Stack>
                  </Stack>
                </MetricCard>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {departmentData.length > 0 && (
          <ChartContainer>
            <Stack
              direction="row" justifyContent="space-between" alignItems="center"
              sx={{ mb: 2.5 }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700, display: 'flex', alignItems: 'center',
                  color: theme.palette.text.primary,
                }}
              >
                <BusinessIcon sx={{ mr: 1, fontSize: '1.3rem', color: theme.palette.primary.main }} />
                Department Distribution
              </Typography>
              <Chip
                label={`${departmentData.length} Departments`}
                size="small"
                sx={{
                  fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              />
            </Stack>

            <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center"> {/* Increased spacing on md+ */}
              <Grid item xs={12} md={5} lg={4}>
                <Box sx={{ height: { xs: 220, sm: 250 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> {/* Responsive height */}
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%" cy="50%"
                        innerRadius={theme.breakpoints.down('sm') ? 50 : 65} // Responsive radius
                        outerRadius={theme.breakpoints.down('sm') ? 75 : 90} // Responsive radius
                        paddingAngle={3}
                        dataKey="value"
                        label={false} // Removed direct labels for cleaner look
                        labelLine={false}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={alpha(theme.palette.background.paper, 0.5)} // Subtle stroke
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      {/* Use the RechartsTooltip wrapper, passing our custom content component */}
                      <RechartsTooltip content={<EnhancedCustomTooltip theme={theme} />} cursor={{ fill: alpha(theme.palette.text.primary, 0.1) }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>

              <Grid item xs={12} md={7} lg={8}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="subtitle2" color="text.secondary"
                    sx={{ mb: 2, fontWeight: 500, display: 'flex', alignItems: 'center' }}
                  >
                    <ArrowRightAltIcon sx={{ mr: 0.5, color: theme.palette.primary.light }} />
                    Headcount by Department
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, flex: 1, overflow: 'auto', pr: 1, maxHeight: { xs: 200, sm: 'none' } }}> {/* Max height on small screens for scroll */}
                    {departmentData
                      .sort((a, b) => b.value - a.value)
                      .map((dept) => (
                        <Stack
                          key={dept.name}
                          spacing={0.5}
                          sx={{
                            padding: theme.spacing(0.5, 1),
                            borderRadius: theme.shape.borderRadius,
                            transition: 'background-color 0.3s ease, transform 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(dept.color, 0.08),
                              // transform: 'translateX(3px)', // Optional subtle movement
                            }
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1.25} alignItems="center"> {/* Increased spacing */}
                              <Box
                                sx={{
                                  width: 12, height: 12, borderRadius: '3px', bgcolor: dept.color,
                                  boxShadow: `0 2px 6px ${alpha(dept.color, 0.6)}` // Enhanced shadow
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                {dept.name}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: dept.color }}>
                              {dept.value.toLocaleString()}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={totalFromDepts > 0 ? (dept.value / totalFromDepts) * 100 : 0} // Safe division
                            sx={{
                              height: 7, // Slightly thicker
                              borderRadius: 3,
                              bgcolor: alpha(dept.color, 0.15),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: dept.color,
                                borderRadius: 3,
                              }
                            }}
                          />
                        </Stack>
                      ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </ChartContainer>
        )}
      </CardContent>
    </StatsCard>
  );
};

export default HeadcountSummary;