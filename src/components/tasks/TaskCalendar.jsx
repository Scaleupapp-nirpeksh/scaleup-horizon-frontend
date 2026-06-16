// src/components/tasks/TaskCalendar.jsx
// Month calendar of tasks by due date. Every day cell is strictly equal
// width; tasks render as a collapsed summary (priority dot + key) that
// opens a day popup with the full list. Clicking the empty area of a day
// offers to create a task due that day.
import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Stack, IconButton, Tooltip, useTheme,
  alpha, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, Chip,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AddTaskIcon from '@mui/icons-material/AddTask';
import BoltIcon from '@mui/icons-material/Bolt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  format, isSameMonth, isToday, isBefore, startOfDay, differenceInCalendarDays
} from 'date-fns';
import { epicColor, epicPrefix } from '../../utils/epicTag';

const PRIORITY_COLORS = {
  critical: '#f44336',
  high: '#ff9800',
  medium: '#2196f3',
  low: '#4caf50',
};


// Days-left treatment shared with the board/detail panels: color-coded by how
// soon a task is due so the user knows what to accelerate.
const daysLeft = (dueValue, theme) => {
  if (!dueValue) return null;
  const due = new Date(dueValue);
  if (isNaN(due.getTime())) return null;
  const n = differenceInCalendarDays(startOfDay(due), startOfDay(new Date()));
  const C = theme.palette;
  if (n < 0) return { n, label: `${Math.abs(n)}d overdue`, color: C.error.main, urgent: true };
  if (n === 0) return { n, label: 'Due today', color: C.error.main, urgent: true };
  if (n === 1) return { n, label: 'Due tomorrow', color: C.warning.main, urgent: true };
  if (n <= 3) return { n, label: `${n}d left`, color: C.warning.main, urgent: true };
  if (n <= 7) return { n, label: `${n}d left`, color: C.text.secondary, urgent: false };
  return { n, label: `${n}d left`, color: C.success.main, urgent: false };
};

// Equal columns no matter how wide the content is — minmax(0, 1fr) stops
// chip text from inflating its track
const GRID_7 = { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' };
const MAX_COMPACT_ROWS = 3;

const TaskCalendar = ({ tasks = [], onTaskClick, onCreateForDay, showEpicPrefix = false }) => {
  const theme = useTheme();
  const [cursor, setCursor] = useState(new Date());
  const [dayDialog, setDayDialog] = useState(null); // { date, tasks, mode }
  // What each day cell plots: 'due' (deadlines), 'start' (start dates), or
  // 'both' (deadlines in the cell + a ▶ marker on days work starts).
  const [viewMode, setViewMode] = useState('both');
  const START_COLOR = theme.palette.success.main;

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

  // Index start dates so the calendar shows each task's working window, not
  // just its deadline. A day a task *starts* gets a hollow marker.
  const startsByDay = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (!t.startDate || ['completed', 'cancelled'].includes(t.status)) return;
      const d = new Date(t.startDate);
      if (isNaN(d.getTime())) return;
      const key = format(d, 'yyyy-MM-dd');
      (map[key] = map[key] || []).push(t);
    });
    return map;
  }, [tasks]);

  // The single most-urgent open deadline + an overdue count — the "what should
  // I accelerate right now" strip above the grid.
  const deadlineSummary = useMemo(() => {
    const open = tasks.filter(t => t.dueDate && !['completed', 'cancelled'].includes(t.status));
    if (!open.length) return null;
    const today = startOfDay(new Date());
    let overdue = 0;
    let next = null;
    open.forEach(t => {
      const due = startOfDay(new Date(t.dueDate));
      if (isNaN(due.getTime())) return;
      if (isBefore(due, today)) overdue += 1;
      if (!isBefore(due, today) && (!next || due < startOfDay(new Date(next.dueDate)))) next = t;
    });
    return { overdue, next };
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

  // Full task row — used inside the day popup only. In 'start' mode it shows
  // a green "Starts <date>" chip; otherwise the due-date countdown.
  const renderTaskRow = (task, mode = 'due') => {
    const dl = isClosed(task) ? null : daysLeft(task.dueDate, theme);
    const startChip = mode === 'start' && task.startDate
      ? { label: `Starts ${format(new Date(task.startDate), 'MMM d')}`, color: START_COLOR }
      : null;
    return (
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
        {showEpicPrefix && epicPrefix(task) && (
          <Tooltip title={task.parentTask?.title || ''}>
            <Box sx={{
              flexShrink: 0, fontSize: '0.6rem', fontWeight: 800, lineHeight: 1.6,
              px: 0.5, borderRadius: 0.5, letterSpacing: 0.3, color: '#fff',
              bgcolor: epicColor(task.parentTask?._id),
            }}>
              {epicPrefix(task)}
            </Box>
          </Tooltip>
        )}
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
            flexGrow: 1,
            minWidth: 0,
            color: isOverdue(task) ? 'error.main' : 'text.primary',
            textDecoration: isClosed(task) ? 'line-through' : 'none',
            opacity: isClosed(task) ? 0.6 : 1,
          }}
        >
          {task.title}
        </Typography>
        {startChip ? (
          <Chip
            size="small"
            label={startChip.label}
            sx={{
              flexShrink: 0, fontWeight: 700, height: 20, fontSize: '0.66rem',
              bgcolor: alpha(startChip.color, 0.15), color: startChip.color,
            }}
          />
        ) : dl && (
          <Chip
            size="small"
            label={dl.label}
            sx={{
              flexShrink: 0, fontWeight: 700, height: 20, fontSize: '0.66rem',
              bgcolor: alpha(dl.color, 0.15), color: dl.color,
            }}
          />
        )}
      </Box>
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

      {/* View toggle (due / start / both) + legend */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        useFlexGap
        flexWrap="wrap"
        spacing={1}
        sx={{ px: 2, pb: 1.5 }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={viewMode}
          onChange={(e, v) => { if (v) setViewMode(v); }}
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 1.5, py: 0.4, fontWeight: 700, fontSize: '0.75rem' } }}
        >
          <ToggleButton value="due">
            <EventAvailableIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Due dates
          </ToggleButton>
          <ToggleButton value="start">
            <PlayCircleOutlineIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Start dates
          </ToggleButton>
          <ToggleButton value="both">Both</ToggleButton>
        </ToggleButtonGroup>

        {/* Legend */}
        <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
          {viewMode !== 'start' && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
              <Typography variant="caption" color="text.secondary">Due date</Typography>
            </Stack>
          )}
          {viewMode !== 'due' && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ color: START_COLOR, fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>▶</Box>
              <Typography variant="caption" color="text.secondary">Start date</Typography>
            </Stack>
          )}
          {viewMode !== 'start' && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
              <Typography variant="caption" color="text.secondary">Overdue</Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* Deadline pressure strip — overdue count + the next thing to accelerate */}
      {viewMode !== 'start' && deadlineSummary && (deadlineSummary.overdue > 0 || deadlineSummary.next) && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
          sx={{
            px: 2, py: 1.25, mx: 2, mb: 0.5,
            borderRadius: 2,
            bgcolor: deadlineSummary.overdue > 0
              ? alpha(theme.palette.error.main, 0.06)
              : alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${deadlineSummary.overdue > 0
              ? alpha(theme.palette.error.main, 0.2)
              : alpha(theme.palette.primary.main, 0.12)}`,
          }}
        >
          {deadlineSummary.overdue > 0 && (
            <Chip
              size="small"
              icon={<WarningAmberIcon sx={{ fontSize: '0.95rem !important' }} />}
              label={`${deadlineSummary.overdue} overdue`}
              sx={{
                fontWeight: 700, height: 24,
                bgcolor: alpha(theme.palette.error.main, 0.14),
                color: theme.palette.error.main,
                '& .MuiChip-icon': { color: theme.palette.error.main },
              }}
            />
          )}
          {deadlineSummary.next && (() => {
            const dl = daysLeft(deadlineSummary.next.dueDate, theme);
            return (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                onClick={() => onTaskClick(deadlineSummary.next)}
                sx={{ cursor: 'pointer', minWidth: 0 }}
              >
                <BoltIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>
                  Up next
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}
                >
                  {deadlineSummary.next.taskKey}
                </Typography>
                <Typography variant="body2" noWrap sx={{ minWidth: 0, color: 'text.primary' }}>
                  {deadlineSummary.next.title}
                </Typography>
                {dl && (
                  <Chip
                    size="small"
                    label={dl.label}
                    sx={{
                      flexShrink: 0, fontWeight: 700, height: 22, fontSize: '0.7rem',
                      bgcolor: alpha(dl.color, 0.15), color: dl.color,
                    }}
                  />
                )}
              </Stack>
            );
          })()}
        </Stack>
      )}

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
            const dayStarts = startsByDay[key] || [];
            const inMonth = isSameMonth(day, cursor);
            // What this cell plots in its body, and whether to show the ▶ marker.
            const startView = viewMode === 'start';
            const bodyTasks = startView ? dayStarts : dayTasks;
            const showStartMarker = viewMode === 'both' && dayStarts.length > 0;
            const compact = bodyTasks.slice(0, MAX_COMPACT_ROWS);
            const hiddenCount = bodyTasks.length - compact.length;
            const anyOverdue = !startView && dayTasks.some(isOverdue);
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
                  {showStartMarker && (
                    <Tooltip title={`${dayStarts.length} task${dayStarts.length === 1 ? '' : 's'} start${dayStarts.length === 1 ? 's' : ''} this day`}>
                      <Stack
                        direction="row"
                        spacing={0.25}
                        alignItems="center"
                        sx={{ color: 'success.main' }}
                      >
                        <Box sx={{ fontSize: '0.6rem', lineHeight: 1, fontWeight: 700 }}>▶</Box>
                        {dayStarts.length > 1 && (
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 700 }}>
                            {dayStarts.length}
                          </Typography>
                        )}
                      </Stack>
                    </Tooltip>
                  )}
                </Stack>

                {/* Collapsed task summary — click opens the day popup */}
                {bodyTasks.length > 0 && (
                  <Tooltip title={`${bodyTasks.length} task${bodyTasks.length === 1 ? '' : 's'} ${startView ? 'starting' : 'due'} — click to view`}>
                    <Box
                      onClick={(e) => { e.stopPropagation(); setDayDialog({ date: day, tasks: bodyTasks, mode: startView ? 'start' : 'due' }); }}
                      sx={{
                        borderRadius: 1,
                        p: 0.5,
                        bgcolor: startView
                          ? alpha(START_COLOR, 0.07)
                          : anyOverdue
                            ? alpha(theme.palette.error.main, 0.07)
                            : alpha(theme.palette.primary.main, 0.06),
                        border: `1px solid ${startView
                          ? alpha(START_COLOR, 0.25)
                          : anyOverdue
                            ? alpha(theme.palette.error.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.12)}`,
                        '&:hover': {
                          bgcolor: startView
                            ? alpha(START_COLOR, 0.13)
                            : anyOverdue
                              ? alpha(theme.palette.error.main, 0.12)
                              : alpha(theme.palette.primary.main, 0.12),
                        },
                      }}
                    >
                      {compact.map(t => {
                        const prefix = showEpicPrefix ? epicPrefix(t) : null;
                        return (
                        <Stack key={t._id} direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0, py: 0.1 }}>
                          {prefix ? (
                            <Tooltip title={t.parentTask?.title || ''}>
                              <Box sx={{
                                flexShrink: 0, fontSize: '0.58rem', fontWeight: 800, lineHeight: 1.5,
                                px: 0.4, borderRadius: 0.5, letterSpacing: 0.3, color: '#fff',
                                bgcolor: epicColor(t.parentTask?._id),
                                opacity: isClosed(t) ? 0.5 : 1,
                              }}>
                                {prefix}
                              </Box>
                            </Tooltip>
                          ) : (
                            <Box sx={{
                              width: 6, height: 6, flexShrink: 0, borderRadius: '50%',
                              bgcolor: startView ? START_COLOR : (isClosed(t) ? theme.palette.grey[400] : (PRIORITY_COLORS[t.priority] || theme.palette.grey[400])),
                            }} />
                          )}
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              minWidth: 0,
                              fontSize: '0.66rem',
                              fontFamily: 'ui-monospace, Menlo, monospace',
                              fontWeight: 700,
                              color: (!startView && isOverdue(t)) ? 'error.main' : 'text.secondary',
                              textDecoration: isClosed(t) ? 'line-through' : 'none',
                            }}
                          >
                            {t.taskKey || t.title}
                          </Typography>
                        </Stack>
                        );
                      })}
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
                {dayDialog.tasks.length} {dayDialog.mode === 'start' ? 'starting' : 'due'}
              </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 1.5 }}>
              <Stack spacing={0.25}>
                {dayDialog.tasks.map(t => renderTaskRow(t, dayDialog.mode))}
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
