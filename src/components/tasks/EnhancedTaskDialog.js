// EnhancedTaskDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
  FormControl, InputLabel, MenuItem, Button, Stack, Chip, IconButton,
  Typography, Box, Avatar, Autocomplete, Alert, Tabs, Tab, Paper,
  Divider, ToggleButtonGroup, ToggleButton, Tooltip, Fade, Grow,
  InputAdornment, FormHelperText, AvatarGroup, Collapse, useTheme,
  alpha, CircularProgress, Badge, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import FlagIcon from '@mui/icons-material/Flag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LabelIcon from '@mui/icons-material/Label';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TodayIcon from '@mui/icons-material/Today';
import NextWeekIcon from '@mui/icons-material/NextWeek';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

const priorityConfig = {
  critical: { icon: <LocalFireDepartmentIcon />, color: '#f44336', label: 'Critical' },
  high: { icon: <WarningIcon />, color: '#ff9800', label: 'High' },
  medium: { icon: <InfoIcon />, color: '#2196f3', label: 'Medium' },
  low: { icon: <FlagIcon />, color: '#4caf50', label: 'Low' }
};

const categorySubcategories = {
  development: ['Frontend', 'Backend', 'Database', 'DevOps', 'Testing', 'Bug Fix', 'Feature', 'Refactoring'],
  marketing: ['Content', 'Social Media', 'SEO', 'Email Campaign', 'Analytics', 'Branding', 'PR'],
  sales: ['Lead Generation', 'Client Meeting', 'Proposal', 'Follow-up', 'Contract', 'Demo'],
  operations: ['Process Improvement', 'Documentation', 'Training', 'Compliance', 'Vendor Management'],
  finance: ['Budgeting', 'Reporting', 'Audit', 'Expense Tracking', 'Invoicing', 'Payroll'],
  hr: ['Recruitment', 'Onboarding', 'Performance Review', 'Training', 'Policy', 'Benefits'],
  design: ['UI Design', 'UX Research', 'Branding', 'Illustration', 'Prototype', 'Design System'],
  other: ['General', 'Miscellaneous']
};

const EnhancedTaskDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  members = [], 
  existingTask = null,
  loading = false 
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'other',
    subcategory: '',
    tags: [],
    priority: 'medium',
    assignee: null,
    dueDate: null,
    parentTask: null,
    blockedBy: []
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (open) {
      if (existingTask) {
        setTaskForm({
          ...existingTask,
          assignee: existingTask.assignee?._id || existingTask.assignee?.userId || null // Handle both cases
        });
      } else {
        // Reset form for new task
        setTaskForm({
          title: '',
          description: '',
          category: 'other',
          subcategory: '',
          tags: [],
          priority: 'medium',
          assignee: null,
          dueDate: null,
          parentTask: null,
          blockedBy: []
        });
      }
      setErrors({});
      setCustomSubcategory('');
      setShowCustomSubcategory(false);
      setActiveTab(0);
    }
  }, [open, existingTask]);

  // Check if members are loading
  useEffect(() => {
    setMembersLoading(members.length === 0 && open);
  }, [members, open]);

  const validateForm = () => {
    const newErrors = {};
    if (!taskForm.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('=== TASK FORM DEBUG (FIXED) ===');
      console.log('taskForm.assignee:', taskForm.assignee);
      console.log('members array:', members);
      console.log('members with userId:', members.map(m => ({ userId: m.userId, name: m.name })));
      console.log('selected member:', members.find(m => m.userId === taskForm.assignee));
      
      const submitData = {
        ...taskForm,
        assignee: taskForm.assignee, // Remove || undefined
        subcategory: showCustomSubcategory ? customSubcategory : (taskForm.subcategory || null),
      };
      
      console.log('submitData.assignee:', submitData.assignee);
      console.log('=== END DEBUG ===');
      
      onSubmit(submitData);
    }
  };
  const handleQuickDate = (option) => {
    const today = new Date();
    switch (option) {
      case 'today':
        setTaskForm({ ...taskForm, dueDate: today });
        break;
      case 'tomorrow':
        setTaskForm({ ...taskForm, dueDate: addDays(today, 1) });
        break;
      case 'week':
        setTaskForm({ ...taskForm, dueDate: addWeeks(today, 1) });
        break;
      case 'month':
        setTaskForm({ ...taskForm, dueDate: addMonths(today, 1) });
        break;
      default:
        break;
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!taskForm.tags.includes(tagInput.trim())) {
        setTaskForm({ 
          ...taskForm, 
          tags: [...taskForm.tags, tagInput.trim()] 
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTaskForm({ 
      ...taskForm, 
      tags: taskForm.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const availableSubcategories = categorySubcategories[taskForm.category] || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'visible',
          background: theme.palette.background.paper,
        }
      }}
      TransitionComponent={Grow}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: alpha(theme.palette.common.white, 0.1),
            }
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2) }}>
                <AddIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {existingTask ? 'Edit Task' : 'Create New Task'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Fill in the details to {existingTask ? 'update' : 'create'} a task
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            px: 3,
            pt: 2
          }}
        >
          <Tab label="Basic Details" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Assignment & Priority" icon={<GroupIcon />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Fade in={activeTab === 0}>
              <Stack spacing={3}>
                {/* Title Field */}
                <TextField
                  label="Task Title"
                  fullWidth
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="Enter a clear and concise task title"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge 
                          color="error" 
                          variant="dot" 
                          invisible={!errors.title}
                        >
                          <DescriptionIcon color="action" />
                        </Badge>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Description Field */}
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Provide detailed information about the task..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover': {
                        '& > fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }
                  }}
                />

                {/* Category and Subcategory */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={taskForm.category}
                      label="Category"
                      onChange={(e) => setTaskForm({ 
                        ...taskForm, 
                        category: e.target.value,
                        subcategory: '' // Reset subcategory when category changes
                      })}
                      startAdornment={
                        <InputAdornment position="start">
                          <CategoryIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {Object.keys(categorySubcategories).map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LabelIcon fontSize="small" />
                            <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Subcategory</InputLabel>
                    <Select
                      value={showCustomSubcategory ? 'custom' : taskForm.subcategory}
                      label="Subcategory"
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setShowCustomSubcategory(true);
                        } else {
                          setShowCustomSubcategory(false);
                          setTaskForm({ ...taskForm, subcategory: e.target.value });
                        }
                      }}
                      startAdornment={
                        <InputAdornment position="start">
                          <SubdirectoryArrowRightIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {availableSubcategories.map((subcat) => (
                        <MenuItem key={subcat} value={subcat}>{subcat}</MenuItem>
                      ))}
                      <Divider />
                      <MenuItem value="custom">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AddIcon fontSize="small" />
                          <span>Add Custom Subcategory</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                {/* Custom Subcategory Input */}
                <Collapse in={showCustomSubcategory}>
                  <TextField
                    fullWidth
                    label="Custom Subcategory"
                    value={customSubcategory}
                    onChange={(e) => setCustomSubcategory(e.target.value)}
                    placeholder="Enter custom subcategory name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AddIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Collapse>

                {/* Tags */}
                <Box>
                  <TextField
                    fullWidth
                    label="Tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleAddTag}
                    placeholder="Type and press Enter to add tags"
                    helperText="Press Enter to add tags"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LabelIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {taskForm.tags.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                      {taskForm.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          onDelete={() => handleRemoveTag(tag)}
                          sx={{ mt: 1 }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Fade>
          )}

          {activeTab === 1 && (
            <Fade in={activeTab === 1}>
              <Stack spacing={3}>
                {/* Priority Selection */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Priority Level
                  </Typography>
                  <ToggleButtonGroup
                    value={taskForm.priority}
                    exclusive
                    onChange={(e, newPriority) => {
                      if (newPriority) setTaskForm({ ...taskForm, priority: newPriority });
                    }}
                    fullWidth
                    sx={{ 
                      '& .MuiToggleButton-root': {
                        py: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&.Mui-selected': {
                          color: 'white',
                        }
                      }
                    }}
                  >
                    {Object.entries(priorityConfig).map(([value, config]) => (
                      <ToggleButton 
                        key={value} 
                        value={value}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: config.color,
                            '&:hover': {
                              backgroundColor: config.color,
                            }
                          }
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          {config.icon}
                          <span>{config.label}</span>
                        </Stack>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>

                {/* Assignee Selection */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Assign To
                  </Typography>
                  {membersLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : members.length === 0 ? (
                    <Alert severity="info">
                      No team members found. Add team members to assign tasks.
                    </Alert>
                  ) : (
                    <Autocomplete
  options={members}
  getOptionLabel={(option) => option.name || ''}
  value={members.find(m => m.userId === taskForm.assignee) || null} // Changed from m._id to m.userId
  onChange={(e, newValue) => {
    console.log('Assignee selection changed:', newValue);
    setTaskForm({ 
      ...taskForm, 
      assignee: newValue?.userId || null  // Changed from newValue?._id to newValue?.userId
    });
  }}
  renderInput={(params) => (
    <TextField 
      {...params} 
      placeholder="Select team member"
      InputProps={{
        ...params.InputProps,
        startAdornment: (
          <>
            <InputAdornment position="start">
              <PersonAddIcon color="action" />
            </InputAdornment>
            {params.InputProps.startAdornment}
          </>
        ),
      }}
    />
  )}
  renderOption={(props, option) => (
    <ListItem {...props}>
      <ListItemAvatar>
        <Avatar sx={{ width: 32, height: 32 }}>
          {option.name?.charAt(0) || '?'}
        </Avatar>
      </ListItemAvatar>
      <ListItemText 
        primary={option.name}
        secondary={option.email}
      />
    </ListItem>
  )}
/>
                  )}
                </Box>

                {/* Due Date Selection */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Due Date
                  </Typography>
                  
                  {/* Quick Date Options */}
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      icon={<TodayIcon />}
                      label="Today"
                      onClick={() => handleQuickDate('today')}
                      variant={
                        taskForm.dueDate && 
                        format(taskForm.dueDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                          ? 'filled' : 'outlined'
                      }
                      color="primary"
                      clickable
                    />
                    <Chip
                      icon={<NextWeekIcon />}
                      label="Tomorrow"
                      onClick={() => handleQuickDate('tomorrow')}
                      variant="outlined"
                      clickable
                    />
                    <Chip
                      icon={<DateRangeIcon />}
                      label="Next Week"
                      onClick={() => handleQuickDate('week')}
                      variant="outlined"
                      clickable
                    />
                    <Chip
                      icon={<CalendarTodayIcon />}
                      label="Next Month"
                      onClick={() => handleQuickDate('month')}
                      variant="outlined"
                      clickable
                    />
                  </Stack>

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Select Due Date"
                      value={taskForm.dueDate}
                      onChange={(newValue) => setTaskForm({ ...taskForm, dueDate: newValue })}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarTodayIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Box>

                {/* Task Summary Preview */}
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Task Preview
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">Title:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {taskForm.title || 'Untitled Task'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">Priority:</Typography>
                      <Chip 
                        size="small" 
                        icon={priorityConfig[taskForm.priority].icon}
                        label={priorityConfig[taskForm.priority].label}
                        sx={{ 
                          bgcolor: alpha(priorityConfig[taskForm.priority].color, 0.1),
                          color: priorityConfig[taskForm.priority].color,
                          fontWeight: 600
                        }}
                      />
                    </Stack>
                    {taskForm.assignee && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">Assigned to:</Typography>
                        <Chip 
                          size="small" 
                          avatar={<Avatar sx={{ width: 20, height: 20 }}>
                            {members.find(m => m.userId === taskForm.assignee)?.name?.charAt(0)}
                          </Avatar>}
                          label={members.find(m => m.userId === taskForm.assignee)?.name}
                        />
                      </Stack>
                    )}
                    {taskForm.dueDate && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">Due:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {format(taskForm.dueDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            </Fade>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
        <Button onClick={onClose} size="large">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !taskForm.title.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          size="large"
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            px: 4,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            }
          }}
        >
          {loading ? 'Creating...' : (existingTask ? 'Update Task' : 'Create Task')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedTaskDialog;