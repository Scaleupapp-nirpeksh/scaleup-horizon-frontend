// src/components/tasks/TaskAnalytics.jsx
import React from 'react';
import {
  Box, Grid, Paper, Typography, Stack, useTheme, alpha,
  Avatar, Chip, LinearProgress, Card, CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';

// Styled Components
const AnalyticsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
  }
}));

const MetricCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
  borderRadius: theme.spacing(2),
  '& .metric-value': {
    color: theme.palette[color].dark,
  }
}));

const COLORS = {
  priority: {
    critical: '#f44336',
    high: '#ff9800',
    medium: '#2196f3',
    low: '#4caf50'
  },
  status: {
    todo: '#9e9e9e',
    in_progress: '#2196f3',
    in_review: '#9c27b0',
    blocked: '#f44336',
    completed: '#4caf50',
    cancelled: '#757575'
  },
  chart: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']
};

const TaskAnalytics = ({ stats, tasks }) => {
  const theme = useTheme();

  // Calculate additional metrics
  const completionRate = stats?.totalTasks > 0
    ? ((stats?.statusDistribution?.find(s => s._id === 'completed')?.count || 0) / stats.totalTasks) * 100
    : 0;

  const avgTasksPerPerson = stats?.tasksByAssignee?.length > 0
    ? stats.totalTasks / stats.tasksByAssignee.length
    : 0;

  // Prepare chart data
  const priorityData = stats?.priorityDistribution?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    fill: COLORS.priority[item._id]
  })) || [];

  const statusData = stats?.statusDistribution?.map(item => ({
    name: item._id.replace('_', ' ').charAt(0).toUpperCase() + item._id.replace('_', ' ').slice(1),
    value: item.count,
    fill: COLORS.status[item._id]
  })) || [];

  const categoryData = stats?.categoryDistribution?.slice(0, 6).map((item, index) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    fill: COLORS.chart[index % COLORS.chart.length]
  })) || [];

  const teamPerformanceData = stats?.tasksByAssignee?.slice(0, 5).map(member => ({
    name: member.name.split(' ')[0],
    completed: tasks?.filter(t => t.assignee?._id === member._id && t.status === 'completed').length || 0,
    inProgress: tasks?.filter(t => t.assignee?._id === member._id && t.status === 'in_progress').length || 0,
    todo: tasks?.filter(t => t.assignee?._id === member._id && t.status === 'todo').length || 0,
  })) || [];

  // Task velocity data (mock - in real app, calculate from task completion dates)
  const velocityData = [
    { week: 'Week 1', completed: 12, created: 15 },
    { week: 'Week 2', completed: 18, created: 20 },
    { week: 'Week 3', completed: 22, created: 19 },
    { week: 'Week 4', completed: 25, created: 23 },
  ];

  return (
    <Box>
      {/* Summary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard color="primary">
            <CardContent>
              <Stack spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700 }}>
                    {completionRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard color="secondary">
            <CardContent>
              <Stack spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700 }}>
                    {avgTasksPerPerson.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Tasks/Person
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard color="success">
            <CardContent>
              <Stack spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700 }}>
                    87%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    On-Time Delivery
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard color="warning">
            <CardContent>
              <Stack spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700 }}>
                    3.5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Days to Complete
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Priority Distribution */}
        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsCard>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Priority Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {priorityData.map((item) => (
                <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.fill }} />
                    <Typography variant="body2">{item.name}</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </AnalyticsCard>
        </Grid>

        {/* Status Overview */}
        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsCard>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Status Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </AnalyticsCard>
        </Grid>

        {/* Task Velocity */}
        <Grid item xs={12} lg={4}>
          <AnalyticsCard>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Task Velocity
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke={theme.palette.success.main} 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </AnalyticsCard>
        </Grid>

        {/* Team Performance */}
        <Grid item xs={12} lg={8}>
          <AnalyticsCard>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Team Performance
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill={COLORS.status.completed} />
                  <Bar dataKey="inProgress" stackId="a" fill={COLORS.status.in_progress} />
                  <Bar dataKey="todo" stackId="a" fill={COLORS.status.todo} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </AnalyticsCard>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <AnalyticsCard>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Tasks by Category
            </Typography>
            <Stack spacing={2}>
              {categoryData.map((item, index) => (
                <Box key={item.name}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">{item.name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.value / stats?.totalTasks) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha(COLORS.chart[index], 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: COLORS.chart[index],
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </AnalyticsCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskAnalytics;