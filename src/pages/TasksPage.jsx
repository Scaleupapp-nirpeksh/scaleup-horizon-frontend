// src/pages/TasksPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, Box, Stack, useTheme, alpha, 
  IconButton, Button, Chip, Avatar, Badge, Tooltip, Fab, Menu, MenuItem,
  TextField, Select, FormControl, InputLabel, Divider, Dialog, 
  DialogTitle, DialogContent, DialogActions, Tab, Tabs, Card, CardContent,
  LinearProgress, CircularProgress, Skeleton, Zoom, Fade, Grow, Collapse,
  ToggleButton, ToggleButtonGroup, List, ListItem, ListItemText, ListItemAvatar,
  ListItemSecondaryAction, InputAdornment, FormHelperText, AvatarGroup,
  Breadcrumbs, Link, Alert, Snackbar, SpeedDial, SpeedDialAction, SpeedDialIcon,
  useMediaQuery, SwipeableDrawer, Autocomplete, Rating, ButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, formatDistanceToNow, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

// Icons
import TaskIcon from '@mui/icons-material/Task';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CommentIcon from '@mui/icons-material/Comment';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import GroupIcon from '@mui/icons-material/Group';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LabelIcon from '@mui/icons-material/Label';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// Component imports
import EnhancedTaskDialog from '../components/tasks/EnhancedTaskDialog';

// API imports
import {
  getTasks, createTask, updateTask, archiveTask, assignTask, updateTaskWatchers,
  getTaskComments, addTaskComment, updateTaskComment, deleteTaskComment,
  getTaskStats, formatTaskFilters, listOrganizationMembers
} from '../services/api';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' 
    ? '#0a0a0a'
    : `linear-gradient(180deg, 
        ${alpha(theme.palette.background.default, 0.95)} 0%, 
        ${alpha(theme.palette.grey[50], 0.95)} 50%,
        ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 50%),
                 radial-gradient(ellipse at bottom right, ${alpha(theme.palette.secondary.main, 0.06)} 0%, transparent 50%)`,
    pointerEvents: 'none',
    zIndex: 0,
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  zIndex: 1,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: alpha(theme.palette.common.white, 0.1),
    animation: `${pulse} 3s ease-in-out infinite`,
    pointerEvents: 'none',
    zIndex: -1,
  }
}));

const HeaderContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
}));

const StatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.8)
    : theme.palette.background.paper,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette[color].main, 0.15)}`,
    borderColor: theme.palette[color].main,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette[color].light, 0.1)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const KanbanColumn = styled(Paper)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  minHeight: 600,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  }
}));

const TaskCard = styled(Card)(({ theme, priority, isDragging }) => ({
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderLeft: `4px solid ${
    priority === 'critical' ? theme.palette.error.main :
    priority === 'high' ? theme.palette.warning.main :
    priority === 'medium' ? theme.palette.info.main :
    theme.palette.success.main
  }`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  opacity: isDragging ? 0.5 : 1,
  transform: isDragging ? 'rotate(5deg)' : 'none',
  background: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
  }
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: theme.spacing(2),
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  }
}));

const CommentBubble = styled(Paper)(({ theme, isOwn }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: isOwn 
    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
    : theme.palette.background.paper,
  color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: isOwn ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  maxWidth: '80%',
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  animation: `${fadeIn} 0.3s ease`,
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

// Helper Functions
const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'critical': return <LocalFireDepartmentIcon color="error" />;
    case 'high': return <WarningIcon color="warning" />;
    case 'medium': return <InfoIcon color="info" />;
    case 'low': return <FlagIcon color="success" />;
    default: return <FlagIcon />;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'todo': return <RadioButtonUncheckedIcon />;
    case 'in_progress': return <PendingIcon color="primary" />;
    case 'in_review': return <VisibilityIcon color="secondary" />;
    case 'blocked': return <BlockIcon color="error" />;
    case 'completed': return <CheckCircleIcon color="success" />;
    case 'cancelled': return <CloseIcon color="action" />;
    default: return <RadioButtonUncheckedIcon />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'todo': return 'default';
    case 'in_progress': return 'primary';
    case 'in_review': return 'secondary';
    case 'blocked': return 'error';
    case 'completed': return 'success';
    case 'cancelled': return 'default';
    default: return 'default';
  }
};

// Main Component
const TasksPage = () => {
  const theme = useTheme();
  const { user, activeOrganization } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasMore: false
  });
  
  // View & Filter State
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list, calendar
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignee: 'all',
    search: '',
    myTasks: false,
    sortBy: 'createdAt',
    page: 1,
    limit: 20
  });
  const [activeFilter, setActiveFilter] = useState(false);
  
  // UI State
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [selectedTaskMenu, setSelectedTaskMenu] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Comment State
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  
  // Fetch Data
  const fetchTasks = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    try {
      const params = formatTaskFilters(filters);
      
      // Fetch all data in parallel
      const [tasksRes, statsRes, membersRes] = await Promise.all([
        getTasks(params),
        getTaskStats(),
        listOrganizationMembers()
      ]);
      
      // Log to debug
      console.log('Members fetched:', membersRes.data);
      
      setTasks(tasksRes.data.tasks || []);
      setPagination(tasksRes.data.pagination || {});
      setStats(statsRes.data || null);
      
      // Ensure members array is properly set
      const membersList = membersRes.data?.members || membersRes.data || [];
      setMembers(Array.isArray(membersList) ? membersList : []);
      
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
      if (showRefreshing) setTimeout(() => setRefreshing(false), 500);
    }
  }, [filters]);
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  // Add a loading state specifically for members in the header
  useEffect(() => {
    // Fetch members separately if needed on initial load
    if (members.length === 0 && activeOrganization) {
      listOrganizationMembers()
        .then(res => {
          const membersList = res.data?.members || res.data || [];
          setMembers(Array.isArray(membersList) ? membersList : []);
        })
        .catch(err => {
          console.error('Error fetching members:', err);
        });
    }
  }, [activeOrganization]);
  
  // Fetch Comments
  const fetchComments = async (taskId) => {
    setLoadingComments(true);
    try {
      const res = await getTaskComments(taskId);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };
  
  // Update the handleCreateTask to work with the new dialog
  const handleCreateTask = async (formData) => {
    setCreateLoading(true);
    try {
      // Transform the form data to match backend expectations
      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.tags,
        priority: formData.priority,
        assignee: formData.assignee,
        dueDate: formData.dueDate,
        startDate: formData.startDate,
        parentTask: formData.parentTask,
        blockedBy: formData.blockedBy,
        // Add subcategory to custom fields as well if needed
        customFields: formData.subcategory ? { subcategory: formData.subcategory } : undefined
      };

      const res = await createTask(taskData);
      setSuccess('Task created successfully!');
      setCreateTaskOpen(false);
      fetchTasks(true);
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.msg || 'Failed to create task');
    } finally {
      setCreateLoading(false);
    }
  };

  // Update the handleUpdateTask to work with the enhanced dialog
  const handleUpdateTaskFromDialog = async (formData) => {
    setUpdateLoading(true);
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.tags,
        priority: formData.priority,
        status: formData.status,
        assignee: formData.assignee,
        dueDate: formData.dueDate,
        startDate: formData.startDate,
        customFields: formData.subcategory ? { subcategory: formData.subcategory } : undefined
      };

      await updateTask(editingTask._id, updates);
      setSuccess('Task updated successfully!');
      setEditingTask(null);
      setEditDialogOpen(false);
      fetchTasks(true);
      
      if (selectedTask?._id === editingTask._id) {
        setSelectedTask({ ...selectedTask, ...updates });
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.response?.data?.msg || 'Failed to update task');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      setSuccess('Task updated successfully!');
      fetchTasks(true);
      if (selectedTask?._id === taskId) {
        setSelectedTask({ ...selectedTask, ...updates });
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.response?.data?.msg || 'Failed to update task');
    }
  };
  
  const handleArchiveTask = async (taskId) => {
    try {
      await archiveTask(taskId);
      setSuccess('Task archived successfully!');
      fetchTasks(true);
      setTaskDetailOpen(false);
    } catch (err) {
      console.error('Error archiving task:', err);
      setError(err.response?.data?.msg || 'Failed to archive task');
    }
  };
  
  const handleAssignTask = async (taskId, assigneeId) => {
    try {
      await assignTask(taskId, { assigneeId });
      setSuccess('Task assigned successfully!');
      fetchTasks(true);
    } catch (err) {
      console.error('Error assigning task:', err);
      setError(err.response?.data?.msg || 'Failed to assign task');
    }
  };
  
  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTask) return;
    
    try {
      const res = await addTaskComment(selectedTask._id, { content: commentText });
      setComments([res.data.comment, ...comments]);
      setCommentText('');
      setSuccess('Comment added!');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };
  
  // Drag and Drop Handler
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // Only update if status changed
    if (source.droppableId !== destination.droppableId) {
      const task = tasks.find(t => t._id === draggableId);
      if (task) {
        // Optimistically update the UI
        const newTasks = [...tasks];
        const taskIndex = newTasks.findIndex(t => t._id === draggableId);
        if (taskIndex > -1) {
          newTasks[taskIndex] = { ...newTasks[taskIndex], status: destination.droppableId };
          setTasks(newTasks);
        }
        
        // Update on server
        handleUpdateTask(draggableId, { status: destination.droppableId });
      }
    }
  };
  
  // Group tasks by status for Kanban view
  const tasksByStatus = useMemo(() => {
    const grouped = {
      todo: [],
      in_progress: [],
      in_review: [],
      blocked: [],
      completed: []
    };
    
    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);
  
  // Render Functions
  const renderKanbanView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Grid container spacing={2}>
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <Grid item xs={12} sm={6} lg={2.4} key={status}>
            <KanbanColumn elevation={0}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {status.replace('_', ' ')}
                </Typography>
                <Chip 
                  label={statusTasks.length} 
                  size="small" 
                  color={getStatusColor(status)}
                />
              </Stack>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minHeight: 400,
                      backgroundColor: snapshot.isDraggingOver 
                        ? alpha(theme.palette.primary.main, 0.05)
                        : 'transparent',
                      borderRadius: 1,
                      transition: 'background-color 0.2s ease',
                      p: 1
                    }}
                  >
                    {statusTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              priority={task.priority}
                              isDragging={snapshot.isDragging}
                              onClick={() => {
                                setSelectedTask(task);
                                setTaskDetailOpen(true);
                                fetchComments(task._id);
                              }}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack spacing={1.5}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, pr: 1 }}>
                                      {task.title}
                                    </Typography>
                                    <IconButton 
                                      size="small" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTaskMenu(task._id);
                                        setMoreMenuAnchor(e.currentTarget);
                                      }}
                                    >
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                  
                                  {task.description && (
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary"
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                      }}
                                    >
                                      {task.description}
                                    </Typography>
                                  )}
                                  
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                    <Chip
                                      icon={getPriorityIcon(task.priority)}
                                      label={task.priority}
                                      size="small"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                    {task.category && (
                                      <Chip
                                        icon={<LabelIcon />}
                                        label={task.category}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem' }}
                                      />
                                    )}
                                    {task.subcategory && (
                                      <Chip
                                        icon={<SubdirectoryArrowRightIcon />}
                                        label={task.subcategory}
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        sx={{ fontSize: '0.65rem' }}
                                      />
                                    )}
                                  </Stack>
                                  
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      {task.assignee && (
                                        <Tooltip title={task.assignee.name}>
                                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                            {task.assignee.name.charAt(0)}
                                          </Avatar>
                                        </Tooltip>
                                      )}
                                      {task.dueDate && (
                                        <Tooltip title={`Due: ${format(new Date(task.dueDate), 'MMM dd, yyyy')}`}>
                                          <Chip
                                            icon={<AccessTimeIcon />}
                                            label={format(new Date(task.dueDate), 'MMM dd')}
                                            size="small"
                                            color={new Date(task.dueDate) < new Date() ? 'error' : 'default'}
                                            sx={{ fontSize: '0.7rem' }}
                                          />
                                        </Tooltip>
                                      )}
                                    </Stack>
                                    
                                    <Stack direction="row" spacing={0.5}>
                                      {task.subtasks?.length > 0 && (
                                        <Tooltip title={`${task.subtasks.length} subtasks`}>
                                          <IconButton size="small">
                                            <AccountTreeIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      {task.comments?.length > 0 && (
                                        <Badge badgeContent={task.comments.length} color="primary">
                                          <IconButton size="small">
                                            <CommentIcon fontSize="small" />
                                          </IconButton>
                                        </Badge>
                                      )}
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </TaskCard>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </KanbanColumn>
          </Grid>
        ))}
      </Grid>
    </DragDropContext>
  );
  
  const renderListView = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Task</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Assignee</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task._id}
              hover
              onClick={() => {
                setSelectedTask(task);
                setTaskDetailOpen(true);
                fetchComments(task._id);
              }}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {task.title}
                  </Typography>
                  {task.description && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {task.description}
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <Chip
                  icon={getStatusIcon(task.status)}
                  label={task.status.replace('_', ' ')}
                  size="small"
                  color={getStatusColor(task.status)}
                />
              </TableCell>
              <TableCell>
                <Chip
                  icon={getPriorityIcon(task.priority)}
                  label={task.priority}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="body2">{task.category}</Typography>
                  {task.subcategory && (
                    <Typography variant="caption" color="text.secondary">
                      {task.subcategory}
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                {task.assignee ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {task.assignee.name?.charAt(0) || '?'}
                    </Avatar>
                    <Typography variant="body2">{task.assignee.name || 'Unknown'}</Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                )}
              </TableCell>
              <TableCell>
                {task.dueDate ? (
                  <Typography 
                    variant="body2" 
                    color={new Date(task.dueDate) < new Date() ? 'error' : 'text.primary'}
                  >
                    {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">No due date</Typography>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTaskMenu(task._id);
                    setMoreMenuAnchor(e.currentTarget);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <TablePagination
        component="div"
        count={pagination.totalTasks}
        page={pagination.currentPage - 1}
        onPageChange={(e, newPage) => setFilters({ ...filters, page: newPage + 1 })}
        rowsPerPage={filters.limit}
        onRowsPerPageChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
      />
    </TableContainer>
  );
  
  // Task Detail Dialog
  const renderTaskDetail = () => (
    <Dialog 
      open={taskDetailOpen} 
      onClose={() => {
        setTaskDetailOpen(false);
        setEditingTask(null);
      }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'visible'
        }
      }}
    >
      {selectedTask && (
        <>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton
                  onClick={() => setTaskDetailOpen(false)}
                  sx={{ ml: -1 }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedTask.title}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => {
                  setEditingTask(selectedTask);
                  setEditDialogOpen(true);
                  setTaskDetailOpen(false);
                }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleArchiveTask(selectedTask._id)}>
                  <ArchiveIcon />
                </IconButton>
              </Stack>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {selectedTask.description || 'No description provided'}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  {/* Comments Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Comments ({comments.length})
                    </Typography>
                    
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton 
                                onClick={handleAddComment}
                                disabled={!commentText.trim()}
                                color="primary"
                              >
                                <SendIcon />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Stack>
                    
                    {loadingComments ? (
                      <Stack spacing={2}>
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                        ))}
                      </Stack>
                    ) : (
                      <Stack spacing={2} sx={{ maxHeight: 400, overflowY: 'auto' }}>
                        {comments.map((comment) => (
                          <CommentBubble 
                            key={comment._id} 
                            isOwn={comment.author?._id === user.id}
                            elevation={0}
                          >
                            <Stack spacing={1}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ width: 32, height: 32 }}>
                                    {comment.author?.name?.charAt(0) || '?'}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      {comment.author?.name || 'Unknown User'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </Typography>
                                  </Box>
                                </Stack>
                                {comment.type !== 'comment' && (
                                  <Chip 
                                    label={comment.type.replace('_', ' ')} 
                                    size="small"
                                    color="secondary"
                                  />
                                )}
                              </Stack>
                              <Typography variant="body2">
                                {comment.content}
                              </Typography>
                            </Stack>
                          </CommentBubble>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  {/* Task Details */}
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Task Details
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Chip
                          icon={getStatusIcon(selectedTask.status)}
                          label={selectedTask.status.replace('_', ' ')}
                          color={getStatusColor(selectedTask.status)}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Priority</Typography>
                        <Chip
                          icon={getPriorityIcon(selectedTask.priority)}
                          label={selectedTask.priority}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Category</Typography>
                        <Typography variant="body2">{selectedTask.category}</Typography>
                        {selectedTask.subcategory && (
                          <Typography variant="caption" color="text.secondary">
                            / {selectedTask.subcategory}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Created</Typography>
                        <Typography variant="body2">
                          {format(new Date(selectedTask.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      {selectedTask.dueDate && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Due Date</Typography>
                          <Typography 
                            variant="body2"
                            color={new Date(selectedTask.dueDate) < new Date() ? 'error' : 'text.primary'}
                          >
                            {format(new Date(selectedTask.dueDate), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                  
                  {/* Assignee */}
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Assignee
                    </Typography>
                    {selectedTask.assignee ? (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar>{selectedTask.assignee.name?.charAt(0) || '?'}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {selectedTask.assignee.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedTask.assignee.email || 'No email'}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </Paper>
                  
                  {/* Watchers */}
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Watchers ({selectedTask.watchers?.length || 0})
                    </Typography>
                    {selectedTask.watchers?.length > 0 ? (
                      <AvatarGroup max={4}>
                        {selectedTask.watchers.map((watcher) => (
                          <Tooltip key={watcher._id} title={watcher.name || 'Unknown'}>
                            <Avatar>{watcher.name?.charAt(0) || '?'}</Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No watchers
                      </Typography>
                    )}
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
  
  if (loading && !tasks.length) {
    return (
      <PageContainer>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Stack>
        </Container>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <HeaderSection>
        <HeaderContent maxWidth="xl">
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 2, color: 'white' }}
          >
            <Link 
              href="/" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                '&:hover': { color: 'white' }
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
              <TaskIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Tasks
            </Typography>
          </Breadcrumbs>
          
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                Task Management
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Track, prioritize, and collaborate on tasks with your team
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 3 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setActiveFilter(!activeFilter)}
                sx={{ 
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Filters
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  console.log('New Task button clicked');
                  setCreateTaskOpen(true);
                }}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                New Task
              </Button>
            </Stack>
          </Stack>
        </HeaderContent>
      </HeaderSection>
      
      <Container maxWidth="xl" sx={{ pb: 4, position: 'relative', zIndex: 1 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard color="primary">
              <Stack spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  <TaskIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.totalTasks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Box>
              </Stack>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard color="warning">
              <Stack spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                  <PendingIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.statusDistribution?.find(s => s._id === 'in_progress')?.count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Stack>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard color="success">
              <Stack spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.statusDistribution?.find(s => s._id === 'completed')?.count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Stack>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard color="error">
              <Stack spacing={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.overdueCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue
                  </Typography>
                </Box>
              </Stack>
            </StatsCard>
          </Grid>
        </Grid>
        
        {/* Filters Section */}
        <Collapse in={activeFilter}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="in_review">In Review</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority}
                    label="Priority"
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    value={filters.assignee}
                    label="Assignee"
                    onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                  >
                    <MenuItem value="all">All Assignees</MenuItem>
                    {members.map((member) => (
                      <MenuItem key={member._id} value={member._id}>
                        {member.name || 'Unknown User'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  >
                    <MenuItem value="createdAt">Created Date</MenuItem>
                    <MenuItem value="dueDate">Due Date</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setFilters({
                    status: 'all',
                    priority: 'all',
                    category: 'all',
                    assignee: 'all',
                    search: '',
                    myTasks: false,
                    sortBy: 'createdAt',
                    page: 1,
                    limit: 20
                  })}
                  sx={{ height: '56px' }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
            
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <FilterChip
                label="My Tasks"
                color={filters.myTasks ? 'primary' : 'default'}
                onClick={() => setFilters({ ...filters, myTasks: !filters.myTasks })}
                variant={filters.myTasks ? 'filled' : 'outlined'}
              />
            </Stack>
          </Paper>
        </Collapse>
        
        {/* View Mode Toggle */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="kanban">
              <ViewKanbanIcon sx={{ mr: 1 }} />
              Kanban
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon sx={{ mr: 1 }} />
              List
            </ToggleButton>
          </ToggleButtonGroup>
          
          <IconButton 
            onClick={() => fetchTasks(true)}
            disabled={refreshing}
          >
            <RefreshIcon sx={{ animation: refreshing ? `${rotate} 1s linear infinite` : 'none' }} />
          </IconButton>
        </Stack>
        
        {/* Main Content */}
        {refreshing && <LinearProgress sx={{ mb: 2 }} />}
        
        {viewMode === 'kanban' ? renderKanbanView() : renderListView()}
        
        {/* Dialogs */}
        {renderTaskDetail()}
        
        {/* Create Task Dialog */}
        <EnhancedTaskDialog
          open={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          onSubmit={handleCreateTask}
          members={members}
          loading={createLoading}
        />
        
        {/* Edit Task Dialog */}
        {editingTask && (
          <EnhancedTaskDialog
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setEditingTask(null);
            }}
            onSubmit={handleUpdateTaskFromDialog}
            members={members}
            existingTask={editingTask}
            loading={updateLoading}
          />
        )}
        
        {/* Task Context Menu */}
        <Menu
          anchorEl={moreMenuAnchor}
          open={Boolean(moreMenuAnchor)}
          onClose={() => {
            setMoreMenuAnchor(null);
            setSelectedTaskMenu(null);
          }}
        >
          <MenuItem onClick={() => {
            const task = tasks.find(t => t._id === selectedTaskMenu);
            if (task) {
              setEditingTask(task);
              setEditDialogOpen(true);
            }
            setMoreMenuAnchor(null);
          }}>
            <EditIcon sx={{ mr: 2 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedTaskMenu) {
              handleArchiveTask(selectedTaskMenu);
            }
            setMoreMenuAnchor(null);
          }}>
            <ArchiveIcon sx={{ mr: 2 }} /> Archive
          </MenuItem>
        </Menu>
        
        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <FloatingActionButton
            color="primary"
            onClick={() => setCreateTaskOpen(true)}
          >
            <AddIcon />
          </FloatingActionButton>
        )}
        
        {/* Snackbars */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>
        
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </PageContainer>
  );
};

export default TasksPage;