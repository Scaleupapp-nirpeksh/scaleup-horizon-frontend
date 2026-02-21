// ImprovedKanbanBoard.jsx - Fixed drag & drop with proper z-index and JIRA-like behavior
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Stack, useTheme, alpha,
  IconButton, Button, Chip, Avatar, Badge, Tooltip, Collapse,
  Card, CardContent, CircularProgress, Divider,
  Zoom, Fade, Skeleton
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentIcon from '@mui/icons-material/Comment';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LabelIcon from '@mui/icons-material/Label';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import FlagIcon from '@mui/icons-material/Flag';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Enhanced Animations
const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// CRITICAL: Fixed Styled Components with proper z-index handling for drag & drop
const KanbanContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  overflowX: 'auto',
  paddingBottom: theme.spacing(1),
  position: 'relative',
  zIndex: 1, // Base layer
  
  // Custom scrollbar styling
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: alpha(theme.palette.divider, 0.1),
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 4,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const KanbanGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  minWidth: 'fit-content',
  padding: theme.spacing(1),
  flexWrap: 'nowrap',
  position: 'relative',
  zIndex: 2, // Above container
  
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(1),
  },
}));

// FIXED: Column with proper z-index that doesn't interfere with dragging
const KanbanColumn = styled(Paper)(({ theme }) => ({
  width: 280,
  minWidth: 260,
  flexShrink: 0,
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  minHeight: 400,
  maxHeight: 'calc(100vh - 300px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: 3,

  '&:hover': {
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
    transform: 'translateY(-2px)',
  },

  '&[data-is-drag-occurring="true"]': {
    zIndex: 4,
  },

  [theme.breakpoints.down('md')]: {
    width: '80vw',
    minWidth: '80vw',
    maxWidth: '80vw',
  },

  [theme.breakpoints.up('md')]: {
    maxWidth: 280,
  },
}));

const ColumnHeader = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  zIndex: 5, // Above column content
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

// FIXED: Tasks container with proper drag feedback
const TasksContainer = styled(Box)(({ theme, isDraggingOver }) => ({
  flex: 1,
  overflowY: 'auto',
  paddingRight: theme.spacing(0.5),
  marginRight: -theme.spacing(0.5),
  position: 'relative',
  zIndex: 4, // Above column
  minHeight: 100,
  
  // Visual feedback when dragging over
  backgroundColor: isDraggingOver 
    ? alpha(theme.palette.primary.main, 0.05)
    : 'transparent',
  borderRadius: theme.spacing(1),
  border: isDraggingOver 
    ? `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
    : '2px dashed transparent',
  transition: 'all 0.2s ease',
  
  // Custom scrollbar for task container
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.divider, 0.3),
    borderRadius: 3,
    '&:hover': {
      backgroundColor: alpha(theme.palette.divider, 0.5),
    },
  },
}));

// CRITICAL: Fixed TaskCard with proper z-index management for drag & drop
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
  background: theme.palette.background.paper,
  position: 'relative',
  cursor: isDragging ? 'grabbing' : 'grab',
  userSelect: 'none',
  
  // CRITICAL: Proper z-index handling
  zIndex: isDragging ? 9999 : 6, // Very high z-index when dragging
  
  // Normal state (not dragging)
  ...(!isDragging && {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: `${slideDown} 0.3s ease`,
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
      borderLeftWidth: 6,
      zIndex: 10, // Slightly higher on hover
    },
    
    '&:active': {
      animation: `${pulse} 0.2s ease`,
    },
  }),
  
  // CRITICAL: Enhanced drag state with proper visibility
  ...(isDragging && {
    // Disable pointer events on children to prevent interference
    '& *': {
      pointerEvents: 'none',
    },
    
    // Enhanced visual feedback
    opacity: 0.95,
    transform: 'scale(1.05) rotate(3deg)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.3)}`,
    borderLeftWidth: 6,
    
    // Force the card to be on top of everything
    position: 'relative',
    
    // Smooth transition when starting drag
    transition: 'all 0.1s ease-out',
    
    // Add a subtle glow effect
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
      borderRadius: 'inherit',
      zIndex: -1,
      filter: 'blur(4px)',
    }
  }),
}));

const ShowMoreButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 500,
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  color: theme.palette.primary.main,
  transition: 'all 0.2s ease',
  zIndex: 7, // Above tasks but below dragging
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-1px)',
  },
  
  '&:disabled': {
    opacity: 0.5,
  },
}));

const ArchiveSection = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  zIndex: 1, // Lower than main kanban
  backdropFilter: 'blur(10px)',
}));

// Status configuration
const STATUS_CONFIG = {
  todo: {
    label: 'Todo',
    icon: <RadioButtonUncheckedIcon />,
    color: 'default',
    bgColor: '#f5f5f5'
  },
  in_progress: {
    label: 'In Progress',
    icon: <PendingIcon />,
    color: 'primary',
    bgColor: '#e3f2fd'
  },
  in_review: {
    label: 'In Review',
    icon: <VisibilityIcon />,
    color: 'secondary',
    bgColor: '#f3e5f5'
  },
  blocked: {
    label: 'Blocked',
    icon: <BlockIcon />,
    color: 'error',
    bgColor: '#ffebee'
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircleIcon />,
    color: 'success',
    bgColor: '#e8f5e8'
  }
};

// Priority configuration
const PRIORITY_CONFIG = {
  critical: { icon: <LocalFireDepartmentIcon color="error" />, color: '#f44336' },
  high: { icon: <WarningIcon color="warning" />, color: '#ff9800' },
  medium: { icon: <InfoIcon color="info" />, color: '#2196f3' },
  low: { icon: <FlagIcon color="success" />, color: '#4caf50' }
};

// Helper functions
const sortTasksByDueDate = (tasks) => {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
};

const formatTaskDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: 'error' };
  if (diffDays === 0) return { text: 'Due today', color: 'warning' };
  if (diffDays === 1) return { text: 'Due tomorrow', color: 'info' };
  if (diffDays <= 7) return { text: `${diffDays}d left`, color: 'default' };
  
  return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'default' };
};

// FIXED: Individual Task Card Component with proper drag handling
const TaskItem = React.memo(({ task, index, onClick, onMenuClick }) => {
  const dueDate = formatTaskDate(task.dueDate);
  
  const handleClick = useCallback((e) => {
    // Only handle click if not in a drag operation
    if (!e.defaultPrevented) {
      onClick(task);
    }
  }, [task, onClick]);
  
  const handleMenuClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    onMenuClick(task._id, e.currentTarget);
  }, [task._id, onMenuClick]);
  
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            // CRITICAL: Ensure proper positioning during drag
            ...(snapshot.isDragging && {
              zIndex: 9999,
              position: 'fixed', // Use fixed positioning during drag
            }),
          }}
        >
          <TaskCard
            priority={task.priority}
            isDragging={snapshot.isDragging}
            onClick={handleClick}
            elevation={snapshot.isDragging ? 8 : 1}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Stack spacing={1.5}>
                {/* Task Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600, 
                      pr: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.3
                    }}
                  >
                    {task.title}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={handleMenuClick}
                    sx={{ 
                      opacity: 0.7, 
                      '&:hover': { opacity: 1 },
                      zIndex: 10 // Ensure menu button is always clickable
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Stack>
                
                {/* Task Description */}
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
                      lineHeight: 1.4
                    }}
                  >
                    {task.description}
                  </Typography>
                )}
                
                {/* Task Tags */}
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  <Chip
                    icon={PRIORITY_CONFIG[task.priority]?.icon}
                    label={task.priority}
                    size="small"
                    sx={{ 
                      fontSize: '0.7rem',
                      height: 24,
                      '& .MuiChip-icon': { fontSize: '0.8rem' }
                    }}
                  />
                  {task.category && (
                    <Chip
                      icon={<LabelIcon sx={{ fontSize: '0.7rem' }} />}
                      label={task.category}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 24 }}
                    />
                  )}
                  {task.subcategory && (
                    <Chip
                      icon={<SubdirectoryArrowRightIcon sx={{ fontSize: '0.7rem' }} />}
                      label={task.subcategory}
                      size="small"
                      variant="outlined"
                      color="secondary"
                      sx={{ fontSize: '0.65rem', height: 22 }}
                    />
                  )}
                </Stack>
                
                {/* Task Footer */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {task.assignee && (
                      <Tooltip title={task.assignee.name || 'Unknown'}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {(task.assignee.name || '?').charAt(0)}
                        </Avatar>
                      </Tooltip>
                    )}
                    {dueDate && (
                      <Tooltip title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}>
                        <Chip
                          icon={<AccessTimeIcon sx={{ fontSize: '0.7rem' }} />}
                          label={dueDate.text}
                          size="small"
                          color={dueDate.color}
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 22,
                            '& .MuiChip-icon': { fontSize: '0.7rem' }
                          }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                  
                  <Stack direction="row" spacing={0.5}>
                    {task.subtasks?.length > 0 && (
                      <Tooltip title={`${task.subtasks.length} subtasks`}>
                        <Badge badgeContent={task.subtasks.length} color="primary" max={99}>
                          <AccountTreeIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                        </Badge>
                      </Tooltip>
                    )}
                    {task.comments?.length > 0 && (
                      <Tooltip title={`${task.comments.length} comments`}>
                        <Badge badgeContent={task.comments.length} color="primary" max={99}>
                          <CommentIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                        </Badge>
                      </Tooltip>
                    )}
                    {task.attachments?.length > 0 && (
                      <Tooltip title={`${task.attachments.length} attachments`}>
                        <Badge badgeContent={task.attachments.length} color="secondary" max={99}>
                          <AttachFileIcon sx={{ fontSize: '1rem', opacity: 0.7 }} />
                        </Badge>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </TaskCard>
        </div>
      )}
    </Draggable>
  );
});

// FIXED: Kanban Column Component with proper drag state management
const KanbanColumnComponent = React.memo(({ 
  status, 
  tasks, 
  visibleCount, 
  onShowMore, 
  onTaskClick, 
  onTaskMenu,
  loadingMore 
}) => {
  const theme = useTheme();
  const config = STATUS_CONFIG[status];
  const hasMore = tasks.length > visibleCount;
  const visibleTasks = tasks.slice(0, visibleCount);
  
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <KanbanColumn 
          data-is-drag-occurring={snapshot.isDraggingOver}
          sx={{
            ...(snapshot.isDraggingOver && {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderColor: theme.palette.primary.main,
              borderWidth: 2,
              transform: 'scale(1.02)',
            })
          }}
        >
          <ColumnHeader>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                {config.icon}
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  {config.label}
                </Typography>
              </Stack>
              <Chip 
                label={tasks.length} 
                size="small" 
                color={config.color}
                sx={{ 
                  fontWeight: 600,
                  minWidth: 32,
                  height: 24
                }}
              />
            </Stack>
          </ColumnHeader>
          
          <TasksContainer
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {visibleTasks.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                  opacity: 0.5
                }}
              >
                {config.icon}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No tasks in {config.label.toLowerCase()}
                </Typography>
              </Box>
            ) : (
              <>
                {visibleTasks.map((task, index) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    index={index}
                    onClick={onTaskClick}
                    onMenuClick={onTaskMenu}
                  />
                ))}
                
                {hasMore && (
                  <Fade in={true}>
                    <Box>
                      <ShowMoreButton
                        onClick={() => onShowMore(status)}
                        disabled={loadingMore}
                        startIcon={
                          loadingMore ? (
                            <CircularProgress size={16} />
                          ) : (
                            <ExpandMoreIcon />
                          )
                        }
                      >
                        {loadingMore ? 'Loading...' : `Show More (${tasks.length - visibleCount} remaining)`}
                      </ShowMoreButton>
                    </Box>
                  </Fade>
                )}
              </>
            )}
            {provided.placeholder}
          </TasksContainer>
        </KanbanColumn>
      )}
    </Droppable>
  );
});

// Main Improved Kanban Board Component
const ImprovedKanbanBoard = ({ 
  tasks = [], 
  onDragEnd, 
  onTaskClick, 
  onTaskMenu,
  loading = false 
}) => {
  const theme = useTheme();

  // State for pagination and archive
  const [visibleCounts, setVisibleCounts] = useState({
    todo: 10,
    in_progress: 10,
    in_review: 10,
    blocked: 10,
    completed: 10
  });
  
  const [loadingMore, setLoadingMore] = useState({
    todo: false,
    in_progress: false,
    in_review: false,
    blocked: false,
    completed: false
  });
  
  const [showArchive, setShowArchive] = useState(false);
  
  // Separate completed tasks into recent and archived
  const { currentTasks, archivedCompleted } = useMemo(() => {
    console.log('Processing tasks for archive...', tasks.length);
    
    const completedTasks = tasks.filter(task => task.status === 'completed');
    console.log('Found completed tasks:', completedTasks.length);
    
    // Separate old vs recent completed tasks
    const recentCompleted = [];
    const archivedTasks = [];
    
    // Sort completed tasks by completion date (most recent first)
    const sortedCompleted = [...completedTasks].sort((a, b) => {
      const dateA = new Date(a.completedAt || a.updatedAt || a.createdAt);
      const dateB = new Date(b.completedAt || b.updatedAt || b.createdAt);
      return dateB - dateA; // Most recent first
    });
    
    // Take first 10 as recent, rest as archived
    sortedCompleted.forEach((task, index) => {
      if (index < 10) {
        recentCompleted.push(task);
      } else {
        archivedTasks.push(task);
      }
    });
    
    console.log('Recent completed:', recentCompleted.length);
    console.log('Archived completed:', archivedTasks.length);
    
    // Create filtered task list with only recent completed tasks
    const filteredTasks = tasks.filter(task => {
      if (task.status === 'completed') {
        return recentCompleted.some(recent => recent._id === task._id);
      }
      return true;
    });
    
    return {
      currentTasks: filteredTasks,
      archivedCompleted: archivedTasks
    };
  }, [tasks]);
  
  // Group current tasks by status and sort by due date
  const tasksByStatus = useMemo(() => {
    const grouped = {
      todo: [],
      in_progress: [],
      in_review: [],
      blocked: [],
      completed: []
    };
    
    currentTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    
    // Sort each group by due date
    Object.keys(grouped).forEach(status => {
      grouped[status] = sortTasksByDueDate(grouped[status]);
    });
    
    return grouped;
  }, [currentTasks]);
  
  // Handle showing more tasks
  const handleShowMore = useCallback(async (status) => {
    setLoadingMore(prev => ({ ...prev, [status]: true }));
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setVisibleCounts(prev => ({
      ...prev,
      [status]: prev[status] + 10
    }));
    
    setLoadingMore(prev => ({ ...prev, [status]: false }));
  }, []);
  
  // Reset visible counts when tasks change significantly
  useEffect(() => {
    setVisibleCounts({
      todo: 10,
      in_progress: 10,
      in_review: 10,
      blocked: 10,
      completed: 10
    });
  }, [tasks.length]);
  
  if (loading) {
    return (
      <Box>
        <KanbanContainer>
          <KanbanGrid>
            {Object.keys(STATUS_CONFIG).map((status) => (
              <KanbanColumn key={status}>
                <Stack spacing={2}>
                  <Skeleton variant="rectangular" height={40} />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                  ))}
                </Stack>
              </KanbanColumn>
            ))}
          </KanbanGrid>
        </KanbanContainer>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Main Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <KanbanContainer>
          <KanbanGrid>
            {Object.keys(STATUS_CONFIG).map((status) => (
              <KanbanColumnComponent
                key={status}
                status={status}
                tasks={tasksByStatus[status] || []}
                visibleCount={visibleCounts[status]}
                onShowMore={handleShowMore}
                onTaskClick={onTaskClick}
                onTaskMenu={onTaskMenu}
                loadingMore={loadingMore[status]}
              />
            ))}
          </KanbanGrid>
        </KanbanContainer>
      </DragDropContext>
      
      {/* Archived Completed Section */}
      {archivedCompleted.length > 0 && (
        <ArchiveSection>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                <ArchiveIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Archived Completed Tasks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {archivedCompleted.length} older completed tasks (beyond the latest 10)
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              startIcon={showArchive ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={() => setShowArchive(!showArchive)}
              sx={{ textTransform: 'none' }}
            >
              {showArchive ? 'Hide' : 'Show'} Archive ({archivedCompleted.length})
            </Button>
          </Stack>
          
          <Collapse in={showArchive}>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              {archivedCompleted.map((task, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={task._id}>
                  <Zoom 
                    in={showArchive} 
                    timeout={300 + (index % 12) * 50}
                    style={{ transitionDelay: `${(index % 12) * 50}ms` }}
                  >
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: 0.8,
                        '&:hover': {
                          opacity: 1,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`
                        }
                      }}
                      onClick={() => onTaskClick(task)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {task.description}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Completed"
                              size="small"
                              color="success"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            {task.completedAt && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(task.completedAt).toLocaleDateString()}
                              </Typography>
                            )}
                            {task.category && (
                              <Chip
                                label={task.category}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.65rem' }}
                              />
                            )}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </ArchiveSection>
      )}
    </Box>
  );
};

export default React.memo(ImprovedKanbanBoard);