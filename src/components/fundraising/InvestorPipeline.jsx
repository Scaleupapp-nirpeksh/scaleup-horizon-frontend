// src/components/fundraising/InvestorPipeline.jsx
// Drag-and-drop investor pipeline (Lead → … → Invested) with follow-up
// dates and a per-investor interaction log in a side drawer.
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Stack, Chip, IconButton, Drawer,
  TextField, MenuItem, Button, Avatar, Tooltip, useTheme, alpha,
  CircularProgress, Snackbar, Alert
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import GroupsIcon from '@mui/icons-material/Groups';
import ChatIcon from '@mui/icons-material/Chat';
import NotesIcon from '@mui/icons-material/Notes';
import SendIcon from '@mui/icons-material/Send';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import { format, isBefore, startOfDay, formatDistanceToNow } from 'date-fns';
import {
  getInvestors, patchInvestorPipeline, addInvestorInteraction, createInvestorProspect
} from '../../services/api';

const STAGES = ['Lead', 'Contacted', 'Introduced', 'Pitched', 'Follow-up',
  'Negotiating', 'Soft Committed', 'Hard Committed', 'Invested'];
const PARKED = ['Declined', 'Passed', 'On Hold'];

const STAGE_COLORS = {
  Lead: '#9e9e9e', Contacted: '#64b5f6', Introduced: '#4fc3f7', Pitched: '#7e57c2',
  'Follow-up': '#ffb74d', Negotiating: '#ff8a65', 'Soft Committed': '#aed581',
  'Hard Committed': '#66bb6a', Invested: '#2e7d32',
};

const INTERACTION_ICONS = {
  call: <CallIcon fontSize="small" />,
  email: <EmailIcon fontSize="small" />,
  meeting: <GroupsIcon fontSize="small" />,
  whatsapp: <ChatIcon fontSize="small" />,
  note: <NotesIcon fontSize="small" />,
};

const fmtINR = (v) => {
  const abs = Math.abs(v || 0);
  if (abs >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${Math.round(v || 0).toLocaleString('en-IN')}`;
};

const InvestorPipeline = () => {
  const theme = useTheme();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState(null); // { type, text }

  // Drawer form state
  const [followUpDate, setFollowUpDate] = useState('');
  const [intType, setIntType] = useState('call');
  const [intSummary, setIntSummary] = useState('');
  const [saving, setSaving] = useState(false);

  // Quick-add prospect dialog
  const EMPTY_PROSPECT = {
    name: '', entityName: '', email: '', phone: '', investorType: 'Angel',
    source: '', expectedAmount: '', status: 'Lead', nextFollowUpDate: '',
  };
  const [prospectOpen, setProspectOpen] = useState(false);
  const [prospect, setProspect] = useState(EMPTY_PROSPECT);
  const [prospectSaving, setProspectSaving] = useState(false);

  const handleAddProspect = async () => {
    if (!prospect.name.trim()) return;
    setProspectSaving(true);
    try {
      await createInvestorProspect({
        ...prospect,
        expectedAmount: prospect.expectedAmount ? Number(prospect.expectedAmount) : undefined,
        nextFollowUpDate: prospect.nextFollowUpDate || undefined,
      });
      setMessage({ type: 'success', text: `${prospect.name.trim()} added to the pipeline` });
      setProspectOpen(false);
      setProspect(EMPTY_PROSPECT);
      fetchInvestors();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Could not add prospect' });
    } finally {
      setProspectSaving(false);
    }
  };

  const fetchInvestors = useCallback(async () => {
    try {
      const res = await getInvestors();
      setInvestors(res.data || []);
    } catch (err) {
      console.error('Error fetching investors:', err);
      setMessage({ type: 'error', text: 'Could not load investors' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvestors(); }, [fetchInvestors]);

  const openDrawer = (inv) => {
    setSelected(inv);
    setFollowUpDate(inv.nextFollowUpDate ? format(new Date(inv.nextFollowUpDate), 'yyyy-MM-dd') : '');
    setIntType('call');
    setIntSummary('');
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const id = result.draggableId;
    if (result.source.droppableId === newStatus) return;
    setInvestors(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
    try {
      await patchInvestorPipeline(id, { status: newStatus });
      setMessage({ type: 'success', text: `Moved to ${newStatus}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Could not move investor' });
      fetchInvestors();
    }
  };

  const handleStatusChange = async (inv, status) => {
    try {
      await patchInvestorPipeline(inv._id, { status });
      setSelected(prev => prev ? { ...prev, status } : prev);
      fetchInvestors();
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not update status' });
    }
  };

  const handleFollowUpSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await patchInvestorPipeline(selected._id, { nextFollowUpDate: followUpDate || null });
      setMessage({ type: 'success', text: followUpDate ? 'Follow-up scheduled' : 'Follow-up cleared' });
      setSelected(prev => prev ? { ...prev, nextFollowUpDate: followUpDate || null } : prev);
      fetchInvestors();
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not save follow-up date' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddInteraction = async () => {
    if (!selected || !intSummary.trim()) return;
    setSaving(true);
    try {
      const res = await addInvestorInteraction(selected._id, {
        type: intType,
        summary: intSummary.trim(),
        nextFollowUpDate: followUpDate || undefined,
      });
      setSelected(res.data.investor);
      setIntSummary('');
      setMessage({ type: 'success', text: 'Interaction logged' });
      fetchInvestors();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Could not log interaction' });
    } finally {
      setSaving(false);
    }
  };

  const today = startOfDay(new Date());
  const followUpChip = (inv) => {
    if (!inv.nextFollowUpDate) return null;
    const d = new Date(inv.nextFollowUpDate);
    const overdue = isBefore(d, today);
    return (
      <Chip
        icon={<AccessTimeIcon sx={{ fontSize: '0.75rem' }} />}
        label={format(d, 'MMM d')}
        size="small"
        color={overdue ? 'error' : 'default'}
        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
      />
    );
  };

  const parked = investors.filter(i => PARKED.includes(i.status));

  if (loading) {
    return <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress /></Stack>;
  }

  const active = investors.filter(i => !PARKED.includes(i.status));
  const totalExpected = active.filter(i => !['Invested'].includes(i.status))
    .reduce((s, i) => s + (i.expectedAmount || i.totalCommittedAmount || 0), 0);
  const totalCommitted = active.filter(i => ['Soft Committed', 'Hard Committed', 'Invested'].includes(i.status))
    .reduce((s, i) => s + (i.totalCommittedAmount || 0), 0);

  return (
    <Box>
      {/* Header: pipeline value + quick add */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 2, rowGap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {active.length} in pipeline
          {totalExpected > 0 && <> · <b>{fmtINR(totalExpected)}</b> in conversations</>}
          {totalCommitted > 0 && <> · <b>{fmtINR(totalCommitted)}</b> committed</>}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={() => setProspectOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Add Prospect
        </Button>
      </Stack>

      {investors.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No investors in your pipeline yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a prospect with just a name — deal terms can come later,
            when the conversation gets real.
          </Typography>
          <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={() => setProspectOpen(true)}>
            Add your first prospect
          </Button>
        </Paper>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ overflowX: 'auto', pb: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ minWidth: 'fit-content', alignItems: 'flex-start' }}>
              {STAGES.map(stage => {
                const stageInvestors = investors.filter(i => i.status === stage);
                return (
                  <Droppable droppableId={stage} key={stage}>
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          width: 210,
                          flexShrink: 0,
                          p: 1.25,
                          borderRadius: 2,
                          minHeight: 160,
                          bgcolor: snapshot.isDraggingOver
                            ? alpha(theme.palette.primary.main, 0.05)
                            : alpha(theme.palette.background.paper, 0.9),
                          border: `1px solid ${snapshot.isDraggingOver ? theme.palette.primary.main : alpha(theme.palette.divider, 0.4)}`,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STAGE_COLORS[stage] }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
                              {stage}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.disabled">{stageInvestors.length}</Typography>
                        </Stack>
                        {stageInvestors.map((inv, index) => (
                          <Draggable draggableId={inv._id} index={index} key={inv._id}>
                            {(prov, snap) => (
                              <Paper
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                onClick={() => openDrawer(inv)}
                                elevation={snap.isDragging ? 6 : 0}
                                sx={{
                                  p: 1.25,
                                  mb: 1,
                                  borderRadius: 1.5,
                                  cursor: 'grab',
                                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                  borderLeft: `3px solid ${STAGE_COLORS[stage]}`,
                                  '&:hover': { borderColor: theme.palette.primary.main },
                                  ...prov.draggableProps.style && {},
                                }}
                                style={prov.draggableProps.style}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                  {inv.name}
                                </Typography>
                                {inv.entityName && (
                                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                                    {inv.entityName}
                                  </Typography>
                                )}
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.75 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    {inv.totalCommittedAmount
                                      ? fmtINR(inv.totalCommittedAmount)
                                      : inv.expectedAmount
                                        ? `~${fmtINR(inv.expectedAmount)}`
                                        : '—'}
                                  </Typography>
                                  {followUpChip(inv)}
                                </Stack>
                              </Paper>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Paper>
                    )}
                  </Droppable>
                );
              })}
            </Stack>
          </Box>
        </DragDropContext>
      )}

      {/* Parked investors */}
      {parked.length > 0 && (
        <Paper sx={{ mt: 2, p: 2, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary' }}>
            PARKED — DECLINED / PASSED / ON HOLD ({parked.length})
          </Typography>
          <Stack direction="row" flexWrap="wrap" sx={{ gap: 1, mt: 1 }}>
            {parked.map(inv => (
              <Chip
                key={inv._id}
                label={`${inv.name} · ${inv.status}`}
                onClick={() => openDrawer(inv)}
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Investor drawer */}
      <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0 } }}>
        {selected && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{selected.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[selected.entityName, selected.email, selected.phone].filter(Boolean).join(' · ') || 'No contact details'}
                  </Typography>
                </Box>
                <IconButton onClick={() => setSelected(null)}><CloseIcon /></IconButton>
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }} alignItems="center">
                <TextField
                  select size="small" label="Stage" value={selected.status}
                  onChange={(e) => handleStatusChange(selected, e.target.value)}
                  sx={{ minWidth: 170 }}
                >
                  {[...STAGES, ...PARKED].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
                <Typography variant="body2" color="text.secondary">
                  {selected.totalCommittedAmount ? `${fmtINR(selected.totalCommittedAmount)} committed` : ''}
                  {selected.totalReceivedAmount ? ` · ${fmtINR(selected.totalReceivedAmount)} received` : ''}
                  {!selected.totalCommittedAmount && selected.expectedAmount ? `~${fmtINR(selected.expectedAmount)} expected` : ''}
                </Typography>
              </Stack>
              {!selected.roundId && (
                <Chip
                  size="small"
                  variant="outlined"
                  color="warning"
                  label="Prospect — attach a round & deal terms (Investors tab) before marking Invested"
                  sx={{ mt: 1.5, height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 } }}
                />
              )}
              {selected.source && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Source: {selected.source}
                </Typography>
              )}
            </Box>

            <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary' }}>
                NEXT FOLLOW-UP
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField
                  type="date" size="small" value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button size="small" variant="outlined" onClick={handleFollowUpSave} disabled={saving}>
                  Save
                </Button>
              </Stack>
              {selected.lastContactedAt && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  Last contact {formatDistanceToNow(new Date(selected.lastContactedAt), { addSuffix: true })}
                </Typography>
              )}
            </Box>

            <Box sx={{ p: 2.5, flex: 1, overflowY: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary' }}>
                LOG AN INTERACTION
              </Typography>
              <Stack spacing={1} sx={{ mt: 1, mb: 2.5 }}>
                <Stack direction="row" spacing={1}>
                  <TextField select size="small" value={intType} onChange={(e) => setIntType(e.target.value)} sx={{ minWidth: 120 }}>
                    {Object.keys(INTERACTION_ICONS).map(t => (
                      <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small" fullWidth multiline maxRows={4}
                    placeholder="What happened? Next step?"
                    value={intSummary}
                    onChange={(e) => setIntSummary(e.target.value)}
                  />
                  <Tooltip title="Log interaction">
                    <span>
                      <IconButton color="primary" disabled={!intSummary.trim() || saving} onClick={handleAddInteraction}>
                        <SendIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>

              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary' }}>
                HISTORY ({(selected.interactions || []).length})
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {[...(selected.interactions || [])].reverse().map((it, idx) => (
                  <Stack key={idx} direction="row" spacing={1.5}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                      {INTERACTION_ICONS[it.type] || INTERACTION_ICONS.note}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2">{it.summary}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(it.date), 'MMM d, yyyy')}{it.by?.name ? ` · ${it.by.name}` : ''}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
                {(selected.interactions || []).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No interactions logged yet.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Quick-add prospect dialog: name is the only required field */}
      <Dialog open={prospectOpen} onClose={() => !prospectSaving && setProspectOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Add Prospect
          <Typography variant="body2" color="text.secondary">
            Only the name is required — deal terms come later, when the deal is real.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Name" required fullWidth size="small" autoFocus
                value={prospect.name}
                onChange={(e) => setProspect({ ...prospect, name: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Firm / Entity" fullWidth size="small"
                value={prospect.entityName}
                onChange={(e) => setProspect({ ...prospect, entityName: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" fullWidth size="small"
                value={prospect.email}
                onChange={(e) => setProspect({ ...prospect, email: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phone" fullWidth size="small"
                value={prospect.phone}
                onChange={(e) => setProspect({ ...prospect, phone: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Type" fullWidth size="small"
                value={prospect.investorType}
                onChange={(e) => setProspect({ ...prospect, investorType: e.target.value })}>
                {['Angel', 'VC Firm', 'Corporate VC', 'Family Office', 'Accelerator', 'Incubator', 'Individual', 'Other'].map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Stage" fullWidth size="small"
                value={prospect.status}
                onChange={(e) => setProspect({ ...prospect, status: e.target.value })}>
                {['Lead', 'Contacted', 'Introduced', 'Pitched', 'Follow-up', 'Negotiating'].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Expected amount (₹, rough)" type="number" fullWidth size="small"
                value={prospect.expectedAmount}
                onChange={(e) => setProspect({ ...prospect, expectedAmount: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Next follow-up" type="date" fullWidth size="small"
                InputLabelProps={{ shrink: true }}
                value={prospect.nextFollowUpDate}
                onChange={(e) => setProspect({ ...prospect, nextFollowUpDate: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="How you met / who introduced" fullWidth size="small"
                value={prospect.source}
                onChange={(e) => setProspect({ ...prospect, source: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setProspectOpen(false)} disabled={prospectSaving}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProspect}
            disabled={!prospect.name.trim() || prospectSaving}
            startIcon={prospectSaving ? <CircularProgress size={16} /> : <PersonAddIcon />}>
            Add to Pipeline
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={message?.type || 'info'} onClose={() => setMessage(null)}>
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvestorPipeline;
