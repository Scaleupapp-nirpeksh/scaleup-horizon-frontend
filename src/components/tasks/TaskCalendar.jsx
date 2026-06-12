// src/components/tasks/TaskCalendar.jsx
// Month calendar of tasks by due date. Clicking a task opens it; clicking
// the empty area of a day offers to create a task due that day.
import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Stack, IconButton, Tooltip, useTheme,
  alpha, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AddTaskIcon from '@mui/icons-material/AddTask';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  format, isSameMonth, isToday, isBefore, startOfDay
} from 'date-fns';

const PRIORITY_COLORS = {
  critical: '#f44336',
  high: '#ff9800',
  medium: '#2196f3',
  low: '#4caf50',
};

const MAX_VISIBLE = 3;

const TaskCalendar = ({ tasks = [], onTaskClick, onCreateForDay }) => {
  const theme = useTheme();
  const [cursor, setCursor] = useState(new Date());
  const [dayDialog, setDayDialog] = useState(null); // { date, tasks } for "+N more"

  // Index tasks by due date (yyyy-MM-dd)
  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      if (isNaN(d.getTime())) return;
      const key = format(d, 'yyyy-MM-dd');
      (map[key] = map[key] || []).push(t);
    });
    // Open tasks first, then completed/cancelled
    Object.values(map).forEach(list => list.sort((a, b) => {
      const closedA = ['completed', 'cancelled'].includes(a.status) ? 1 : 0;
      const closedB = ['completed', 'cancelled'].includes(b.status) ? 1 : 0;
      return closedA - closedB;
    }));
    return map;
  }, [tasks]);

  // Build the visible grid (Monday-first weeks)
  const weeks = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const rows = [];
    let day = gridStart;
    while (day <= gridEnd) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [cursor]);

  const today = startOfDay(new Date());

  const renderTaskChip = (task) => {
    const closed = ['completed', 'cancelled'].includes(task.status);
    const overdue = !closed && task.dueDate && isBefore(new Date(task.dueDate), today);
    return (
      <Tooltip
        key={task._id}
        title={`${task.taskKey ? task.taskKey + ' — ' : ''}${task.title}${task.assignee?.name ? ` · ${task.assignee.name}` : ''}`}
      >
        <Box
          onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 0.75,
            py: 0.25,
            mb: 0.5,
            borderRadius: 1,
            cursor: 'pointer',
            bgcolor: overdue
              ? alpha(theme.palette.error.main, 0.08)
              : alpha(theme.palette.primary.main, closed ? 0.03 : 0.06),
            borderLeft: `3px solid ${closed ? theme.palette.grey[400] : (PRIORITY_COLORS[task.priority] || theme.palette.grey[400])}`,
            opacity: closed ? 0.55 : 1,
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14) },
          }}
        >
          <Typography
            variant="caption"
            noWrap
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: overdue ? 'error.main' : 'text.primary',
              textDecoration: closed ? 'line-through' : 'none',
            }}
          >
            {task.taskKey ? `${task.taskKey} ` : ''}{task.title}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {format(cursor, 'MMMM yyyy')}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" startIcon={<TodayIcon />} onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <IconButton size="small" onClick={() => setCursor(addMonths(cursor, -1))}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={() => setCursor(addMonths(cursor, 1))}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Weekday header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: 1, borderColor: 'divider' }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <Typography
            key={d}
            variant="caption"
            sx={{ textAlign: 'center', py: 1, fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5 }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Grid */}
      {weeks.map((week, wi) => (
        <Box key={wi} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {week.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDay[key] || [];
            const inMonth = isSameMonth(day, cursor);
            const visible = dayTasks.slice(0, MAX_VISIBLE);
            const hiddenCount = dayTasks.length - visible.length;
            return (
              <Box
                key={key}
                onClick={() => onCreateForDay(day)}
                sx={{
                  minHeight: 118,
                  p: 0.75,
                  borderTop: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',
                  bgcolor: isToday(day)
                    ? alpha(theme.palette.primary.main, 0.05)
                    : inMonth ? 'background.paper' : alpha(theme.palette.action.hover, 0.4),
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                  '&:last-of-type': { borderRight: 0 },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isToday(day) ? 800 : 500,
                      color: isToday(day) ? 'primary.main' : inMonth ? 'text.primary' : 'text.disabled',
                      ...(isToday(day) && {
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }),
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  {dayTasks.length > 0 && (
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                      {dayTasks.length}
                    </Typography>
                  )}
                </Stack>
                {visible.map(renderTaskChip)}
                {hiddenCount > 0 && (
                  <Typography
                    variant="caption"
                    onClick={(e) => { e.stopPropagation(); setDayDialog({ date: day, tasks: dayTasks }); }}
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    +{hiddenCount} more
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      ))}

      {/* Day overflow dialog */}
      <Dialog open={!!dayDialog} onClose={() => setDayDialog(null)} maxWidth="xs" fullWidth>
        {dayDialog && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {format(dayDialog.date, 'EEEE, MMM d')} · {dayDialog.tasks.length} tasks
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={0.5}>
                {dayDialog.tasks.map(t => (
                  <Box key={t._id} onClick={() => { setDayDialog(null); onTaskClick(t); }}>
                    {renderTaskChip(t)}
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Button
                fullWidth
                size="small"
                startIcon={<AddTaskIcon />}
                onClick={() => { const d = dayDialog.date; setDayDialog(null); onCreateForDay(d); }}
              >
                New task on this day
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDayDialog(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default TaskCalendar;
