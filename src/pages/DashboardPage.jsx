// src/pages/DashboardPage.jsx
// "Today" — the founder command center. One backend call
// (/dashboard/command-center) supplies everything; sections render honest
// empty states with setup CTAs instead of zero-filled metrics.
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container, Grid, Paper, Typography, Box, Stack, useTheme, alpha,
  Skeleton, Button, Chip, Avatar, Card, CardContent, CardActionArea,
  LinearProgress, Tooltip, IconButton, Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';

// Icons
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';
import AddTaskIcon from '@mui/icons-material/AddTask';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';

import { getCommandCenter } from '../services/api';

// ---------- styled ----------
const Page = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  paddingBottom: theme.spacing(6),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)'
    : 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
}));

const SectionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  background: theme.palette.background.paper,
  transition: 'all 0.25s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    borderColor: alpha(theme.palette.primary.main, 0.25),
  },
}));

const AttentionRow = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(1.25, 1.5),
  borderRadius: theme.spacing(1.5),
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': { background: alpha(theme.palette.primary.main, 0.06), transform: 'translateX(3px)' },
}));

// ---------- helpers ----------
const formatINR = (value) => {
  if (!value && value !== 0) return '₹0';
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

const dueLabel = (dueDate) => {
  const d = new Date(dueDate);
  if (isNaN(d)) return '';
  if (isToday(d)) return 'today';
  if (isTomorrow(d)) return 'tomorrow';
  return format(d, 'EEE, MMM d');
};

// Trim the import suffix for compact business cards
const epicShortName = (title) => String(title).replace(/\s*[—-]\s*5-Month Plan.*$/i, '');

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await getCommandCenter();
      setData(res.data);
      setUpdatedAt(new Date());
      setError('');
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Could not load the dashboard. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openTask = (task) => navigate(`/tasks?task=${task._id || task}`);
  const openEpic = (epicId) => navigate(`/tasks?epic=${epicId}`);

  // ---------- attention list (notifications + overdue + alerts) ----------
  const attentionItems = [];
  if (data) {
    data.attention.forEach(a => attentionItems.push({
      key: `alert-${a.type}-${a.title}`,
      icon: <WarningAmberIcon color={a.severity === 'error' ? 'error' : 'warning'} />,
      primary: a.title,
      secondary: null,
      onClick: () => navigate(a.link),
    }));
    data.tasks.overdue.forEach(t => attentionItems.push({
      key: `overdue-${t._id}`,
      icon: <AccessTimeIcon color="error" />,
      primary: `${t.taskKey ? t.taskKey + ' — ' : ''}${t.title}`,
      secondary: `overdue since ${format(new Date(t.dueDate), 'MMM d')}`
        + (t.parentTask ? ` · ${epicShortName(t.parentTask.title)}` : ''),
      onClick: () => openTask(t),
    }));
    data.tasks.dueSoon.forEach(t => attentionItems.push({
      key: `due-${t._id}`,
      icon: <AccessTimeIcon color="warning" />,
      primary: `${t.taskKey ? t.taskKey + ' — ' : ''}${t.title}`,
      secondary: `due ${dueLabel(t.dueDate)}`
        + (t.parentTask ? ` · ${epicShortName(t.parentTask.title)}` : ''),
      onClick: () => openTask(t),
    }));
    data.notifications.recent.forEach(n => attentionItems.push({
      key: `notif-${n._id}`,
      icon: <NotificationsActiveIcon color="primary" />,
      primary: n.title,
      secondary: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
      onClick: () => n.relatedTask ? openTask(n.relatedTask._id || n.relatedTask) : navigate('/tasks'),
    }));
  }

  // ---------- week grouping ----------
  const weekGroups = {};
  if (data) {
    data.tasks.dueThisWeek.forEach(t => {
      const day = dueLabel(t.dueDate);
      (weekGroups[day] = weekGroups[day] || []).push(t);
    });
  }

  const businesses = (data?.portfolio || []).filter(e => !e.hasEpicChildren);
  const setup = data?.setup || {};
  const setupSteps = [
    { done: setup.tasks, label: 'Create tasks & epics', link: '/tasks' },
    { done: setup.bankAccounts, label: 'Add bank accounts', link: '/financials' },
    { done: setup.expenses, label: 'Record expenses', link: '/financials' },
    { done: setup.revenue, label: 'Record revenue', link: '/financials' },
    { done: setup.team, label: 'Add your team', link: '/headcount' },
    { done: setup.kpis, label: 'Log a KPI snapshot', link: '/kpis' },
    { done: setup.fundraising, label: 'Set up fundraising', link: '/fundraising' },
  ];
  const setupDone = setupSteps.filter(s => s.done).length;

  if (loading) {
    return (
      <Page>
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <Skeleton variant="text" width={300} height={48} />
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {[1, 2, 3].map(i => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
            <Grid size={{ xs: 12 }}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* ---------- Header ---------- */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {(() => {
                const h = new Date().getHours();
                const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
                return `${greeting}, ${user?.name?.split(' ')[0] || 'Founder'}`;
              })()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(), 'EEEE, MMMM d')}
              {updatedAt && ` · updated ${formatDistanceToNow(updatedAt, { addSuffix: true })}`}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<AddTaskIcon />} onClick={() => navigate('/tasks')} sx={{ borderRadius: 2 }}>
              New Task
            </Button>
            <IconButton onClick={() => fetchData(true)} disabled={refreshing}>
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Stack>
        </Stack>

        {error && (
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.06) }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {data && (
          <Grid container spacing={3}>
            {/* ---------- Needs your attention ---------- */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <SectionCard>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Needs your attention
                    </Typography>
                    {attentionItems.length > 0 && (
                      <Chip size="small" color="error" label={attentionItems.length} sx={{ fontWeight: 700 }} />
                    )}
                  </Stack>
                  {attentionItems.length === 0 ? (
                    <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
                      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 44 }} />
                      <Typography color="text.secondary">All clear — nothing overdue, no unread alerts.</Typography>
                    </Stack>
                  ) : (
                    <Stack divider={<Divider flexItem />} sx={{ maxHeight: 360, overflowY: 'auto' }}>
                      {attentionItems.slice(0, 12).map(item => (
                        <AttentionRow key={item.key} direction="row" spacing={1.5} alignItems="center" onClick={item.onClick}>
                          {item.icon}
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{item.primary}</Typography>
                            {item.secondary && (
                              <Typography variant="caption" color="text.secondary" noWrap display="block">
                                {item.secondary}
                              </Typography>
                            )}
                          </Box>
                          <NavigateNextIcon sx={{ opacity: 0.4 }} fontSize="small" />
                        </AttentionRow>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </SectionCard>
            </Grid>

            {/* ---------- This week ---------- */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <SectionCard>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarMonthIcon color="primary" fontSize="small" />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>This week</Typography>
                    </Stack>
                    <Tooltip title="Completed vs created, last 7 days">
                      <Chip
                        size="small"
                        icon={<SpeedIcon />}
                        label={`${data.tasks.velocity.completedLast7} done / ${data.tasks.velocity.createdLast7} new`}
                        variant="outlined"
                      />
                    </Tooltip>
                  </Stack>
                  {Object.keys(weekGroups).length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                      Nothing due in the next 7 days.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5} sx={{ maxHeight: 330, overflowY: 'auto' }}>
                      {Object.entries(weekGroups).map(([day, tasks]) => (
                        <Box key={day}>
                          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                            {day} · {tasks.length}
                          </Typography>
                          {tasks.map(t => (
                            <AttentionRow key={t._id} direction="row" spacing={1} alignItems="center" onClick={() => openTask(t)}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary', minWidth: 56 }}>
                                {t.taskKey}
                              </Typography>
                              <Typography variant="body2" noWrap sx={{ flex: 1 }}>{t.title}</Typography>
                              {t.assignee?.name && (
                                <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem' }}>{t.assignee.name[0]}</Avatar>
                              )}
                            </AttentionRow>
                          ))}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </SectionCard>
            </Grid>

            {/* ---------- Your businesses (portfolio strip) ---------- */}
            {businesses.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <AccountTreeIcon color="secondary" fontSize="small" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Your businesses</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {data.tasks.openCount} open tasks across {businesses.length} epics
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  {businesses.map(epic => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={epic._id}>
                      <SectionCard>
                        <CardActionArea onClick={() => openEpic(epic._id)} sx={{ height: '100%' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack spacing={1}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#9c27b0' }}>
                                  {epic.taskKey}
                                </Typography>
                                {epic.discussionDay && (
                                  <Tooltip title={`Weekly discussion: ${epic.discussionDay}`}>
                                    <Chip
                                      icon={<EventRepeatIcon sx={{ fontSize: '0.7rem' }} />}
                                      label={epic.discussionDay.slice(0, 3)}
                                      size="small"
                                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                                    />
                                  </Tooltip>
                                )}
                              </Stack>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.25, minHeight: 34 }}>
                                {epicShortName(epic.title)}
                              </Typography>
                              <Box>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="caption" color="text.secondary">
                                    {epic.childCompleted}/{epic.childTotal} done
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                    {epic.percentComplete}%
                                  </Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={epic.percentComplete}
                                  sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                                />
                              </Box>
                              <Stack direction="row" spacing={1}>
                                <Chip label={`${epic.childOpen} open`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                                {epic.childOverdue > 0 && (
                                  <Chip label={`${epic.childOverdue} overdue`} size="small" color="error" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                                )}
                              </Stack>
                            </Stack>
                          </CardContent>
                        </CardActionArea>
                      </SectionCard>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            {/* ---------- Money / Team / Fundraising / Growth ---------- */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SectionCard>
                <CardActionArea onClick={() => navigate('/financials')} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>MONEY</Typography>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', width: 36, height: 36 }}>
                        <AccountBalanceIcon fontSize="small" />
                      </Avatar>
                    </Stack>
                    {data.finance.hasData ? (
                      <Stack spacing={0.75}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{formatINR(data.finance.totalBalance)}</Typography>
                        <Typography variant="caption" color="text.secondary">in {data.finance.bankAccountCount} account{data.finance.bankAccountCount === 1 ? '' : 's'}</Typography>
                        <Divider sx={{ my: 0.5 }} />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Burn /mo</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatINR(data.finance.monthlyBurn)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Runway</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: data.finance.runwayMonths !== null && data.finance.runwayMonths < 6 ? 'error.main' : 'text.primary' }}>
                            {data.finance.runwayMonths !== null ? `${data.finance.runwayMonths} mo` : '—'}
                          </Typography>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={1} sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Add bank accounts and expenses to unlock burn &amp; runway.
                        </Typography>
                        <Chip label="Set up financials →" size="small" color="primary" variant="outlined" />
                      </Stack>
                    )}
                  </CardContent>
                </CardActionArea>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SectionCard>
                <CardActionArea onClick={() => navigate('/kpis')} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>GROWTH</Typography>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.12), color: 'success.main', width: 36, height: 36 }}>
                        <GroupsIcon fontSize="small" />
                      </Avatar>
                    </Stack>
                    {data.kpis.hasData ? (
                      <Stack spacing={0.75}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          {(data.kpis.latest.totalRegisteredUsers || 0).toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          total users · {format(new Date(data.kpis.latest.snapshotDate), 'MMM d')}
                        </Typography>
                        <Divider sx={{ my: 0.5 }} />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">DAU / MAU</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {(data.kpis.latest.dau || 0).toLocaleString()} / {(data.kpis.latest.mau || 0).toLocaleString()}
                          </Typography>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={1} sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Log your first KPI snapshot to see growth here.
                        </Typography>
                        <Chip label="Add KPI snapshot →" size="small" color="success" variant="outlined" />
                      </Stack>
                    )}
                  </CardContent>
                </CardActionArea>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SectionCard>
                <CardActionArea onClick={() => navigate('/fundraising')} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>FUNDRAISING</Typography>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.12), color: 'secondary.main', width: 36, height: 36 }}>
                        <BusinessCenterIcon fontSize="small" />
                      </Avatar>
                    </Stack>
                    {data.fundraising.hasData ? (
                      <Stack spacing={0.75}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{formatINR(data.fundraising.totalRaised)}</Typography>
                        <Typography variant="caption" color="text.secondary">raised across {data.fundraising.roundCount} round{data.fundraising.roundCount === 1 ? '' : 's'}</Typography>
                        <Divider sx={{ my: 0.5 }} />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            {data.fundraising.openRound ? `Open: ${data.fundraising.openRound.name}` : 'Investors'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {data.fundraising.openRound
                              ? formatINR(data.fundraising.openRound.targetAmount)
                              : data.fundraising.investorCount}
                          </Typography>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={1} sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Create a round to track investors and progress.
                        </Typography>
                        <Chip label="Set up fundraising →" size="small" color="secondary" variant="outlined" />
                      </Stack>
                    )}
                  </CardContent>
                </CardActionArea>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SectionCard>
                <CardActionArea onClick={() => navigate('/headcount')} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>TEAM</Typography>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), color: 'warning.main', width: 36, height: 36 }}>
                        <PeopleIcon fontSize="small" />
                      </Avatar>
                    </Stack>
                    {data.team.hasData ? (
                      <Stack spacing={0.75}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{data.team.active}</Typography>
                        <Typography variant="caption" color="text.secondary">active of {data.team.total} on record</Typography>
                        <Divider sx={{ my: 0.5 }} />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">Annual cost</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatINR(data.team.annualCost)}</Typography>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={1} sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Add teammates to track cost and structure.
                        </Typography>
                        <Chip label="Add team →" size="small" color="warning" variant="outlined" />
                      </Stack>
                    )}
                  </CardContent>
                </CardActionArea>
              </SectionCard>
            </Grid>

            {/* ---------- Setup progress (only while incomplete) ---------- */}
            {setupDone < setupSteps.length && (
              <Grid size={{ xs: 12 }}>
                <SectionCard>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Workspace setup · {setupDone}/{setupSteps.length}
                      </Typography>
                      <Box sx={{ width: 160 }}>
                        <LinearProgress variant="determinate" value={(setupDone / setupSteps.length) * 100} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
                      {setupSteps.map(step => (
                        <Chip
                          key={step.label}
                          icon={step.done ? <CheckCircleOutlineIcon /> : undefined}
                          label={step.label}
                          color={step.done ? 'success' : 'default'}
                          variant={step.done ? 'filled' : 'outlined'}
                          onClick={step.done ? undefined : () => navigate(step.link)}
                          clickable={!step.done}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </SectionCard>
              </Grid>
            )}

            {/* ---------- Quick actions ---------- */}
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" flexWrap="wrap" sx={{ gap: 1.5 }}>
                <Button variant="outlined" size="small" startIcon={<AddTaskIcon />} onClick={() => navigate('/tasks')} sx={{ borderRadius: 2 }}>New task</Button>
                <Button variant="outlined" size="small" startIcon={<UploadFileIcon />} onClick={() => navigate('/tasks')} sx={{ borderRadius: 2 }}>Import tasks</Button>
                <Button variant="outlined" size="small" startIcon={<AccountBalanceIcon />} onClick={() => navigate('/financials')} sx={{ borderRadius: 2 }}>Add expense</Button>
                <Button variant="outlined" size="small" startIcon={<GroupsIcon />} onClick={() => navigate('/kpis')} sx={{ borderRadius: 2 }}>Log KPIs</Button>
                <Button variant="outlined" size="small" startIcon={<BusinessCenterIcon />} onClick={() => navigate('/fundraising')} sx={{ borderRadius: 2 }}>Fundraising</Button>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Container>
    </Page>
  );
};

export default DashboardPage;
