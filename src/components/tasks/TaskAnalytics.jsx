// src/components/tasks/TaskAnalytics.jsx
import React from 'react';
import {
  Box, Grid, Paper, Typography, Stack, useTheme, alpha,
  Avatar, Chip, LinearProgress, Card, CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line
} from 'recharts';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PercentIcon from '@mui/icons-material/Percent';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

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
    transform: 'translateY(-2px)',
  }
}));

const MetricCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
  borderRadius: theme.spacing(2),
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.15)}`,
  },
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
  chart: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16', '#f97316']
};

const TaskAnalytics = ({ stats, tasks = [] }) => {
  const theme = useTheme();

  // Ensure we have valid data
  if (!stats && (!tasks || tasks.length === 0)) {
    return (
      <AnalyticsCard>
        <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" textAlign="center">
            No task data available
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Create some tasks to see analytics and insights
          </Typography>
        </Stack>
      </AnalyticsCard>
    );
  }

  // Calculate metrics from backend stats or derive from tasks
  const totalTasks = stats?.totalTasks || tasks.length;
  const completedCount = stats?.statusDistribution?.find(s => s._id === 'completed')?.count || 
                        tasks.filter(t => t.status === 'completed').length;
  const overdueCount = stats?.overdueCount || 
                      tasks.filter(task => 
                        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
                      ).length;
  
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  
  // Calculate average tasks per person
  const uniqueAssignees = new Set();
  tasks.forEach(task => {
    if (task.assignee) {
      uniqueAssignees.add(task.assignee._id || task.assignee);
    }
  });
  const avgTasksPerPerson = uniqueAssignees.size > 0 ? totalTasks / uniqueAssignees.size : 0;

  // Prepare chart data from backend stats or calculate from tasks
  const priorityData = stats?.priorityDistribution?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    fill: COLORS.priority[item._id] || COLORS.chart[0]
  })) || (() => {
    const priorities = {};
    tasks.forEach(task => {
      const priority = task.priority || 'medium';
      priorities[priority] = (priorities[priority] || 0) + 1;
    });
    return Object.entries(priorities).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      fill: COLORS.priority[priority] || COLORS.chart[0]
    }));
  })();

  const statusData = stats?.statusDistribution?.map(item => ({
    name: item._id.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    value: item.count,
    fill: COLORS.status[item._id] || COLORS.chart[1]
  })) || (() => {
    const statuses = {};
    tasks.forEach(task => {
      const status = task.status || 'todo';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return Object.entries(statuses).map(([status, count]) => ({
      name: status.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      value: count,
      fill: COLORS.status[status] || COLORS.chart[1]
    }));
  })();

  const categoryData = stats?.categoryDistribution?.slice(0, 8).map((item, index) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
    fill: COLORS.chart[index % COLORS.chart.length]
  })) || (() => {
    const categories = {};
    tasks.forEach(task => {
      const category = task.category || 'other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).slice(0, 8).map(([category, count], index) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      fill: COLORS.chart[index % COLORS.chart.length]
    }));
  })();

  // Team performance data from backend or calculated
  const teamPerformanceData = stats?.tasksByAssignee?.slice(0, 8).map(member => ({
    name: (member.name || 'Unknown').split(' ')[0],
    completed: member.completed || 0,
    inProgress: member.inProgress || 0,
    todo: member.todo || 0,
    total: member.taskCount || member.completed + member.inProgress + member.todo
  })) || (() => {
    const memberStats = {};
    tasks.forEach(task => {
      if (task.assignee) {
        const memberId = task.assignee._id || task.assignee;
        const memberName = task.assignee.name || 'Unknown';
        
        if (!memberStats[memberId]) {
          memberStats[memberId] = {
            name: memberName.split(' ')[0],
            completed: 0,
            inProgress: 0,
            todo: 0,
            total: 0
          };
        }
        
        memberStats[memberId].total++;
        switch (task.status) {
          case 'completed':
            memberStats[memberId].completed++;
            break;
          case 'in_progress':
            memberStats[memberId].inProgress++;
            break;
          case 'todo':
            memberStats[memberId].todo++;
            break;
          default:
            break;
        }
      }
    });
    return Object.values(memberStats).slice(0, 8);
  })();

  // Mock velocity data (in real app, this would come from historical data)
  const velocityData = [
    { period: 'Week 1', completed: Math.floor(completedCount * 0.2), created: Math.floor(totalTasks * 0.25) },
    { period: 'Week 2', completed: Math.floor(completedCount * 0.3), created: Math.floor(totalTasks * 0.3) },
    { period: 'Week 3', completed: Math.floor(completedCount * 0.35), created: Math.floor(totalTasks * 0.25) },
    { period: 'Week 4', completed: Math.floor(completedCount * 0.15), created: Math.floor(totalTasks * 0.2) },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Enhanced Summary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard color="primary">
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                    <PercentIcon />
                  </Avatar>
                  <Chip 
                    label={completionRate >= 80 ? "Excellent" : completionRate >= 60 ? "Good" : "Needs Improvement"} 
                    size="small" 
                    color={completionRate >= 80 ? "success" : completionRate >= 60 ? "warning" : "error"}
                  />
                </Stack>
                <Box>
                  <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700 }}>
                    {completionRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {completedCount} of {totalTasks} tasks completed
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
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Chip 
                    label={`${uniqueAssignees.size} Members`} 
                    size="small" 
                    variant="outlined"
                  />
                </Stack>
                <Box>
                  <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700 }}>
                    {avgTasksPerPerson.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Tasks/Person
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Across {uniqueAssignees.size} team members
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
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Chip 
                    label="This Month" 
                    size="small" 
                    color="success"
                    variant="outlined"
                  />
                </Stack>
                <Box>
                  <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700 }}>
                    {((completedCount / Math.max(totalTasks, 1)) * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Productivity Score
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Based on completion rate
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard color="error">
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Chip 
                    label={overdueCount > 0 ? "Action Required" : "On Track"} 
                    size="small" 
                    color={overdueCount > 0 ? "error" : "success"}
                  />
                </Stack>
                <Box>
                  <Typography variant="h4" className="metric-value" sx={{ fontWeight: 700 }}>
                    {overdueCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Tasks
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {((overdueCount / Math.max(totalTasks, 1)) * 100).toFixed(1)}% of total tasks
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
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  <PriorityHighIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Priority Distribution
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Task priority breakdown
                  </Typography>
                </Box>
              </Stack>
              
              {priorityData.length > 0 ? (
                <>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Stack spacing={1}>
                    {priorityData.map((item) => (
                      <Stack key={item.name} direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.fill }} />
                          <Typography variant="body2">{item.name}</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.value} ({((item.value / totalTasks) * 100).toFixed(1)}%)
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    No priority data available
                  </Typography>
                </Stack>
              )}
            </Stack>
          </AnalyticsCard>
        </Grid>

        {/* Status Overview */}
        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsCard>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Status Overview
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current task statuses
                  </Typography>
                </Box>
              </Stack>

              {statusData.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={80} fontSize={12} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    No status data available
                  </Typography>
                </Stack>
              )}
            </Stack>
          </AnalyticsCard>
        </Grid>

        {/* Task Velocity */}
        <Grid item xs={12} lg={4}>
          <AnalyticsCard>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                  <TimelineIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Task Velocity
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tasks created vs completed
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" fontSize={12} />
                    <YAxis fontSize={12} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="created" 
                      stroke={theme.palette.primary.main} 
                      strokeWidth={3}
                      dot={{ r: 5, fill: theme.palette.primary.main }}
                      name="Created"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke={theme.palette.success.main} 
                      strokeWidth={3}
                      dot={{ r: 5, fill: theme.palette.success.main }}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </AnalyticsCard>
        </Grid>

        {/* Team Performance */}
        <Grid item xs={12} lg={8}>
          <AnalyticsCard>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Team Performance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Task distribution by team member
                  </Typography>
                </Box>
              </Stack>

              {teamPerformanceData.length > 0 ? (
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="completed" stackId="a" fill={COLORS.status.completed} name="Completed" />
                      <Bar dataKey="inProgress" stackId="a" fill={COLORS.status.in_progress} name="In Progress" />
                      <Bar dataKey="todo" stackId="a" fill={COLORS.status.todo} name="To Do" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    No team performance data available
                  </Typography>
                </Stack>
              )}
            </Stack>
          </AnalyticsCard>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <AnalyticsCard>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Category Breakdown
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tasks by category
                  </Typography>
                </Box>
              </Stack>

              {categoryData.length > 0 ? (
                <Stack spacing={2}>
                  {categoryData.map((item, index) => (
                    <Box key={item.name}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.value} ({((item.value / totalTasks) * 100).toFixed(1)}%)
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={(item.value / totalTasks) * 100}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha(item.fill, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: item.fill,
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                </Stack>
              )}
            </Stack>
          </AnalyticsCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskAnalytics;