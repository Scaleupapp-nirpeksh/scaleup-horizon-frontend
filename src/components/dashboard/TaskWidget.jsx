// src/components/dashboard/TaskWidget.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Avatar,
  IconButton, LinearProgress, Button, Skeleton, Tooltip,
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction,
  Badge, useTheme, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

// Icons
import TaskIcon from '@mui/icons-material/Task';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingIcon from '@mui/icons-material/Pending';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// API
import { getTasks, getTaskStats } from '../../services/api';

// Styled Components
const WidgetCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.08)}`,
  }
}));

const TaskListItem = styled(Box)(({ theme, priority }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(1),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderLeft: `3px solid ${
    priority === 'critical' ? theme.palette.error.main :
    priority === 'high' ? theme.palette.warning.main :
    priority === 'medium' ? theme.palette.info.main :
    theme.palette.success.main
  }`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateX(4px)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
  }
}));

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  background: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  textAlign: 'center',
}));

// Helper functions
const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'critical': return <LocalFireDepartmentIcon fontSize="small" color="error" />;
    case 'high': return <WarningIcon fontSize="small" color="warning" />;
    case 'medium': return <InfoIcon fontSize="small" color="info" />;
    case 'low': return <FlagIcon fontSize="small" color="success" />;
    default: return <FlagIcon fontSize="small" />;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'todo': return <RadioButtonUncheckedIcon fontSize="small" />;
    case 'in_progress': return <PendingIcon fontSize="small" color="primary" />;
    case 'completed': return <CheckCircleIcon fontSize="small" color="success" />;
    default: return <RadioButtonUncheckedIcon fontSize="small" />;
  }
};

const TaskWidget = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchTaskData();
  }, []);

  const fetchTaskData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        getTasks({ 
          myTasks: true, 
          status: 'in_progress', 
          sortBy: 'priority',
          limit: 5 
        }),
        getTaskStats()
      ]);

      setTasks(tasksRes.data.tasks || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching task data:', err);
    } finally {
      setLoading(false);
    }
  };

  const todoCount = stats?.statusDistribution?.find(s => s._id === 'todo')?.count || 0;
  const inProgressCount = stats?.statusDistribution?.find(s => s._id === 'in_progress')?.count || 0;
  const completedCount = stats?.statusDistribution?.find(s => s._id === 'completed')?.count || 0;
  const totalTasks = stats?.totalTasks || 0;

  return (
    <WidgetCard elevation={0}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
              <TaskIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              My Tasks
            </Typography>
          </Stack>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/tasks')}
          >
            View All
          </Button>
        </Stack>

        {/* Stats Summary */}
        {loading ? (
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" width={80} height={60} />
            ))}
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <StatBox sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                {todoCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                To Do
              </Typography>
            </StatBox>
            <StatBox sx={{ flex: 1, background: alpha(theme.palette.warning.main, 0.05), borderColor: alpha(theme.palette.warning.main, 0.1) }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                {inProgressCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                In Progress
              </Typography>
            </StatBox>
            <StatBox sx={{ flex: 1, background: alpha(theme.palette.success.main, 0.05), borderColor: alpha(theme.palette.success.main, 0.1) }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                {completedCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </StatBox>
          </Stack>
        )}

        {/* Progress Bar */}
        {!loading && totalTasks > 0 && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Overall Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {((completedCount / totalTasks) * 100).toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={(completedCount / totalTasks) * 100}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                }
              }}
            />
          </Box>
        )}

        {/* Task List */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Active Tasks
          </Typography>
          
          {loading ? (
            <Stack spacing={1}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={70} />
              ))}
            </Stack>
          ) : tasks.length > 0 ? (
            <Stack spacing={1}>
              {tasks.map((task) => (
                <TaskListItem
                  key={task._id}
                  priority={task.priority}
                  onClick={() => navigate('/tasks')}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ flex: 1 }}>
                        {getStatusIcon(task.status)}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {task.title}
                        </Typography>
                      </Stack>
                      {getPriorityIcon(task.priority)}
                    </Stack>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      {task.dueDate && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography 
                            variant="caption" 
                            color={new Date(task.dueDate) < new Date() ? 'error' : 'text.secondary'}
                          >
                            {format(new Date(task.dueDate), 'MMM dd')}
                          </Typography>
                        </Stack>
                      )}
                      {task.assignee && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                            {task.assignee.name.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {task.assignee.name.split(' ')[0]}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </TaskListItem>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <TaskIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No active tasks
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/tasks')}
                sx={{ mt: 1 }}
              >
                Create a task
              </Button>
            </Box>
          )}
        </Box>

        {/* Overdue Tasks Alert */}
        {!loading && stats?.overdueCount > 0 && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            borderRadius: 2,
            background: alpha(theme.palette.error.main, 0.05),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
          }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Badge badgeContent={stats.overdueCount} color="error">
                <WarningIcon color="error" />
              </Badge>
              <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                {stats.overdueCount} overdue {stats.overdueCount === 1 ? 'task' : 'tasks'}
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </WidgetCard>
  );
};

export default TaskWidget;