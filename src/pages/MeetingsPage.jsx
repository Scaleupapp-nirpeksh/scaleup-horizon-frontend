// src/pages/MeetingsPage.jsx
// Founder meeting mode: run the weekly business discussion against its epic
// board, capture notes/decisions/action-items live, end with an email recap.
// Second tab: the org-wide decision log.
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, Container, Paper, Typography, Button, Stack, Chip, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
  CircularProgress, Divider, Alert, Tabs, Tab, List, ListItemButton,
  ListItemText, FormControlLabel, Switch, Grid, Autocomplete,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import GavelIcon from '@mui/icons-material/Gavel';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HistoryIcon from '@mui/icons-material/History';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  startMeeting, getMeetings, getMeetingById, updateMeeting, addMeetingDecision,
  addFounderMeetingActionItem, endMeeting, getDecisions, createDecision, updateDecision,
  deleteDecision, getTasks, listOrganizationMembers,
} from '../services/api';

const safeDate = (d, fmt = 'd MMM yyyy, h:mm a') => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : format(dt, fmt);
};

const STATUS_COLOR = {
  todo: 'default', in_progress: 'info', in_review: 'secondary',
  blocked: 'error', completed: 'success', cancelled: 'default',
};

// ---------------------------------------------------------------- helpers

const groupBoardTasks = (tasks) => {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const week = new Date(now); week.setDate(week.getDate() + 7);
  const open = tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
  return {
    overdue: open.filter(t => t.dueDate && new Date(t.dueDate) < now),
    dueThisWeek: open.filter(t => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) < week),
    blocked: open.filter(t => t.status === 'blocked'),
    inProgress: open.filter(t => t.status === 'in_progress'),
    openCount: open.length,
  };
};

// ================================================================== page

const MeetingsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [liveMeeting, setLiveMeeting] = useState(null); // populated meeting doc
  const [liveDecisions, setLiveDecisions] = useState([]);
  const [history, setHistory] = useState([]);
  const [epics, setEpics] = useState([]);
  const [members, setMembers] = useState([]);

  // start dialog
  const [startOpen, setStartOpen] = useState(false);
  const [startEpic, setStartEpic] = useState(null);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [meetingsRes, epicsRes, membersRes] = await Promise.all([
        getMeetings({ limit: 30 }),
        getTasks({ taskType: 'epic', limit: 100 }),
        listOrganizationMembers().catch(() => ({ data: [] })),
      ]);
      const all = meetingsRes.data.meetings || [];
      const live = all.find(m => m.status === 'in_progress');
      setHistory(all.filter(m => m.status === 'ended'));
      setEpics(epicsRes.data.tasks || epicsRes.data || []);
      const mem = membersRes.data?.members || membersRes.data || [];
      setMembers(Array.isArray(mem) ? mem : []);
      if (live) {
        const full = await getMeetingById(live._id);
        setLiveMeeting(full.data.meeting);
        setLiveDecisions(full.data.decisions || []);
      } else {
        setLiveMeeting(null);
        setLiveDecisions([]);
      }
      setError('');
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not load meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStart = async () => {
    setStarting(true);
    try {
      await startMeeting(startEpic ? { epicId: startEpic._id } : {});
      setStartOpen(false);
      setStartEpic(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not start meeting');
      setStartOpen(false);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Meetings</Typography>
          <Typography variant="body2" color="text.secondary">
            Run your weekly business discussions, log decisions, and leave with action items.
          </Typography>
        </Box>
        {!liveMeeting && (
          <Button variant="contained" size="large" startIcon={<PlayArrowIcon />} onClick={() => setStartOpen(true)}>
            Start Meeting
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {liveMeeting ? (
        <LiveMeeting
          meeting={liveMeeting}
          decisions={liveDecisions}
          setDecisions={setLiveDecisions}
          members={members}
          onChanged={load}
          navigate={navigate}
        />
      ) : (
        <>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Past Meetings" />
            <Tab icon={<GavelIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Decision Log" />
          </Tabs>
          {tab === 0 && <MeetingHistory history={history} navigate={navigate} />}
          {tab === 1 && <DecisionLog epics={epics} />}
        </>
      )}

      {/* Start meeting dialog */}
      <Dialog open={startOpen} onClose={() => !starting && setStartOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Start a meeting</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Pick the business you are discussing — its board loads alongside your notes. Leave empty for an ad-hoc discussion.
            </Typography>
            <Autocomplete
              options={epics}
              getOptionLabel={(o) => `${o.taskKey ? o.taskKey + ' — ' : ''}${o.title}`}
              value={startEpic}
              onChange={(e, v) => setStartEpic(v)}
              renderInput={(params) => <TextField {...params} label="Business / epic (optional)" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartOpen(false)} disabled={starting}>Cancel</Button>
          <Button variant="contained" onClick={handleStart} disabled={starting} startIcon={<PlayArrowIcon />}>
            {starting ? 'Starting…' : 'Start'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// ============================================================ live meeting

const LiveMeeting = ({ meeting, decisions, setDecisions, members, onChanged, navigate }) => {
  const [notes, setNotes] = useState(meeting.notes || '');
  const [noteState, setNoteState] = useState('saved'); // saved | dirty | saving
  const saveTimer = useRef(null);

  const [boardTasks, setBoardTasks] = useState(null);
  const [decisionText, setDecisionText] = useState('');
  const [decisionWhy, setDecisionWhy] = useState('');
  const [savingDecision, setSavingDecision] = useState(false);

  const [aiTitle, setAiTitle] = useState('');
  const [aiAssignee, setAiAssignee] = useState('');
  const [aiDue, setAiDue] = useState('');
  const [savingAi, setSavingAi] = useState(false);
  const [actionItems, setActionItems] = useState(meeting.actionItems || []);

  const [endOpen, setEndOpen] = useState(false);
  const [sendRecap, setSendRecap] = useState(true);
  const [ending, setEnding] = useState(false);
  const [err, setErr] = useState('');

  // Board context for the chosen epic
  useEffect(() => {
    let alive = true;
    if (meeting.epic?._id) {
      getTasks({ parentTask: meeting.epic._id, limit: 300 })
        .then(res => { if (alive) setBoardTasks(res.data.tasks || []); })
        .catch(() => { if (alive) setBoardTasks([]); });
    }
    return () => { alive = false; };
  }, [meeting.epic]);

  // Debounced notes autosave
  const onNotesChange = (v) => {
    setNotes(v);
    setNoteState('dirty');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setNoteState('saving');
      try {
        await updateMeeting(meeting._id, { notes: v });
        setNoteState('saved');
      } catch {
        setNoteState('dirty');
      }
    }, 1200);
  };
  useEffect(() => () => saveTimer.current && clearTimeout(saveTimer.current), []);

  const logDecision = async () => {
    if (!decisionText.trim()) return;
    setSavingDecision(true);
    try {
      const res = await addMeetingDecision(meeting._id, { decision: decisionText.trim(), rationale: decisionWhy.trim() || undefined });
      setDecisions(prev => [...prev, res.data.decision]);
      setDecisionText('');
      setDecisionWhy('');
    } catch (e) {
      setErr(e.response?.data?.msg || 'Could not log decision');
    } finally {
      setSavingDecision(false);
    }
  };

  const addActionItem = async () => {
    if (!aiTitle.trim()) return;
    setSavingAi(true);
    try {
      const res = await addFounderMeetingActionItem(meeting._id, {
        title: aiTitle.trim(),
        assignee: aiAssignee || undefined,
        dueDate: aiDue || undefined,
      });
      setActionItems(prev => [...prev, res.data.task]);
      setAiTitle(''); setAiAssignee(''); setAiDue('');
    } catch (e) {
      setErr(e.response?.data?.msg || 'Could not create action item');
    } finally {
      setSavingAi(false);
    }
  };

  const handleEnd = async () => {
    setEnding(true);
    try {
      // flush unsaved notes before ending
      if (noteState !== 'saved') await updateMeeting(meeting._id, { notes });
      await endMeeting(meeting._id, { sendRecap });
      setEndOpen(false);
      await onChanged();
    } catch (e) {
      setErr(e.response?.data?.msg || 'Could not end meeting');
    } finally {
      setEnding(false);
    }
  };

  const groups = useMemo(() => boardTasks ? groupBoardTasks(boardTasks) : null, [boardTasks]);

  const taskRow = (t) => (
    <ListItemButton key={t._id} dense onClick={() => navigate(`/tasks?task=${t._id}`)} sx={{ borderRadius: 1 }}>
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, minWidth: 56 }}>{t.taskKey}</Typography>
            <Typography variant="body2" noWrap>{t.title}</Typography>
          </Stack>
        }
        secondary={t.dueDate ? `Due ${safeDate(t.dueDate, 'd MMM')}` : null}
      />
      <Chip size="small" label={t.status.replace('_', ' ')} color={STATUS_COLOR[t.status] || 'default'} variant="outlined" />
    </ListItemButton>
  );

  const boardSection = (label, items, emptyOk) => (
    (items.length > 0 || !emptyOk) && (
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="overline" color={label === 'OVERDUE' ? 'error.main' : 'text.secondary'} sx={{ fontWeight: 700 }}>
          {label} ({items.length})
        </Typography>
        {items.length ? <List dense disablePadding>{items.slice(0, 8).map(taskRow)}</List>
          : <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>None</Typography>}
      </Box>
    )
  );

  return (
    <Box>
      {/* Live header */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: 'primary.main', borderWidth: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="LIVE" color="error" size="small" sx={{ fontWeight: 700 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{meeting.title}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Started {formatDistanceToNow(new Date(meeting.startedAt), { addSuffix: true })}
              {' · '}{(meeting.attendees || []).map(a => a.name).join(', ')}
            </Typography>
          </Box>
          <Button variant="contained" color="error" startIcon={<StopIcon />} onClick={() => setEndOpen(true)}>
            End Meeting
          </Button>
        </Stack>
      </Paper>

      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Grid container spacing={2}>
        {/* Board context */}
        {meeting.epic && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {meeting.epic.taskKey} board
                </Typography>
                <Tooltip title="Open full board">
                  <IconButton size="small" onClick={() => navigate(`/tasks?epic=${meeting.epic._id}`)}>
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              {!groups ? <CircularProgress size={22} /> : (
                <>
                  <Typography variant="caption" color="text.secondary">{groups.openCount} open tasks</Typography>
                  <Divider sx={{ my: 1 }} />
                  {boardSection('OVERDUE', groups.overdue, false)}
                  {boardSection('BLOCKED', groups.blocked, true)}
                  {boardSection('DUE THIS WEEK', groups.dueThisWeek, false)}
                  {boardSection('IN PROGRESS', groups.inProgress, true)}
                </>
              )}
            </Paper>
          </Grid>
        )}

        {/* Notes + decisions + action items */}
        <Grid size={{ xs: 12, md: meeting.epic ? 7 : 12 }}>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notes</Typography>
                <Typography variant="caption" color={noteState === 'saved' ? 'success.main' : 'text.secondary'}>
                  {noteState === 'saved' ? 'Saved' : noteState === 'saving' ? 'Saving…' : 'Unsaved changes'}
                </Typography>
              </Stack>
              <TextField
                multiline minRows={6} maxRows={16} fullWidth placeholder="Capture the discussion as it happens…"
                value={notes} onChange={(e) => onNotesChange(e.target.value)}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                <GavelIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Decisions ({decisions.length})
              </Typography>
              {decisions.map(d => (
                <Box key={d._id} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1.5, py: 0.5, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.decision}</Typography>
                  {d.rationale && <Typography variant="caption" color="text.secondary">{d.rationale}</Typography>}
                </Box>
              ))}
              <Stack spacing={1} sx={{ mt: 1 }}>
                <TextField
                  size="small" fullWidth placeholder="What did you decide?"
                  value={decisionText} onChange={(e) => setDecisionText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); logDecision(); } }}
                />
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small" fullWidth placeholder="Why? (optional)"
                    value={decisionWhy} onChange={(e) => setDecisionWhy(e.target.value)}
                  />
                  <Button variant="outlined" onClick={logDecision} disabled={savingDecision || !decisionText.trim()}>Log</Button>
                </Stack>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                <TaskAltIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Action items ({actionItems.length})
              </Typography>
              {actionItems.map(t => (
                <Stack key={t._id} direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, minWidth: 56 }}>{t.taskKey}</Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>{t.title}</Typography>
                  {t.assignee && <Chip size="small" label={t.assignee.name} variant="outlined" />}
                  {t.dueDate && <Typography variant="caption" color="text.secondary">{safeDate(t.dueDate, 'd MMM')}</Typography>}
                </Stack>
              ))}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                <TextField
                  size="small" fullWidth placeholder="New action item…"
                  value={aiTitle} onChange={(e) => setAiTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addActionItem(); } }}
                />
                <TextField
                  size="small" select value={aiAssignee} onChange={(e) => setAiAssignee(e.target.value)}
                  sx={{ minWidth: 140 }} label="Assignee"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {members.map(m => (
                    <MenuItem key={m.userId || m._id} value={m.userId || m._id}>{m.name}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small" type="date" value={aiDue} onChange={(e) => setAiDue(e.target.value)}
                  InputLabelProps={{ shrink: true }} label="Due"
                />
                <Button variant="outlined" startIcon={<AddIcon />} onClick={addActionItem} disabled={savingAi || !aiTitle.trim()}>
                  Add
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* End meeting dialog */}
      <Dialog open={endOpen} onClose={() => !ending && setEndOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>End meeting?</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {decisions.length} decision{decisions.length === 1 ? '' : 's'} · {actionItems.length} action item{actionItems.length === 1 ? '' : 's'} captured.
            </Typography>
            <FormControlLabel
              control={<Switch checked={sendRecap} onChange={(e) => setSendRecap(e.target.checked)} />}
              label={<Typography variant="body2">Email the recap to all attendees</Typography>}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndOpen(false)} disabled={ending}>Keep going</Button>
          <Button variant="contained" color="error" onClick={handleEnd} disabled={ending} startIcon={<StopIcon />}>
            {ending ? 'Ending…' : 'End meeting'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// =============================================================== history

const MeetingHistory = ({ history, navigate }) => {
  const [detail, setDetail] = useState(null); // { meeting, decisions }
  const [loadingId, setLoadingId] = useState(null);

  const openDetail = async (m) => {
    setLoadingId(m._id);
    try {
      const res = await getMeetingById(m._id);
      setDetail(res.data);
    } finally {
      setLoadingId(null);
    }
  };

  if (!history.length) {
    return (
      <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>No meetings yet</Typography>
        <Typography variant="body2" color="text.secondary">
          Start your first discussion — notes, decisions and action items all get captured in one place.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Stack spacing={1.5}>
        {history.map(m => (
          <Paper key={m._id} variant="outlined" sx={{ p: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => openDetail(m)}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{m.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {safeDate(m.startedAt)} · {(m.attendees || []).map(a => a.name).join(', ')}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                {m.epic && <Chip size="small" label={m.epic.taskKey} variant="outlined" />}
                <Chip size="small" label={`${m.decisionCount} decision${m.decisionCount === 1 ? '' : 's'}`} color={m.decisionCount ? 'primary' : 'default'} variant="outlined" />
                <Chip size="small" label={`${(m.actionItems || []).length} action item${(m.actionItems || []).length === 1 ? '' : 's'}`} variant="outlined" />
                {loadingId === m._id && <CircularProgress size={16} />}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Detail dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle sx={{ pb: 0.5 }}>{detail.meeting.title}</DialogTitle>
            <DialogContent>
              <Typography variant="caption" color="text.secondary">
                {safeDate(detail.meeting.startedAt)} — {safeDate(detail.meeting.endedAt, 'h:mm a')}
                {detail.meeting.recapSentAt ? ' · recap emailed' : ''}
              </Typography>
              {detail.decisions.length > 0 && (
                <>
                  <Typography variant="overline" color="primary" sx={{ fontWeight: 700, display: 'block', mt: 2 }}>Decisions</Typography>
                  {detail.decisions.map(d => (
                    <Box key={d._id} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1.5, py: 0.5, mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.decision}</Typography>
                      {d.rationale && <Typography variant="caption" color="text.secondary">{d.rationale}</Typography>}
                    </Box>
                  ))}
                </>
              )}
              {(detail.meeting.actionItems || []).length > 0 && (
                <>
                  <Typography variant="overline" color="primary" sx={{ fontWeight: 700, display: 'block', mt: 1 }}>Action items</Typography>
                  {detail.meeting.actionItems.map(t => (
                    <Stack key={t._id} direction="row" spacing={1} alignItems="center" sx={{ py: 0.4, cursor: 'pointer' }} onClick={() => navigate(`/tasks?task=${t._id}`)}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, minWidth: 56 }}>{t.taskKey}</Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>{t.title}</Typography>
                      <Chip size="small" label={(t.status || '').replace('_', ' ')} color={STATUS_COLOR[t.status] || 'default'} variant="outlined" />
                    </Stack>
                  ))}
                </>
              )}
              {detail.meeting.notes && detail.meeting.notes.trim() && (
                <>
                  <Typography variant="overline" color="primary" sx={{ fontWeight: 700, display: 'block', mt: 1 }}>Notes</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detail.meeting.notes}</Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetail(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

// ============================================================ decision log

const DecisionLog = ({ epics }) => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEpic, setFilterEpic] = useState('');
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ decision: '', rationale: '', epicId: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterEpic) params.epicId = filterEpic;
      if (q.trim()) params.q = q.trim();
      const res = await getDecisions(params);
      setDecisions(res.data.decisions || []);
      setErr('');
    } catch (e) {
      setErr(e.response?.data?.msg || 'Could not load decisions');
    } finally {
      setLoading(false);
    }
  }, [filterEpic, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const handleAdd = async () => {
    if (!form.decision.trim()) return;
    setSaving(true);
    try {
      await createDecision({
        decision: form.decision.trim(),
        rationale: form.rationale.trim() || undefined,
        epicId: form.epicId || undefined,
      });
      setAddOpen(false);
      setForm({ decision: '', rationale: '', epicId: '' });
      await load();
    } catch (e) {
      setErr(e.response?.data?.msg || 'Could not log decision');
    } finally {
      setSaving(false);
    }
  };

  const handleSupersede = async (d) => {
    try {
      await updateDecision(d._id, { status: d.status === 'superseded' ? 'active' : 'superseded' });
      await load();
    } catch (e) {
      setErr(e.response?.data?.msg || 'Could not update decision');
    }
  };

  const handleDelete = async (d) => {
    if (!window.confirm('Delete this decision from the log? This cannot be undone.')) return;
    try {
      await deleteDecision(d._id);
      await load();
    } catch (e) {
      setErr(e.response?.data?.msg || 'Could not delete decision');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <TextField
          size="small" placeholder="Search decisions…" value={q} onChange={(e) => setQ(e.target.value)} sx={{ minWidth: 220 }}
        />
        <TextField
          size="small" select value={filterEpic} onChange={(e) => setFilterEpic(e.target.value)} sx={{ minWidth: 200 }} label="Business"
        >
          <MenuItem value="">All businesses</MenuItem>
          {epics.map(e => <MenuItem key={e._id} value={e._id}>{e.taskKey} — {e.title}</MenuItem>)}
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>Log Decision</Button>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : decisions.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>No decisions logged yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Decisions made in meetings land here automatically. You can also log one directly.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {decisions.map(d => (
            <Paper key={d._id} variant="outlined" sx={{ p: 1.5, opacity: d.status === 'superseded' ? 0.6 : 1 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, textDecoration: d.status === 'superseded' ? 'line-through' : 'none' }}>
                    {d.decision}
                  </Typography>
                  {d.rationale && <Typography variant="body2" color="text.secondary">{d.rationale}</Typography>}
                  <Typography variant="caption" color="text.secondary">
                    {safeDate(d.decidedAt, 'd MMM yyyy')}
                    {d.recordedBy ? ` · ${d.recordedBy.name}` : ''}
                    {d.meeting ? ` · from "${d.meeting.title}"` : ' · logged directly'}
                  </Typography>
                </Box>
                {d.epic && <Chip size="small" label={d.epic.taskKey} variant="outlined" />}
                {d.status === 'superseded' && <Chip size="small" label="Superseded" color="default" />}
                <Tooltip title={d.status === 'superseded' ? 'Reactivate' : 'Mark superseded'}>
                  <IconButton size="small" onClick={() => handleSupersede(d)}><GavelIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(d)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Add decision dialog */}
      <Dialog open={addOpen} onClose={() => !saving && setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log a decision</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Decision" required fullWidth autoFocus
              value={form.decision} onChange={(e) => setForm(f => ({ ...f, decision: e.target.value }))}
            />
            <TextField
              label="Why? (rationale)" fullWidth multiline minRows={2}
              value={form.rationale} onChange={(e) => setForm(f => ({ ...f, rationale: e.target.value }))}
            />
            <TextField
              label="Business (optional)" select fullWidth value={form.epicId}
              onChange={(e) => setForm(f => ({ ...f, epicId: e.target.value }))}
            >
              <MenuItem value="">None</MenuItem>
              {epics.map(e => <MenuItem key={e._id} value={e._id}>{e.taskKey} — {e.title}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={saving || !form.decision.trim()}>
            {saving ? 'Saving…' : 'Log decision'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingsPage;
