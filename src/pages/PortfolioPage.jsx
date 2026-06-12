// src/pages/PortfolioPage.jsx
// Multi-venture portfolio: one card per business with task health, latest
// decision, last meeting and the next discussion day — the cross-business
// cockpit for founders running several ventures at once.
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Paper, Typography, Stack, Chip, Button, Grid,
  CircularProgress, Alert, LinearProgress, Divider, Tooltip, IconButton,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ForumIcon from '@mui/icons-material/Forum';
import GavelIcon from '@mui/icons-material/Gavel';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { getPortfolio } from '../services/api';

const safeDate = (d, fmt = 'd MMM') => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : format(dt, fmt);
};

const PortfolioPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPortfolio();
      setData(res.data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not load portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  const totals = data?.totals || {};
  const businesses = data?.businesses || [];

  const statChip = (label, value, color) => (
    <Box sx={{ textAlign: 'center', px: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, color: color || 'text.primary' }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Portfolio</Typography>
          <Typography variant="body2" color="text.secondary">
            All your ventures side by side — health, decisions and cadence.
          </Typography>
        </Box>
        <IconButton onClick={load}><RefreshIcon /></IconButton>
      </Stack>

      {error && <Alert severity="error" sx={{ my: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Summary strip */}
      <Paper variant="outlined" sx={{ p: 2, my: 2 }}>
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} justifyContent="space-around" flexWrap="wrap">
          {statChip('Businesses', totals.businesses || 0)}
          {statChip('Open tasks', totals.open || 0)}
          {statChip('Overdue', totals.overdue || 0, totals.overdue ? 'error.main' : 'success.main')}
          {statChip('Shipped (7d)', totals.completedLast7 || 0, 'success.main')}
          {statChip('Decisions (30d)', totals.decisionsLast30 || 0)}
        </Stack>
      </Paper>

      {businesses.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>No businesses yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create epics on the task board — each business epic becomes a portfolio card here.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/tasks')}>Open task board</Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {businesses.map(b => {
            const t = b.tasks;
            const discussionToday = b.nextDiscussion && isToday(new Date(b.nextDiscussion));
            return (
              <Grid key={b._id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.25, height: '100%', display: 'flex', flexDirection: 'column',
                    borderTop: 3,
                    borderTopColor: t.overdue > 0 ? 'error.main' : t.open > 0 ? 'primary.main' : 'success.main',
                  }}
                >
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{b.taskKey}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>{b.title}</Typography>
                    </Box>
                    {b.discussionDay && (
                      <Tooltip title={discussionToday ? 'Discussion day is today' : `Next: ${safeDate(b.nextDiscussion, 'EEE d MMM')}`}>
                        <Chip
                          size="small" icon={<EventIcon sx={{ fontSize: 14 }} />}
                          label={discussionToday ? 'Today' : b.discussionDay.slice(0, 3)}
                          color={discussionToday ? 'primary' : 'default'}
                          variant={discussionToday ? 'filled' : 'outlined'}
                        />
                      </Tooltip>
                    )}
                  </Stack>

                  {/* Progress */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <LinearProgress
                      variant="determinate" value={t.percentComplete}
                      sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 34 }}>{t.percentComplete}%</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                    {t.completed}/{t.total} done{t.completedLast7 ? ` · ${t.completedLast7} shipped this week` : ''}
                  </Typography>

                  {/* Health chips */}
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                    <Chip size="small" label={`${t.open} open`} variant="outlined" />
                    {t.overdue > 0 && <Chip size="small" label={`${t.overdue} overdue`} color="error" />}
                    {t.blocked > 0 && <Chip size="small" label={`${t.blocked} blocked`} color="warning" variant="outlined" />}
                    {t.stalled > 0 && <Chip size="small" label={`${t.stalled} stalled`} variant="outlined" />}
                    {t.dueThisWeek > 0 && <Chip size="small" label={`${t.dueThisWeek} due this week`} color="info" variant="outlined" />}
                    {t.total === 0 && <Chip size="small" label="No tasks yet" variant="outlined" />}
                  </Stack>

                  {/* Latest decision + last meeting */}
                  <Box sx={{ flex: 1 }}>
                    {b.latestDecision ? (
                      <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mb: 0.75 }}>
                        <GavelIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{b.latestDecision.decision}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {safeDate(b.latestDecision.decidedAt, 'd MMM')}
                            {b.decisionsLast30 > 1 ? ` · ${b.decisionsLast30} decisions in 30d` : ''}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
                        No decisions logged yet
                      </Typography>
                    )}
                    {b.lastMeeting && (
                      <Typography variant="caption" color="text.secondary">
                        Last discussed {formatDistanceToNow(new Date(b.lastMeeting.endedAt), { addSuffix: true })}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 1.25 }} />
                  <Stack direction="row" spacing={1}>
                    <Button size="small" startIcon={<ViewKanbanIcon />} onClick={() => navigate(`/tasks?epic=${b._id}`)}>
                      Board
                    </Button>
                    <Button size="small" startIcon={<ForumIcon />} onClick={() => navigate('/meetings')}>
                      Discuss
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default PortfolioPage;
