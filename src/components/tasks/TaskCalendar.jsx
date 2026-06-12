// src/components/tasks/TaskCalendar.jsx
// Month calendar of tasks by due date. Every day cell is strictly equal
// width; tasks render as a collapsed summary (priority dot + key) that
// opens a day popup with the full list. Clicking the empty area of a day
// offers to create a task due that day.
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

// Equal columns no matter how wide the content is — minmax(0, 1fr) stops
// chip text from inflating its track
const GRID_7 = { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' };
const MAX_COMPACT_ROWS = 3;

const TaskCalendar = ({ tasks = [], onTaskClick, onCreateForDay }) => {
  const theme = useTheme();
  const [cursor, setCursor] = useState(new Date());
  const [dayDialog, setDayDialog] = useState(null); // { date, tasks }

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
  const isClosed = (t) => ['completed', 'cancelled'].includes(t.status);
  const isOverdue = (t) => !isClosed(t) && t.dueDate && isBefore(new Date(t.dueDate), today);

  // Full task row — used inside the day popup only
  const renderTaskRow = (task) => (
    <Box
      key={task._id}
      onClick={() => { setDayDialog(null); onTaskClick(task); }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        cursor: 'pointer',
        bgcolor: isOverdue(task) ? alpha(theme.palette.error.main, 0.06) : 'transparent',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
      }}
    >
      <Box sx={{
        width: 8, height: 8, flexShrink: 0, borderRadius: '50%',
        bgcolor: isClosed(task) ? theme.palette.grey[400] : (PRIORITY_COLORS[task.priority] || theme.palette.grey[400]),
      }} />
      <Typography
        variant="caption"
        sx={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}
      >
        {task.taskKey}
      </Typography>
      <Typography
        variant="body2"
        noWrap
        sx={{
          minWidth: 0,
          color: isOverdue(task) ? 'error.main' : 'text.primary',
          textDecoration: isClosed(task) ? 'line-through' : 'none',
          opacity: isClosed(task) ? 0.6 : 1,
        }}
      >
        {task.title}
      </Typography>
    </Box>
  );

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
      <Box sx={{ ...GRID_7, borderTop: 1, borderColor: 'divider' }}>
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
        <Box key={wi} sx={GRID_7}>
          {week.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDay[key] || [];
            const inMonth = isSameMonth(day, cursor);
            const compact = dayTasks.slice(0, MAX_COMPACT_ROWS);
            const hiddenCount = dayTasks.length - compact.length;
            const anyOverdue = dayTasks.some(isOverdue);
            return (
              <Box
                key={key}
                onClick={() => onCreateForDay(day)}
                sx={{
                  minWidth: 0,
                  overflow: 'hidden',
                  minHeight: 104,
                  p: 0.75,
                  borderTop: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',
                  bgcolor: isToday(day)
                    ? alpha(theme.palette.primary.main, 0.05)
                    : inMonth ? 'background.paper' : alpha(theme.palette.action.hover, 0.4),
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.07) },
                  '&:nth-of-type(7n)': { borderRight: 0 },
                }}
              >
                <Stack direction="row" justifyContent="flex-start" sx={{ mb: 0.5 }}>
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
                </Stack>

                {/* Collapsed task summary — click opens the day popup */}
                {dayTasks.length > 0 && (
                  <Tooltip title={`${dayTasks.length} task${dayTasks.length === 1 ? '' : 's'} — click to view`}>
                    <Box
                      onClick={(e) => { e.stopPropagation(); setDayDialog({ date: day, tasks: dayTasks }); }}
                      sx={{
                        borderRadius: 1,
                        p: 0.5,
                        bgcolor: anyOverdue
                          ? alpha(theme.palette.error.main, 0.07)
                          : alpha(theme.palette.primary.main, 0.06),
                        border: `1px solid ${anyOverdue
                          ? alpha(theme.palette.error.main, 0.2)
                          : alpha(theme.palette.primary.main, 0.12)}`,
                        '&:hover': {
                          bgcolor: anyOverdue
                            ? alpha(theme.palette.error.main, 0.12)
                            : alpha(theme.palette.primary.main, 0.12),
                        },
                      }}
                    >
                      {compact.map(t => (
                        <Stack key={t._id} direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0, py: 0.1 }}>
                          <Box sx={{
                            width: 6, height: 6, flexShrink: 0, borderRadius: '50%',
                            bgcolor: isClosed(t) ? theme.palette.grey[400] : (PRIORITY_COLORS[t.priority] || theme.palette.grey[400]),
                          }} />
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              minWidth: 0,
                              fontSize: '0.66rem',
                              fontFamily: 'ui-monospace, Menlo, monospace',
                              fontWeight: 700,
                              color: isOverdue(t) ? 'error.main' : 'text.secondary',
                              textDecoration: isClosed(t) ? 'line-through' : 'none',
                            }}
                          >
                            {t.taskKey || t.title}
                          </Typography>
                        </Stack>
                      ))}
                      {hiddenCount > 0 && (
                        <Typography variant="caption" sx={{ fontSize: '0.64rem', fontWeight: 700, color: 'primary.main', pl: 1 }}>
                          +{hiddenCount} more
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                )}
              </Box>
            );
          })}
        </Box>
      ))}

      {/* Day popup: full task list */}
      <Dialog open={!!dayDialog} onClose={() => setDayDialog(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        {dayDialog && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {format(dayDialog.date, 'EEEE, MMM d')}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                {dayDialog.tasks.length} task{dayDialog.tasks.length === 1 ? '' : 's'}
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 1.5 }}>
              <Stack spacing={0.25}>
                {dayDialog.tasks.map(renderTaskRow)}
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
